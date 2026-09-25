import test from 'node:test';
import assert from 'node:assert/strict';
import {accessFor,modalAccess} from '../components/balhinbalay/accessPolicy.js';
import {restoreRoute} from '../components/balhinbalay/browserState.js';

test('public discovery, compare and local recent routes remain open',()=>{
  for(const route of ['home','search','results','map','property','compare','recent','profile']){
    assert.equal(accessFor(route,null,true),'public',route);
    assert.equal(restoreRoute('#'+route,null,{page:'home'}).page,route);
  }
});

test('direct identity routes require a checked server account and never expose local demos',()=>{
  for(const route of ['saved','messages','chat','settings','editProfile']){
    assert.equal(restoreRoute('#'+route,null,{page:'home'}).page,route);
    assert.equal(accessFor(route,null,false),'checking',route);
    assert.equal(accessFor(route,null,true),'sign-in',route);
    assert.equal(accessFor(route,{id:'real',email:'test@example.com'},true),'account-unavailable',route);
  }
  assert.equal(restoreRoute('#admin',null,{page:'home'}).page,'admin');
  assert.equal(accessFor('admin',null,false),'checking');
  assert.equal(accessFor('admin',null,true),'sign-in');
  assert.equal(accessFor('admin',{id:'real',email:'admin@example.com'},true),'admin');
  for(const route of ['owner','editor']){
    assert.equal(restoreRoute('#'+route,null,{page:'home'}).page,route);
    assert.equal(accessFor(route,null,true),'sign-in');
    assert.equal(accessFor(route,{id:'real',email:'test@example.com'},true),'lister-unavailable');
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
