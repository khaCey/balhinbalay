import test from 'node:test';
import assert from 'node:assert/strict';
import {publicSearchOptions,searchPublicProjections} from '../src/marketplace-publication.js';

const listing=(id,overrides={})=>({id,published_at:'2026-10-12T00:00:00.000Z',transaction_type:'RENT',title:'A real home',description:'Quiet and sunny',price_amount:'15000',property:{property_type:'HOUSE',bedrooms:2,bathrooms:1,floor_area_sqm:70},location:{city:'City of Cebu',barangay:'Lahug',map_point:null},...overrides});

test('public search accepts only supported persisted filters and deterministic pagination',()=>{
 const a=listing('a'),b=listing('b',{price_amount:'20000',property:{property_type:'CONDO',bedrooms:1,bathrooms:2,floor_area_sqm:50}}),c=listing('c',{transaction_type:'SALE',title:'Riverside land',description:'Open plot',price_amount:'500000',property:{property_type:'LAND',bedrooms:null,bathrooms:null,floor_area_sqm:null},location:{city:'Iloilo City',barangay:'Mandurriao',map_point:null}});
 const all=[c,b,a];
 const search=query=>searchPublicProjections(all,publicSearchOptions(query));
 assert.deepEqual(search({limit:'2'}).listings.map(x=>x.id),['a','b']);
 assert.deepEqual(search({limit:'2',page:'2'}).listings.map(x=>x.id),['c']);
 assert.deepEqual(search({sort:'price_desc'}).listings.map(x=>x.id),['c','b','a']);
 assert.deepEqual(search({transaction_type:'SALE'}).listings.map(x=>x.id),['c']);
 assert.deepEqual(search({city:'CITY OF CEBU',property_type:'CONDO',min_price:'18000',max_price:'22000',min_bedrooms:'1',min_bathrooms:'2',min_floor_area:'40'}).listings.map(x=>x.id),['b']);
 assert.deepEqual(search({keyword:'quiet lahug'}).listings.map(x=>x.id),['a','b']);
 assert.deepEqual(search({keyword:'mandurriao'}).listings.map(x=>x.id),['c']);
 assert.deepEqual(search({min_bedrooms:'1'}).listings.map(x=>x.id),['a','b']);
 assert.throws(()=>publicSearchOptions({sort:'recommended'}));
 assert.throws(()=>publicSearchOptions({tags:'pool'}));
 assert.throws(()=>publicSearchOptions({limit:'500'}));
});
