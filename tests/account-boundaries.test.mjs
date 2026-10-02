import test from 'node:test';
import assert from 'node:assert/strict';
import {accessFor,modalAccess} from '../components/balhinbalay/accessPolicy.js';
import {restorePath,legacyPath} from '../components/balhinbalay/browserState.js';

test('public discovery, compare and local recent routes remain open',()=>{
  for(const route of ['home','search','results','map','property','compare','recent','profile']){
    assert.equal(accessFor(route,null,true),'public',route);
    assert.equal(restorePath('/'+route,'',null,{page:'home'}).page,route);
  }
});

test('direct identity routes require a checked server account and never expose local demos',()=>{
  for(const route of ['saved','messages','chat','settings','editProfile']){
    assert.equal(restorePath('/'+route,'',null,{page:'home'}).page,route);
    assert.equal(accessFor(route,null,false),'checking',route);
    assert.equal(accessFor(route,null,true),'sign-in',route);
    assert.equal(accessFor(route,{id:'real',email:'test@example.com'},true),'account-unavailable',route);
  }
  // Administration is a separate /admin application, not a consumer hash route.
  assert.equal(legacyPath('#admin'),null);
  assert.equal(restorePath('/admin','',null,{page:'home'}).page,'home');
  for(const route of ['owner','editor']){
    assert.equal(restorePath('/'+route,'',null,{page:'home'}).page,route);
    assert.equal(accessFor(route,null,true),'sign-in');
    assert.equal(accessFor(route,{id:'real',email:'test@example.com'},true),'marketplace');
  }
});

test('direct actions are blocked for guests and truthful for authenticated accounts',()=>{
  for(const type of ['save-search','enquiry','viewing']){
    assert.equal(modalAccess(type,null,true),'sign-in');
    assert.equal(modalAccess(type,{id:'real'},true),'account-unavailable');
  }
  for(const type of ['availability','unlist']){
    assert.equal(modalAccess(type,null,true),'sign-in');
    assert.equal(modalAccess(type,{id:'real'},true),'lister-unavailable');
  }
  assert.equal(modalAccess('gallery',null,true),'public');
});
