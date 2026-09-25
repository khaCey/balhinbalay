import test from 'node:test';
import assert from 'node:assert/strict';
import {base, defaults} from '../components/balhinbalay/data.js';
import {searchListings} from '../components/balhinbalay/searchListings.js';
import {RANKING_CONFIG} from '../components/balhinbalay/ranking/rankingConfig.js';
import {deriveAgeDays, toRankingListing} from '../components/balhinbalay/ranking/rankingAdapter.js';
import {computeMarketAverage, decayedPopularityStats, rankCityListings, scoreFreshness, scorePopularity, scoreQuality} from '../components/balhinbalay/ranking/cityRanking.js';

const query = changes => ({...defaults(), cities:['Cebu City'], ...changes});
const ids = rows => rows.map(p => p.id);
const complete = {
  id:'complete', title:'Sample home', price:20000, city:'Cebu City', location:'Lahug',
  type:'Condo', listingType:'rent', photoCount:5, description:'Useful property details. '.repeat(10),
  beds:0, baths:1, sizeSqm:35, furnishing:'Unfurnished', availabilityStatus:'available',
  depositInfo:0, leaseMonths:12, ageDays:30,
};

test('accepted freshness half-life, including unknown/future ages', () => {
  assert.equal(scoreFreshness(0),1);
  assert.equal(scoreFreshness(30),0.5);
  assert.equal(scoreFreshness(60),0.25);
  assert.equal(scoreFreshness(-30),1);
  assert.equal(scoreFreshness(deriveAgeDays({})),0);
});

test('quality measures applicable supplied facts, with five-photo saturation', () => {
  assert.equal(scoreQuality(complete),1);
  assert.ok(scoreQuality(complete) > scoreQuality({...complete, description:'', photoCount:0, furnishing:undefined}));
  assert.equal(scoreQuality({...complete, photoCount:50}),1);
  const land = {...complete, type:'Land', beds:undefined, baths:undefined, furnishing:undefined};
  assert.equal(scoreQuality(land),1);
  const room = {...land, type:'room/bedspace', furnishing:'Furnished', bathroomAccess:'Shared', maxOccupants:2};
  assert.equal(scoreQuality(room),1);
  assert.equal(scoreQuality({...complete,beds:null,baths:''}),0.9);
  const sale = {...complete, listingType:'sale', depositInfo:undefined, leaseMonths:undefined, saleTermsComplete:true};
  assert.equal(scoreQuality(sale),1);
});

test('adapter preserves real fields and does not manufacture missing property facts', () => {
  const adapted = toRankingListing(base[0]);
  assert.equal(adapted.ageDays,5);
  assert.equal(adapted.photoCount,3);
  assert.equal(adapted.sizeSqm,42);
  for (const field of ['description','depositInfo','leaseMonths','availabilityStatus','saleTermsComplete']) assert.equal(adapted[field],undefined);
  assert.equal(toRankingListing(base[1]).listingType,'sale');
  assert.equal(toRankingListing({...base[0],images:['one','one','two']}).photoCount,2);
  assert.equal(toRankingListing(base[8]).type,'room/bedspace');
});

test('publication age ignores ordinary edits and falls back to explicit demo ages', () => {
  const now = Date.parse('2026-09-21T00:00:00Z');
  const p = {publishedAt:'2026-08-22T00:00:00Z',createdAt:'2026-01-01',updatedAt:'2026-09-21',age:0};
  assert.equal(deriveAgeDays(p,now),30);
  assert.equal(deriveAgeDays({...p,publishedAt:'invalid',createdAt:'2026-08-22T00:00:00Z'},now),30);
  assert.equal(deriveAgeDays({age:7,updatedAt:'2026-09-21'},now),7);
});

test('canonical filters exclude ineligible City listings before scoring for every sort', () => {
  const accepted = {...base[0],id:'eligible',price:20000,age:15};
  const excluded = [
    {price:20001}, {price:9999}, {mode:'Buy'}, {city:'Danao City'}, {type:'House'},
    {beds:0}, {baths:0}, {size:15}, {tags:[]}, {active:false}, {status:'Unlisted'},
    {status:'Pending approval'}, {status:'Rejected'}, {availabilityStatus:'unavailable'},
    {availabilityStatus:'rented'}, {availabilityStatus:'sold'}, {availability:'Currently occupied'},
    {marketStatus:'sold'}, {reviewStatus:'pending'},
  ].map((patch,i) => {
    const p = {...accepted,...patch,id:`excluded-${i}`,pop:1e9,contacts:1e9};
    Object.defineProperty(p,'description',{get(){throw new Error('Excluded listing reached scorer');}});
    return p;
  });
  const q = query({min:'10000',max:'20000',type:'Condo',beds:'1',baths:'1',size:'30',tags:['furnished']});
  for (const sort of ['Recommended','Newest','Price: low to high','Price: high to low','Size: large to small','Size: small to large']) {
    assert.deepEqual(ids(searchListings({...q,sort},{},null,[accepted,...excluded])),['eligible']);
  }
  assert.deepEqual(searchListings(query({max:'1'})),[]);
  assert.ok(searchListings(query({mode:'Buy'})).every(p => p.mode==='Buy'));
});

