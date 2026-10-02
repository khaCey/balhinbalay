import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Pool} from 'pg';
import {v7 as uuidv7} from 'uuid';
import {createHash,randomBytes} from 'node:crypto';
import request from 'supertest';
import {migrate} from '../../src/migrate.js';
import {createAccountApp} from '../../src/app.js';
import {mountMarketplace} from '../../src/marketplace.js';
import {mountSiteAdmin} from '../../src/site-admin.js';
import {ensureUserPrincipal,guardedDeleteAccount,transaction} from '../../src/marketplace-identity.js';
import {POLICY} from '../../src/marketplace-validation.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('BB_MARKETPLACE_TEST_URL is required for real PostgreSQL/PostGIS integration');
const url=new URL(connection);
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Integration is restricted to an explicitly disposable local development service');
const root=new Pool({connectionString:connection});
const names=['bb_wrk0037_empty','bb_wrk0037_upgrade'];
const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'synthetic-development-proxy-key-000000',adminEmails:['owner@synthetic.invalid'],marketplaceEnabled:true,sessionDays:14,verificationHours:24,resetMinutes:15};
const digest=x=>createHash('sha256').update(x).digest('hex');
let upgrade,pool,app,owner,alice,bob,city,barangay,secondCity,main;
const call=(method,path,actor=alice,body)=>{
 const r=request(app)[method]('/api/marketplace/'+path).set('x-balhinbalay-proxy-key',config.proxyKey).set('Origin',config.appOrigin);
 if(actor)r.set('Cookie',actor.cookie);if(body!==undefined)r.send(body);return r;
};
const admin=(method,path,body,actor=owner)=>{const r=request(app)[method]('/api/admin/'+path).set('x-balhinbalay-proxy-key',config.proxyKey).set('Origin',config.appOrigin);if(actor)r.set('Cookie',actor.adminCookie||actor.cookie);if(body!==undefined)r.send(body);return r;};
async function user(email,status='active') {
 const id=uuidv7(),raw=randomBytes(32).toString('base64url'),adminRaw=randomBytes(32).toString('base64url');
 await transaction(pool,async c=>{await c.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,'synthetic-hash',$3,$4)",[id,email,status,status==='active'?new Date():null]);await ensureUserPrincipal(c,id);});
 await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day'),($4,$2,$5,'admin',now()+interval '1 day')",[uuidv7(),id,digest(raw),uuidv7(),digest('admin:'+adminRaw)]);
 return {id,cookie:'__Host-bb_session='+raw,adminCookie:'__Host-bb_admin_session='+adminRaw,raw,adminRaw};
}
async function activate(actor) {
 const r=await call('post','me/lister-access',actor,{});assert.equal(r.status,200);
 const a=await admin('post',`marketplace/lister-access/${actor.id}/approve`,{expected_version:r.body.lister_access.version});assert.equal(a.status,200);return a.body.lister_access;
}
async function draft(body={relationship:'OWNER'},actor=alice) {
 const r=await call('post','listings',actor,body);assert.equal(r.status,201,JSON.stringify(r.body));return r.body;
}
const versions=x=>({expected_version:x.listing.version,expected_property_version:x.property.version});
const complete=(type='HOUSE',transaction='RENT')=>({relationship:'OWNER',property:{property_type:type,city_id:city,barangay_id:barangay,...(type==='LAND'?{lot_area_sqm:'5.0001'}:{})},listing:{title:'Synthetic listing',description:'Synthetic integration fixture only.',transaction_type:transaction,price_amount:'12345.6789',currency_code:'PHP',availability_status:'AVAILABLE'},...(transaction==='RENT'?{rental_terms:{pricing_period:'MONTHLY'}}:{sale_terms:{payment_notes:null}})});
async function approveAuthority(x) {const r=await admin('post',`marketplace/property-authorities/${x.authority.id}/approve`,{expected_version:x.authority.version});assert.equal(r.status,200,JSON.stringify(r.body));return r.body.authority;}

await test('WRK0037 PostgreSQL/PostGIS foundation',async t=>{
 try {
  for(const name of names)await root.query(`CREATE DATABASE ${name} TEMPLATE template0`);
  pool=new Pool({connectionString:new URL('/'+names[0],connection).href});
  upgrade=new Pool({connectionString:new URL('/'+names[1],connection).href});
  await t.test('001→004 from empty and idempotent runner with real PostGIS',async()=>{
   await migrate(pool);await migrate(pool);
   assert.equal((await pool.query('SELECT count(*)::int n FROM schema_migrations')).rows[0].n,4);
   const spatial=await pool.query("SELECT extversion FROM pg_extension WHERE extname='postgis'");assert.match(spatial.rows[0].extversion,/^3\.4/);
   assert.equal((await pool.query('SELECT count(*)::int n FROM lister_access')).rows[0].n,0);
   console.log('Actual PostgreSQL/PostGIS:',(await pool.query('SELECT version() AS pg,PostGIS_Full_Version() AS postgis')).rows[0]);
  });
  await t.test('account-only upgrade preserves every original user/action/session field and principal UUIDv7',async()=>{
   await upgrade.query('CREATE TABLE schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
   for(const name of ['001_accounts.sql','002_session_purpose.sql']){await upgrade.query(await readFile(new URL('../../migrations/'+name,import.meta.url),'utf8'));await upgrade.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);}
   const id=uuidv7(),action=uuidv7(),sid=uuidv7();
   await upgrade.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,'old@synthetic.invalid','synthetic-hash','active',now())",[id]);
   await upgrade.query("INSERT INTO account_actions(id,user_id,purpose,token_hash,expires_at) VALUES($1,$2,'verify',$3,now()+interval '1 day')",[action,id,digest('synthetic-action')]);
   await upgrade.query("INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,now()+interval '1 day')",[sid,id,digest('synthetic-session')]);
   const before=await Promise.all(['users','account_actions','auth_sessions'].map(name=>upgrade.query('SELECT * FROM '+name+' ORDER BY id')));
   await migrate(upgrade);await migrate(upgrade);
   const after=await Promise.all(['users','account_actions','auth_sessions'].map(name=>upgrade.query('SELECT * FROM '+name+' ORDER BY id')));
   for(let i=0;i<3;i++)for(const key of Object.keys(before[i].rows[0]))assert.deepEqual(after[i].rows[0][key],before[i].rows[0][key],key);
   const principal=(await upgrade.query('SELECT * FROM principals')).rows[0];assert.equal(principal.user_id,id);assert.equal(principal.id[14],'7');assert.equal(principal.kind,'USER');
   assert.equal((await upgrade.query('SELECT count(*)::int n FROM lister_access')).rows[0].n,0);
  });
  await t.test('failed migration is atomic and concurrent runners are serialised',async()=>{
   await Promise.all([migrate(pool),migrate(pool)]);
   const dir=await mkdtemp(join(tmpdir(),'bb-wrk0037-migrate-'));
   try{await writeFile(join(dir,'001_atomic_probe.sql'),'CREATE TABLE atomic_probe(id integer); SELECT wrk0037_missing_function();');await assert.rejects(migrate(pool,{directory:dir}));assert.equal((await pool.query("SELECT to_regclass('atomic_probe') AS id")).rows[0].id,null);assert.equal((await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE name='001_atomic_probe.sql'")).rows[0].n,0);}finally{await rm(dir,{recursive:true});}
  });
  owner=await user(config.adminEmails[0]);alice=await user('alice@synthetic.invalid');bob=await user('bob@synthetic.invalid');
  app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});
  const region=uuidv7();city=uuidv7();barangay=uuidv7();secondCity=uuidv7();
  await pool.query("INSERT INTO regions VALUES($1,'SYNTHETIC-REGION','Synthetic region')",[region]);
  await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$3,'SYNTHETIC-CITY-A','Synthetic city A','CITY'),($2,$3,'SYNTHETIC-CITY-B','Synthetic city B','CITY')",[city,secondCity,region]);
  await pool.query("INSERT INTO barangays VALUES($1,$2,'SYNTHETIC-BARANGAY','Synthetic barangay')",[barangay,city]);
  await t.test('ordinary verified session and canonical Origin/proxy key are mandatory',async()=>{
   assert.equal((await call('get','me/lister-access',null)).status,401);
   assert.equal((await request(app).get('/api/marketplace/me/lister-access').set('Cookie',alice.cookie)).status,403);
   assert.equal((await call('post','me/lister-access',alice,{}).set('Origin','https://attacker.invalid')).status,403);
   assert.equal((await call('get','me/lister-access',{cookie:owner.adminCookie})).status,401);
   assert.equal((await call('get','me/lister-access',{cookie:'__Host-bb_session='+owner.adminRaw})).status,401);
   assert.equal((await admin('get','marketplace/lister-access',undefined,{cookie:owner.cookie})).status,401);
   assert.equal((await admin('get','marketplace/lister-access',undefined,bob)).status,401);
  });
  await t.test('pending request retries are idempotent and cannot grant capability',async()=>{
   const responses=await Promise.all([call('post','me/lister-access',alice,{}),call('post','me/lister-access',alice,{})]);responses.forEach(r=>assert.equal(r.status,200));
   assert.equal(responses[0].body.lister_access.status,'pending');assert.equal(responses[0].body.lister_access.version,'1');
   assert.equal((await pool.query("SELECT count(*)::int n FROM audit_events WHERE entity_uuid=$1 AND action='capability_requested'",[alice.id])).rows[0].n,1);
   assert.equal((await call('post','me/lister-access',alice,{status:'active'})).status,422);
   assert.equal((await call('post','listings',alice,{relationship:'OWNER'})).status,403);
   await activate(alice);
  });
  await t.test('incomplete persistent private draft has server UUIDv7 identity and declared authority',async()=>{
   main=await draft();for(const id of [main.listing.id,main.property.id,main.authority.id,main.listing.owner_principal_id])assert.equal(id[14],'7');
   assert.equal(main.authority.verification_state,'declared');assert.equal(main.listing.review_status,'draft');assert.equal(main.listing.market_status,'unlisted');assert.equal(main.listing.price_amount,null);
   const read=await call('get','listings/'+main.listing.id);assert.equal(read.status,200);assert.equal(read.body.property.id,main.property.id);
   const collection=await call('get','me/listings');assert.equal(collection.body.listings[0].id,main.listing.id);
  });
  await t.test('IDOR, actor/status mass assignment and raw arbitrary resources are denied',async()=>{
   assert.equal((await call('get','listings/'+main.listing.id,bob)).status,404);
   await activate(bob);assert.equal((await call('patch','listings/'+main.listing.id,bob,{...versions(main),listing:{title:'attack'}})).status,404);
   assert.equal((await call('post','listings',alice,{relationship:'OWNER',owner_principal_id:main.listing.owner_principal_id})).status,422);
   for(const key of ['review_status','market_status','responsible_lister_user_id','public_map_point','approved_submission_id'])assert.equal((await call('patch','listings/'+main.listing.id,alice,{...versions(main),listing:{[key]:'active'}})).status,422,key);
   assert.equal((await call('get','conversations')).status,404);
   assert.equal((await call('post','listings',bob,{property_id:main.property.id,authority_id:main.authority.id})).status,404);
  });
  await t.test('NULL/zero/decimal precision, bad currency/geography/applicability/occupancy checks',async()=>{
   const zero=await draft({...complete(),property:{...complete().property,bedrooms:0,bathrooms:null},rental_terms:{pricing_period:'MONTHLY',deposit:'0'}});
   assert.equal(zero.property.bedrooms,0);assert.equal(zero.property.bathrooms,null);assert.equal(zero.rental_terms.deposit,'0.0000');assert.equal(zero.listing.price_amount,'12345.6789');
   for(const listing of [{price_amount:123.45},{price_amount:'0'},{price_amount:'1.00001'},{currency_code:'ZZZ'},{availability_status:'UNKNOWN'},{available_from:'2026-02-30'}])assert.equal((await call('patch','listings/'+main.listing.id,alice,{...versions(main),listing})).status,422);
   assert.equal((await call('post','listings',alice,{...complete(),property:{property_type:'HOUSE',city_id:secondCity,barangay_id:barangay}})).status,422);
   assert.equal((await call('post','listings',alice,{...complete('LAND'),property:{...complete('LAND').property,bedrooms:2}})).status,422);
   assert.equal((await call('post','listings',alice,{...complete('ROOM'),details:{max_occupants:1,bathroom_access:'SHARED'},rental_terms:{pricing_period:'MONTHLY',offering_mode:'BEDSPACE',current_occupants:2}})).status,422);
  });
  await t.test('stale listing/property versions and simultaneous saves produce one winner',async()=>{
   const responses=await Promise.all([call('patch','listings/'+main.listing.id,alice,{...versions(main),listing:{title:'first'}}),call('patch','listings/'+main.listing.id,alice,{...versions(main),listing:{title:'second'}})]);
   assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);main=responses.find(r=>r.status===200).body;
   assert.equal((await call('patch','listings/'+main.listing.id,alice,{...versions(main),expected_property_version:'1'})).status,409);
  });
  await t.test('declared authority blocks complete submission; independent manual approval is purpose gated',async()=>{
   const x=await draft(complete());
   let result=await call('post','listings/'+x.listing.id+'/submissions',alice,versions(x));assert.equal(result.status,422);assert.ok(result.body.fields.authority);
   assert.equal((await admin('post',`marketplace/property-authorities/${x.authority.id}/approve`,{expected_version:x.authority.version},{cookie:owner.cookie})).status,401);
   const approved=await approveAuthority(x);assert.equal(approved.verification_state,'verified');
   assert.equal((await admin('post',`marketplace/property-authorities/${x.authority.id}/approve`,{expected_version:x.authority.version})).status,409);
   const responses=await Promise.all([call('post','listings/'+x.listing.id+'/submissions',alice,versions(x)),call('post','listings/'+x.listing.id+'/submissions',alice,versions(x))]);assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);
   result=await call('get','listings/'+x.listing.id);assert.equal(result.body.listing.review_status,'pending');assert.equal(result.body.listing.market_status,'unlisted');assert.equal(result.body.listing.approved_submission_id,null);assert.equal(result.body.listing.published_at,null);
   assert.equal((await call('patch','listings/'+x.listing.id,alice,versions(result.body))).status,409);
  });
  await t.test('zero-photo immutable snapshot contains no private location/contact and exact policy/versions',async()=>{
   const x=await draft({...complete('LAND','SALE'),private_location:{street_address:'PRIVATE-SYNTHETIC-STREET',unit_identifier:'PRIVATE-UNIT',room_identifier:'PRIVATE-ROOM'}});await approveAuthority(x);
   await pool.query("INSERT INTO property_private_locations(property_id,exact_location) VALUES($1,ST_SetSRID(ST_MakePoint(123.1,10.2),4326)::geography) ON CONFLICT(property_id) DO UPDATE SET exact_location=excluded.exact_location",[x.property.id]);
   const r=await call('post','listings/'+x.listing.id+'/submissions',alice,versions(x));assert.equal(r.status,201,JSON.stringify(r.body));
   const row=(await pool.query('SELECT * FROM listing_submissions WHERE id=$1',[r.body.submission.id])).rows[0];
   assert.equal(row.validation_policy_version,POLICY);assert.equal(row.listing_version,x.listing.version);assert.equal(row.property_version,x.property.version);
   const output=JSON.stringify(row.payload);for(const forbidden of ['PRIVATE-','exact_location','street_address','unit_identifier','room_identifier','@synthetic.invalid','password_hash','token_hash'])assert.ok(!output.includes(forbidden),forbidden);
   assert.ok(!('photos' in row.payload));
   await assert.rejects(pool.query("UPDATE listing_submissions SET payload='{}' WHERE id=$1",[row.id]),e=>e.code==='23514');
   await assert.rejects(pool.query('DELETE FROM listing_submissions WHERE id=$1',[row.id]),e=>e.code==='23514');
   const own=await call('get','listings/'+x.listing.id);assert.ok(!JSON.stringify(own.body).includes('exact_location'));
   assert.equal((await pool.query('SELECT ST_SRID(exact_location::geometry) AS srid FROM property_private_locations WHERE property_id=$1',[x.property.id])).rows[0].srid,4326);
  });
  await t.test('Rent/Sale, building parent and Room/Land submission matrix',async()=>{
   for(const type of ['CONDO','APARTMENT','HOUSE','TOWNHOUSE','ROOM','LAND'])for(const mode of ['RENT','SALE']) {
    const data=complete(type,mode);
    if(['CONDO','APARTMENT','ROOM'].includes(type))data.development={development_type:type==='CONDO'?'CONDOMINIUM':type==='APARTMENT'?'APARTMENT_BUILDING':'BOARDING_HOUSE',name:'Synthetic building'};
    if(type==='ROOM'){data.details={max_occupants:2,bathroom_access:'NONE'};if(mode==='RENT')data.rental_terms={pricing_period:'DAILY',offering_mode:'PRIVATE_ROOM',current_occupants:0};}
    const x=await draft(data);await approveAuthority(x);const r=await call('post','listings/'+x.listing.id+'/submissions',alice,versions(x));assert.equal(r.status,201,type+'/'+mode+': '+JSON.stringify(r.body));
   }
   const room=await draft(complete('ROOM'));await approveAuthority(room);const r=await call('post','listings/'+room.listing.id+'/submissions',alice,versions(room));assert.equal(r.status,422);for(const key of ['property.parent_property_id','details.max_occupants','details.bathroom_access','rental_terms.offering_mode','rental_terms.current_occupants'])assert.ok(r.body.fields[key],key);
   const condo=await draft(complete('CONDO'));await approveAuthority(condo);assert.ok((await call('post','listings/'+condo.listing.id+'/submissions',alice,versions(condo))).body.fields['property.development_id']);
  });
  await t.test('draft type and transaction switches retain applicable values and reject stale context',async()=>{
   const x=await draft({...complete('ROOM'),development:{development_type:'BOARDING_HOUSE',name:'Synthetic type switch'},details:{max_occupants:2,bathroom_access:'SHARED'},rental_terms:{pricing_period:'MONTHLY',offering_mode:'BEDSPACE',current_occupants:0}});
   let r=await call('patch','listings/'+x.listing.id,alice,{...versions(x),property:{property_type:'HOUSE'},details:{storeys:2},rental_terms:{offering_mode:null,current_occupants:null}});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.details.storeys,2);
   r=await call('patch','listings/'+x.listing.id,alice,{...versions(r.body),listing:{transaction_type:'SALE'},sale_terms:{payment_notes:'Synthetic optional note'}});assert.equal(r.status,200,JSON.stringify(r.body));assert.deepEqual(r.body.rental_terms,{});assert.equal(r.body.sale_terms.payment_notes,'Synthetic optional note');
   const room=await draft({...complete('ROOM'),development:{development_type:'BOARDING_HOUSE',name:'Synthetic archived context'},details:{max_occupants:1,bathroom_access:'PRIVATE'},rental_terms:{pricing_period:'DAILY',offering_mode:'PRIVATE_ROOM',current_occupants:0}});await approveAuthority(room);
   await pool.query('UPDATE developments SET archived_at=now() WHERE id=$1',[room.property.development_id]);assert.equal((await call('post','listings/'+room.listing.id+'/submissions',alice,versions(room))).status,422);
  });
  await t.test('authority declaration change invalidates approval without silently retaining it',async()=>{
   const x=await draft(complete());const a=await approveAuthority(x);
   const r=await call('patch','listings/'+x.listing.id,alice,{...versions(x),relationship:'PROPERTY_MANAGER',expected_authority_version:a.version});assert.equal(r.status,200);assert.equal(r.body.authority.verification_state,'declared');
   assert.equal((await call('post','listings/'+x.listing.id+'/submissions',alice,versions(r.body))).status,422);
  });
  await t.test('two authorised Listers can have separate adverts for the same physical property',async()=>{
   const x=await draft(complete());const principal=(await pool.query('SELECT id FROM principals WHERE user_id=$1',[bob.id])).rows[0].id;const authority=uuidv7();
   await pool.query("INSERT INTO property_authorities(id,property_id,principal_id,relationship) VALUES($1,$2,$3,'AGENT_BROKER')",[authority,x.property.id,principal]);
   const r=await call('post','listings',bob,{property_id:x.property.id,authority_id:authority});assert.equal(r.status,201);assert.equal(r.body.property.id,x.property.id);assert.notEqual(r.body.listing.id,x.listing.id);
   assert.equal((await call('get','listings/'+x.listing.id,bob)).status,404);
   assert.equal((await call('get','listings/'+r.body.listing.id,alice)).status,404);
  });
  await t.test('suspended/revoked capability denies writes; consumer retry cannot restore; admin restore works',async()=>{
   for(const action of ['suspend','revoke']) {
    let cap=(await call('get','me/lister-access')).body.lister_access;
    const a=await admin('post',`marketplace/lister-access/${alice.id}/${action}`,{expected_version:cap.version});assert.equal(a.status,200);
    assert.equal((await call('post','listings',alice,{relationship:'OWNER'})).status,403);
    assert.equal((await call('patch','listings/'+main.listing.id,alice,versions(main))).status,403);
    cap=(await call('post','me/lister-access',alice,{})).body.lister_access;assert.equal(cap.status,action==='suspend'?'suspended':'revoked');
    assert.equal((await admin('post',`marketplace/lister-access/${alice.id}/approve`,{expected_version:cap.version})).status,200);
   }
  });
  await t.test('revoked, expired, wrong-purpose and suspended/unverified base accounts fail closed',async()=>{
   const actor=await user('denied@synthetic.invalid');
   await pool.query("UPDATE auth_sessions SET revoked_at=now() WHERE token_hash=$1",[digest(actor.raw)]);assert.equal((await call('get','me/lister-access',actor)).status,401);
   await pool.query("UPDATE auth_sessions SET revoked_at=NULL,expires_at=now()-interval '1 hour' WHERE token_hash=$1",[digest(actor.raw)]);assert.equal((await call('get','me/lister-access',actor)).status,401);
   await pool.query("UPDATE auth_sessions SET expires_at=now()+interval '1 hour',purpose='admin' WHERE token_hash=$1",[digest(actor.raw)]);assert.equal((await call('get','me/lister-access',actor)).status,401);
   await pool.query("UPDATE auth_sessions SET purpose='user' WHERE token_hash=$1",[digest(actor.raw)]);await pool.query("UPDATE users SET status='suspended' WHERE id=$1",[actor.id]);assert.equal((await call('get','me/lister-access',actor)).status,401);
   const pending=await user('pending@synthetic.invalid','pending');assert.equal((await call('post','me/lister-access',pending,{})).status,401);
  });
  await t.test('guarded admin hard-delete retains history and permits unreferenced disposable users',async()=>{
   assert.equal((await admin('delete','accounts/'+alice.id)).status,409);assert.equal((await pool.query('SELECT id FROM users WHERE id=$1',[alice.id])).rowCount,1);
   const fresh=await user('disposable@synthetic.invalid');assert.equal((await admin('delete','accounts/'+fresh.id)).status,204);assert.equal((await pool.query('SELECT id FROM principals WHERE user_id=$1',[fresh.id])).rowCount,0);
   assert.equal((await guardedDeleteAccount(pool,owner.id)).history,true);
  });
  await t.test('new registered and admin-provisioned users get atomic UUIDv7 principals without Lister grants',async()=>{
   assert.equal((await request(app).post('/api/auth/register').set('x-balhinbalay-proxy-key',config.proxyKey).set('Origin',config.appOrigin).send({email:'registered@synthetic.invalid',password:'Synthetic password 1234'})).status,201);
   const provision=await admin('post','accounts',{email:'provisioned@synthetic.invalid',password:'Synthetic password 1234'});assert.equal(provision.status,201);
   for(const email of ['registered@synthetic.invalid','provisioned@synthetic.invalid']){const row=(await pool.query('SELECT p.id,p.kind,u.id AS uid FROM principals p JOIN users u ON u.id=p.user_id WHERE u.email=$1',[email])).rows[0];assert.equal(row.id[14],'7');assert.equal(row.kind,'USER');assert.equal((await pool.query('SELECT 1 FROM lister_access WHERE user_id=$1',[row.uid])).rowCount,0);}
  });
  await t.test('real deferred extension/terms checks, city FK, feature scope and alias cycle enforce integrity',async()=>{
   const x=await draft(complete());
   await assert.rejects(transaction(pool,async c=>{await c.query('INSERT INTO room_details(property_id) VALUES($1)',[x.property.id]);}),e=>e.code==='23514');
   await assert.rejects(transaction(pool,async c=>{await c.query('DELETE FROM house_details WHERE property_id=$1',[x.property.id]);}),e=>e.code==='23514');
   await assert.rejects(transaction(pool,async c=>{await c.query('INSERT INTO sale_terms(listing_id) VALUES($1)',[x.listing.id]);}),e=>e.code==='23514');
   await assert.rejects(pool.query('UPDATE properties SET city_id=$1 WHERE id=$2',[secondCity,x.property.id]),e=>e.code==='23503');
   await pool.query("INSERT INTO features VALUES('SYNTHETIC-DEVELOPMENT','Synthetic feature','DEVELOPMENT',true)");
   await assert.rejects(pool.query("INSERT INTO property_features VALUES($1,'SYNTHETIC-DEVELOPMENT')",[x.property.id]),e=>e.code==='23514');
   const y=await draft();
   await assert.rejects(transaction(pool,async c=>{await c.query('INSERT INTO property_aliases(old_property_id,canonical_property_id,merged_by_user_id) VALUES($1,$2,$3),($2,$1,$3)',[x.property.id,y.property.id,owner.id]);}),e=>e.code==='23514');
   await assert.rejects(pool.query('UPDATE properties SET parent_property_id=id WHERE id=$1',[x.property.id]),e=>e.code==='23514');
   const other=await draft();await assert.rejects(pool.query('UPDATE listings SET authority_id=$1 WHERE id=$2',[other.authority.id,x.listing.id]),e=>e.code==='23503');
   await assert.rejects(pool.query("UPDATE audit_events SET metadata='{}'"),e=>e.code==='23514');
  });
 } finally {
  if(upgrade)await upgrade.end();
  if(pool)await pool.end();
  for(const name of names)await root.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  await root.end();
 }
});
