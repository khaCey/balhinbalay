import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {defaults} from '../components/balhinbalay/data.js';
import {legacyPath,navigationSnapshot,restorePath,routePath} from '../components/balhinbalay/browserState.js';

const ordinary=['home','search','results','map','profile','login','register','recent','compare','about','contact','privacy','terms','forgot-password'];

test('consumer paths generate and restore directly, including property IDs',()=>{
  const state={page:'home',q:defaults(),compare:[],property:1};
  for(const page of ordinary){
    const path=routePath(page,state);
    assert.equal(path,page==='home'?'/':`/${page}`);
    assert.equal(restorePath(path,'',null,state).page,page);
  }
  assert.equal(routePath('property',{property:12}),'/property/12');
  assert.equal(restorePath('/property/12','',null,state).property,12);
  assert.equal(restorePath('/property/invalid','',null,state).property,null);
});

test('Back and Forward snapshots recover search and map context without identity data',()=>{
  const state={page:'map',q:{...defaults(),cities:['Cebu City']},savedTab:'Properties',compare:[1,2],property:1,
    chat:1,mapSelected:1,mapCenter:{lat:10,lng:123},mapZoom:15,mapBounds:null,returnPage:'map',draft:{password:'private'}};
  const old={...state,page:'results'};
  const property={...state,page:'property',returnPage:'map'};
  const history=[{path:'/results',bbNav:navigationSnapshot(old)},{path:'/map',bbNav:navigationSnapshot(state)},{path:'/property/1',bbNav:navigationSnapshot(property)}];
  for(const entry of [history[1],history[0],history[1],history[2]]){
    const restored=restorePath(entry.path,'',{bbNav:entry.bbNav},{...state,page:'home'});
    assert.equal(restored.page,entry.bbNav.page);
    assert.deepEqual(restored.q.cities,['Cebu City']);
    assert.deepEqual(restored.compare,[1,2]);
    assert.equal('draft' in entry.bbNav,false);
    if(restored.page==='map')assert.equal(restored.mapSelected,1);
    if(restored.page==='property')assert.equal(restored.returnPage,'map');
  }
});

test('legacy ordinary links migrate while action tokens remain browser-only',()=>{
  for(const [old,path] of [['#home','/'],['#search','/search'],['#profile','/profile'],['#property/1','/property/1'],['#privacy','/privacy'],['#terms','/terms']])
    assert.equal(legacyPath(old),path);
  assert.equal(legacyPath('#admin'),null);
  assert.equal(routePath('admin'),'/');
  assert.equal(legacyPath('#property/not-a-number'),null);
  for(const page of ['verify-email','reset-password']){
    const old=`#${page}/one%2Ftime`;
    const path=legacyPath(old);
    assert.equal(path,`/${page}#one%2Ftime`);
    assert.equal(new URL(path,'https://balhinbalay.com').pathname,`/${page}`);
    assert.equal(new URL(path,'https://balhinbalay.com').search,'');
    assert.equal(restorePath(`/${page}`,'#one%2Ftime',null,{page:'home'}).actionToken,'one/time');
    assert.equal(routePath(page,{actionToken:'one/time'}),path);
  }
});

test('framework owns direct consumer routes; admin is separate and account UX is preserved',async()=>{
  const route=await readFile(new URL('../app/(consumer)/[...route]/page.tsx',import.meta.url),'utf8');
  const layout=await readFile(new URL('../app/(consumer)/layout.tsx',import.meta.url),'utf8');
  const admin=await readFile(new URL('../app/admin/page.tsx',import.meta.url),'utf8');
  const account=await readFile(new URL('../components/balhinbalay/AccountAccess.jsx',import.meta.url),'utf8');
  const profile=await readFile(new URL('../components/balhinbalay/Account.jsx',import.meta.url),'utf8');
  assert.match(route,/params: Promise<\{route: string\[\]\}>/);
  assert.match(route,/route\[0\]==='property'/);
  assert.match(layout,/BalhinBalay/);
  assert.match(admin,/function AdminPortal/);
  assert.match(account,/setMode\('reset-invalid'\)/);
  assert.match(account,/nav\('profile'\)/);
  assert.match(profile,/Sign out/);
});
