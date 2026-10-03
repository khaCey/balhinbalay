import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomBytes} from 'node:crypto';
import {mkdtemp,copyFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Pool} from 'pg';
import {v7 as uuidv7} from 'uuid';
import request from 'supertest';
import {migrate} from '../../src/migrate.js';
import {createAccountApp} from '../../src/app.js';
import {mountMarketplace} from '../../src/marketplace.js';
import {mountSiteAdmin} from '../../src/site-admin.js';
import {ensureUserPrincipal,transaction} from '../../src/marketplace-identity.js';
import {inspectDatabase} from '../../scripts/verify-marketplace-release.js';
import {loadPackage,applyGeography,verifyGeography,COUNTS} from '../../scripts/provision-psgc.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable PostgreSQL/PostGIS URL required');
const url=new URL(connection);
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Isolated disposable PostgreSQL/PostGIS only');
const root=new Pool({connectionString:connection}),databases=[];
const pkg=await loadPackage(),rows=pkg.rows;
const sha=s=>createHash('sha256').update(s).digest('hex');
async function database(name){
  await root.query(`CREATE DATABASE ${name} TEMPLATE template0`);databases.push(name);
  return new Pool({connectionString:new URL('/'+name,connection).href});
}
async function digest(pool,geography=false){
  const names=geography?['regions','provinces','cities','barangays']:['users','auth_sessions','account_actions','auth_rate_limits','principals','lister_access','properties','property_private_locations','property_authorities','listings','listing_submissions','listing_submission_reviews','listing_status_history','listing_price_history','audit_events','conversations','conversation_participants','messages','schema_migrations'];
  const result={};
  for(const name of names){
    const ordered=name==='auth_rate_limits'?'bucket_hash':name==='schema_migrations'?'name':name==='property_private_locations'?'property_id':name==='lister_access'?'user_id':'id';
    const data=(await pool.query(`SELECT row_to_json(x) AS row FROM (SELECT *,xmin::text AS row_version FROM ${name} ORDER BY ${ordered}) x`)).rows;
    result[name]=sha(JSON.stringify(data));
  }
  return result;
}
async function seedAccountOnly(pool){
  const user=uuidv7();
  await pool.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,'original@controlled.invalid','controlled-unchanged','active',now())",[user]);
  await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day')",[uuidv7(),user,sha('original-session')]);
  await pool.query("INSERT INTO account_actions(id,user_id,purpose,token_hash,expires_at,sent_at) VALUES($1,$2,'reset',$3,now()+interval '1 hour',now())",[uuidv7(),user,sha('original-action')]);
  return user;
}
const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'controlled-geography-proxy-key-000000',adminEmails:['reviewer@controlled.invalid'],marketplaceEnabled:true,moderationEnabled:true,publicationEnabled:true,messagingEnabled:true,sessionDays:14,verificationHours:24,resetMinutes:15};
async function actor(pool,email){
  const id=uuidv7(),raw=randomBytes(32).toString('base64url'),admin=randomBytes(32).toString('base64url');
  await transaction(pool,async c=>{await c.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,'controlled-only','active',now())",[id,email]);await ensureUserPrincipal(c,id);});
  await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day'),($4,$2,$5,'admin',now()+interval '1 day')",[uuidv7(),id,sha(raw),uuidv7(),sha('admin:'+admin)]);
  return {id,cookie:'__Host-bb_session='+raw,adminCookie:'__Host-bb_admin_session='+admin};
}
let fresh,upgrade,partial,app,reviewer,lister,seeker,city,barangay,listing,thread;
const call=(method,path,body,user,admin=false)=>{const r=request(app)[method]('/api/'+(admin?'admin/':'')+'marketplace/'+path).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey);if(user)r.set('Cookie',admin?user.adminCookie:user.cookie);if(body!==undefined)r.send(body);return r;};
const control=(path,body)=>call('post',path,body,reviewer,true);
const draftBody=(cityId=city,barangayId=barangay)=>({relationship:'OWNER',property:{property_type:'HOUSE',city_id:cityId,barangay_id:barangayId},listing:{title:'Controlled geography verification',description:'Controlled listing; no real property offered.',transaction_type:'SALE',price_amount:'1234.50',currency_code:'PHP',availability_status:'AVAILABLE'},private_location:{street_address:'PRIVATE-CONTROLLED-STREET',unit_identifier:'PRIVATE-CONTROLLED-UNIT',room_identifier:'PRIVATE-CONTROLLED-ROOM'}});

