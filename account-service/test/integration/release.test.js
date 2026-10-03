import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash,randomBytes} from 'node:crypto';
import {Pool} from 'pg';
import {v7 as uuidv7} from 'uuid';
import request from 'supertest';
import {migrate} from '../../src/migrate.js';
import {createAccountApp} from '../../src/app.js';
import {mountMarketplace} from '../../src/marketplace.js';
import {mountSiteAdmin} from '../../src/site-admin.js';
import {inspectDatabase,requirePreserved} from '../../scripts/verify-marketplace-release.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable local test URL required');
const url=new URL(connection),container=process.env.BB_MARKETPLACE_PG_CONTAINER;
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true'||!container||!/^\w{12,64}$/.test(container))throw new Error('Synthetic disposable service/container only');
const root=new Pool({connectionString:connection});
const names=['bb_wrk0042_upgrade','bb_wrk0042_restore_before','bb_wrk0042_restore_after'];
const pools=[];
const sha=x=>createHash('sha256').update(x).digest('hex');
function pg(command,args,input){const r=spawnSync('docker',['exec',...(input?['-i']:[]),container,command,'-U','postgres',...args],{input,maxBuffer:16*1024*1024});assert.equal(r.status,0,r.stderr?.toString());return r.stdout;}
function open(name){const p=new Pool({connectionString:new URL('/'+name,connection).href});pools.push(p);return p;}
async function account(pool,email){
  const id=uuidv7(),raw=randomBytes(32).toString('base64url'),araw=randomBytes(32).toString('base64url');
  await pool.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,'synthetic-only','active',now())",[id,email]);
  await pool.query("INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at) VALUES($1,$2,$3,'user',now()+interval '1 day'),($4,$2,$5,'admin',now()+interval '1 day')",[uuidv7(),id,sha(raw),uuidv7(),sha('admin:'+araw)]);
  await pool.query("INSERT INTO account_actions(id,user_id,purpose,token_hash,expires_at) VALUES($1,$2,'reset',$3,now()+interval '1 day')",[uuidv7(),id,sha('action:'+raw)]);
  return {id,cookie:'__Host-bb_session='+raw,adminCookie:'__Host-bb_admin_session='+araw};
}
await test('WRK0042 exact RC migration, preflight and backup restoration',async t=>{
  let pool,before,after,reviewer,lister,dir;
  try{
    for(const name of names)await root.query(`CREATE DATABASE ${name} TEMPLATE template0`);
    pool=open(names[0]);dir=await mkdtemp(join(tmpdir(),'bb-wrk0042-gate-'));
    await pool.query('CREATE TABLE schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
    for(const name of ['001_accounts.sql','002_session_purpose.sql']){await pool.query(await readFile(new URL('../../migrations/'+name,import.meta.url),'utf8'));await pool.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);}
    reviewer=await account(pool,'reviewer@synthetic.invalid');lister=await account(pool,'lister@synthetic.invalid');
    await pool.query("INSERT INTO auth_rate_limits VALUES($1,1,now())",[sha('synthetic-rate-limit')]);
    await t.test('account-only preflight records exact ledger/identity and no secret values',async()=>{
      before=await inspectDatabase(pool,'before');assert.equal(before.ledger.length,2);assert.equal(before.accounts.users.count,2);assert.equal(before.accounts.auth_sessions.count,4);assert.equal(before.accounts.account_actions.count,2);
      assert.doesNotMatch(JSON.stringify(before),/synthetic-only|@synthetic|password_hash|token_hash/);
    });
    await t.test('custom backup is listed and restored to a separate account-only database',async()=>{
      const dump=pg('pg_dump',['--format=custom','--no-owner','--dbname',names[0]]);assert.ok(dump.length>1000);assert.match(pg('pg_restore',['--list'],dump).toString(),/auth_sessions/);
      pg('pg_restore',['--exit-on-error','--no-owner','--dbname',names[1]],dump);
      const restored=await inspectDatabase(open(names[1]),'before');requirePreserved(before,restored);assert.equal(restored.database,names[1]);
    });
    await t.test('manual account-only upgrade and repeated runner preserve all original fields',async()=>{
      await migrate(pool);await migrate(pool);after=await inspectDatabase(pool,'after',before);assert.equal(after.ledger.length,6);
      assert.equal((await pool.query('SELECT count(*)::int n FROM principals')).rows[0].n,2);assert.equal((await pool.query('SELECT count(*)::int n FROM lister_access')).rows[0].n,0);
    });
    await t.test('unexpected ledger fails the read-only gate',async()=>{
      await pool.query("INSERT INTO schema_migrations(name) VALUES('099_unreviewed.sql')");await assert.rejects(inspectDatabase(pool,'after',before),/ledger/);await pool.query("DELETE FROM schema_migrations WHERE name='099_unreviewed.sql'");
    });
    await t.test('account/session preservation digest detects a changed original credential',async()=>{
      await pool.query("UPDATE users SET password_hash='changed-synthetic' WHERE id=$1",[lister.id]);await assert.rejects(inspectDatabase(pool,'after',before),/identity changed/);await pool.query("UPDATE users SET password_hash='synthetic-only' WHERE id=$1",[lister.id]);
    });
    await t.test('missing immutable message protection fails schema preflight',async()=>{
      await pool.query('ALTER TABLE messages DISABLE TRIGGER messages_immutable');await assert.rejects(inspectDatabase(pool,'after',before),/triggers/);await pool.query('ALTER TABLE messages ENABLE TRIGGER messages_immutable');
    });
    await t.test('manual CLI requires a previous record, is read-only and writes only digest evidence',async()=>{
      const {writeFile}=await import('node:fs/promises');const previous=join(dir,'before.json'),record=join(dir,'after.json');await writeFile(previous,JSON.stringify(before));
      const env={...process.env,DATABASE_URL:new URL('/'+names[0],connection).href};
      const r=spawnSync(process.execPath,['scripts/verify-marketplace-release.js','after','--previous',previous,'--record',record],{cwd:new URL('../../',import.meta.url),env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.doesNotMatch(r.stdout+r.stderr,/postgresql:|synthetic-only|@synthetic/);requirePreserved(before,JSON.parse(await readFile(record,'utf8')));
      const bad=spawnSync(process.execPath,['scripts/verify-marketplace-release.js','after','--record',join(dir,'bad.json')],{cwd:new URL('../../',import.meta.url),env,encoding:'utf8'});assert.equal(bad.status,1);assert.doesNotMatch(bad.stdout+bad.stderr,/postgresql:/);
    });
    await t.test('full marketplace history backup restores stable listing/submission/review/thread/message identities',async()=>{
      const config={appOrigin:'https://test.balhinbalay.invalid',proxyKey:'synthetic-release-proxy-key-00000000',adminEmails:['reviewer@synthetic.invalid'],marketplaceEnabled:true,moderationEnabled:true,publicationEnabled:true,messagingEnabled:true,sessionDays:14,verificationHours:24,resetMinutes:15};
      const app=createAccountApp({pool,config,mailer:{verify:async()=>{},reset:async()=>{}}});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});
      const call=async(method,path,body,actor=lister,admin=false)=>{let r=request(app)[method](admin?'/api/admin/marketplace/'+path:'/api/marketplace/'+path).set('Origin',config.appOrigin).set('x-balhinbalay-proxy-key',config.proxyKey).set('Cookie',admin?actor.adminCookie:actor.cookie);if(body!==undefined)r=r.send(body);const response=await r;assert.ok(response.status>=200&&response.status<300,JSON.stringify(response.body));return response.body;};
      let result=await call('post','me/lister-access',{});await call('post','lister-access/'+lister.id+'/approve',{expected_version:result.lister_access.version},reviewer,true);
      const region=uuidv7(),city=uuidv7(),barangay=uuidv7();await pool.query("INSERT INTO regions VALUES($1,'RELEASE-SYNTHETIC','Synthetic region')",[region]);await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'RELEASE-CITY','Synthetic city','CITY')",[city,region]);await pool.query("INSERT INTO barangays VALUES($1,$2,'RELEASE-BRGY','Synthetic barangay')",[barangay,city]);
      result=await call('post','listings',{relationship:'OWNER',property:{property_type:'HOUSE',city_id:city,barangay_id:barangay},listing:{title:'Synthetic restore listing',description:'Synthetic restore only',transaction_type:'SALE',price_amount:'1000',currency_code:'PHP'},private_location:{street_address:'PRIVATE-SYNTHETIC'}});
      const listing=result.listing.id;await call('post','property-authorities/'+result.authority.id+'/approve',{expected_version:result.authority.version},reviewer,true);
      const submission=await call('post','listings/'+listing+'/submissions',{expected_version:result.listing.version,expected_property_version:result.property.version});result=await call('get','listings/'+listing);
      result=await call('post',`listings/${listing}/submissions/${submission.submission.id}/approve`,{expected_version:result.listing.version},reviewer,true);result=await call('post','listings/'+listing+'/activate',{expected_version:result.listing.version});
      const contact=await call('post','conversations',{listing_id:listing,first_message:'Synthetic first message',client_request_id:uuidv7()},reviewer);await call('post','conversations/'+contact.conversation.id+'/messages',{body:'Synthetic reply',client_request_id:uuidv7()});
      const tables=['principals','lister_access','properties','property_authorities','property_private_locations','listings','listing_submissions','listing_submission_reviews','listing_status_history','audit_events','conversations','conversation_participants','messages'];
      const history=async p=>{const values={};for(const table of tables){const key=table==='lister_access'?'user_id':table==='property_private_locations'?'property_id':'id';values[table]=(await p.query(`SELECT row_to_json(t) row FROM (SELECT * FROM ${table} ORDER BY ${key}) t`)).rows.map(r=>r.row);}return values;};
      const original=await history(pool);const source=await inspectDatabase(pool,'after');const dump=pg('pg_dump',['--format=custom','--no-owner','--dbname',names[0]]);pg('pg_restore',['--exit-on-error','--no-owner','--dbname',names[2]],dump);const restored=open(names[2]);assert.deepEqual(await history(restored),original);requirePreserved(source,await inspectDatabase(restored,'after'));assert.equal(original.messages.length,2);
      console.log('Synthetic custom backups restored before and after marketplace migrations; destructive production rollback is not certified.');
    });
  }finally{
    for(const p of pools)await p.end();
    try{
      for(const name of names){
        for(let attempt=0;attempt<100;attempt++){
          const n=(await root.query('SELECT count(*)::int n FROM pg_stat_activity WHERE datname=$1',[name])).rows[0].n;
          if(!n)break;
          if(attempt===99)throw new Error('Disposable release connections did not close');
          await new Promise(resolve=>setTimeout(resolve,20));
        }
        await root.query(`DROP DATABASE IF EXISTS ${name}`);
      }
    }finally{await root.end();if(dir)await rm(dir,{recursive:true});}
  }
});
