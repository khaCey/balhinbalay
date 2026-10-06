import test from 'node:test';
import assert from 'node:assert/strict';
import {marketplaceAllowed,marketplaceForward} from '../lib/marketplace-proxy.js';
import {readFile} from 'node:fs/promises';
const id='019a0000-0000-7000-8000-000000000001';
const ctx=path=>({params:Promise.resolve({path})});

test('marketplace methods/resources are exact; approval and arbitrary paths fail closed',()=>{
 for(const [method,path] of [['GET',['me','lister-access']],['POST',['me','lister-access']],['GET',['me','listings']],['GET',['reference-data']],['POST',['listings']],['GET',['listings',id]],['PATCH',['listings',id]],['POST',['listings',id,'submissions']]])assert.equal(marketplaceAllowed(method,path),true);
 for(const path of [['listings',id,'approve'],['conversations','1'],['auth','login'],['..','admin'],['listings','1'],['listings',id,'submissions','extra']])assert.equal(marketplaceAllowed('POST',path),false);
 assert.equal(marketplaceAllowed('DELETE',['listings',id]),false);
 assert.equal(marketplaceAllowed('POST',['property-authorities',id,'approve'],true),true);
 assert.equal(marketplaceAllowed('POST',['property-authorities',id,'revoke'],true),false);
 assert.equal(marketplaceAllowed('POST',['lister-access',id,'suspend'],true),true);
});

test('proxy separates credentials, checks origin/body/query and never forwards Set-Cookie',async()=>{
 const previous={APP_URL:process.env.APP_URL,ACCOUNT_API_ORIGIN:process.env.ACCOUNT_API_ORIGIN,ACCOUNT_PROXY_KEY:process.env.ACCOUNT_PROXY_KEY};const oldFetch=globalThis.fetch;
 Object.assign(process.env,{APP_URL:'https://site.invalid',ACCOUNT_API_ORIGIN:'https://private-service.invalid',ACCOUNT_PROXY_KEY:'synthetic-only'});
 let sent;
 globalThis.fetch=async(url,options)=>{sent={url:String(url),options};return new Response('{"ok":true}',{headers:{'Content-Type':'application/json','Set-Cookie':'leak=value'}});};
 try{
  const get=()=>new Request('https://site.invalid/api/marketplace/me/listings?limit=2',{headers:{Cookie:'unrelated=secret; __Host-bb_admin_session=admin-value; __Host-bb_session=user-value'}});
  let response=await marketplaceForward(get(),ctx(['me','listings']),'GET');assert.equal(response.status,200);assert.equal(sent.options.headers.get('cookie'),'__Host-bb_session=user-value');assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(sent.options.redirect,'error');assert.match(sent.url,/limit=2$/);
  response=await marketplaceForward(new Request('https://site.invalid/api/admin/marketplace/lister-access',{headers:{Cookie:'__Host-bb_session=user-value; __Host-bb_admin_session=admin-value'}}),ctx(['lister-access']),'GET',true);assert.equal(response.status,200);assert.equal(sent.options.headers.get('cookie'),'__Host-bb_admin_session=admin-value');
  const mutate=(origin,body='{}')=>new Request('https://site.invalid/api/marketplace/me/lister-access',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body});
  assert.equal((await marketplaceForward(mutate('https://attacker.invalid'),ctx(['me','lister-access']),'POST')).status,403);
  assert.equal((await marketplaceForward(mutate('https://site.invalid','x'.repeat(8193)),ctx(['me','lister-access']),'POST')).status,413);
  assert.equal((await marketplaceForward(new Request('https://site.invalid/api/marketplace/me/listings?destination=https://evil.invalid'),ctx(['me','listings']),'GET')).status,422);
  assert.equal((await marketplaceForward(new Request('https://site.invalid/api/marketplace/me/listings?limit=1&limit=2'),ctx(['me','listings']),'GET')).status,422);
  process.env.ACCOUNT_API_ORIGIN='https://user:password@private-service.invalid';assert.equal((await marketplaceForward(get(),ctx(['me','listings']),'GET')).status,503);
 }finally{globalThis.fetch=oldFetch;for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});

test('persistent editor uses UUID route/API and leaves sample/local guest persistence separate',async()=>{
 const files=await Promise.all(['../components/balhinbalay/Marketplace.jsx','../app/(consumer)/[...route]/page.tsx','../components/balhinbalay/browserState.js','../components/balhinbalay/MarketplaceAdmin.jsx'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
 const [ui,routes,browser,admin]=files;
 assert.doesNotMatch(ui,/localStorage|Date\.now\(|fake|\.owner\b/);assert.match(ui,/marketplaceRequest\('listings\//);assert.match(ui,/expected_property_version/);assert.match(ui,/expected_authority_version/);assert.match(ui,/Save and submit for review/);assert.match(routes,/route\[0\]==='editor'/);assert.match(routes,/listingId=\{route\[1\]\}/);assert.match(browser,/Historical browser-only saves, messages and listings/);assert.match(admin,/\/api\/admin\/marketplace\//);
});

test('publication proxy allows only UUID detail and versioned owner actions, with no public credentials',async()=>{
 assert.equal(marketplaceAllowed('GET',['public','listings',id]),true);
 for(const action of ['activate','unlist'])assert.equal(marketplaceAllowed('POST',['listings',id,action]),true);
 for(const [method,path] of [['GET',['public','listings']],['POST',['public','listings',id]],['GET',['listings',id,'activate']],['POST',['listings',id,'activate','extra']],['GET',['public','listings','1']]])assert.equal(marketplaceAllowed(method,path),false);
 assert.equal(marketplaceAllowed('POST',['listings',id,'activate'],true),false);
 const previous={APP_URL:process.env.APP_URL,ACCOUNT_API_ORIGIN:process.env.ACCOUNT_API_ORIGIN,ACCOUNT_PROXY_KEY:process.env.ACCOUNT_PROXY_KEY},old=globalThis.fetch;let sent;
 Object.assign(process.env,{APP_URL:'https://site.invalid',ACCOUNT_API_ORIGIN:'https://private-service.invalid',ACCOUNT_PROXY_KEY:'synthetic-only'});
 globalThis.fetch=async(url,options)=>{sent={url:String(url),options};return Response.json({ok:true});};
 try{
  const response=await marketplaceForward(new Request('https://site.invalid/api/marketplace/public/listings/'+id,{headers:{Cookie:'__Host-bb_session=secret; __Host-bb_admin_session=admin-secret'}}),ctx(['public','listings',id]),'GET');assert.equal(response.status,200);assert.equal(sent.options.headers.get('cookie'),null);assert.equal(response.headers.get('cache-control'),'no-store');
  const mutation=origin=>new Request('https://site.invalid/api/marketplace/listings/'+id+'/activate',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:'__Host-bb_session=owner; __Host-bb_admin_session=admin'},body:'{"expected_version":"4"}'});
  assert.equal((await marketplaceForward(mutation('https://evil.invalid'),ctx(['listings',id,'activate']),'POST')).status,403);
  assert.equal((await marketplaceForward(mutation('https://site.invalid'),ctx(['listings',id,'activate']),'POST')).status,200);assert.equal(sent.options.headers.get('cookie'),'__Host-bb_session=owner');assert.equal(sent.options.body,'{"expected_version":"4"}');
  assert.equal((await marketplaceForward(new Request('https://site.invalid/api/marketplace/public/listings/'+id+'?private=true'),ctx(['public','listings',id]),'GET')).status,422);
 }finally{globalThis.fetch=old;for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
