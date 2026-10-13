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
const root=new Pool({connectionString:connection}),db='bb_wrk0049_reporting';
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
await test('WRK0049 real PostgreSQL/PostGIS reporting',async t=>{
 try{
  await root.query(`CREATE DATABASE ${db} TEMPLATE template0`);pool=new Pool({connectionString:new URL('/'+db,connection).href});await migrate(pool);await migrate(pool);
  app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});
  reviewer=await user(config.adminEmails[0]);lister=await user('lister@synthetic.invalid');stranger=await user('stranger@synthetic.invalid');await grant(lister);await grant(stranger);
  const region=uuidv7();city=uuidv7();barangay=uuidv7();
  await pool.query("INSERT INTO regions VALUES($1,'PUB-SYNTHETIC','Synthetic region')",[region]);
  await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'PUB-CITY','Synthetic city','CITY')",[city,region]);await pool.query("INSERT INTO barangays VALUES($1,$2,'PUB-BRGY','Synthetic barangay')",[barangay,city]);

  const report=(x,actor=stranger,body={reason:'OTHER',details:'Synthetic report details'})=>consumer('post','listings/'+x.listingId+'/reports',body,actor);
  const queue=(query='',actor=reviewer)=>admin('get','listing-reports'+query,undefined,actor);
  const review=(id,version,status,note='Synthetic review')=>admin('post','listing-reports/'+id+'/review',{expected_version:version,status,note});
  const active=async()=>{const x=await approvedFixture();const r=await change(x);assert.equal(r.status,200,JSON.stringify(r.body));return {...x,version:r.body.listing.version};};
  await t.test('ordinary verified sessions mandatory; dedicated admin session never authorises reporting',async()=>{
   const x=await active();
   for(const actor of [null,{cookie:reviewer.adminCookie}])assert.equal((await report(x,actor)).status,401);
   for(const state of ["status='pending',email_verified_at=NULL","status='suspended'","deleted_at=now()","anonymised_at=now()"]){
    await pool.query('UPDATE users SET '+state+' WHERE id=$1',[stranger.id]);assert.equal((await report(x)).status,401);
    await pool.query("UPDATE users SET status='active',email_verified_at=now(),deleted_at=NULL,anonymised_at=NULL WHERE id=$1",[stranger.id]);
   }
   assert.equal((await queue('',stranger)).status,401);
   assert.equal((await call('get','/api/admin/marketplace/listing-reports',undefined,stranger.cookie)).status,401);
  });
  await t.test('concurrent duplicate submissions create one immutable record and no publication change',async()=>{
   const x=await active(),before=(await pool.query('SELECT * FROM listings WHERE id=$1',[x.listingId])).rows[0];
   const rs=await Promise.all([report(x),report(x)]);
   assert.deepEqual(rs.map(r=>r.status).sort(),[200,201]);assert.equal(rs[0].body.report.id,rs[1].body.report.id);
   assert.equal((await report(x,stranger,{reason:'OTHER',details:'Changed details'})).status,200);
   const records=(await pool.query('SELECT * FROM listing_reports WHERE listing_id=$1',[x.listingId])).rows;
   assert.equal(records.length,1);assert.equal(records[0].details,'Synthetic report details');
   assert.deepEqual((await pool.query('SELECT * FROM listings WHERE id=$1',[x.listingId])).rows[0],before);
   assert.equal((await publicRead(x.listingId)).status,200);
   assert.equal(JSON.stringify(rs[0].body).includes(stranger.id),false);
   assert.equal(JSON.stringify((await publicRead(x.listingId)).body).includes('report'),false);
  });
  await t.test('bounded admin triage, review versions and history; reporting stays private from listers',async()=>{
   const x=await active(),r=await report(x),rid=r.body.report.id;
   const q=await queue('?status=NEW&limit=1');assert.equal(q.status,200);assert.equal(q.body.reports.length,1);
   if(q.body.next_cursor){const n=await queue('?status=NEW&limit=1&before='+q.body.next_cursor);assert.notEqual(n.body.reports[0]?.id,q.body.reports[0].id);}
   assert.equal((await queue('?limit=101')).status,422);
   let detail=await admin('get','listing-reports/'+rid);assert.equal(detail.body.report.reporter_email,'stranger@synthetic.invalid');
   assert.equal((await consumer('get','listing-reports/'+rid,undefined,lister)).status,404);
   assert.equal((await review(rid,'1','RESOLVED')).status,409);
   assert.equal((await review(rid,'1','UNDER_REVIEW')).status,200);
   assert.equal((await review(rid,'1','DISMISSED')).status,409);
   assert.equal((await review(rid,'2','RESOLVED')).status,200);
   detail=await admin('get','listing-reports/'+rid);assert.equal(detail.body.history.length,2);assert.ok(detail.body.report.resolved_at);
   assert.equal((await review(rid,'3','UNDER_REVIEW')).status,409);
   assert.equal((await report(x)).status,201);
   const next=(await report(x)).body.report.id;assert.equal((await review(next,'1','UNDER_REVIEW')).status,200);assert.equal((await review(next,'2','DISMISSED')).status,200);
   assert.equal((await publicRead(x.listingId)).status,200);
  });
  await t.test('missing/unlisted/pending/ineligible listings reject reports without enumeration',async()=>{
   const x=await active();await change(await current(x),'unlist');
   const hidden=await report(x),missing=await report({listingId:uuidv7()});assert.equal(hidden.status,404);assert.deepEqual(hidden.body,missing.body);
   assert.equal((await report(await pending())).status,404);
   const y=await active();await pool.query("UPDATE lister_access SET status='suspended' WHERE user_id=$1",[lister.id]);
   assert.equal((await report(y)).status,404);await pool.query("UPDATE lister_access SET status='active' WHERE user_id=$1",[lister.id]);
   await pool.query("UPDATE property_authorities SET status='revoked' WHERE id=$1",[y.authorityId]);assert.equal((await report(y)).status,404);
  });
  await t.test('submitted identity/content injection and immutable SQL history are rejected',async()=>{
   const x=await active();
   assert.equal((await report(x,stranger,{reason:'OTHER',reported_by_user_id:lister.id})).status,422);
   assert.equal((await report(x,stranger,{reason:'OTHER',details:'x'.repeat(2001)})).status,422);
   const r=await report(x),rid=r.body.report.id;await review(rid,'1','UNDER_REVIEW');
   await assert.rejects(pool.query("UPDATE listing_reports SET details='tampered' WHERE id=$1",[rid]));
   await assert.rejects(pool.query('DELETE FROM listing_reports WHERE id=$1',[rid]));
   await assert.rejects(pool.query("UPDATE listing_report_reviews SET note='tampered' WHERE report_id=$1",[rid]));
   await assert.rejects(pool.query('DELETE FROM listing_report_reviews WHERE report_id=$1',[rid]));
  });
  await t.test('audit failure rolls back report and rate bucket atomically',async()=>{
   const x=await active();await pool.query("CREATE FUNCTION fail_report_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='listing_report_created' THEN RAISE EXCEPTION 'synthetic failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_report_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION fail_report_audit()");
   try{assert.equal((await report(x)).status,503);assert.equal((await pool.query('SELECT count(*)::int n FROM listing_reports WHERE listing_id=$1',[x.listingId])).rows[0].n,0);}
   finally{await pool.query('DROP TRIGGER fail_report_audit ON audit_events; DROP FUNCTION fail_report_audit()');}
   assert.equal((await report(x)).status,201);
  });
  await t.test('server-side per-account rate limit bounds repeated attempts',async()=>{
   const actor=await user('rate@synthetic.invalid'),x=await active();
   for(let i=0;i<20;i++)assert.ok([200,201].includes((await report(x,actor)).status));
   assert.equal((await report(x,actor)).status,429);
   assert.equal((await pool.query('SELECT count(*)::int n FROM listing_reports WHERE reported_by_user_id=$1',[actor.id])).rows[0].n,1);
  });
 }finally{
  if(pool)await pool.end();
  try{for(let attempt=0;attempt<100;attempt++){const n=(await root.query('SELECT count(*)::int n FROM pg_stat_activity WHERE datname=$1',[db])).rows[0].n;if(!n)break;if(attempt===99)throw new Error('Disposable connections did not close');await new Promise(resolve=>setTimeout(resolve,20));}await root.query(`DROP DATABASE IF EXISTS ${db}`);}finally{await root.end();}
 }
});