test('City Recommended combines exact 70/15/15 and ignores behavioural signals', () => {
  const rows = searchListings(query());
  assert.notDeepEqual(ids(rows),ids(searchListings(query({sort:'Newest'}))));
  assert.deepEqual(rows,searchListings(query(),{Condo:100000,Apartment:100000,Studio:100000}));
  for (const row of rows) {
    const s = row.scores;
    assert.equal(s.totalScore,0.70*s.popularity+0.15*s.freshness+0.15*s.quality);
    assert.equal('personalisation' in s,false);
    assert.ok(s.totalScore>=0 && s.totalScore<=1);
  }
  assert.deepEqual(ids(rows),[4,1,9,3,12]);
  assert.equal(RANKING_CONFIG.diversity.enabled,false);
});

test('all five manual sorts bypass adaptation/scoring and respect numeric order', () => {
  const rows = [
    {...base[0],id:30,price:100,size:30,age:2},
    {...base[0],id:31,price:9,size:100,age:60},
    {...base[0],id:32,price:50,size:9,age:0},
  ];
  for (const p of rows) Object.defineProperty(p,'description',{get(){throw new Error('Manual sort reached scorer');}});
  const orders = {'Newest':[32,30,31],'Price: low to high':[31,32,30],'Price: high to low':[30,32,31],'Size: large to small':[31,30,32],'Size: small to large':[32,30,31]};
  for (const [sort,order] of Object.entries(orders)) {
    const results = searchListings(query({sort}),{},null,rows);
    assert.deepEqual(ids(results),order);
    assert.ok(results.every(p => !p.scores));
  }
  const dated = [{...base[0],id:30,publishedAt:'2025-01-01',age:0},{...base[0],id:31,publishedAt:'2026-01-01',age:60}];
  assert.deepEqual(ids(searchListings(query({sort:'Newest'}),{},null,dated)),[31,30]);
});

test('popularity decays, smooths cold starts and keeps Rent/Sale markets separate', () => {
  assert.deepEqual(decayedPopularityStats({metricBuckets:[{ageDays:14,impressions:100,contacts:10}]}),{effectiveImpressions:50,effectiveEngagement:50});
  assert.equal(scorePopularity({},0).score,0.5);
  assert.equal(scorePopularity({},2).score,0.5);
  const market = [{...complete,impressions:50,contacts:5},{...complete,city:'Danao City',impressions:200,contacts:40},{...complete,listingType:'sale',impressions:100000,contacts:1e9}];
  const stats = computeMarketAverage(market,{listingType:'rent',cities:['Cebu City']});
  assert.equal(stats.source,'broader-market-fallback');
  assert.equal(stats.rate,450/250);
  assert.deepEqual(stats,computeMarketAverage(market.slice(0,2),{listingType:'rent',cities:['Cebu City']}));
});

test('eligible-only market prior, deterministic ordering and source immutability', () => {
  const snapshot = structuredClone(base);
  const q = query({max:'25000'});
  const result = searchListings(q);
  const noisy = base.map(p => p.price>25000 ? {...p,contacts:1e9,impressions:1} : p);
  assert.deepEqual(searchListings(q,{},null,noisy),result);
  assert.deepEqual(base,snapshot);
  const tied = [{...complete,id:'b'},{...complete,id:'a'}];
  const ranked = rankCityListings(tied,{listingType:'rent',cities:['Cebu City']});
  assert.deepEqual(ids(ranked),['a','b']);
  assert.deepEqual(ids(tied),['b','a']);
  assert.ok(ranked.every(p => !p.isExploration && !p.diversityMoved));
});

test('Keyword/School/Map retain their existing demo path and hard filters', () => {
  for (const method of ['Keyword','School','Map']) assert.ok(searchListings(query({method})).every(p => !p.scores));
  assert.deepEqual(ids(searchListings(query({method:'Keyword',keyword:'campus'}))),[4]);
  const bounds = {south:10.32,north:10.33,west:123.90,east:123.91};
  const result = searchListings(query({method:'Map'}),{},bounds);
  assert.ok(result.length>0);
  assert.ok(result.every(p => p.lat>=bounds.south && p.lat<=bounds.north && p.lng>=bounds.west && p.lng<=bounds.east));
});
