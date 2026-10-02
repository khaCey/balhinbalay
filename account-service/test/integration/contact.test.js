import test from 'node:test';
import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {v7 as uuidv7} from 'uuid';
import {createHash,randomBytes} from 'node:crypto';
import request from 'supertest';
import {migrate} from '../../src/migrate.js';
import {createAccountApp} from '../../src/app.js';
import {mountMarketplace} from '../../src/marketplace.js';
import {mountSiteAdmin} from '../../src/site-admin.js';
import {marketplaceForward} from '../../../lib/marketplace-proxy.js';
import {contactRequest,sendContact} from '../../../lib/listing-contact.js';
import {ensureUserPrincipal,transaction} from '../../src/marketplace-identity.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable PostgreSQL/PostGIS URL required');
const url=new URL(connection);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Synthetic disposable service only');
const root=new Pool({connectionString:connection}),db='bb_wrk0041_contact';
const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'synthetic-moderation-proxy-key-000000',adminEmails:['reviewer@synthetic.invalid','reviewer2@synthetic.invalid'],marketplaceEnabled:true,moderationEnabled:true,publicationEnabled:true,messagingEnabled:true,sessionDays:14,verificationHours:24,resetMinutes:15};
const sha=s=>createHash('sha256').update(s).digest('hex');
let pool,app,reviewer,lister,stranger,seeker,city,barangay;
const consumer=(method,path,body,actor=lister)=>call(method,'/api/marketplace/'+path,body,actor?.cookie);
const admin=(method,path,body,actor=reviewer)=>call(method,'/api/admin/marketplace/'+path,body,actor?.adminCookie||actor?.cookie);
const call=(method,path,body,cookie)=>{const r=request(app)[method](path).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey);if(cookie)r.set('Cookie',cookie);if(body!==undefined)r.send(body);return r;};
const resource=x=>`listings/${x.listingId}/submissions/${x.submissionId}`;
async function user(email) {
 const id=uuidv7(),raw=randomBytes(32).toString('base64url'),araw=randomBytes(32).toString('base64url');
 await transaction(pool,async c=>{await c.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,'synthetic-only','active',now())",[id,email]);await ensureUserPrincipal(c,id);});
 await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day'),($4,$2,$5,'admin',now()+interval '1 day')",[uuidv7(),id,sha(raw),uuidv7(),sha('admin:'+araw)]);
 return {id,raw,araw,cookie:'__Host-bb_session='+raw,adminCookie:'__Host-bb_admin_session='+araw};
}
async function grant(actor) {
 let r=await consumer('post','me/lister-access',{},actor);assert.equal(r.status,200);
 r=await admin('post',`lister-access/${actor.id}/approve`,{expected_version:r.body.lister_access.version});assert.equal(r.status,200,JSON.stringify(r.body));
}
async function pending(actor=lister,building=false) {
 let r=await consumer('post','listings',{relationship:'OWNER',property:{property_type:building?'CONDO':'HOUSE',city_id:city,barangay_id:barangay},listing:{title:'Synthetic pending house',description:'Synthetic moderation fixture only.',transaction_type:building?'RENT':'SALE',price_amount:'1234.50',currency_code:'PHP',availability_status:'AVAILABLE',available_from:'2026-11-01'},...(building?{development:{name:'Synthetic shared condominium',development_type:'CONDOMINIUM'},rental_terms:{pricing_period:'MONTHLY'}}:{}),private_location:{room_identifier:'PRIVATE-ROOM',street_address:'PRIVATE-NOT-REVIEW-CONTENT',unit_identifier:'PRIVATE-UNIT'}},actor);assert.equal(r.status,201,JSON.stringify(r.body));
 const d=r.body;
 r=await admin('post',`property-authorities/${d.authority.id}/approve`,{expected_version:d.authority.version});assert.equal(r.status,200);
 r=await consumer('post',`listings/${d.listing.id}/submissions`,{expected_version:d.listing.version,expected_property_version:d.property.version},actor);assert.equal(r.status,201,JSON.stringify(r.body));
 const own=await consumer('get','listings/'+d.listing.id,undefined,actor);assert.equal(own.status,200);
 return {listingId:d.listing.id,submissionId:r.body.submission.id,version:own.body.listing.version,propertyVersion:own.body.property.version,authorityId:d.authority.id,propertyId:d.property.id};
}
const decide=(x,action='approve',body={},actor=reviewer)=>admin('post',resource(x)+'/'+action,{expected_version:x.version,...body},actor);
const publicRead=id=>call('get','/api/marketplace/public/listings/'+id);
const change=(x,action='activate',body={},actor=lister)=>consumer('post',`listings/${x.listingId}/${action}`,{expected_version:x.version,...body},actor);
async function approvedFixture(building=false){const x=await pending(lister,building);const r=await decide(x);assert.equal(r.status,200,JSON.stringify(r.body));return {...x,version:r.body.listing.version};}
const start=(x,key=uuidv7(),text='Synthetic first contact',actor=seeker,extra={})=>consumer('post','conversations',{listing_id:x.listingId,first_message:text,client_request_id:key,...extra},actor);
const send=(thread,actor=seeker,key=uuidv7(),text='Synthetic reply')=>consumer('post','conversations/'+thread+'/messages',{body:text,client_request_id:key},actor);
async function activeFixture(){const x=await approvedFixture();const r=await change(x);assert.equal(r.status,200,JSON.stringify(r.body));return {...x,version:r.body.listing.version};}
async function access(action){const v=(await pool.query('SELECT version FROM lister_access WHERE user_id=$1',[lister.id])).rows[0].version;const r=await admin('post','lister-access/'+lister.id+'/'+action,{expected_version:v});assert.equal(r.status,200,JSON.stringify(r.body));}
await test('WRK0041 genuine real-listing contact on disposable PostgreSQL/PostGIS',async t=>{
 try{
  await root.query(`CREATE DATABASE ${db} TEMPLATE template0`);pool=new Pool({connectionString:new URL('/'+db,connection).href});await migrate(pool);await migrate(pool);
  app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});
  reviewer=await user(config.adminEmails[0]);lister=await user('lister@synthetic.invalid');stranger=await user('stranger@synthetic.invalid');seeker=await user('seeker@synthetic.invalid');await grant(lister);await grant(stranger);
  const region=uuidv7();city=uuidv7();barangay=uuidv7();
  await pool.query("INSERT INTO regions VALUES($1,'CONTACT-SYNTHETIC','Synthetic region')",[region]);await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'CONTACT-CITY','Synthetic city','CITY')",[city,region]);await pool.query("INSERT INTO barangays VALUES($1,$2,'CONTACT-BRGY','Synthetic barangay')",[barangay,city]);
  await t.test('genuine current reviewed active listing starts without test mode, preserving safe immutable context',async()=>{
   const x=await activeFixture();await pool.query("UPDATE listings SET title='UNREVIEWED TITLE',description='UNREVIEWED PRIVATE',price_amount=99999 WHERE id=$1",[x.listingId]);
   const r=await start(x);assert.equal(r.status,201,JSON.stringify(r.body));const c=r.body.conversation;assert.equal(c.listing_context.title,'Synthetic pending house');assert.equal(c.listing_context.property_type,'HOUSE');assert.equal(c.listing_context.transaction_type,'SALE');assert.equal(c.participants.length,2);
   assert.doesNotMatch(JSON.stringify(r.body),/UNREVIEWED|PRIVATE-|@synthetic|phone|email|password|token|recipient_user_id|initiator_user_id|owner_principal_id|authority_id/);
   const rows=(await pool.query('SELECT * FROM conversations WHERE id=$1',[c.id])).rows;assert.equal(rows.length,1);assert.equal(rows[0].recipient_user_id,lister.id);assert.equal(rows[0].initiator_user_id,seeker.id);
  });
  await t.test('draft/pending/rejected/approved-unlisted and ineligible public state cannot create a new thread',async()=>{
   const draft=await consumer('post','listings',{relationship:'OWNER'});assert.equal(draft.status,201);const d={listingId:draft.body.listing.id};assert.equal((await start(d)).status,403);
   const p=await pending();assert.equal((await start(p)).status,403);await decide(p,'reject',{reason:'Synthetic reject'});assert.equal((await start(p)).status,403);
   const approved=await approvedFixture();assert.equal((await start(approved)).status,403);
   const x=await activeFixture();for(const assignment of ["archived_at=now()","market_status='archived'","market_status='unlisted'"]){await pool.query('UPDATE listings SET '+assignment+' WHERE id=$1',[x.listingId]);assert.equal((await start(x)).status,403);await pool.query("UPDATE listings SET archived_at=NULL,market_status='active' WHERE id=$1",[x.listingId]);}
   await pool.query('UPDATE properties SET archived_at=now() WHERE id=$1',[x.propertyId]);assert.equal((await start(x)).status,403);
   assert.equal((await start({listingId:uuidv7()})).status,404);assert.equal((await start({listingId:1})).status,422);
   assert.equal((await pool.query('SELECT count(*)::int n FROM conversations WHERE listing_id=ANY($1::uuid[])',[[d.listingId,p.listingId,approved.listingId,x.listingId]])).rows[0].n,0);
  });
  await t.test('responsible account/capability and exact valid authority must remain eligible',async()=>{
   const x=await activeFixture();
   for(const action of ['suspend','revoke']){await access(action);assert.equal((await start(x)).status,403);await access('approve');}
   for(const assignment of ["status='suspended'","status='disabled'","status='pending',email_verified_at=NULL","anonymised_at=now()","deleted_at=now()"]){await pool.query('UPDATE users SET '+assignment+' WHERE id=$1',[lister.id]);assert.equal((await start(x)).status,403);await pool.query("UPDATE users SET status='active',email_verified_at=now(),deleted_at=NULL,anonymised_at=NULL WHERE id=$1",[lister.id]);}
   for(const state of ['suspended','revoked']){await pool.query('UPDATE property_authorities SET status=$2 WHERE id=$1',[x.authorityId,state]);assert.equal((await start(x)).status,403);}await pool.query("UPDATE property_authorities SET status='active',verification_state='declared' WHERE id=$1",[x.authorityId]);assert.equal((await start(x)).status,403);await pool.query("UPDATE property_authorities SET verification_state='verified' WHERE id=$1",[x.authorityId]);
   await pool.query('UPDATE listings SET responsible_lister_user_id=$2 WHERE id=$1',[x.listingId,stranger.id]);assert.equal((await start(x)).status,403);await pool.query('UPDATE listings SET responsible_lister_user_id=$2 WHERE id=$1',[x.listingId,lister.id]);
   assert.equal((await start(x)).status,201);
  });
  await t.test('verified active ordinary initiator required; self-contact and arbitrary participant assignment denied',async()=>{
   const x=await activeFixture();assert.equal((await start(x,uuidv7(),'guest',null)).status,401);assert.equal((await start(x,uuidv7(),'admin',{cookie:reviewer.adminCookie})).status,401);
   for(const assignment of ["status='suspended'","status='disabled'","status='pending',email_verified_at=NULL","deleted_at=now()","anonymised_at=now()"]){await pool.query('UPDATE users SET '+assignment+' WHERE id=$1',[seeker.id]);assert.equal((await start(x)).status,401);await pool.query("UPDATE users SET status='active',email_verified_at=now(),deleted_at=NULL,anonymised_at=NULL WHERE id=$1",[seeker.id]);}
   await pool.query("UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND purpose='user'",[seeker.id]);assert.equal((await start(x)).status,401);await pool.query("UPDATE auth_sessions SET revoked_at=NULL WHERE user_id=$1 AND purpose='user'",[seeker.id]);
   assert.equal((await start(x,uuidv7(),'self',lister)).body.code,'SELF_CONTACT');
   for(const extra of [{recipient_user_id:stranger.id},{sender_id:lister.id},{participants:[seeker.id,stranger.id]},{listing_context:{title:'spoof'}},{owner_principal_id:uuidv7()}])assert.equal((await start(x,uuidv7(),'spoof',seeker,extra)).status,422);
   assert.equal((await start(x).set('Origin','https://attacker.invalid')).status,403);assert.equal((await start(x).set('x-balhinbalay-proxy-key','wrong')).status,403);
  });
  await t.test('invalid/unreviewed/cross-listing/obsolete snapshot cannot bypass current publication validity',async()=>{
   const x=await activeFixture(),y=await activeFixture();await assert.rejects(pool.query('UPDATE listings SET approved_submission_id=$2 WHERE id=$1',[x.listingId,y.submissionId]),e=>e.code==='23503');
   await pool.query("UPDATE listings SET market_status='unlisted',approved_submission_id=NULL WHERE id=$1",[x.listingId]);assert.equal((await start(x)).status,403);
   // Direct invalid synthetic state is used only to prove fail-closed validation.
   await pool.query("INSERT INTO listing_submissions(id,listing_id,listing_version,property_version,validation_policy_version,payload,submitted_by_user_id) SELECT $1,listing_id,listing_version+100,property_version,validation_policy_version,payload,submitted_by_user_id FROM listing_submissions WHERE id=$2",[uuidv7(),y.submissionId]);assert.equal((await start(y)).status,403);
   const z=await pending();await pool.query("UPDATE listings SET review_status='approved',market_status='active',published_at=now(),approved_submission_id=$2,version=version+1 WHERE id=$1",[z.listingId,z.submissionId]);assert.equal((await start(z)).status,403);
  });
  await t.test('retry and concurrent initiation produce exactly one original thread/two participants/first message',async()=>{
   const x=await activeFixture(),key=uuidv7();const rs=await Promise.all([start(x,key),start(x,key)]);assert.deepEqual(rs.map(r=>r.status).sort(),[200,201]);const thread=rs[0].body.conversation.id;assert.equal(rs[1].body.conversation.id,thread);assert.equal(rs[0].body.message.id,rs[1].body.message.id);
   assert.equal((await pool.query('SELECT count(*)::int n FROM conversations WHERE listing_id=$1',[x.listingId])).rows[0].n,1);assert.equal((await pool.query('SELECT count(*)::int n FROM conversation_participants WHERE conversation_id=$1',[thread])).rows[0].n,2);assert.equal((await pool.query('SELECT count(*)::int n FROM messages WHERE conversation_id=$1',[thread])).rows[0].n,1);
   assert.equal((await start(x,key,'different')).status,409);const next=await start(x,uuidv7(),'Another contact');assert.equal(next.status,201);assert.equal(next.body.conversation.id,thread);
  });
  await t.test('outsider and admin IDOR cannot read/send or gain participants',async()=>{
   const x=await activeFixture(),thread=(await start(x)).body.conversation.id;
   for(const path of ['conversations/'+thread,'conversations/'+thread+'/messages'])assert.equal((await consumer('get',path,undefined,stranger)).status,404);
   assert.equal((await send(thread,stranger)).status,404);assert.equal((await consumer('get','conversations/'+thread,undefined,{cookie:reviewer.adminCookie})).status,401);
   assert.equal((await consumer('get','conversations',undefined,stranger)).body.conversations.some(c=>c.id===thread),false);assert.equal((await consumer('post','conversations/'+thread+'/participants',{user_id:stranger.id})).status,404);
  });
  await t.test('real Unlist preserves existing reads/replies while preventing fresh starts; committed retry is read-only',async()=>{
   const x=await activeFixture(),key=uuidv7(),r=await start(x,key),thread=r.body.conversation.id;
   assert.equal((await change(x,'unlist')).status,200);assert.equal((await publicRead(x.listingId)).status,404);assert.equal((await start(x,uuidv7())).status,403);
   for(const actor of [seeker,lister]){assert.equal((await consumer('get','conversations/'+thread,undefined,actor)).status,200);assert.equal((await send(thread,actor)).status,201);}
   const before=(await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0];const retry=await start(x,key);assert.equal(retry.status,200);assert.equal(retry.body.conversation.id,thread);assert.deepEqual((await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],before);
  });
  await t.test('original Lister suspension/revocation freezes both senders, preserves reads and restoration resumes',async()=>{
   const x=await activeFixture(),thread=(await start(x)).body.conversation.id;
   for(const action of ['suspend','revoke']){await access(action);const before=(await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0];for(const actor of [seeker,lister]){const read=await consumer('get','conversations/'+thread,undefined,actor);assert.equal(read.status,200);assert.equal(read.body.conversation.can_send,false);assert.equal((await consumer('get','conversations/'+thread+'/messages',undefined,actor)).status,200);assert.equal((await send(thread,actor)).body.code,'CONVERSATION_FROZEN');}assert.deepEqual((await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],before);await access('approve');for(const actor of [seeker,lister])assert.equal((await send(thread,actor)).status,201);}
  });
  await t.test('owner/responsibility replacement never changes original participants/context or unfreezes history',async()=>{
   const x=await activeFixture(),key=uuidv7(),r=await start(x,key),thread=r.body.conversation.id,before=(await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],parts=(await pool.query('SELECT * FROM conversation_participants WHERE conversation_id=$1 ORDER BY id',[thread])).rows;
   const principal=(await pool.query("SELECT id FROM principals WHERE kind='USER' AND user_id=$1",[stranger.id])).rows[0].id,authority=uuidv7();await pool.query("INSERT INTO property_authorities(id,property_id,principal_id,relationship,verification_state,verified_by_user_id,verified_at) VALUES($1,$2,$3,'OWNER','verified',$4,now())",[authority,x.propertyId,principal,reviewer.id]);
   await pool.query('UPDATE listings SET owner_principal_id=$2,authority_id=$3,responsible_lister_user_id=$4 WHERE id=$1',[x.listingId,principal,authority,stranger.id]);await access('suspend');assert.equal((await send(thread)).body.code,'CONVERSATION_FROZEN');assert.equal((await consumer('get','conversations/'+thread,undefined,stranger)).status,404);
   const retry=await start(x,key);assert.equal(retry.status,200);assert.equal(retry.body.conversation.id,thread);assert.equal(retry.body.conversation.can_send,false);assert.deepEqual((await pool.query('SELECT * FROM conversations WHERE id=$1',[thread])).rows[0],before);assert.deepEqual((await pool.query('SELECT * FROM conversation_participants WHERE conversation_id=$1 ORDER BY id',[thread])).rows,parts);await access('approve');assert.equal((await send(thread)).status,201);
  });
  await t.test('contact serialises with real Unlist and capability suspension without a deadlock or invalid new thread',async()=>{
   const x=await activeFixture();const rs=await Promise.all([start(x),change(x,'unlist')]);assert.equal(rs[1].status,200);assert.ok([201,403].includes(rs[0].status),JSON.stringify(rs[0].body));assert.equal((await publicRead(x.listingId)).status,404);assert.equal((await start(x,uuidv7())).status,403);
   const y=await activeFixture();const lock=await pool.connect();try{await lock.query('BEGIN');await lock.query("UPDATE lister_access SET status='suspended' WHERE user_id=$1",[lister.id]);const pendingStart=start(y).then(r=>r);let waiting=false;for(let attempt=0;attempt<100;attempt++){const result=await pool.query("SELECT 1 FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND query LIKE '%lister_access%' AND pid<>pg_backend_pid()");if(result.rowCount){waiting=true;break;}await new Promise(resolve=>setTimeout(resolve,10));}assert.equal(waiting,true);await lock.query('COMMIT');assert.equal((await pendingStart).status,403);assert.equal((await pool.query('SELECT count(*)::int n FROM conversations WHERE listing_id=$1',[y.listingId])).rows[0].n,0);}finally{await lock.query('ROLLBACK');lock.release();await access('approve');}
  });
  await t.test('public contact transport crosses the exact same-origin proxy, navigates to UUID thread and denies guest/sample',async()=>{
   const x=await activeFixture(),server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const prior={APP_URL:process.env.APP_URL,ACCOUNT_API_ORIGIN:process.env.ACCOUNT_API_ORIGIN,ACCOUNT_PROXY_KEY:process.env.ACCOUNT_PROXY_KEY,ACCOUNT_ALLOW_LOCAL_HTTP:process.env.ACCOUNT_ALLOW_LOCAL_HTTP};
   Object.assign(process.env,{APP_URL:config.appOrigin,ACCOUNT_API_ORIGIN:'http://127.0.0.1:'+server.address().port,ACCOUNT_PROXY_KEY:config.proxyKey,ACCOUNT_ALLOW_LOCAL_HTTP:'true'});
   const proxy=async(resource,options={},cookie=seeker.cookie)=>{const req=new Request(config.appOrigin+'/api/marketplace/'+resource,{method:options.method||'GET',headers:{Origin:config.appOrigin,...(cookie?{Cookie:cookie}:{}),...(options.body?{'Content-Type':'application/json'}:{})},body:options.body?JSON.stringify(options.body):undefined});const r=await marketplaceForward(req,{params:Promise.resolve({path:resource.split('/')})},options.method||'GET');const data=await r.json();if(!r.ok)throw Object.assign(new Error(data.message),{code:data.code,status:r.status});return data;};
   try{const pub=await proxy('public/listings/'+x.listingId,{},null);assert.equal(pub.listing.id,x.listingId);assert.doesNotMatch(JSON.stringify(pub),/PRIVATE-|phone|email|@synthetic/);const payload=contactRequest(pub.listing.id,'Proxy contact');let path;await sendContact(payload,proxy,value=>{path=value;});assert.match(path,/^\/chat\/[0-9a-f-]{36}$/);const thread=await proxy('conversations/'+path.slice(6));assert.equal(thread.conversation.listing_context.listing_id,x.listingId);assert.doesNotMatch(JSON.stringify(thread),/phone|email|@synthetic/);
    await assert.rejects(sendContact(contactRequest(x.listingId,'Guest'),(resource,options)=>proxy(resource,options,null),()=>{throw new Error('Unexpected guest navigation');}),e=>e.code==='UNAUTHENTICATED');assert.throws(()=>contactRequest(1,'Sample'));assert.equal((await start({listingId:'1'})).status,422);
   }finally{for(const [key,value] of Object.entries(prior)){if(value===undefined)delete process.env[key];else process.env[key]=value;}await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
  });
 }finally{
  if(pool)await pool.end();try{for(let attempt=0;attempt<100;attempt++){const n=(await root.query('SELECT count(*)::int n FROM pg_stat_activity WHERE datname=$1',[db])).rows[0].n;if(!n)break;if(attempt===99)throw new Error('Disposable connections did not close');await new Promise(resolve=>setTimeout(resolve,20));}await root.query(`DROP DATABASE IF EXISTS ${db}`);}finally{await root.end();}
 }
});
