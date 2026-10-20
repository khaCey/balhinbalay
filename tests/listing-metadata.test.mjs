import test from 'node:test';
import assert from 'node:assert/strict';
import {listingMetadata,fetchListingForRender} from '../lib/listing-metadata.js';
const id='11111111-1111-4111-8111-111111111111',asset='22222222-2222-4222-8222-222222222222';
const listing={id,title:'Cebu home',transaction_type:'RENT',price_amount:'15000.00',currency_code:'PHP',location:{barangay:'Lahug',city:'City of Cebu',street_address:'PRIVATE'},description:'PRIVATE description',media:[{id:asset,share_url:'https://evil.invalid/private'}],private_location:{street_address:'PRIVATE'},email:'PRIVATE'};
test('share metadata uses approved public fields, fixed canonical and a constructed public image',()=>{
 const m=listingMetadata(id,{status:'found',listing,shareAssetId:asset});assert.equal(m.alternates.canonical,'https://balhinbalay.com/listing/'+id);assert.equal(m.openGraph.title,'Cebu home | BalhinBalay');assert.equal(m.description,'For rent · PHP 15000.00 · Lahug, City of Cebu');assert.equal(m.openGraph.images[0].url,`https://balhinbalay.com/api/marketplace/public/listings/${id}/media/${asset}/share`);assert.equal(m.twitter.card,'summary_large_image');assert.doesNotMatch(JSON.stringify(m),/PRIVATE|evil/);
});
test('zero photos use branded artwork without making photos mandatory',()=>{
 const m=listingMetadata(id,{status:'found',listing:{...listing,media:[]}});assert.equal(m.openGraph.images[0].url,'https://balhinbalay.com/sharing-default.jpg');assert.equal(m.openGraph.images[0].width,1200);assert.equal(m.openGraph.images[0].height,630);
});
test('ineligible, withdrawn and unavailable states contain no listing values',()=>{
 for(const status of ['not-found','unavailable']){const m=listingMetadata(id,{status,listing});assert.equal(m.robots.index,false);assert.doesNotMatch(JSON.stringify(m),/Cebu|15000|Lahug|22222222|PRIVATE/);}
});
test('metadata normalises control characters and bounds untrusted public text',()=>{
 const m=listingMetadata(id,{status:'found',listing:{...listing,title:'x\n\u0000'.repeat(300),location:{city:'y'.repeat(400),barangay:'z'.repeat(400)}}});assert.ok(m.title.length<=194);assert.ok(m.description.length<=300);assert.doesNotMatch(m.title,/[\u0000\n]/);
});
test('server rendering uses the protected proxy, no cookies, no redirects and fresh eligibility',async()=>{
 const old={...process.env},original=globalThis.fetch;Object.assign(process.env,{APP_URL:'https://balhinbalay.com',ACCOUNT_API_ORIGIN:'https://private.invalid',ACCOUNT_PROXY_KEY:'synthetic'});
 try{let status=200,usable=true;globalThis.fetch=async(url,options)=>{assert.equal(options.cache,'no-store');assert.equal(options.redirect,'error');assert.equal(options.headers.get('cookie'),null);if(url.href.endsWith('/share'))return usable?new Response(new Uint8Array([1]),{headers:{'Content-Type':'image/jpeg'}}):Response.json({ok:false},{status:404});assert.equal(url.href,'https://private.invalid/api/marketplace/public/listings/'+id);return Response.json(status===200?{ok:true,listing}:{ok:false},{status});};let found=await fetchListingForRender(id);assert.equal(found.status,'found');assert.equal(found.shareAssetId,asset);usable=false;found=await fetchListingForRender(id);assert.equal(found.status,'found');assert.equal(found.shareAssetId,null);assert.equal(listingMetadata(id,found).openGraph.images[0].url,'https://balhinbalay.com/sharing-default.jpg');status=404;assert.equal((await fetchListingForRender(id)).status,'not-found');status=503;assert.equal((await fetchListingForRender(id)).status,'unavailable');}
 finally{globalThis.fetch=original;for(const key of ['APP_URL','ACCOUNT_API_ORIGIN','ACCOUNT_PROXY_KEY'])if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}
});
