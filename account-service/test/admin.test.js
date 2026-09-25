import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {PGlite} from '@electric-sql/pglite';
import request from 'supertest';
import argon2 from 'argon2';
import {createAccountApp} from '../src/app.js';
import {isLoopbackAddress,mountLocalAdmin} from '../src/admin.js';

const ORIGIN='https://balhinbalay.com';
const proxyKey='a'.repeat(40);
const password='a sufficiently long password';
let database,dir,app,pool,adminToken;
const query=async(sql,args)=>{const result=await database.query(sql,args);return {...result,rowCount:result.rows.length};};
const authPost=(path,body,cookie)=>{let req=request(app).post(`/api/auth/${path}`).set('Origin',ORIGIN).set('x-balhinbalay-proxy-key',proxyKey);if(cookie)req=req.set('Cookie',cookie);return req.send(body);};
const admin=(method,path)=>request(app)[method](path).set('x-balhinbalay-admin-token',adminToken);
const siteAdmin=(method,path,cookie)=>{let req=request(app)[method](path).set('Origin',ORIGIN).set('x-balhinbalay-proxy-key',proxyKey);if(cookie)req=req.set('Cookie',cookie);return req;};

test.beforeEach(async()=>{
  dir=await mkdtemp(join(tmpdir(),'bb-admin-'));
  database=new PGlite(dir);
  await database.exec(await readFile(new URL('../migrations/001_accounts.sql',import.meta.url),'utf8'));
  pool={query,connect:async()=>({query,release(){}})};
  const mailer={verify:async()=>{},reset:async()=>{}};
  const config={appOrigin:ORIGIN,proxyKey,adminEmails:['admin@example.com'],sessionDays:14,verificationHours:24,resetMinutes:15};
  app=createAccountApp({pool,mailer,config});
  mountLocalAdmin(app,{pool,config});
  const page=await request(app).get('/admin');
  assert.equal(page.status,200);
  adminToken=page.text.match(/<meta name="bb-admin-token" content="([^"]+)"/)[1];
});
test.afterEach(async()=>{await database.close();await rm(dir,{recursive:true,force:true});});

test('admin surface is loopback-oriented and API requires the per-process admin token',async()=>{
  assert.equal(isLoopbackAddress('127.0.0.1'),true);
  assert.equal(isLoopbackAddress('::1'),true);
  assert.equal(isLoopbackAddress('::ffff:127.0.0.1'),true);
  assert.equal(isLoopbackAddress('192.168.1.10'),false);
  assert.equal((await request(app).get('/admin/api/accounts')).status,403);
  assert.equal((await request(app).get('/admin/api/accounts').set('x-balhinbalay-admin-token','wrong')).status,403);
  const list=await admin('get','/admin/api/accounts');
  assert.equal(list.status,200);assert.deepEqual(list.body.accounts,[]);
});

test('admin creates a normalised pre-verified active account that can sign in immediately',async()=>{
  const created=await admin('post','/admin/api/accounts').send({email:'  Owner@Test.Example  ',password});
  assert.equal(created.status,201);
  assert.equal(created.body.user.email,'owner@test.example');
  assert.equal(created.body.user.status,'active');
  assert.ok(created.body.user.email_verified_at);
  const row=(await query('SELECT * FROM users')).rows[0];
  assert.match(row.password_hash,/^\$argon2id\$/);assert.ok(await argon2.verify(row.password_hash,password));
  const login=await authPost('login',{email:'owner@test.example',password});
  assert.equal(login.status,200);
  const duplicate=await admin('post','/admin/api/accounts').send({email:'OWNER@test.example',password});
  assert.equal(duplicate.status,409);assert.equal(duplicate.body.code,'ACCOUNT_EXISTS');
});

test('admin can see all accounts and deletion cascades auth sessions and account actions',async()=>{
  const first=await admin('post','/admin/api/accounts').send({email:'one@example.com',password});
  await admin('post','/admin/api/accounts').send({email:'two@example.com',password});
  const login=await authPost('login',{email:'one@example.com',password});
  assert.equal(login.status,200);
  assert.equal((await authPost('forgot-password',{email:'one@example.com'})).status,202);
  const list=await admin('get','/admin/api/accounts');
  assert.equal(list.body.accounts.length,2);
  assert.deepEqual(new Set(list.body.accounts.map(x=>x.email)),new Set(['one@example.com','two@example.com']));
  assert.equal((await query('SELECT * FROM auth_sessions')).rows.length,1);
  assert.equal((await query('SELECT * FROM account_actions')).rows.length,1);
  const deleted=await admin('delete',`/admin/api/accounts/${first.body.user.id}`);
  assert.equal(deleted.status,204);
  assert.equal((await query("SELECT * FROM users WHERE email='one@example.com'")).rows.length,0);
  assert.equal((await query('SELECT * FROM auth_sessions')).rows.length,0);
  assert.equal((await query('SELECT * FROM account_actions')).rows.length,0);
  assert.equal((await admin('delete',`/admin/api/accounts/${first.body.user.id}`)).status,404);
});

test('Site admin API requires a real session and configured admin email',async()=>{
  const created=await admin('post','/admin/api/accounts').send({email:'admin@example.com',password});
  const login=await authPost('login',{email:'admin@example.com',password});
  const cookie=login.headers['set-cookie'][0].split(';')[0];
  assert.equal((await siteAdmin('get','/api/admin/accounts')).status,401);
  const list=await siteAdmin('get','/api/admin/accounts',cookie);
  assert.equal(list.status,200);assert.equal(list.body.accounts.length,1);
  const made=await siteAdmin('post','/api/admin/accounts',cookie).send({email:'created@example.com',password});
  assert.equal(made.status,201);assert.equal(made.body.user.status,'active');
  assert.equal((await siteAdmin('delete',`/api/admin/accounts/${made.body.user.id}`,cookie)).status,204);
  assert.equal((await query("SELECT * FROM users WHERE email='created@example.com'")).rows.length,0);
  assert.ok(created.body.user.id);
});

test('Site admin API rejects a signed-in non-admin',async()=>{
  await admin('post','/admin/api/accounts').send({email:'ordinary@example.com',password});
  const login=await authPost('login',{email:'ordinary@example.com',password});
  const cookie=login.headers['set-cookie'][0].split(';')[0];
  const denied=await siteAdmin('get','/api/admin/accounts',cookie);
  assert.equal(denied.status,403);assert.equal(denied.body.code,'ADMIN_FORBIDDEN');
});
