import test from 'node:test';
import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {v7 as uuidv7} from 'uuid';
import {createHash,randomBytes} from 'node:crypto';
import {mkdtemp,rm,readdir,chmod} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import request from 'supertest';
import {migrate} from '../../src/migrate.js';
import {createAccountApp} from '../../src/app.js';
import {mountMarketplace} from '../../src/marketplace.js';
import {mountSiteAdmin} from '../../src/site-admin.js';
import {ensureUserPrincipal,transaction} from '../../src/marketplace-identity.js';
import {reviewedRelease} from '../helpers/reviewed-release.js';
const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable PostgreSQL/PostGIS URL required');
const url=new URL(connection);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Synthetic disposable service only');
const root=new Pool({connectionString:connection}),db='bb_wrk0062_media';
const mediaRoot=await mkdtemp(join(tmpdir(),'bb-integration-media-'));
const historical=await reviewedRelease();
const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'synthetic-media-proxy-key-00000000000',adminEmails:['reviewer@synthetic.invalid'],marketplaceEnabled:true,moderationEnabled:true,publicationEnabled:true,mediaEnabled:true,mediaRoot,sessionDays:14,verificationHours:24,resetMinutes:15};
const sha=s=>createHash('sha256').update(s).digest('hex');
const photo=await sharp({create:{width:60,height:40,channels:3,background:'#4488aa'}}).withMetadata({exif:{IFD0:{Artist:'PRIVATE-EXIF'}}}).jpeg().toBuffer();
let pool,app,reviewer,owner,stranger,city,barangay,legacy;
function mount(){app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});}
const call=(method,path,body,actor=owner,admin=false)=>{const r=request(app)[method]('/api/'+(admin?'admin/':'')+'marketplace/'+path).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey);if(actor)r.set('Cookie',admin?actor.adminCookie:actor.cookie);if(body!==undefined)r.send(body);return r;};
const publicRead=id=>call('get','public/listings/'+id,undefined,null);
const imagePath=(x,asset,variant='share')=>`public/listings/${x.listing.id}/media/${asset}/${variant}`;
const upload=(x,{version=x.listing.version,actor=owner,bytes=photo,type='image/jpeg'}={})=>request(app).post('/api/marketplace/listings/'+x.listing.id+'/media').set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey).set('Cookie',actor?.cookie||'').set('Content-Type',type).set('X-Listing-Version',String(version)).send(bytes);
const get=x=>call('get','listings/'+x.listing.id);
const fresh=async x=>(await get(x)).body;
async function user(email){
 const id=uuidv7(),raw=randomBytes(32).toString('base64url'),araw=randomBytes(32).toString('base64url');
 await transaction(pool,async c=>{await c.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,'synthetic-only','active',now())",[id,email]);await ensureUserPrincipal(c,id);});
 await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day'),($4,$2,$5,'admin',now()+interval '1 day')",[uuidv7(),id,sha(raw),uuidv7(),sha('admin:'+araw)]);
 return {id,raw,cookie:'__Host-bb_session='+raw,adminCookie:'__Host-bb_admin_session='+araw};
}
async function grant(actor){let r=await call('post','me/lister-access',{},actor);assert.equal(r.status,200);r=await call('post','lister-access/'+actor.id+'/approve',{expected_version:r.body.lister_access.version},reviewer,true);assert.equal(r.status,200,JSON.stringify(r.body));}
async function draft(){const r=await call('post','listings',{relationship:'OWNER',property:{property_type:'HOUSE',city_id:city,barangay_id:barangay},listing:{title:'Synthetic photo house',description:'Synthetic media fixture',transaction_type:'SALE',price_amount:'1234.50',currency_code:'PHP'},private_location:{street_address:'PRIVATE-STREET',unit_identifier:'PRIVATE-UNIT'}});assert.equal(r.status,201,JSON.stringify(r.body));return r.body;}
async function submit(x){let r=await call('post','property-authorities/'+x.authority.id+'/approve',{expected_version:x.authority.version},reviewer,true);assert.equal(r.status,200,JSON.stringify(r.body));x=await fresh(x);r=await call('post',`listings/${x.listing.id}/submissions`,{expected_version:x.listing.version,expected_property_version:x.property.version});assert.equal(r.status,201,JSON.stringify(r.body));return {...await fresh(x),submission:r.body.submission};}
async function approve(x){const r=await call('post',`listings/${x.listing.id}/submissions/${x.submission.id}/approve`,{expected_version:x.listing.version},reviewer,true);assert.equal(r.status,200,JSON.stringify(r.body));return {...x,listing:{...x.listing,...r.body.listing}};}
async function publish(x){const r=await call('post',`listings/${x.listing.id}/activate`,{expected_version:x.listing.version});assert.equal(r.status,200,JSON.stringify(r.body));return {...x,listing:{...x.listing,...r.body.listing}};}
async function withPhoto(){let x=await draft();const r=await upload(x);assert.equal(r.status,201,JSON.stringify(r.body));return {...x,listing:{...x.listing,version:r.body.version},media:r.body.media};}
await test('WRK0062 real PostgreSQL/PostGIS media and approval boundaries',async t=>{
 try{
  await root.query(`CREATE DATABASE ${db} TEMPLATE template0`);pool=new Pool({connectionString:new URL('/'+db,connection).href});
  await migrate(pool,{directory:historical.directory});config.mediaEnabled=false;mount();
  reviewer=await user(config.adminEmails[0]);owner=await user('owner@synthetic.invalid');stranger=await user('stranger@synthetic.invalid');await grant(owner);await grant(stranger);
  const region=uuidv7();city=uuidv7();barangay=uuidv7();await pool.query("INSERT INTO regions VALUES($1,'MEDIA-REGION','Synthetic region')",[region]);await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'MEDIA-CITY','Synthetic city','CITY')",[city,region]);await pool.query("INSERT INTO barangays VALUES($1,$2,'MEDIA-BRGY','Synthetic barangay')",[barangay,city]);legacy=await draft();
  await t.test('001–006→008 is additive, idempotent, preserves old records and does not depend on reporting007',async()=>{
   const before=(await pool.query('SELECT * FROM users ORDER BY id')).rows,listing=(await get(legacy)).body;
   await migrate(pool);await migrate(pool);assert.deepEqual((await pool.query('SELECT * FROM users ORDER BY id')).rows,before);assert.deepEqual((await get(legacy)).body,listing);
   const ledger=(await pool.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map(x=>x.name);assert.equal(ledger.length,7);assert.equal(ledger.at(-1),'008_listing_media.sql');assert.ok(!ledger.some(x=>x.startsWith('007')));
  });
  config.mediaEnabled=true;mount();
  await t.test('upload preserves listing fields, versions each mutation, rejects IDOR and never publishes a private draft',async()=>{
   const x=await draft(),r=await upload(x);assert.equal(r.status,201,JSON.stringify(r.body));assert.equal(r.body.media.length,1);assert.equal(r.body.version,String(BigInt(x.listing.version)+1n));const after=await fresh(x);assert.equal(after.listing.title,x.listing.title);assert.deepEqual(after.private_location,x.private_location);const asset=r.body.media[0].id;
   const privatePath=`listings/${x.listing.id}/media/${asset}/gallery`;
   assert.equal((await call('get',privatePath)).status,200);assert.equal((await call('get',privatePath,undefined,stranger)).status,404);assert.equal((await call('get',privatePath,undefined,null)).status,401);assert.equal((await call('get',privatePath,undefined,{cookie:reviewer.adminCookie})).status,401);assert.equal((await call('get',imagePath(x,asset),undefined,null)).status,404);
   assert.equal((await upload(after,{actor:stranger})).status,404);assert.equal((await upload(after,{actor:null})).status,401);assert.equal((await upload(after,{actor:{cookie:reviewer.adminCookie}})).status,401);
  });
  await t.test('malformed/type/size/version/origin failures and concurrent uploads cannot create duplicate attachments',async()=>{
   let x=await draft();assert.equal((await upload(x,{bytes:Buffer.from('<svg/>')})).status,415);assert.equal((await upload(x,{type:'image/svg+xml'})).status,415);assert.equal((await upload(x,{bytes:Buffer.alloc(8*1024*1024+1)})).status,413);
   const rs=await Promise.all([upload(x),upload(x)]);assert.deepEqual(rs.map(r=>r.status).sort(),[201,409]);assert.equal((await call('get',`listings/${x.listing.id}/media`)).body.media.length,1);assert.equal((await upload(x)).status,409);
   x=await fresh(x);const origin=await request(app).post('/api/marketplace/listings/'+x.listing.id+'/media').set('x-balhinbalay-proxy-key',config.proxyKey).set('Origin','https://evil.invalid').set('Cookie',owner.cookie).set('X-Listing-Version',x.listing.version).set('Content-Type','image/jpeg').send(photo);assert.equal(origin.status,403);
  });
  await t.test('cover/reorder/remove uses current attached IDs and optimistic versions; removed bytes stay private',async()=>{
   let x=await withPhoto(),first=x.media[0].id;const r=await upload(x);assert.equal(r.status,201);x=await fresh(x);const second=r.body.media[1].id;
   const path=`listings/${x.listing.id}/media`,patch=ids=>call('patch',path,{expected_version:x.listing.version,asset_ids:ids});
   assert.equal((await patch([first,first])).status,422);assert.equal((await patch([uuidv7()])).status,422);
   let result=await patch([second,first]);assert.equal(result.status,200);assert.equal(result.body.media[0].id,second);assert.equal((await patch([first])).status,409);
   x=await fresh(x);result=await patch([second]);assert.equal(result.status,200);assert.equal((await call('get',`listings/${x.listing.id}/media/${first}/gallery`)).status,404);
   assert.equal((await pool.query('SELECT count(*)::int n FROM media_assets WHERE id=$1',[first])).rows[0].n,1);
  });
  await t.test('review sees the exact frozen photos; pending/approved editing is blocked; only active approved media is public',async()=>{
   let x=await withPhoto(),asset=x.media[0].id;x=await submit(x);
   const adminPath=`listings/${x.listing.id}/submissions/${x.submission.id}`;
   let r=await call('get',adminPath,undefined,reviewer,true);assert.equal(r.status,200);assert.equal(r.body.media[0].id,asset);assert.doesNotMatch(JSON.stringify(r.body.media),/PRIVATE|storage|sha256|owner_principal/);
   assert.equal((await call('get',adminPath+'/media/'+asset+'/share',undefined,reviewer,true)).status,200);assert.equal((await call('get',adminPath+'/media/'+asset+'/share',undefined,owner,true)).status,403);
   assert.equal((await upload(x)).status,409);assert.equal((await call('patch',`listings/${x.listing.id}/media`,{expected_version:x.listing.version,asset_ids:[]})).status,409);assert.equal((await call('get',imagePath(x,asset),undefined,null)).status,404);
   x=await approve(x);assert.equal((await upload(x)).status,409);assert.equal((await call('get',imagePath(x,asset),undefined,null)).status,404);x=await publish(x);
   r=await publicRead(x.listing.id);assert.equal(r.status,200);assert.equal(r.body.listing.media[0].id,asset);r=await call('get',imagePath(x,asset),undefined,null);assert.equal(r.status,200);assert.equal(r.headers['cache-control'],'no-store');const metadata=await sharp(r.body).metadata();assert.deepEqual([metadata.width,metadata.height],[1200,630]);assert.equal(metadata.exif,undefined);
   r=await call('post',`listings/${x.listing.id}/unlist`,{expected_version:x.listing.version});assert.equal(r.status,200);assert.equal((await call('get',imagePath(x,asset),undefined,null)).status,404);assert.equal((await publicRead(x.listing.id)).status,404);
  });
  await t.test('capability, account and authority withdrawal deny guessed public media URLs immediately',async()=>{
   let x=await withPhoto(),asset=x.media[0].id;x=await publish(await approve(await submit(x)));
   for(const [sql,restore,args] of [["UPDATE lister_access SET status='revoked' WHERE user_id=$1","UPDATE lister_access SET status='active' WHERE user_id=$1",[owner.id]],["UPDATE users SET status='suspended' WHERE id=$1","UPDATE users SET status='active' WHERE id=$1",[owner.id]],["UPDATE property_authorities SET status='revoked' WHERE id=$1","UPDATE property_authorities SET status='active' WHERE id=$1",[x.authority.id]]]){await pool.query(sql,args);assert.equal((await call('get',imagePath(x,asset),undefined,null)).status,404);assert.equal((await publicRead(x.listing.id)).status,404);await pool.query(restore,args);assert.equal((await call('get',imagePath(x,asset),undefined,null)).status,200);}
  });
  await t.test('rejected revision retains immutable submission photos and audit history',async()=>{
   let x=await withPhoto(),first=x.media[0].id;x=await submit(x);const old=x.submission.id;
   let r=await call('post',`listings/${x.listing.id}/submissions/${old}/reject`,{expected_version:x.listing.version,reason:'Synthetic revision'},reviewer,true);assert.equal(r.status,200);x=await fresh(x);r=await upload(x);assert.equal(r.status,201);assert.equal(r.body.review_status,'draft');
   x=await fresh(x);r=await call('patch',`listings/${x.listing.id}/media`,{expected_version:x.listing.version,asset_ids:[r.body.media[1].id]});assert.equal(r.status,200);x=await fresh(x);const next=await call('post',`listings/${x.listing.id}/submissions`,{expected_version:x.listing.version,expected_property_version:x.property.version});assert.equal(next.status,201);
   assert.equal((await call('get',`listings/${x.listing.id}/submissions/${old}/media/${first}/gallery`,undefined,reviewer,true)).status,200);
   await assert.rejects(pool.query('UPDATE listing_submission_media SET position=3 WHERE submission_id=$1',[old]));await assert.rejects(pool.query('DELETE FROM media_assets WHERE id=$1',[first]));await assert.rejects(pool.query("UPDATE media_variants SET sha256=repeat('a',64) WHERE asset_id=$1",[first]));
  });
  await t.test('filesystem and database failures leave no half-committed photo or changed listing version',async()=>{
   let x=await draft();const blocked=join(mediaRoot,'insecure');await import('node:fs/promises').then(fs=>fs.mkdir(blocked,{mode:0o755}));config.mediaRoot=blocked;mount();try{assert.equal((await upload(x)).status,503);assert.equal((await fresh(x)).listing.version,x.listing.version);}finally{config.mediaRoot=mediaRoot;mount();await chmod(blocked,0o700);await rm(blocked,{recursive:true});}
   await pool.query("CREATE FUNCTION fail_media_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='listing_photo_uploaded' THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_media_audit BEFORE INSERT ON audit_events FOR EACH ROW EXECUTE FUNCTION fail_media_audit()");
   const files=(await readdir(mediaRoot)).sort(),count=(await pool.query('SELECT count(*)::int n FROM media_assets')).rows[0].n;
   try{assert.equal((await upload(x)).status,503);assert.equal((await fresh(x)).listing.version,x.listing.version);assert.equal((await pool.query('SELECT count(*)::int n FROM media_assets')).rows[0].n,count);assert.deepEqual((await readdir(mediaRoot)).sort(),files);}finally{await pool.query('DROP TRIGGER fail_media_audit ON audit_events; DROP FUNCTION fail_media_audit()');}
  });
  await t.test('a pre-media zero-photo listing still submits, approves and publishes without content mutation',async()=>{
   const x=await publish(await approve(await submit(legacy)));const r=await publicRead(x.listing.id);assert.equal(r.status,200);assert.deepEqual(r.body.listing.media,[]);assert.equal(r.body.listing.title,legacy.listing.title);
  });
 }finally{
  if(pool)await pool.end();
  try{await root.query(`DROP DATABASE IF EXISTS ${db}`);}finally{await root.end();await historical.cleanup();await rm(mediaRoot,{recursive:true,force:true});}
 }
});
