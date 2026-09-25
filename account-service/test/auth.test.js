import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import request from 'supertest';
import argon2 from 'argon2';
import {createAccountApp} from '../src/app.js';
import {readConfig} from '../src/config.js';

const ORIGIN='https://balhinbalay.example';
const password='a sufficiently long password';
let database,dir,mail,app,pool;
const digest=s=>createHash('sha256').update(s).digest('hex');
const query=async(sql,args)=>{
  const result=await database.query(sql,args);
  return {...result,rowCount:result.rows.length};
};
const post=(path,body,cookie)=>{
  let req=request(app).post(`/api/auth/${path}`).set('Origin',ORIGIN).set('x-balhinbalay-proxy-key','a'.repeat(40));
  if(cookie)req=req.set('Cookie',cookie);
  return req.send(body);
};
const get=(path,cookie)=>request(app).get(`/api/auth/${path}`).set('x-balhinbalay-proxy-key','a'.repeat(40)).set('Cookie',cookie||'');
const raw=link=>decodeURIComponent(link.split('/#')[1].split('/').slice(1).join('/'));
const register=async(email='somebody@example.com')=>post('register',{email,password});
const verify=async(i=0)=>post('verify-email',{token:raw(mail[i].url)});

test.beforeEach(async()=>{
  dir=await mkdtemp(join(tmpdir(),'bb-auth-'));
  database=new PGlite(dir);
  await database.exec(await readFile(new URL('../migrations/001_accounts.sql',import.meta.url),'utf8'));
  pool={query,connect:async()=>({query,release(){}})};
  mail=[];
  const mailer={verify:async(email,url)=>{mail.push({purpose:'verify',email,url});},reset:async(email,url)=>{mail.push({purpose:'reset',email,url});}};
  app=createAccountApp({pool,mailer,config:{appOrigin:ORIGIN,proxyKey:'a'.repeat(40),sessionDays:14,verificationHours:24,resetMinutes:15}});
});
test.afterEach(async()=>{await database.close();await rm(dir,{recursive:true,force:true});});

test('registration persists normalised unique email and Argon2id hash; duplicate does not send another link',async()=>{
  assert.equal((await register('  Somebody@Example.COM  ')).status,201);
  const r=await query('SELECT * FROM users');
  assert.equal(r.rows.length,1);
  assert.equal(r.rows[0].email,'somebody@example.com');
  assert.equal(r.rows[0].status,'pending');
  assert.equal(r.rows[0].email_verified_at,null);
  assert.match(r.rows[0].password_hash,/^\$argon2id\$/);
  assert.ok(await argon2.verify(r.rows[0].password_hash,password));
  assert.equal((await register('SOMEBODY@example.com')).status,202);
  assert.equal((await query('SELECT * FROM users')).rows.length,1);
  assert.equal(mail.length,1);
  assert.equal((await query('SELECT token_hash FROM account_actions')).rows[0].token_hash,digest(raw(mail[0].url)));
  assert.equal((await get('session')).status,401);
});

test('registration rejects invalid email and weak/oversized passwords',async()=>{
  assert.equal((await post('register',{email:'invalid',password})).body.code,'INVALID_EMAIL');
  assert.equal((await post('register',{email:'a@example.com',password:'short'})).body.code,'INVALID_PASSWORD');
  assert.equal((await post('register',{email:'a@example.com',password:'x'.repeat(129)})).body.code,'INVALID_PASSWORD');
  assert.equal((await query('SELECT * FROM users')).rows.length,0);
});

test('verification rejects invalid/expired/reused tokens and activates only once',async()=>{
  await register();
  assert.equal((await post('verify-email',{token:'x'.repeat(43)})).body.code,'INVALID_TOKEN');
  const value=raw(mail[0].url);
  await query("UPDATE account_actions SET created_at=now()-interval '2 hours',expires_at=now()-interval '1 minute' WHERE token_hash=$1",[digest(value)]);
  assert.equal((await verify()).body.code,'EXPIRED_TOKEN');
  assert.equal((await query('SELECT status FROM users')).rows[0].status,'pending');
  await query("UPDATE account_actions SET expires_at=now()+interval '1 hour' WHERE token_hash=$1",[digest(value)]);
  assert.equal((await verify()).status,200);
  assert.equal((await verify()).body.code,'ALREADY_USED');
  const account=(await query('SELECT * FROM users')).rows[0];
  assert.equal(account.status,'active');assert.ok(account.email_verified_at);
});

