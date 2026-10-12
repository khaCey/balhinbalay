import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fetchRealListings,realMapPins,realSearchParams} from '../components/balhinbalay/realInventory.js';

test('main inventory requests only supported real public filters',()=>{
 const params=realSearchParams({mode:'Rent',cities:['City of Cebu'],type:'House',min:10000,max:20000,beds:2,baths:1,size:70,keyword:'Lahug',sort:'Price: low to high'},2,20);
 assert.equal(params.get('transaction_type'),'RENT');assert.equal(params.get('city'),'City of Cebu');assert.equal(params.get('property_type'),'HOUSE');
 assert.equal(params.get('min_price'),'10000');assert.equal(params.get('max_price'),'20000');assert.equal(params.get('min_bedrooms'),'2');
 assert.equal(params.get('min_bathrooms'),'1');assert.equal(params.get('min_floor_area'),'70');assert.equal(params.get('keyword'),'Lahug');
 assert.equal(params.get('sort'),'price_asc');assert.equal(params.get('page'),'2');assert.equal(params.get('limit'),'20');
 assert.equal(params.has('tags'),false);
});

test('empty or unavailable real API never falls back to illustrative fixtures',async()=>{
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>({ok:true,json:async()=>({ok:true,listings:[],total:0,has_more:false})});
  assert.deepEqual(await fetchRealListings({mode:'Rent'}),{listings:[],total:0});
  globalThis.fetch=async()=>({ok:false});
  await assert.rejects(fetchRealListings({mode:'Rent'}),/could not be reached/);
 }finally{globalThis.fetch=original;}
});

test('a coordinate-less real listing remains in results but has no map pin',()=>{
 const noPoint={id:'first',location:{city:'City of Cebu',barangay:'Lahug',map_point:null}};
 const withPoint={id:'second',location:{city:'City of Cebu',barangay:'Lahug',map_point:{lat:10.3,lng:123.9}}};
 const results=[noPoint,withPoint];
 assert.equal(results.length,2);
 assert.deepEqual(realMapPins(results),[withPoint]);
});

test('main public pages and real cards contain no sample feed or property photographs',async()=>{
 const files=await Promise.all(['Home.jsx','Search.jsx','RealListingCard.jsx'].map(name=>readFile(new URL('../components/balhinbalay/'+name,import.meta.url),'utf8')));
 for(const source of files)assert.doesNotMatch(source,/searchListings\(|\bbase\.filter\(|photos\[|ListingImage/);
 assert.match(files[2],/\/listing\/'\+listing\.id/);
 assert.match(files[2],/Photo not available/);
});
