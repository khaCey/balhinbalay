import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sessionOutcome} from '../components/balhinbalay/sessionState.js';
import {routePath} from '../components/balhinbalay/browserState.js';

const user={id:'ordinary-user',email:'test@example.com'};

test('a server-revoked authenticated session clears account and raises one notice on the next recheck',()=>{
  const restored=sessionOutcome(false,user);
  assert.equal(restored.hadAuthenticatedSession,true);
  const revoked=sessionOutcome(restored.hadAuthenticatedSession,null,{unauthenticated:true});
  assert.deepEqual(revoked,{account:null,hadAuthenticatedSession:false,showSessionEnded:true});
  assert.equal(sessionOutcome(revoked.hadAuthenticatedSession,null,{unauthenticated:true}).showSessionEnded,false);
});

test('initial signed-out load, service outage and explicit sign-out do not raise a session-ended notice',()=>{
  assert.equal(sessionOutcome(false,null,{unauthenticated:true}).showSessionEnded,false);
  const outage=sessionOutcome(true,null);
  assert.equal(outage.account,null);
  assert.equal(outage.showSessionEnded,false);
  assert.equal(outage.hadAuthenticatedSession,true);
  // setAccount(null) on intentional sign-out clears the prior-authenticated marker.
  assert.equal(sessionOutcome(false,null,{unauthenticated:true}).showSessionEnded,false);
});

test('a successful reset in this tab suppresses a concurrent recheck and clears the prior marker',()=>{
  const duringReset=sessionOutcome(true,null,{unauthenticated:true,suppressNotice:true});
  assert.equal(duringReset.showSessionEnded,false);
  assert.equal(duringReset.hadAuthenticatedSession,false);
  assert.equal(sessionOutcome(false,null,{unauthenticated:true}).showSessionEnded,false);
});

test('the existing modal offers direct clean-path sign-in and account flows retain their boundaries',async()=>{
  const [model,dialogs,profile,access]=await Promise.all([
    readFile(new URL('../components/balhinbalay/model.js',import.meta.url),'utf8'),
    readFile(new URL('../components/balhinbalay/Dialogs.jsx',import.meta.url),'utf8'),
    readFile(new URL('../components/balhinbalay/Account.jsx',import.meta.url),'utf8'),
    readFile(new URL('../components/balhinbalay/AccountAccess.jsx',import.meta.url),'utf8'),
  ]);
  assert.equal(routePath('login',{}),'/login');
  assert.match(dialogs,/case 'session-ended':return <Shell[^>]*>.*You have been logged out\. Please sign in again\..*onClick=\{\(\)=>nav\('login'\)\}>Sign in/s);
  assert.match(model,/window\.addEventListener\('focus',onFocus\)/);
  assert.match(model,/error\.code==='UNAUTHENTICATED'/);
  assert.match(profile,/setSessionEndNoticeSuppressed\(true\).*registrationClient\.logout\(\).*setAccount\(null\)/s);
  assert.match(access,/setSessionEndNoticeSuppressed\(true\).*client\.reset\(actionToken,password\);setAccount\(null\).*setMode\('reset-complete'\)/s);
  assert.match(access,/setAccount\(session\.user\);nav\('profile'\)/);
  assert.match(access,/viewMode==='reset-invalid'\?<>/);
});