test('resend invalidates previous link, rate limit and cooldown prevent email spam',async()=>{
  await register();
  const first=raw(mail[0].url);
  assert.equal((await post('resend-verification',{email:'unknown@example.com'})).status,202);
  assert.equal((await post('resend-verification',{email:'somebody@example.com'})).status,202);
  assert.equal(mail.length,1);
  await query("UPDATE account_actions SET sent_at=now()-interval '2 minutes'");
  assert.equal((await post('resend-verification',{email:'somebody@example.com'})).status,202);
  assert.equal(mail.length,2);
  assert.equal((await post('verify-email',{token:first})).body.code,'INVALID_TOKEN');
  assert.equal((await post('resend-verification',{email:'somebody@example.com'})).status,202);
  assert.equal((await post('resend-verification',{email:'somebody@example.com'})).status,429);
  assert.equal((await verify(1)).status,200);
  await query('DELETE FROM auth_rate_limits');
  assert.equal((await post('resend-verification',{email:'somebody@example.com'})).status,202);
  assert.equal(mail.length,2);
});

test('verified login creates a secure authoritative session restored on refresh, expires and revokes on logout',async()=>{
  await register();
  assert.equal((await post('login',{email:'somebody@example.com',password})).body.code,'EMAIL_NOT_VERIFIED');
  await verify();
  assert.equal((await post('login',{email:'somebody@example.com',password:'wrong'})).body.code,'INVALID_CREDENTIALS');
  assert.equal((await post('login',{email:'missing@example.com',password})).body.code,'INVALID_CREDENTIALS');
  const login=await post('login',{email:'SOMEBODY@example.com',password});
  assert.equal(login.status,200);
  const cookie=login.headers['set-cookie'][0].split(';')[0];
  assert.match(login.headers['set-cookie'][0],/HttpOnly/);
  assert.match(login.headers['set-cookie'][0],/Secure/);
  assert.match(login.headers['set-cookie'][0],/SameSite=Lax/);
  assert.equal((await get('session',cookie)).body.user.email,'somebody@example.com');
  await query("UPDATE auth_sessions SET expires_at=now()-interval '1 second'");
  assert.equal((await get('session',cookie)).status,401);
  const again=await post('login',{email:'somebody@example.com',password});
  const nextCookie=again.headers['set-cookie'][0].split(';')[0];
  assert.equal((await post('logout',{},nextCookie)).status,200);
  assert.equal((await get('session',nextCookie)).status,401);
});

test('suspended account and database outage fail closed; proxy key and origin enforced',async()=>{
  await register();await verify();
  const active=await post('login',{email:'somebody@example.com',password});
  const cookie=active.headers['set-cookie'][0].split(';')[0];
  await query("UPDATE users SET status='suspended'");
  assert.equal((await post('login',{email:'somebody@example.com',password})).body.code,'ACCOUNT_UNAVAILABLE');
  assert.equal((await get('session',cookie)).status,401);
  assert.equal((await request(app).post('/api/auth/register').set('Origin',ORIGIN).send({email:'a@example.com',password})).status,403);
  assert.equal((await request(app).post('/api/auth/register').set('x-balhinbalay-proxy-key','a'.repeat(40)).send({email:'a@example.com',password})).body.code,'ORIGIN_REJECTED');
  const old=pool.query;
  pool.query=()=>{throw new Error('DB_DOWN');};
  try{assert.equal((await get('session',cookie)).status,503);}
  finally{pool.query=old;}
});

test('user row survives a database reopen',async()=>{
  await register();
  await database.close();
  database=new PGlite(dir);
  const result=await query('SELECT email,status FROM users');
  assert.deepEqual(result.rows,[{email:'somebody@example.com',status:'pending'}]);
});

