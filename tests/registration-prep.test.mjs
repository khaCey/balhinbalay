import test from 'node:test';
import assert from 'node:assert/strict';
import {normaliseEmail,validateRegistration} from '../components/balhinbalay/registrationValidation.js';
import {registrationClient} from '../components/balhinbalay/registrationClient.js';
import {restoreDemo,restoreRoute,routeHash} from '../components/balhinbalay/browserState.js';

test('normalises email consistently and rejects malformed addresses', () => {
  assert.equal(normaliseEmail('  Person@Example.COM  '), 'person@example.com');
  assert.match(validateRegistration({email:'not-an-address',password:'secret',confirmation:'secret'}), /valid email/);
});

test('requires a password and matching confirmation', () => {
  assert.match(validateRegistration({email:'p@example.com',password:'',confirmation:''}), /password/);
  assert.match(validateRegistration({email:'p@example.com',password:'too-short',confirmation:'too-short'}), /12 to 128/);
  assert.match(validateRegistration({email:'p@example.com',password:'first-password',confirmation:'second-password'}), /match/);
  assert.equal(validateRegistration({email:'p@example.com',password:'first-password',confirmation:'first-password'}), null);
});

test('registration client sends the normalised input in a same-origin request without local storage', async () => {
  const oldFetch=globalThis.fetch;
  let observed;
  globalThis.fetch=async (path,options)=>{observed={path,options};return {ok:true,json:async()=>({status:'pending'})};};
  try {
    await registrationClient.register(normaliseEmail(' Test@Example.com '),'secret');
    assert.equal(observed.path,'/api/auth/register');
    assert.equal(observed.options.credentials,'same-origin');
    assert.deepEqual(JSON.parse(observed.options.body),{email:'test@example.com',password:'secret'});
  } finally {globalThis.fetch=oldFetch;}
});

test('missing account service is an error, not a simulated successful registration', async () => {
  const oldFetch=globalThis.fetch;
  globalThis.fetch=async()=>({ok:false,status:404,json:async()=>({})});
  try {await assert.rejects(registrationClient.register('a@example.com','secret'),/not available yet/);}
  finally {globalThis.fetch=oldFetch;}
});

test('verification and password recovery use POST body instead of query-string tokens',async()=>{
  const oldFetch=globalThis.fetch;const paths=[];
  globalThis.fetch=async(path,options)=>{paths.push([path,JSON.parse(options.body)]);return {ok:true,json:async()=>({ok:true})};};
  try{
    await registrationClient.verify('test-token');
    await registrationClient.forgot('p@example.com');
    await registrationClient.reset('reset-token','new password');
    assert.deepEqual(paths,[['/api/auth/verify-email',{token:'test-token'}],['/api/auth/forgot-password',{email:'p@example.com'}],['/api/auth/reset-password',{token:'reset-token',password:'new password'}]]);
  }finally{globalThis.fetch=oldFetch;}
});

test('ordinary registration client does not expose admin account actions',()=>{
  assert.equal(registrationClient.adminAccounts,undefined);
  assert.equal(registrationClient.createAdminAccount,undefined);
  assert.equal(registrationClient.deleteAdminAccount,undefined);
});

test('email-action fragments survive direct navigation without entering demo storage',()=>{
  const initial={page:'home',q:{},compare:[],savedTab:'Properties'};
  const route=restoreRoute('#verify-email/test-action',null,initial);
  assert.equal(route.page,'verify-email');
  assert.equal(route.actionToken,'test-action');
  assert.equal(routeHash(route.page,route),'#verify-email/test-action');
  assert.equal(restoreRoute('#reset-password/bad%ZZ',null,initial).actionToken,'');
});

test('legacy browser demo identity cannot override the authenticated account surface',()=>{
  const blank={
    saved:[],searches:[],recent:[],recentCities:[],signals:{},
    profile:{name:'',email:'',photo:''},
    settings:{messages:true,searches:true,updates:false},
    owner:[],convos:[],signedIn:false,
  };
  const restored=restoreDemo({
    profile:{name:'Legacy Demo User',email:'demo@example.com',photo:'data:image/png;base64,old'},
    signedIn:true,
  },blank);
  assert.deepEqual(restored.profile,blank.profile);
  assert.equal(restored.signedIn,false);
});
