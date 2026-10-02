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
const root=new Pool({connectionString:connection}),db='bb_wrk0039_moderation';
const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'synthetic-moderation-proxy-key-000000',adminEmails:['reviewer@synthetic.invalid','reviewer2@synthetic.invalid'],marketplaceEnabled:true,moderationEnabled:true,sessionDays:14,verificationHours:24,resetMinutes:15};
const sha=s=>createHash('sha256').update(s).digest('hex');
let pool,app,reviewer,reviewer2,lister,stranger,city,barangay;
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
async function pending(actor=lister) {
 let r=await consumer('post','listings',{relationship:'OWNER',property:{property_type:'HOUSE',city_id:city,barangay_id:barangay},listing:{title:'Synthetic pending house',description:'Synthetic moderation fixture only.',transaction_type:'SALE',price_amount:'1234.50',currency_code:'PHP',availability_status:'AVAILABLE'},private_location:{street_address:'PRIVATE-NOT-REVIEW-CONTENT',unit_identifier:'PRIVATE-UNIT'}},actor);assert.equal(r.status,201,JSON.stringify(r.body));
 const d=r.body;
 r=await admin('post',`property-authorities/${d.authority.id}/approve`,{expected_version:d.authority.version});assert.equal(r.status,200);
 r=await consumer('post',`listings/${d.listing.id}/submissions`,{expected_version:d.listing.version,expected_property_version:d.property.version},actor);assert.equal(r.status,201,JSON.stringify(r.body));
 const own=await consumer('get','listings/'+d.listing.id,undefined,actor);assert.equal(own.status,200);
 return {listingId:d.listing.id,submissionId:r.body.submission.id,version:own.body.listing.version,propertyVersion:own.body.property.version,authorityId:d.authority.id};
}
const decide=(x,action='approve',body={},actor=reviewer)=>admin('post',resource(x)+'/'+action,{expected_version:x.version,...body},actor);
await test('WRK0039 real PostgreSQL/PostGIS moderation',async t=>{
 try {
  await root.query(`CREATE DATABASE ${db} TEMPLATE template0`);pool=new Pool({connectionString:new URL('/'+db,connection).href});await migrate(pool);await migrate(pool);
  app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});
  reviewer=await user(config.adminEmails[0]);reviewer2=await user(config.adminEmails[1]);lister=await user('lister@synthetic.invalid');stranger=await user('stranger@synthetic.invalid');await grant(lister);await grant(stranger);
  const region=uuidv7();city=uuidv7();barangay=uuidv7();
  await pool.query("INSERT INTO regions VALUES($1,'MOD-SYNTHETIC','Synthetic region')",[region]);
  await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'MOD-CITY','Synthetic city','CITY')",[city,region]);await pool.query("INSERT INTO barangays VALUES($1,$2,'MOD-BRGY','Synthetic barangay')",[barangay,city]);
  const first=await pending();
  await t.test('reviewer-only queue/detail: ordinary, wrong-purpose, non-allowlisted, missing credentials denied',async()=>{
   for(const actor of [null,{cookie:lister.cookie},{cookie:reviewer.cookie},{cookie:'__Host-bb_admin_session='+reviewer.raw},stranger]) {
    const status=actor===stranger?403:401;
    assert.equal((await admin('get','listing-submissions',undefined,actor)).status,status);
    assert.equal((await admin('get',resource(first),undefined,actor)).status,status);
    assert.equal((await decide(first,'approve',{},actor)).status,status);
    assert.equal((await decide(first,'reject',{reason:'Denied'},actor)).status,status);
   }
   config.adminEmails=[];assert.equal((await admin('get','listing-submissions')).status,403);config.adminEmails=['reviewer@synthetic.invalid','reviewer2@synthetic.invalid'];
   assert.equal((await call('get','/api/admin/marketplace/listing-submissions',undefined,reviewer.adminCookie).set('x-balhinbalay-proxy-key','wrong')).status,403);
   assert.equal((await decide(first).set('Origin','https://attacker.invalid')).status,403);
  });
  await t.test('pending snapshot and necessary context are private, bounded, matched and never consumer review resources',async()=>{
   let r=await admin('get','listing-submissions');assert.equal(r.status,200);assert.equal(r.headers['cache-control'],'no-store');assert.equal(r.body.submissions[0].id,first.submissionId);assert.equal(r.body.submissions[0].payload,undefined);
   r=await admin('get',resource(first));assert.equal(r.status,200);assert.equal(r.body.submission.expected_version,first.version);assert.equal(r.body.context.verification_state,'verified');assert.equal(r.body.submission.payload.listing.title,'Synthetic pending house');
   assert.doesNotMatch(JSON.stringify(r.body),/PRIVATE-NOT|PRIVATE-UNIT|@synthetic|token_hash|password_hash/);
   assert.equal((await consumer('get',resource(first))).status,404);assert.equal((await consumer('get','listing-submissions')).status,404);
   assert.equal((await admin('get','listing-submissions?sort=arbitrary')).status,422);
   assert.equal((await admin('get',resource({...first,listingId:uuidv7()}))).status,404);
   assert.equal((await decide({...first,listingId:uuidv7()})).status,404);
  });
  await t.test('stale review and review-state/actor mass assignment cannot alter a pending listing',async()=>{
   assert.equal((await decide(first,'approve',{expected_version:'1'})).status,409);
   for(const body of [{approved_submission_id:uuidv7()},{reviewer_user_id:lister.id},{market_status:'active'},{outcome:'approved'}])assert.equal((await decide(first,'approve',body)).status,422);
   assert.equal((await consumer('patch','listings/'+first.listingId,{expected_version:first.version,expected_property_version:first.propertyVersion,listing:{approved_submission_id:first.submissionId}})).status,422);
   assert.equal((await pool.query('SELECT count(*)::int n FROM listing_submission_reviews')).rows[0].n,0);
  });
  await t.test('reject requires non-empty bounded reason and records one immutable decision/history',async()=>{
   for(const reason of [undefined,null,'',' \n ',42,'x'.repeat(2001)])assert.equal((await decide(first,'reject',{reason})).status,422);
   const before=(await pool.query('SELECT * FROM listing_submissions WHERE id=$1',[first.submissionId])).rows[0];
   const r=await decide(first,'reject',{reason:'  Correct the description.  '});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.review.outcome,'rejected');assert.equal(r.body.review.reason,'Correct the description.');assert.equal(r.body.review.reviewer_user_id,reviewer.id);assert.ok(r.body.review.reviewed_at);assert.equal(r.body.listing.market_status,'unlisted');assert.equal(r.body.listing.approved_submission_id,null);
   assert.deepEqual((await pool.query('SELECT * FROM listing_submissions WHERE id=$1',[first.submissionId])).rows[0],before);
   const own=await consumer('get','listings/'+first.listingId);assert.equal(own.body.review_history[0].reason,'Correct the description.');assert.equal(own.body.review_history[0].reviewer_user_id,undefined);
   for(const query of ['UPDATE listing_submission_reviews SET reason=\'overwrite\' WHERE submission_id=$1','DELETE FROM listing_submission_reviews WHERE submission_id=$1','UPDATE listing_submissions SET payload=\'{}\' WHERE id=$1'])await assert.rejects(pool.query(query,[first.submissionId]),e=>e.code==='23514');
   assert.equal((await pool.query("SELECT count(*)::int n FROM audit_events WHERE entity_uuid=$1 AND action='submission_rejected'",[first.listingId])).rows[0].n,1);
   assert.equal((await decide(first)).status,409);
  });
  await t.test('eligible rejected edit reopens draft; new immutable resubmission keeps all earlier history',async()=>{
   const rejected=(await consumer('get','listings/'+first.listingId)).body;
   assert.equal((await consumer('patch','listings/'+first.listingId,{expected_version:rejected.listing.version,expected_property_version:rejected.property.version,listing:{description:'Corrected synthetic description.'}},stranger)).status,404);
   await pool.query("UPDATE lister_access SET status='suspended' WHERE user_id=$1",[lister.id]);assert.equal((await consumer('patch','listings/'+first.listingId,{expected_version:rejected.listing.version,expected_property_version:rejected.property.version})).status,403);await pool.query("UPDATE lister_access SET status='active' WHERE user_id=$1",[lister.id]);
   let r=await consumer('patch','listings/'+first.listingId,{expected_version:rejected.listing.version,expected_property_version:rejected.property.version,listing:{description:'Corrected synthetic description.'}});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.listing.review_status,'draft');assert.equal(r.body.listing.market_status,'unlisted');
   r=await consumer('post','listings/'+first.listingId+'/submissions',{expected_version:r.body.listing.version,expected_property_version:r.body.property.version});assert.equal(r.status,201);assert.notEqual(r.body.submission.id,first.submissionId);
   const second={...first,submissionId:r.body.submission.id,version:(await consumer('get','listings/'+first.listingId)).body.listing.version};
   assert.equal((await decide({...second,submissionId:first.submissionId})).status,409);
   const detail=await admin('get',resource(second));assert.equal(detail.body.history.length,2);assert.equal(detail.body.history[0].outcome,'rejected');assert.equal(detail.body.submission.payload.listing.description,'Corrected synthetic description.');
   r=await decide(second);assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.listing.approved_submission_id,second.submissionId);assert.equal(r.body.listing.market_status,'unlisted');
   assert.equal((await pool.query('SELECT count(*)::int n FROM listing_submissions WHERE listing_id=$1',[first.listingId])).rows[0].n,2);assert.equal((await pool.query('SELECT count(*)::int n FROM listing_submission_reviews WHERE listing_id=$1',[first.listingId])).rows[0].n,2);
   const approved=(await consumer('get','listings/'+first.listingId)).body;assert.equal((await consumer('patch','listings/'+first.listingId,{expected_version:approved.listing.version,expected_property_version:approved.property.version})).status,409);
   assert.equal((await admin('get','listing-submissions')).body.submissions.some(s=>s.listing_id===first.listingId),false);
  });
  await t.test('even allowlisted admin with Lister ownership cannot self-approve',async()=>{
   await grant(reviewer);const own=await pending(reviewer);
   assert.equal((await decide(own)).status,403);assert.equal((await decide(own,'approve',{},reviewer2)).status,200);
  });
  await t.test('concurrent approve/reject yields exactly one authoritative outcome',async()=>{
   const x=await pending();const results=await Promise.all([decide(x,'approve',{},reviewer),decide(x,'reject',{reason:'Concurrent decision'},reviewer2)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
   const review=(await pool.query('SELECT * FROM listing_submission_reviews WHERE submission_id=$1',[x.submissionId])).rows;assert.equal(review.length,1);
   const listing=(await pool.query('SELECT * FROM listings WHERE id=$1',[x.listingId])).rows[0];assert.equal(listing.review_status,review[0].outcome);assert.equal(listing.market_status,'unlisted');assert.equal(listing.approved_submission_id,review[0].outcome==='approved'?x.submissionId:null);
   assert.equal((await pool.query("SELECT count(*)::int n FROM audit_events WHERE entity_uuid=$1 AND action IN ('submission_approved','submission_rejected')",[x.listingId])).rows[0].n,1);
  });
  await t.test('audit failure rolls back review, selected submission and status as one transaction',async()=>{
   const x=await pending();
   await pool.query("CREATE FUNCTION fail_review_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='submission_approved' THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_review_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION fail_review_audit()");
   try{assert.equal((await decide(x)).status,503);assert.equal((await pool.query('SELECT count(*)::int n FROM listing_submission_reviews WHERE submission_id=$1',[x.submissionId])).rows[0].n,0);const l=(await pool.query('SELECT * FROM listings WHERE id=$1',[x.listingId])).rows[0];assert.equal(l.review_status,'pending');assert.equal(l.version,x.version);assert.equal(l.approved_submission_id,null);}finally{await pool.query('DROP TRIGGER fail_review_audit ON audit_events; DROP FUNCTION fail_review_audit()');}
   assert.equal((await decide(x)).status,200);
  });
  await t.test('composite FK/unique decision/immutable history and reviewer account retention',async()=>{
   const a=await pending(),b=await pending();await decide(a);
   await assert.rejects(pool.query("INSERT INTO listing_submission_reviews(id,submission_id,listing_id,reviewer_user_id,outcome,listing_version) VALUES($1,$2,$3,$4,'approved',1)",[uuidv7(),b.submissionId,a.listingId,reviewer.id]),e=>e.code==='23503');
   await assert.rejects(pool.query("INSERT INTO listing_submission_reviews(id,submission_id,listing_id,reviewer_user_id,outcome,listing_version) VALUES($1,$2,$3,$4,'approved',1)",[uuidv7(),a.submissionId,a.listingId,reviewer.id]),e=>e.code==='23505');
   assert.equal((await call('delete','/api/admin/accounts/'+reviewer2.id,undefined,reviewer.adminCookie)).status,409);
  });
  await t.test('inactive/unverified/expired/revoked admin cannot access retained moderation context',async()=>{
   for(const assignment of ["status='suspended'","email_verified_at=NULL","deleted_at=now()","anonymised_at=now()"]){await pool.query('UPDATE users SET '+assignment+' WHERE id=$1',[reviewer.id]);assert.equal((await admin('get','listing-submissions')).status,401);await pool.query("UPDATE users SET status='active',email_verified_at=now(),deleted_at=NULL,anonymised_at=NULL WHERE id=$1",[reviewer.id]);}
   await pool.query("UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND purpose='admin'",[reviewer.id]);assert.equal((await admin('get','listing-submissions')).status,401);
   await pool.query("UPDATE auth_sessions SET revoked_at=NULL,expires_at=now()-interval '1 second' WHERE user_id=$1 AND purpose='admin'",[reviewer.id]);assert.equal((await admin('get','listing-submissions')).status,401);
  });
 }finally{if(pool)await pool.end();await root.query(`DROP DATABASE IF EXISTS ${db} WITH(FORCE)`);await root.end();}
});