test('password reset token is hashed, expiring, one use and revokes existing sessions',async()=>{
  await register();await verify();
  const login=await post('login',{email:'somebody@example.com',password});
  const cookie=login.headers['set-cookie'][0].split(';')[0];
  assert.equal((await post('forgot-password',{email:'missing@example.com'})).status,202);
  assert.equal((await post('forgot-password',{email:'somebody@example.com'})).status,202);
  const resetToken=raw(mail.at(-1).url);
  assert.equal((await query("SELECT token_hash FROM account_actions WHERE purpose='reset'")).rows[0].token_hash,digest(resetToken));
  assert.equal((await post('reset-password',{token:'q'.repeat(43),password:'new long enough password'})).body.code,'INVALID_TOKEN');
  await query("UPDATE account_actions SET created_at=now()-interval '2 hours',expires_at=now()-interval '1 minute' WHERE purpose='reset'");
  assert.equal((await post('reset-password',{token:resetToken,password:'new long enough password'})).body.code,'EXPIRED_TOKEN');
  await query("UPDATE account_actions SET expires_at=now()+interval '1 hour' WHERE purpose='reset'");
  assert.equal((await post('reset-password',{token:resetToken,password:'new long enough password'})).status,200);
  assert.equal((await post('reset-password',{token:resetToken,password:'new long enough password'})).body.code,'ALREADY_USED');
  assert.equal((await get('session',cookie)).status,401);
  assert.equal((await post('login',{email:'somebody@example.com',password})).status,401);
  assert.equal((await post('login',{email:'somebody@example.com',password:'new long enough password'})).status,200);
});

test('delivery failure leaves recoverable pending account without a usable emailed link',async()=>{
  const failed=createAccountApp({pool,mailer:{verify:async()=>{throw new Error('SMTP refused secret');},reset:async()=>{}},
    config:{appOrigin:ORIGIN,proxyKey:'a'.repeat(40),sessionDays:14,verificationHours:24,resetMinutes:15}});
  const response=await request(failed).post('/api/auth/register').set('Origin',ORIGIN).set('x-balhinbalay-proxy-key','a'.repeat(40))
    .send({email:'somebody@example.com',password});
  assert.equal(response.status,503);
  assert.equal(response.body.code,'EMAIL_UNAVAILABLE');
  assert.equal((await query('SELECT status FROM users')).rows[0].status,'pending');
  assert.ok((await query('SELECT invalidated_at FROM account_actions')).rows[0].invalidated_at);
  assert.equal((await post('resend-verification',{email:'somebody@example.com'})).status,202);
  assert.equal(mail.length,1);
});

test('resend SMTP outage does not reveal whether an account exists',async()=>{
  await register();
  await query("UPDATE account_actions SET sent_at=now()-interval '2 minutes'");
  const failed=createAccountApp({pool,mailer:{verify:async()=>{throw new Error('private SMTP detail');},reset:async()=>{}},
    config:{appOrigin:ORIGIN,proxyKey:'a'.repeat(40),sessionDays:14,verificationHours:24,resetMinutes:15}});
  const send=address=>request(failed).post('/api/auth/resend-verification').set('Origin',ORIGIN)
    .set('x-balhinbalay-proxy-key','a'.repeat(40)).send({email:address});
  const existing=await send('somebody@example.com'),unknown=await send('unknown@example.com');
  assert.equal(existing.status,202);assert.equal(unknown.status,202);
  assert.deepEqual(existing.body,unknown.body);
  assert.equal((await query('SELECT count(*)::int AS count FROM account_actions WHERE invalidated_at IS NULL')).rows[0].count,0);
});

test('missing deployment secrets fail startup configuration before serving requests',()=>{
  assert.throws(()=>readConfig({NODE_ENV:'production'}),/DATABASE_URL is required/);
  const e={DATABASE_URL:'x',APP_URL:'http://example.com',SMTP_HOST:'x',SMTP_PORT:'587',SMTP_USER:'x',SMTP_PASS:'x',SMTP_FROM:'x',PROXY_KEY:'a'.repeat(40),NODE_ENV:'production'};
  assert.throws(()=>readConfig(e),/HTTPS/);
});
