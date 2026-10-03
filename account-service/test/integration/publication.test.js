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
import {ensureUserPrincipal,transaction} from '../../src/marketplace-identity.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable PostgreSQL/PostGIS URL required');
const url=new URL(connection);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Synthetic disposable service only');
const root=new Pool({connectionString:connection}),db='bb_wrk0040_publication';
const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'synthetic-moderation-proxy-key-000000',adminEmails:['reviewer@synthetic.invalid','reviewer2@synthetic.invalid'],marketplaceEnabled:true,moderationEnabled:true,publicationEnabled:true,sessionDays:14,verificationHours:24,resetMinutes:15};
const sha=s=>createHash('sha256').update(s).digest('hex');
let pool,app,reviewer,lister,stranger,city,barangay;
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
async function current(x){return {...x,version:(await consumer('get','listings/'+x.listingId)).body.listing.version};}
await test('WRK0040 real PostgreSQL/PostGIS publication',async t=>{
 try{
  await root.query(`CREATE DATABASE ${db} TEMPLATE template0`);pool=new Pool({connectionString:new URL('/'+db,connection).href});await migrate(pool);await migrate(pool);
  app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});
  reviewer=await user(config.adminEmails[0]);lister=await user('lister@synthetic.invalid');stranger=await user('stranger@synthetic.invalid');await grant(lister);await grant(stranger);
  const region=uuidv7();city=uuidv7();barangay=uuidv7();
  await pool.query("INSERT INTO regions VALUES($1,'PUB-SYNTHETIC','Synthetic region')",[region]);
  await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'PUB-CITY','Synthetic city','CITY')",[city,region]);await pool.query("INSERT INTO barangays VALUES($1,$2,'PUB-BRGY','Synthetic barangay')",[barangay,city]);
  await t.test('draft/pending/rejected/unreviewed and archived remain non-public and cannot activate',async()=>{
   const r=await consumer('post','listings',{relationship:'OWNER'});assert.equal(r.status,201);const draft={listingId:r.body.listing.id,version:r.body.listing.version};
   // Even a manually approved authority cannot bypass missing content/review.
   await admin('post',`property-authorities/${r.body.authority.id}/approve`,{expected_version:r.body.authority.version});
   assert.equal((await change(draft)).status,409);
   const pendingListing=await pending();assert.equal((await change(pendingListing)).status,409);
   await decide(pendingListing,'reject',{reason:'Synthetic rejection'});const rejected=await current(pendingListing);assert.equal((await change(rejected)).status,409);
   const a=await approvedFixture();await pool.query("UPDATE listings SET archived_at=now() WHERE id=$1",[a.listingId]);assert.equal((await change(a)).status,409);
   for(const x of [draft,rejected,a])assert.deepEqual((await publicRead(x.listingId)).body,(await publicRead(uuidv7())).body);
   const bare=await pending();await pool.query("UPDATE listings SET review_status='approved',approved_submission_id=$2,version=version+1 WHERE id=$1",[bare.listingId,bare.submissionId]);assert.equal((await change(await current(bare))).status,409);
   assert.equal((await publicRead(bare.listingId)).status,404);
  });
  await t.test('ordinary verified owner, active capability and exact active verified authority are mandatory',async()=>{
   const x=await approvedFixture();
   for(const actor of [null,{cookie:reviewer.adminCookie},{cookie:lister.adminCookie}])assert.equal((await change(x,'activate',{},actor)).status,401);
   assert.equal((await change(x,'activate',{},stranger)).status,404);
   for(const state of ['suspended','revoked','pending']){await pool.query('UPDATE lister_access SET status=$2 WHERE user_id=$1',[lister.id,state]);assert.equal((await change(x)).status,403);}await pool.query("UPDATE lister_access SET status='active' WHERE user_id=$1",[lister.id]);
   for(const assignment of ["status='suspended'","status='pending',email_verified_at=NULL","deleted_at=now()","anonymised_at=now()"]){await pool.query('UPDATE users SET '+assignment+' WHERE id=$1',[lister.id]);assert.equal((await change(x)).status,401);await pool.query("UPDATE users SET status='active',email_verified_at=now(),deleted_at=NULL,anonymised_at=NULL WHERE id=$1",[lister.id]);}
   for(const state of ['declared','pending','rejected']){await pool.query('UPDATE property_authorities SET verification_state=$2 WHERE id=$1',[x.authorityId,state]);assert.equal((await change(x)).status,403);}await pool.query("UPDATE property_authorities SET verification_state='verified' WHERE id=$1",[x.authorityId]);
   for(const state of ['suspended','revoked']){await pool.query('UPDATE property_authorities SET status=$2 WHERE id=$1',[x.authorityId,state]);assert.equal((await change(x)).status,403);}await pool.query("UPDATE property_authorities SET status='active' WHERE id=$1",[x.authorityId]);
   assert.equal((await change(x).set('Origin','https://attacker.invalid')).status,403);
   assert.equal((await change(x).set('x-balhinbalay-proxy-key','wrong')).status,403);
   assert.equal((await publicRead(x.listingId).set('x-balhinbalay-proxy-key','wrong')).status,403);
   assert.equal((await change(x,'activate',{expected_version:'1'})).status,409);
   for(const body of [{review_status:'approved'},{approved_submission_id:x.submissionId},{owner_principal_id:uuidv7()},{responsible_lister_user_id:stranger.id},{published_at:new Date().toISOString()},{public_map_point:{lat:1,lng:2}},{location_confirmed_at:new Date().toISOString()},{private_location:{street_address:'unsafe'}}])assert.equal((await change(x,'activate',body)).status,422);
  });
  await t.test('immutable approved projection ignores divergent live draft, private location and account/contact fields; zero photos/no point publish',async()=>{
   const x=await approvedFixture();const saved=(await pool.query('SELECT * FROM listing_submissions WHERE id=$1',[x.submissionId])).rows[0];
   await pool.query("UPDATE listings SET title='UNREVIEWED SECRET',description='UNREVIEWED private draft',price_amount=999999 WHERE id=$1",[x.listingId]);
   await pool.query("UPDATE properties SET bedrooms=99 WHERE id=$1",[x.propertyId]);
   await pool.query("UPDATE property_private_locations SET exact_location=ST_SetSRID(ST_MakePoint(121.123456,14.654321),4326)::geography WHERE property_id=$1",[x.propertyId]);
   assert.equal((await change(x)).status,200);
   let r=await publicRead(x.listingId);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.headers['cache-control'],'no-store');const p=r.body.listing;
   assert.equal(p.title,saved.payload.listing.title);assert.equal(p.price_amount,saved.payload.listing.price_amount);assert.equal(p.available_from,'2026-11-01');assert.equal(p.property.bedrooms,null);assert.equal(p.location.city,'Synthetic city');assert.equal(p.location.barangay,'Synthetic barangay');assert.equal(p.location.map_point,null);assert.ok(p.published_at);
   assert.doesNotMatch(JSON.stringify(p),/UNREVIEWED|PRIVATE-|121\.123456|14\.654321|@synthetic|street_address|unit_identifier|room_identifier|exact_location|email|phone|password|token|principal|authority|submission_id|responsible_lister/);
   assert.deepEqual((await pool.query('SELECT * FROM listing_submissions WHERE id=$1',[x.submissionId])).rows[0],saved);
   assert.equal((await publicRead(x.listingId+'?include=private')).status,404);
   const own=(await consumer('get','listings/'+x.listingId)).body;
   assert.equal((await consumer('patch','listings/'+x.listingId,{expected_version:own.listing.version,expected_property_version:own.property.version,listing:{title:'edit'}})).status,409);
  });
  await t.test('confirmed permitted shared-building point is exact; private/absent/revoked or unresolved standalone pin never substitutes',async()=>{
   const x=await approvedFixture(true);await pool.query("UPDATE property_private_locations SET exact_location=ST_SetSRID(ST_MakePoint(120.9,14.9),4326)::geography WHERE property_id=$1",[x.propertyId]);
   assert.equal((await change(x)).status,200);assert.equal((await publicRead(x.listingId)).body.listing.location.map_point,null);
   await pool.query("UPDATE listings SET public_map_point=ST_SetSRID(ST_MakePoint(123.75,10.25),4326)::geography,location_confirmed_at=now() WHERE id=$1",[x.listingId]);
   assert.deepEqual((await publicRead(x.listingId)).body.listing.location.map_point,{lat:10.25,lng:123.75});
   await pool.query('UPDATE listings SET public_map_point=NULL,location_confirmed_at=NULL WHERE id=$1',[x.listingId]);assert.equal((await publicRead(x.listingId)).body.listing.location.map_point,null);
   const house=await approvedFixture();await pool.query("UPDATE listings SET public_map_point=ST_SetSRID(ST_MakePoint(123.75,10.25),4326)::geography,location_confirmed_at=now() WHERE id=$1",[house.listingId]);assert.equal((await change(house)).status,200);assert.equal((await publicRead(house.listingId)).body.listing.location.map_point,null);
  });
  await t.test('current eligibility loss removes public access without disclosing state; restoration returns eligible content',async()=>{
   const x=await approvedFixture();await change(x);
   for(const state of ['suspended','revoked']){await pool.query('UPDATE lister_access SET status=$2 WHERE user_id=$1',[lister.id,state]);assert.equal((await publicRead(x.listingId)).status,404);await pool.query("UPDATE lister_access SET status='active' WHERE user_id=$1",[lister.id]);assert.equal((await publicRead(x.listingId)).status,200);}
   await pool.query("UPDATE property_authorities SET status='revoked' WHERE id=$1",[x.authorityId]);assert.equal((await publicRead(x.listingId)).status,404);await pool.query("UPDATE property_authorities SET status='active' WHERE id=$1",[x.authorityId]);
   await pool.query("UPDATE users SET status='suspended' WHERE id=$1",[lister.id]);assert.equal((await publicRead(x.listingId)).status,404);await pool.query("UPDATE users SET status='active' WHERE id=$1",[lister.id]);assert.equal((await publicRead(x.listingId)).status,200);
   await pool.query('UPDATE listings SET archived_at=now() WHERE id=$1',[x.listingId]);assert.equal((await publicRead(x.listingId)).status,404);
  });
  await t.test('unlist and reactivation preserve snapshot, first timestamp and coherent status/audit history',async()=>{
   const x=await approvedFixture();assert.equal((await publicRead(x.listingId)).status,404);assert.equal((await change(x)).status,200);const published=(await publicRead(x.listingId)).body.listing.published_at;
   const active=await current(x);assert.equal((await change(active,'unlist')).status,200);assert.equal((await publicRead(x.listingId)).status,404);assert.equal((await change(active,'unlist')).status,409);
   assert.equal((await change(await current(x))).status,200);assert.equal((await publicRead(x.listingId)).body.listing.published_at,published);
   const states=(await pool.query("SELECT old_market_status,new_market_status FROM listing_status_history WHERE listing_id=$1 AND reason LIKE 'Lister %' ORDER BY created_at,id",[x.listingId])).rows;assert.deepEqual(states,[{old_market_status:'unlisted',new_market_status:'active'},{old_market_status:'active',new_market_status:'unlisted'},{old_market_status:'unlisted',new_market_status:'active'}]);
   const events=(await pool.query("SELECT action,metadata FROM audit_events WHERE entity_uuid=$1 AND action IN ('listing_activate','listing_unlist') ORDER BY created_at,id",[x.listingId])).rows;assert.deepEqual(events.map(e=>e.action),['listing_activate','listing_unlist','listing_activate']);assert.ok(events.every(e=>e.metadata.submission_id===x.submissionId&&BigInt(e.metadata.new_version)===BigInt(e.metadata.old_version)+1n));
  });
  await t.test('concurrent same-version activation/unlisting yields one authoritative transition and no double audit',async()=>{
   const x=await approvedFixture();let results=await Promise.all([change(x),change(x)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
   const active=await current(x);results=await Promise.all([change(active,'unlist'),change(active)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal((await publicRead(x.listingId)).status,404);
   const off=await current(x);assert.equal((await change(off)).status,200);const again=await current(x);results=await Promise.all([change(again,'unlist'),change(again,'unlist')]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal((await publicRead(x.listingId)).status,404);
   assert.equal((await pool.query("SELECT count(*)::int n FROM audit_events WHERE entity_uuid=$1 AND action IN ('listing_activate','listing_unlist')",[x.listingId])).rows[0].n,4);
  });
  await t.test('missing/cross-listing/rejected or obsolete approved submission cannot be published',async()=>{
   const a=await approvedFixture(),b=await approvedFixture();
   await assert.rejects(pool.query('UPDATE listings SET approved_submission_id=$2 WHERE id=$1',[a.listingId,b.submissionId]),e=>e.code==='23503');
   await pool.query('UPDATE listings SET approved_submission_id=NULL WHERE id=$1',[a.listingId]);assert.equal((await change(a)).status,409);
   // Synthetic invalid legacy state: a newer immutable submission invalidates an older selection.
   await pool.query("INSERT INTO listing_submissions(id,listing_id,listing_version,property_version,validation_policy_version,payload,submitted_by_user_id) SELECT $1,listing_id,listing_version+100,property_version,validation_policy_version,payload,submitted_by_user_id FROM listing_submissions WHERE id=$2",[uuidv7(),b.submissionId]);
   assert.equal((await change(b)).status,409);assert.equal((await publicRead(b.listingId)).status,404);
  });
  await t.test('failed audit rolls back publication timestamp, version, market status and history atomically',async()=>{
   const x=await approvedFixture();const before=(await pool.query('SELECT * FROM listings WHERE id=$1',[x.listingId])).rows[0];
   await pool.query("CREATE FUNCTION fail_publication_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='listing_activate' THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_publication_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION fail_publication_audit()");
   try{assert.equal((await change(x)).status,503);assert.deepEqual((await pool.query('SELECT * FROM listings WHERE id=$1',[x.listingId])).rows[0],before);assert.equal((await publicRead(x.listingId)).status,404);assert.equal((await pool.query("SELECT count(*)::int n FROM listing_status_history WHERE listing_id=$1 AND reason='Lister activate'",[x.listingId])).rows[0].n,0);}finally{await pool.query('DROP TRIGGER fail_publication_audit ON audit_events; DROP FUNCTION fail_publication_audit()');}
   assert.equal((await change(x)).status,200);
  });
 }finally{
  if(pool)await pool.end();
  try{for(let attempt=0;attempt<100;attempt++){const n=(await root.query('SELECT count(*)::int n FROM pg_stat_activity WHERE datname=$1',[db])).rows[0].n;if(!n)break;if(attempt===99)throw new Error('Disposable connections did not close');await new Promise(resolve=>setTimeout(resolve,20));}await root.query(`DROP DATABASE IF EXISTS ${db}`);}finally{await root.end();}
 }
});
