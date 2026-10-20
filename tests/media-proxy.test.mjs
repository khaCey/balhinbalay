import test from 'node:test';
import assert from 'node:assert/strict';
import {marketplaceAllowed,marketplaceForward} from '../lib/marketplace-proxy.js';
const listing='11111111-1111-4111-8111-111111111111',asset='22222222-2222-4222-8222-222222222222',submission='33333333-3333-4333-8333-333333333333';
const owner=['listings',listing,'media'],pub=['public','listings',listing,'media',asset,'share'];
const env={APP_URL:'https://fixture.invalid',ACCOUNT_API_ORIGIN:'https://private.invalid',ACCOUNT_PROXY_KEY:'synthetic-secret'};
async function fixture(fn){const old={...process.env},fetch=globalThis.fetch;Object.assign(process.env,env);try{await fn();}finally{globalThis.fetch=fetch;for(const key of Object.keys(env))if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}}
const forward=(path,method='GET',options={})=>marketplaceForward(new Request('https://fixture.invalid/api/'+path.join('/'),{method,...options}),{params:Promise.resolve({path})},method);
const upload=(extra={})=>forward(owner,'POST',{headers:{origin:env.APP_URL,cookie:'__Host-bb_session=ordinary; __Host-bb_admin_session=admin','content-type':'image/jpeg','x-listing-version':'2',...extra},body:new Uint8Array([255,216,255])});
test('media proxy permits only exact owner, separate admin and public raster routes',()=>{
 assert.ok(marketplaceAllowed('POST',owner));assert.ok(marketplaceAllowed('PATCH',owner));assert.ok(marketplaceAllowed('GET',pub));assert.ok(marketplaceAllowed('GET',['listings',listing,'submissions',submission,'media',asset,'thumb'],true));
 for(const p of [pub.slice(0,-1).concat('original'),pub.concat('x'),['listings',listing,'media','..','share'],['listings',listing,'media',asset,'constructor']])assert.equal(marketplaceAllowed('GET',p),false);
 assert.equal(marketplaceAllowed('POST',owner,true),false);assert.equal(marketplaceAllowed('GET',pub,true),false);
});
test('uploads validate the real owner before buffering and forward only ordinary credentials/version',async()=>fixture(async()=>{
 let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(options.headers.get('cookie'),'__Host-bb_session=ordinary');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');if(calls===1)return Response.json({ok:true,available:true,version:'2'});assert.equal(options.method,'POST');assert.equal(options.headers.get('content-type'),'image/jpeg');assert.equal(options.headers.get('x-listing-version'),'2');assert.deepEqual([...options.body],[255,216,255]);return Response.json({ok:true},{status:201});};
 assert.equal((await upload()).status,201);assert.equal(calls,2);
}));
test('invalid origins/types/sessions/stale versions and streamed oversize fail without a write',async()=>fixture(async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({ok:true,available:true,version:'2'});};
 assert.equal((await upload({origin:'https://evil.invalid'})).status,403);
 assert.equal((await upload({'content-type':'image/svg+xml'})).status,415);
 assert.equal((await upload({cookie:'__Host-bb_admin_session=admin'})).status,401);
 assert.equal((await upload({'x-listing-version':'1'})).status,409);
 const body=new Uint8Array(8*1024*1024+1);const r=await forward(owner,'POST',{headers:{origin:env.APP_URL,cookie:'__Host-bb_session=x','content-type':'image/jpeg','x-listing-version':'2'},body});assert.equal(r.status,413);assert.equal(calls,2);
}));
test('revoked sessions fail the preflight and never send image bytes',async()=>fixture(async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({ok:false,code:'UNAUTHENTICATED'},{status:401});};assert.equal((await upload()).status,401);assert.equal(calls,1);
}));
test('public images drop cookies and retain no-store/nosniff without forwarding upstream headers',async()=>fixture(async()=>{
 globalThis.fetch=async(_url,options)=>{assert.equal(options.headers.get('cookie'),null);return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/jpeg','set-cookie':'bad=1','x-private':'no'}});};
 const r=await forward(pub,'GET',{headers:{cookie:'__Host-bb_session=user; __Host-bb_admin_session=admin'}});assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('set-cookie'),null);assert.equal(r.headers.get('x-private'),null);assert.deepEqual([...new Uint8Array(await r.arrayBuffer())],[1,2,3]);
 globalThis.fetch=async()=>new Response('<svg/>',{headers:{'content-type':'image/svg+xml'}});assert.equal((await forward(pub)).status,502);
}));