await test('WRK0044 exact authoritative PSGC package on isolated PostgreSQL/PostGIS',async t=>{
  try{
    await t.test('fresh 001→006 import has exact counts, globally unique codes and valid parent relationships',async()=>{
      fresh=await database('bb_wrk0044_geography_fresh');await migrate(fresh);
      const result=await applyGeography(fresh,rows);assert.deepEqual(result.inserted,COUNTS);assert.deepEqual(result.counts,COUNTS);
      for(const table of Object.keys(COUNTS)){const r=(await fresh.query(`SELECT count(*)::int n,count(DISTINCT code)::int distinct_codes FROM ${table}`)).rows[0];assert.equal(r.n,COUNTS[table]);assert.equal(r.distinct_codes,r.n);}
      assert.equal((await fresh.query('SELECT count(*)::int n FROM cities c JOIN provinces p ON p.id=c.province_id WHERE p.region_id<>c.region_id')).rows[0].n,0);
      assert.equal((await fresh.query('SELECT count(*)::int n FROM barangays b LEFT JOIN cities c ON c.id=b.city_id WHERE c.id IS NULL')).rows[0].n,0);
      assert.equal((await verifyGeography(fresh,rows)).verified,true);
    });
    await t.test('account-only 001/002→003–006 upgrade and import preserve original user/session/action identities',async()=>{
      upgrade=await database('bb_wrk0044_geography_upgrade');const dir=await mkdtemp(join(tmpdir(),'bb-psgc-account-migrations-'));
      try{for(const name of ['001_accounts.sql','002_session_purpose.sql'])await copyFile(fileURLToPath(new URL('../../migrations/'+name,import.meta.url)),join(dir,name));await migrate(upgrade,{directory:dir});}
      finally{await rm(dir,{recursive:true,force:true});}
      const original=await seedAccountOnly(upgrade),before=await inspectDatabase(upgrade,'before');await migrate(upgrade);await inspectDatabase(upgrade,'after',before);
      const prior=await digest(upgrade);assert.deepEqual((await applyGeography(upgrade,rows)).inserted,COUNTS);assert.deepEqual(await digest(upgrade),prior);
      assert.equal((await upgrade.query('SELECT count(*)::int n FROM principals WHERE user_id=$1',[original])).rows[0].n,1);
    });
    await t.test('same full package applied twice makes no insert/update or duplicate on either upgrade path',async()=>{
      for(const pool of [fresh,upgrade]){const before=await digest(pool,true),originals=await digest(pool);const r=await applyGeography(pool,rows);assert.deepEqual(r.inserted,{regions:0,provinces:0,cities:0,barangays:0});assert.deepEqual(await digest(pool,true),before);assert.deepEqual(await digest(pool),originals);}
    });
    await t.test('province-null administrative exceptions and Manila district routing match exact official codes',async()=>{
      const nulls=(await fresh.query('SELECT code FROM cities WHERE province_id IS NULL ORDER BY code')).rows.map(r=>r.code);assert.deepEqual(nulls,pkg.hierarchy.province_null_locality_codes);
      assert.equal((await fresh.query("SELECT count(*)::int n FROM barangays b JOIN cities c ON c.id=b.city_id WHERE c.code='1380600000'")).rows[0].n,897);
      assert.equal((await fresh.query("SELECT r.code FROM cities c JOIN regions r ON r.id=c.region_id WHERE c.code='0990101000'")).rows[0].code,'0900000000');
    });
    await t.test('concurrent repeat import serialises without duplicate reference rows',async()=>{
      const before=await digest(fresh,true);const r=await Promise.all([applyGeography(fresh,rows),applyGeography(fresh,rows)]);for(const x of r)assert.deepEqual(x.inserted,{regions:0,provinces:0,cities:0,barangays:0});assert.deepEqual(await digest(fresh,true),before);
    });
    await t.test('existing authoritative name conflict refuses rather than renaming or partly writing',async()=>{
      const region=rows.regions[0];await fresh.query('UPDATE regions SET name=$2 WHERE code=$1',[region.code,'CONFLICTING NAME']);const before=await digest(fresh,true);
      try{await assert.rejects(applyGeography(fresh,rows),/conflict .* field name/);await assert.rejects(verifyGeography(fresh,rows),/conflict .* field name/);assert.deepEqual(await digest(fresh,true),before);}
      finally{await fresh.query('UPDATE regions SET name=$2 WHERE code=$1',[region.code,region.name]);}
    });
    await t.test('existing Province Region conflict explicitly fails',async()=>{
      const province=rows.provinces[0];await fresh.query('UPDATE provinces SET region_id=$2 WHERE code=$1',[province.code,rows.regions.find(r=>r.code!==province.region_code).id]);
      try{await assert.rejects(applyGeography(fresh,rows),/conflict .* field region_code/);}
      finally{await fresh.query('UPDATE provinces SET region_id=$2 WHERE code=$1',[province.code,rows.regions.find(r=>r.code===province.region_code).id]);}
    });
    await t.test('existing City Region, Province and geographic type conflicts explicitly fail',async()=>{
      const c=rows.cities.find(r=>r.code==='0702223000');
      for(const [column,value,field] of [['region_id',rows.regions[0].id,'region_code'],['province_id',rows.provinces[0].id,'province_code'],['locality_type','MUNICIPALITY','locality_type']]){
        await fresh.query(`UPDATE cities SET ${column}=$2 WHERE code=$1`,[c.code,value]);
        try{await assert.rejects(applyGeography(fresh,rows),new RegExp('conflict .* field '+field));}
        finally{await fresh.query(`UPDATE cities SET ${column}=$2 WHERE code=$1`,[c.code,column==='region_id'?rows.regions.find(r=>r.code===c.region_code).id:column==='province_id'?rows.provinces.find(r=>r.code===c.province_code).id:c.locality_type]);}
      }
    });
    await t.test('invalid stored Barangay→City relationship is conflict-refused',async()=>{
      const b=rows.barangays[0],original=rows.cities.find(r=>r.code===b.city_code),other=rows.cities.find(r=>r.code!==b.city_code);
      await fresh.query('UPDATE barangays SET city_id=$2 WHERE code=$1',[b.code,other.id]);
      try{await assert.rejects(applyGeography(fresh,rows),/conflict .* field city_code/);}
      finally{await fresh.query('UPDATE barangays SET city_id=$2 WHERE code=$1',[b.code,original.id]);}
    });
    await t.test('same PSGC code in an incorrect stored geographic level is explicitly refused',async()=>{
      const id=uuidv7();await fresh.query('INSERT INTO regions(id,code,name) VALUES($1,$2,$3)',[id,rows.barangays[0].code,rows.barangays[0].name]);
      try{await assert.rejects(applyGeography(fresh,rows),/conflicting geographic level/);}
      finally{await fresh.query('DELETE FROM regions WHERE id=$1',[id]);}
    });
    await t.test('duplicate conflicting input and invalid input hierarchy fail before database mutation',async()=>{
      const before=await digest(fresh,true);let bad=structuredClone(rows);bad.barangays[1]={...bad.barangays[0],name:'Conflicting duplicate'};await assert.rejects(applyGeography(fresh,bad),/duplicate or unordered/);
      bad=structuredClone(rows);bad.barangays[0].city_code='0702223000';await assert.rejects(applyGeography(fresh,bad),/invalid Barangay\/City parent/);assert.deepEqual(await digest(fresh,true),before);
    });
    await t.test('late database failure rolls back all four reference-table inserts atomically',async()=>{
      partial=await database('bb_wrk0044_geography_atomic');await migrate(partial);
      await partial.query("CREATE FUNCTION reject_psgc_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Controlled late import failure'; END $$; CREATE TRIGGER reject_psgc_test BEFORE INSERT ON barangays FOR EACH ROW EXECUTE FUNCTION reject_psgc_test()");
      await assert.rejects(applyGeography(partial,rows),/Controlled late import failure/);
      for(const name of Object.keys(COUNTS))assert.equal((await partial.query(`SELECT count(*)::int n FROM ${name}`)).rows[0].n,0);
      await partial.query('DROP TRIGGER reject_psgc_test ON barangays; DROP FUNCTION reject_psgc_test()');
    });
    await t.test('correct existing UUID reference identities remain intact and parent inserts reuse them',async()=>{
      const original=rows.regions[0],existingId=uuidv7();await partial.query('INSERT INTO regions(id,code,name) VALUES($1,$2,$3)',[existingId,original.code,original.name]);await applyGeography(partial,rows);
      assert.equal((await partial.query('SELECT id FROM regions WHERE code=$1',[original.code])).rows[0].id,existingId);
      assert.ok((await partial.query('SELECT region_id FROM provinces p JOIN regions r ON r.id=p.region_id WHERE r.code=$1',[original.code])).rows.every(r=>r.region_id===existingId));
      assert.equal((await verifyGeography(partial,rows)).verified,true);
    });
    await t.test('real PSA City/Barangay choices create a controlled private draft through the unchanged API',async()=>{
      app=createAccountApp({pool:fresh,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool:fresh,config});mountSiteAdmin(app,{pool:fresh,config});
      reviewer=await actor(fresh,config.adminEmails[0]);lister=await actor(fresh,'lister@controlled.invalid');seeker=await actor(fresh,'seeker@controlled.invalid');
      let r=await call('post','me/lister-access',{},lister);assert.equal(r.status,200);r=await control('lister-access/'+lister.id+'/approve',{expected_version:r.body.lister_access.version});assert.equal(r.status,200);
      city=rows.cities.find(r=>r.code==='0702223000').id;barangay=rows.barangays.find(r=>r.city_code==='0702223000'&&r.name==='Guinsay').id;
      r=await call('get','reference-data?city_id='+city+'&city_query=Danao',undefined,lister);assert.equal(r.status,200);assert.ok(r.body.cities.some(c=>c.id===city&&c.name==='Danao City'));assert.ok(r.body.barangays.some(b=>b.id===barangay&&b.name==='Guinsay'));
      r=await call('post','listings',draftBody(),lister);assert.equal(r.status,201,JSON.stringify(r.body));listing=r.body;
      assert.equal(listing.property.city_id,city);assert.equal(listing.property.barangay_id,barangay);assert.equal(listing.listing.review_status,'draft');assert.equal(listing.listing.market_status,'unlisted');
    });
    await t.test('mismatched recognised City+Barangay is rejected without creating a listing',async()=>{
      const wrong=rows.barangays.find(r=>r.city_code!== '0702223000').id,before=(await fresh.query('SELECT count(*)::int n FROM listings')).rows[0].n;
      const r=await call('post','listings',draftBody(city,wrong),lister);assert.equal(r.status,422,JSON.stringify(r.body));assert.equal((await fresh.query('SELECT count(*)::int n FROM listings')).rows[0].n,before);
    });
    await t.test('recognised authoritative City+Barangay passes marketplace_submission_v1 and immutable moderation',async()=>{
      let r=await control('property-authorities/'+listing.authority.id+'/approve',{expected_version:listing.authority.version});assert.equal(r.status,200);
      r=await call('post','listings/'+listing.listing.id+'/submissions',{expected_version:listing.listing.version,expected_property_version:listing.property.version},lister);assert.equal(r.status,201,JSON.stringify(r.body));assert.equal(r.body.submission.validation_policy_version,'marketplace_submission_v1');
      const before=await call('get','listings/'+listing.listing.id,undefined,lister);
      r=await control('listings/'+listing.listing.id+'/submissions/'+r.body.submission.id+'/approve',{expected_version:before.body.listing.version});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.listing.market_status,'unlisted');listing.listing=r.body.listing;
      assert.equal((await fresh.query('SELECT count(*)::int n FROM listing_submission_reviews WHERE listing_id=$1',[listing.listing.id])).rows[0].n,1);
    });
    await t.test('approved real-reference listing Activates and public detail resolves exact labels without private location',async()=>{
      let r=await call('post','listings/'+listing.listing.id+'/activate',{expected_version:listing.listing.version},lister);assert.equal(r.status,200,JSON.stringify(r.body));listing.listing=r.body.listing;
      r=await call('get','public/listings/'+listing.listing.id);assert.equal(r.status,200);assert.deepEqual(r.body.listing.location,{city:'Danao City',barangay:'Guinsay',map_point:null});assert.doesNotMatch(JSON.stringify(r.body),/PRIVATE-|street_address|unit_identifier|room_identifier|exact_location|phone|email|password|token|controlled\.invalid/);
    });
    await t.test('eligible genuine conversation initiation and first-message/reply retain private geography safety',async()=>{
      let r=await call('post','conversations',{listing_id:listing.listing.id,first_message:'Controlled geography contact',client_request_id:uuidv7()},seeker);assert.equal(r.status,201,JSON.stringify(r.body));thread=r.body.conversation.id;assert.equal(r.body.conversation.participants.length,2);assert.doesNotMatch(JSON.stringify(r.body),/PRIVATE-|phone|email|controlled\.invalid|exact_location/);
      r=await call('post','conversations/'+thread+'/messages',{body:'Controlled reply',client_request_id:uuidv7()},lister);assert.equal(r.status,201);
    });
    await t.test('reapplying geography leaves existing immutable marketplace and account/session/action data untouched',async()=>{
      const before=await digest(fresh),geo=await digest(fresh,true);await applyGeography(fresh,rows);assert.deepEqual(await digest(fresh),before);assert.deepEqual(await digest(fresh,true),geo);await verifyGeography(fresh,rows);assert.deepEqual(await digest(fresh),before);
    });
    await t.test('read-only verifier works for a database role that has SELECT alone and cannot insert',async()=>{
      const role='bb_wrk0044_readonly';await fresh.query(`CREATE ROLE ${role}; GRANT USAGE ON SCHEMA public TO ${role}; GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${role}`);
      const client=await fresh.connect();
      try{await client.query(`SET ROLE ${role}`);const wrapper={connect:async()=>({query:(...args)=>client.query(...args),release:()=>{}})};assert.equal((await verifyGeography(wrapper,rows)).verified,true);await client.query(await readFile(fileURLToPath(new URL('../../scripts/verify-psgc.sql',import.meta.url)),'utf8'));await assert.rejects(client.query('INSERT INTO regions(id,code,name) VALUES($1,$2,$3)',[uuidv7(),rows.regions[0].code,rows.regions[0].name]),e=>e.code==='42501');}
      finally{await client.query('RESET ROLE');client.release();await fresh.query(`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ${role}; REVOKE ALL ON SCHEMA public FROM ${role}; DROP ROLE ${role}`);}
    });
  }finally{
    for(const pool of [fresh,upgrade,partial])if(pool)await pool.end();
    try{for(const name of databases){for(let n=0;n<100;n++){if(!(await root.query('SELECT 1 FROM pg_stat_activity WHERE datname=$1',[name])).rowCount)break;if(n===99)throw new Error('Disposable connections did not close');await new Promise(r=>setTimeout(r,20));}await root.query(`DROP DATABASE ${name}`);}}
    finally{await root.end();}
  }
});
