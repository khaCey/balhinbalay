import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Pool} from 'pg';
import {v7 as id} from 'uuid';
import {createHash,randomBytes} from 'node:crypto';
import request from 'supertest';
import {migrate} from '../../src/migrate.js';
import {createAccountApp} from '../../src/app.js';
import {mountMarketplace} from '../../src/marketplace.js';
import {mountSiteAdmin} from '../../src/site-admin.js';
import {ensureUserPrincipal,transaction,guardedDeleteAccount} from '../../src/marketplace-identity.js';
const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable integration URL required');
const url=new URL(connection);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Disposable local synthetic databases only');
const root=new Pool({connectionString:connection}),names=['bb_wrk0038_empty','bb_wrk0038_upgrade'];
const config={appOrigin:'https://synthetic.invalid',proxyKey:'synthetic-proxy-key-000000000000000000',adminEmails:['admin@synthetic.invalid'],marketplaceEnabled:true,messagingEnabled:true,runtimeMode:'test',messagingFixtureStart:true,sessionDays:14,verificationHours:24,resetMinutes:15};
const sha=x=>createHash('sha256').update(x).digest('hex');
let pool,upgrade,app,owner,lister,seeker,outsider,listing,thread;
const call=(method,path,actor=seeker,body)=>{const r=request(app)[method]('/api/marketplace/'+path).set('x-balhinbalay-proxy-key',config.proxyKey).set('Origin',config.appOrigin);if(actor)r.set('Cookie',actor.cookie);if(body!==undefined)r.send(body);return r;};
const admin=async(action)=>{const version=(await pool.query('SELECT version FROM lister_access WHERE user_id=$1',[lister.id])).rows[0].version;const r=await request(app).post('/api/admin/marketplace/lister-access/'+lister.id+'/'+action).set('Cookie',owner.adminCookie).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey).send({expected_version:version});assert.equal(r.status,200,JSON.stringify(r.body));};
async function user(email){const uid=id(),raw=randomBytes(32).toString('base64url'),araw=randomBytes(32).toString('base64url');let principal;await transaction(pool,async c=>{await c.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,'synthetic','active',now())",[uid,email]);principal=await ensureUserPrincipal(c,uid);});await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day'),($4,$2,$5,'admin',now()+interval '1 day')",[id(),uid,sha(raw),id(),sha('admin:'+araw)]);return {id:uid,principal,cookie:'__Host-bb_session='+raw,adminCookie:'__Host-bb_admin_session='+araw,raw,araw};}
async function fixture(){return transaction(pool,async client=>{
 // Direct SQL synthetic moderation fixtures ONLY. No approval/activation endpoint.
 const property=id(),authority=id(),lid=id(),submission=id(),region=id(),city=id(),barangay=id();
 await client.query("INSERT INTO regions VALUES($1,$2,'Synthetic region')",[region,'SYNTHETIC-'+region]);await client.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,$3,'Synthetic city','CITY')",[city,region,'SYNTHETIC-'+city]);await client.query("INSERT INTO barangays VALUES($1,$2,$3,'Synthetic barangay')",[barangay,city,'SYNTHETIC-'+barangay]);
 await client.query("INSERT INTO properties(id,property_type,created_by_user_id,city_id,barangay_id) VALUES($1,'HOUSE',$2,$3,$4)",[property,lister.id,city,barangay]);await client.query('INSERT INTO house_details(property_id) VALUES($1)',[property]);
 await client.query("INSERT INTO property_authorities(id,property_id,principal_id,relationship,verification_state,status,verified_by_user_id,verified_at) VALUES($1,$2,$3,'OWNER','verified','active',$4,now())",[authority,property,lister.principal,owner.id]);
 await client.query("INSERT INTO listings(id,property_id,owner_principal_id,authority_id,created_by_user_id,responsible_lister_user_id,title,description,transaction_type,price_amount,currency_code) VALUES($1,$2,$3,$4,$5,$5,'Synthetic safe title','PRIVATE DESCRIPTION SECRET','SALE',100,'PHP')",[lid,property,lister.principal,authority,lister.id]);
 await client.query('INSERT INTO sale_terms(listing_id) VALUES($1)',[lid]);
 await client.query("INSERT INTO property_private_locations(property_id,street_address) VALUES($1,'PRIVATE STREET SECRET')",[property]);
 await client.query("INSERT INTO listing_submissions(id,listing_id,listing_version,property_version,validation_policy_version,payload,submitted_by_user_id,review_outcome,reviewer_user_id,reviewed_at) VALUES($1,$2,1,1,'synthetic-ci-only','{}',$3,'approved',$4,now())",[submission,lid,lister.id,owner.id]);
 await client.query("UPDATE listings SET review_status='approved',market_status='active',published_at=now(),approved_submission_id=$2 WHERE id=$1",[lid,submission]);return lid;
});}
const start=(lid=listing,key=id(),text='First synthetic message',actor=seeker)=>call('post','conversations',actor,{listing_id:lid,first_message:text,client_request_id:key});
const send=(text='Reply',key=id(),actor=seeker,tid=thread)=>call('post',`conversations/${tid}/messages`,actor,{body:text,client_request_id:key});
await test('WRK0038 real PostgreSQL/PostGIS messaging',async t=>{
 try{
  for(const name of names)await root.query(`CREATE DATABASE ${name} TEMPLATE template0`);
  pool=new Pool({connectionString:new URL('/'+names[0],connection).href});upgrade=new Pool({connectionString:new URL('/'+names[1],connection).href});
  await t.test('empty001→006, account-only upgrade,005 rerun and foundation history unchanged',async()=>{
   await migrate(pool);await migrate(pool);assert.equal((await pool.query('SELECT count(*)::int n FROM schema_migrations')).rows[0].n,6);
   await upgrade.query('CREATE TABLE schema_migrations(name text PRIMARY KEY,applied_at timestamptz DEFAULT now())');
   for(const name of ['001_accounts.sql','002_session_purpose.sql']){await upgrade.query(await readFile(new URL('../../migrations/'+name,import.meta.url),'utf8'));await upgrade.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);}
   const uid=id(),sid=id(),action=id();await upgrade.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,'upgrade@synthetic.invalid','synthetic','active',now())",[uid]);await upgrade.query("INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,'synthetic-upgrade',now()+interval '1 day')",[sid,uid]);await upgrade.query("INSERT INTO account_actions(id,user_id,purpose,token_hash,expires_at) VALUES($1,$2,'verify','synthetic-action',now()+interval '1 day')",[action,uid]);
   const tables=['users','auth_sessions','account_actions'];const before=await Promise.all(tables.map(x=>upgrade.query('SELECT * FROM '+x)));await migrate(upgrade);await migrate(upgrade);const after=await Promise.all(tables.map(x=>upgrade.query('SELECT * FROM '+x)));for(let i=0;i<3;i++)for(const key of Object.keys(before[i].rows[0]))assert.deepEqual(after[i].rows[0][key],before[i].rows[0][key]);
   const dir=await mkdtemp(join(tmpdir(),'wrk38-atomic-'));try{await writeFile(join(dir,'006_atomic_probe.sql'),'CREATE TABLE wrk38_probe(id integer); SELECT missing_wrk38();');await assert.rejects(migrate(pool,{directory:dir}));assert.equal((await pool.query("SELECT to_regclass('wrk38_probe') AS p")).rows[0].p,null);}finally{await rm(dir,{recursive:true});}
  });
  owner=await user(config.adminEmails[0]);lister=await user('lister@synthetic.invalid');seeker=await user('seeker@synthetic.invalid');outsider=await user('outsider@synthetic.invalid');
  await pool.query("INSERT INTO lister_access(user_id,status,activated_by_user_id,activated_at) VALUES($1,'active',$2,now())",[lister.id,owner.id]);
  app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});listing=await fixture();
  await t.test('production/default start is disabled even with a valid active fixture',async()=>{
   const disabled={...config,runtimeMode:'production'};const other=createAccountApp({pool,config:disabled,mailer:{}});mountMarketplace(other,{pool,config:disabled});const r=await request(other).post('/api/marketplace/conversations').set('Cookie',seeker.cookie).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey).send({listing_id:listing,first_message:'No',client_request_id:id()});assert.equal(r.status,503);assert.equal(r.body.code,'CONVERSATION_START_UNAVAILABLE');assert.equal((await pool.query('SELECT count(*)::int n FROM conversations')).rows[0].n,0);
  });
  await t.test('start eligibility: verified active user, ordinary purpose, active listing/authority/Lister and no self contact',async()=>{
   assert.equal((await start(listing,id(),'self',lister)).body.code,'SELF_CONTACT');assert.equal((await start(listing,id(),'guest',null)).status,401);
   assert.equal((await start(listing,id(),'admin',{cookie:owner.adminCookie})).status,401);assert.equal((await start(listing,id(),'wrong',{cookie:'__Host-bb_session='+owner.araw})).status,401);
   assert.equal((await start(listing,id(),'bad').set('Origin','https://attacker.invalid')).status,403);
   for(const status of ['unlisted','sold','rented','archived']){await pool.query('UPDATE listings SET market_status=$2 WHERE id=$1',[listing,status]);assert.equal((await start()).status,403);}await pool.query("UPDATE listings SET market_status='active' WHERE id=$1",[listing]);
   await pool.query("UPDATE property_authorities SET verification_state='declared' WHERE property_id=(SELECT property_id FROM listings WHERE id=$1)",[listing]);assert.equal((await start()).status,403);await pool.query("UPDATE property_authorities SET verification_state='verified' WHERE property_id=(SELECT property_id FROM listings WHERE id=$1)",[listing]);
   await admin('suspend');assert.equal((await start()).status,403);await admin('approve');
   await pool.query("UPDATE users SET status='pending',email_verified_at=NULL WHERE id=$1",[seeker.id]);assert.equal((await start()).status,401);await pool.query("UPDATE users SET status='active',email_verified_at=now() WHERE id=$1",[seeker.id]);
   await pool.query("UPDATE users SET status='disabled' WHERE id=$1",[lister.id]);assert.equal((await start()).status,403);await pool.query("UPDATE users SET status='active' WHERE id=$1",[lister.id]);
  });
  await t.test('concurrent identical first messages create one UUIDv7 thread/two participants/message; altered retry conflicts',async()=>{
   const key=id();const results=await Promise.all([start(listing,key),start(listing,key)]);results.forEach(r=>assert.ok([200,201].includes(r.status),JSON.stringify(r.body)));thread=results[0].body.conversation.id;assert.equal(results[1].body.conversation.id,thread);assert.equal(thread[14],'7');assert.equal((await pool.query('SELECT count(*)::int n FROM conversation_participants WHERE conversation_id=$1',[thread])).rows[0].n,2);assert.equal((await pool.query('SELECT count(*)::int n FROM messages WHERE conversation_id=$1',[thread])).rows[0].n,1);assert.equal((await start(listing,key,'altered')).status,409);
   const before=(await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0];await admin('suspend');assert.equal((await start(listing,key)).status,200);assert.deepEqual((await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],before);await admin('approve');
  });
  await t.test('participant-only inbox/thread/page/send; safe context, no admin/private contact access',async()=>{
   for(const path of [`conversations/${thread}`,`conversations/${thread}/messages`]){assert.equal((await call('get',path,outsider)).status,404);assert.equal((await call('get',path,{cookie:owner.adminCookie})).status,401);}
   assert.equal((await send('outsider',id(),outsider)).status,404);assert.equal((await call('get','conversations',outsider)).body.conversations.length,0);
   for(const actor of [seeker,lister]){const r=await call('get',`conversations/${thread}`,actor);assert.equal(r.status,200);const json=JSON.stringify(r.body);for(const forbidden of ['synthetic.invalid','PRIVATE STREET','PRIVATE DESCRIPTION','password_hash','recipient_user_id','owner_principal_id'])assert.equal(json.includes(forbidden),false,forbidden);assert.equal(r.headers['cache-control'],'no-store');}
   assert.equal((await call('post',`conversations/${thread}/messages`,seeker,{body:'Spoof',client_request_id:id(),sender_id:lister.id})).status,422);
  });
  await t.test('concurrent duplicate sends commit once, payload mismatch conflicts, timestamp pagination has no gaps',async()=>{
   const key=id(),before=(await pool.query('SELECT count(*)::int n FROM messages WHERE conversation_id=$1',[thread])).rows[0].n;const results=await Promise.all([send('race',key),send('race',key)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,201]);assert.equal(results[0].body.message.id,results[1].body.message.id);assert.equal((await pool.query('SELECT count(*)::int n FROM messages WHERE conversation_id=$1',[thread])).rows[0].n,before+1);assert.equal((await send('different',key)).status,409);
   for(let i=0;i<4;i++)assert.equal((await send('Page '+i)).status,201);
   const participant=(await pool.query('SELECT id FROM conversation_participants WHERE conversation_id=$1 AND user_id=$2',[thread,seeker.id])).rows[0].id;
   await pool.query("INSERT INTO messages(id,conversation_id,sender_participant_id,body,client_request_id,created_at) VALUES($1,$2,$3,'Microsecond1',$4,'2020-01-01 00:00:00.000001+00'),($5,$2,$3,'Microsecond2',$6,'2020-01-01 00:00:00.000002+00')",[id(),thread,participant,id(),id(),id()]);
   let cursor='',seen=[];do{const r=await call('get',`conversations/${thread}/messages?limit=2`+(cursor?'&before='+cursor:''));assert.equal(r.status,200);seen.push(...r.body.messages.map(m=>m.id));cursor=r.body.next_cursor;}while(cursor);assert.equal(new Set(seen).size,seen.length);assert.equal(seen.length,(await pool.query('SELECT count(*)::int n FROM messages WHERE conversation_id=$1',[thread])).rows[0].n);
   assert.equal((await call('get',`conversations/${thread}/messages?before=${id()}`)).status,404);assert.equal((await call('get','conversations?limit=101')).status,422);
   const second=(await start(await fixture())).body.conversation.id;const inbox=await call('get','conversations?limit=1');assert.equal(inbox.body.conversations[0].id,second);assert.equal((await call('get','conversations?limit=1&before='+inbox.body.next_cursor)).body.conversations[0].id,thread);assert.equal((await call('get','conversations?before='+second,outsider)).status,404);
  });
  await t.test('closed/unlisted replies persist; suspended/revoked/pending/missing original capability freezes both sides without writes and restores',async()=>{
   for(const state of ['unlisted','sold','rented','archived']){await pool.query('UPDATE listings SET market_status=$2 WHERE id=$1',[listing,state]);for(const actor of [seeker,lister])assert.equal((await send(state,id(),actor)).status,201);}
   for(const action of ['suspend','revoke']){await admin(action);const before=(await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0];for(const actor of [seeker,lister]){assert.equal((await call('get',`conversations/${thread}`,actor)).body.conversation.can_send,false);assert.equal((await call('get',`conversations/${thread}/messages`,actor)).status,200);const r=await send('blocked',id(),actor);assert.equal(r.status,403);assert.equal(r.body.code,'CONVERSATION_FROZEN');}assert.deepEqual((await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],before);await admin('approve');assert.equal((await send('restored')).status,201);}
   await pool.query("UPDATE lister_access SET status='pending' WHERE user_id=$1",[lister.id]);assert.equal((await send()).status,403);await admin('approve');
   // Missing row cannot bypass active gate. Synthetic transaction restores same row.
   const access=(await pool.query('SELECT * FROM lister_access WHERE user_id=$1',[lister.id])).rows[0];await pool.query('DELETE FROM lister_access WHERE user_id=$1',[lister.id]);assert.equal((await send()).status,403);await pool.query("INSERT INTO lister_access(user_id,status,activated_at,activated_by_user_id,version) VALUES($1,'active',$2,$3,$4)",[lister.id,access.activated_at,access.activated_by_user_id,access.version]);
  });
  await t.test('capability lock serialises suspension against send; frozen duplicate retry writes nothing',async()=>{
   const successful=await send('committed');assert.equal(successful.status,201);const key=(await pool.query('SELECT client_request_id FROM messages WHERE id=$1',[successful.body.message.id])).rows[0].client_request_id;
   const lock=await pool.connect();try{await lock.query('BEGIN');await lock.query("UPDATE lister_access SET status='suspended' WHERE user_id=$1",[lister.id]);let finished=false;const pending=send('must wait').then(r=>{finished=true;return r;});
    // Observe the actual waiting SQL lock, not an arbitrary timing assertion.
    let waiting=false;for(let i=0;i<80;i++){const q=await pool.query("SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%lister_access%' AND pid<>pg_backend_pid()");if(q.rowCount){waiting=true;break;}await new Promise(r=>setTimeout(r,10));}assert.equal(waiting,true);assert.equal(finished,false);await lock.query('COMMIT');assert.equal((await pending).body.code,'CONVERSATION_FROZEN');
   }finally{await lock.query('ROLLBACK');lock.release();}
   const before=(await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0];assert.equal((await send('committed',key)).status,200);assert.equal((await send('changed',key)).status,409);assert.deepEqual((await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],before);await admin('approve');
  });
  await t.test('responsibility/owner changes preserve original parties/context and cannot unfreeze using replacement',async()=>{
   await pool.query("INSERT INTO lister_access(user_id,status,activated_by_user_id,activated_at) VALUES($1,'active',$2,now())",[outsider.id,owner.id]);
   const property=(await pool.query('SELECT property_id FROM listings WHERE id=$1',[listing])).rows[0].property_id,authority=id();await pool.query("INSERT INTO property_authorities(id,property_id,principal_id,relationship,verification_state,verified_by_user_id,verified_at) VALUES($1,$2,$3,'OWNER','verified',$4,now())",[authority,property,outsider.principal,owner.id]);
   await pool.query('UPDATE listings SET responsible_lister_user_id=$2,owner_principal_id=$3,authority_id=$4 WHERE id=$1',[listing,outsider.id,outsider.principal,authority]);await admin('suspend');assert.equal((await send()).status,403);assert.equal((await call('get',`conversations/${thread}`,outsider)).status,404);
   assert.equal((await call('get',`conversations/${thread}`)).body.conversation.listing_context.title,'Synthetic safe title');await pool.query("UPDATE listings SET title='Changed title' WHERE id=$1",[listing]);assert.equal((await call('get',`conversations/${thread}`)).body.conversation.listing_context.title,'Synthetic safe title');await admin('approve');assert.equal((await send()).status,201);
   await assert.rejects(pool.query('UPDATE conversations SET recipient_user_id=$2 WHERE id=$1',[thread,outsider.id]));
  });
  await t.test('deferred two-person/side and foreign-sender constraints; immutable history and admin hard-delete guard',async()=>{
   const c=await pool.connect();try{await c.query('BEGIN');await c.query("INSERT INTO conversations(id,listing_id,initiator_user_id,recipient_user_id,listing_owner_principal_id,listing_context) VALUES($1,$2,$3,$4,$5,'{}')",[id(),listing,outsider.id,lister.id,lister.principal]);await assert.rejects(c.query('COMMIT'));}finally{await c.query('ROLLBACK');c.release();}
   await assert.rejects(pool.query("INSERT INTO conversation_participants(id,conversation_id,user_id,side) VALUES($1,$2,$3,'SEEKER')",[id(),thread,outsider.id]));
   const participant=(await pool.query('SELECT id FROM conversation_participants WHERE conversation_id=$1 LIMIT 1',[thread])).rows[0].id;
   await assert.rejects(pool.query("INSERT INTO messages(id,conversation_id,sender_participant_id,body,client_request_id) VALUES($1,$2,$3,'spoof',$4)",[id(),(await start(await fixture(),id(),'Other thread',outsider)).body.conversation.id,participant,id()]));
   for(const sql of ['DELETE FROM messages WHERE conversation_id=$1',"UPDATE messages SET body='changed' WHERE conversation_id=$1",'DELETE FROM conversation_participants WHERE conversation_id=$1','DELETE FROM conversations WHERE id=$1'])await assert.rejects(pool.query(sql,[thread]));
   assert.equal((await guardedDeleteAccount(pool,seeker.id)).history,true);
   const deletion=await request(app).delete('/api/admin/accounts/'+seeker.id).set('Cookie',owner.adminCookie).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey);assert.equal(deletion.status,409);assert.equal(deletion.body.code,'ACCOUNT_HAS_MARKETPLACE_HISTORY');
  });
  await t.test('deleted/anonymised sender renders generically; other participant reads; inactive/expired/revoked requester denied',async()=>{
   await pool.query("UPDATE users SET status='disabled',deleted_at=now(),anonymised_at=now() WHERE id=$1",[lister.id]);let r=await call('get',`conversations/${thread}/messages`);assert.equal(r.status,200);assert.ok(r.body.messages.some(m=>m.sender_label==='Deleted user'));assert.equal(JSON.stringify(r.body).includes('lister@'),false);assert.equal((await call('get',`conversations/${thread}`,lister)).status,401);
   await pool.query("UPDATE users SET status='suspended' WHERE id=$1",[seeker.id]);assert.equal((await call('get',`conversations/${thread}`)).status,401);assert.equal((await send()).status,401);await pool.query("UPDATE users SET status='active' WHERE id=$1",[seeker.id]);
   await pool.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND purpose=\'user\'',[seeker.id]);assert.equal((await call('get','conversations')).status,401);assert.equal((await send()).status,401);
   await pool.query("UPDATE auth_sessions SET revoked_at=NULL,expires_at=now()-interval '1 second' WHERE user_id=$1 AND purpose='user'",[seeker.id]);assert.equal((await call('get',`conversations/${thread}/messages`)).status,401);
  });
 }finally{if(pool)await pool.end();if(upgrade)await upgrade.end();for(const name of names)await root.query(`DROP DATABASE IF EXISTS ${name} WITH(FORCE)`);await root.end();}
});
