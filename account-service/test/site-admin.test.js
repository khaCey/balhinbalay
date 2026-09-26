import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import express from 'express';
import argon2 from 'argon2';
import {PGlite} from '@electric-sql/pglite';
import request from 'supertest';
import {v7 as uuidv7} from 'uuid';
import {mountSiteAdmin} from '../src/site-admin.js';

const ORIGIN='https://balhinbalay.com';
const proxyKey='a'.repeat(40);
const password='a sufficiently long password';
let database,dir,app,pool;
const query=async(sql,args)=>{const result=await database.query(sql,args);return {...result,rowCount:result.rows.length};};
const api=(method,path,cookie,body)=>{
  let req=request(app)[method](`/api/admin/${path}`).set('x-balhinbalay-proxy-key',proxyKey);
  if(method!=='get')req=req.set('Origin',ORIGIN);
  if(cookie)req=req.set('Cookie',cookie);
  return body===undefined?req:req.send(body);
};

async function addUser(email,{admin=false}={}){
  const id=uuidv7(),hash=await argon2.hash(password,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
  await query(`INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,$3,'active',now())`,[id,email,hash]);
  return {id,email,admin};
}

async function makeNormalSession(userId){
  const raw='normal-session-token-not-admin';
  const {createHash}=await import('node:crypto');
  const digest=createHash('sha256').update(raw).digest('hex');
  await query('INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,$4)',[uuidv7(),userId,digest,new Date(Date.now()+86400000)]);
  return `__Host-bb_session=${raw}`;
}

test.beforeEach(async()=>{
  dir=await mkdtemp(join(tmpdir(),'bb-site-admin-'));
  database=new PGlite(dir);
  await database.exec(await readFile(new URL('../migrations/001_accounts.sql',import.meta.url),'utf8'));
  pool={query,connect:async()=>({query,release(){}})};
  app=express();app.use(express.json({limit:'8kb'}));
  mountSiteAdmin(app,{pool,config:{appOrigin:ORIGIN,proxyKey,adminEmails:['admin@example.com'],sessionDays:14}});
});

test.afterEach(async()=>{await database.close();await rm(dir,{recursive:true,force:true});});

test('ordinary BalhinBalay session never authenticates the standalone admin API',async()=>{
  const admin=await addUser('admin@example.com');
  const normalCookie=await makeNormalSession(admin.id);
  const result=await api('get','accounts',normalCookie);
  assert.equal(result.status,401);
  assert.equal(result.body.code,'UNAUTHENTICATED');
});

test('non-admin credentials cannot create an admin session',async()=>{
  await addUser('ordinary@example.com');
  const result=await api('post','login',null,{email:'ordinary@example.com',password});
  assert.equal(result.status,401);
  assert.equal(result.body.code,'INVALID_ADMIN_CREDENTIALS');
  assert.equal(result.headers['set-cookie'],undefined);
});

test('allowlisted admin logs in with a dedicated cookie and can manage accounts',async()=>{
  await addUser('admin@example.com');
  const login=await api('post','login',null,{email:'admin@example.com',password});
  assert.equal(login.status,200);
  const setCookie=login.headers['set-cookie'];
  assert.ok(Array.isArray(setCookie));
  assert.match(setCookie[0],/^__Host-bb_admin_session=/);
  assert.doesNotMatch(setCookie[0],/__Host-bb_session=/);
  const adminCookie=setCookie[0].split(';')[0];

  const session=await api('get','session',adminCookie);
  assert.equal(session.status,200);
  assert.equal(session.body.user.email,'admin@example.com');

  const created=await api('post','accounts',adminCookie,{email:'created@example.com',password});
  assert.equal(created.status,201);
  assert.equal(created.body.user.status,'active');
  assert.ok(created.body.user.email_verified_at);

  const list=await api('get','accounts',adminCookie);
  assert.equal(list.status,200);
  assert.deepEqual(new Set(list.body.accounts.map(account=>account.email)),new Set(['admin@example.com','created@example.com']));

  const deleted=await api('delete',`accounts/${created.body.user.id}`,adminCookie);
  assert.equal(deleted.status,204);

  const logout=await api('post','logout',adminCookie,{});
  assert.equal(logout.status,200);
  assert.match(logout.headers['set-cookie'][0],/^__Host-bb_admin_session=;/);
  assert.equal((await api('get','session',adminCookie)).status,401);
});

test('admin API rejects missing proxy key and cross-origin mutations',async()=>{
  await addUser('admin@example.com');
  assert.equal((await request(app).post('/api/admin/login').set('Origin',ORIGIN).send({email:'admin@example.com',password})).status,403);
  const crossed=await request(app).post('/api/admin/login').set('Origin','https://evil.example').set('x-balhinbalay-proxy-key',proxyKey).send({email:'admin@example.com',password});
  assert.equal(crossed.status,403);
  assert.equal(crossed.body.code,'ORIGIN_REJECTED');
});
