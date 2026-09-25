import test from 'node:test';
import assert from 'node:assert/strict';
import {base, defaults, initial} from '../components/balhinbalay/data.js';
import {normaliseQuery, navigationSnapshot, restoreDemo, restoreRoute, suppliedCosts} from '../components/balhinbalay/browserState.js';
import {searchListings} from '../components/balhinbalay/searchListings.js';
import {reportMailto} from '../components/balhinbalay/reportMailto.js';
import {handleListingImageError,missingPhoto} from '../components/balhinbalay/imageFallback.js';

test('rental costs do not invent missing fees and preserve a supplied zero', () => {
  assert.deepEqual(suppliedCosts({price:20000,broker:0}), {deposit:null,advance:null,broker:0,association:null,keyMoney:null,reservation:null,other:null,utilities:null});
});

test('navigation snapshots preserve search state without account data', () => {
  const snapshot = navigationSnapshot({page:'results',q:{...defaults(),cities:['Cebu City']},savedTab:'Properties',compare:[1,2],property:1,chat:1,mapSelected:null,mapCenter:null,mapZoom:null,mapBounds:null,returnPage:'results',draft:{email:'private@example.com'}});
  assert.equal(snapshot.bbRoute,true);
  assert.deepEqual(snapshot.q.cities,['Cebu City']);
  assert.equal('draft' in snapshot,false);
});

test('invalid direct property IDs remain invalid instead of opening listing one', () => {
  const restored = restoreRoute('#property/not-a-number',{}, {page:'home',q:defaults(),compare:[]});
  assert.equal(restored.page,'property');
  assert.equal(restored.property,null);
});

test('public information routes restore directly without changing search state', () => {
  for (const page of ['about','contact','privacy','terms']) {
    const restored = restoreRoute(`#${page}`, {}, {page:'home',q:{...defaults(),cities:['Cebu City']},compare:[]});
    assert.equal(restored.page,page);
    assert.deepEqual(restored.q.cities,['Cebu City']);
  }
});

test('sample listing report prepares an email without losing punctuation or implying delivery', () => {
  const url = reportMailto({id:12,title:'A place, near IT Park'},'Problem with the site','Image won’t open & price?');
  assert.equal(url.startsWith('mailto:support@balhinbalay.com?'),true);
  const params = new URLSearchParams(url.split('?')[1]);
  assert.match(params.get('subject'),/sample listing 12/);
  assert.match(params.get('body'),/A place, near IT Park \(ID 12\)/);
  assert.match(params.get('body'),/Image won’t open & price\?/);
  assert.match(params.get('body'),/does not create a moderation ticket/);
});

test('malformed stored demo data is bounded and restored safely', () => {
  const restored = restoreDemo({saved:[1,'bad',-2],recent:['3'],profile:{name:4,email:'safe@example.com'},settings:{messages:'yes'},owner:[{id:200,title:3,tags:null}],convos:[null,{id:9,property:1,messages:[null,{text:'Hi'}]}]}, initial);
  assert.deepEqual(restored.saved,[1]);
  assert.deepEqual(restored.recent,[3]);
  assert.equal(restored.profile.name,initial.profile.name);
  assert.equal(restored.settings.messages,initial.settings.messages);
  assert.equal(restored.owner[0].status,'Unlisted');
  assert.equal(restored.owner[0].images,undefined);
  assert.equal(restored.convos[0].messages[0].text,'Hi');
});

test('query normalisation preserves meaningful zero values', () => {
  const q = normaliseQuery({...defaults(),school:0,radius:0,min:0,beds:0,baths:0,size:0});
  assert.equal(q.school,0);
  assert.equal(q.radius,0);
  assert.equal(q.min,0);
  assert.equal(q.beds,0);
});

test('keyword and numeric filters tolerate listings with missing data', () => {
  const missing = {...base[0],id:999,tags:undefined,size:null};
  assert.doesNotThrow(()=>searchListings({...defaults(),method:'Keyword',keyword:'bright',cities:[]},{},null,[missing]));
  assert.deepEqual(searchListings({...defaults(),method:'Keyword',keyword:'bright',size:10,cities:[]},{},null,[missing]),[]);
});

test('all four guest search methods produce eligible sample results', () => {
  const cases = [
    [{method:'City',cities:['Cebu City']},[4,1,9,3,12]],
    [{method:'Keyword',keyword:'furnished',cities:[]},[1,3,10,7,4,12,9,5]],
    [{method:'School',school:0,radius:2,cities:[]},[3,12,9]],
    [{method:'Map',cities:[]},[1,3,10,7,4,6,12,9,5]],
  ];
  for (const [query,expected] of cases) {
    assert.deepEqual(searchListings({...defaults(),...query}).map(p=>p.id),expected,query.method);
  }
});

test('filters and empty state remain consistent across rent, buy and a cleared keyword', () => {
  const city={...defaults(),cities:['Cebu City']};
  assert.deepEqual(searchListings({...city,mode:'Buy'}).map(p=>p.id),[8]);
  assert.deepEqual(searchListings({...city,type:'Land'}),[]);
  assert.deepEqual(searchListings({...city,min:20000,max:30000,tags:['with parking']}).map(p=>p.id),[1]);
  assert.deepEqual(searchListings({...defaults(),method:'Keyword',keyword:'no-such-sample-home'}),[]);
  assert.equal(searchListings({...defaults(),method:'Keyword',keyword:''}).length,9);
});

test('every visible manual sort obeys its selected criterion', () => {
  const q={...defaults(),cities:['Cebu City']};
  const keys={
    'Price: low to high':p=>p.price,
    'Price: high to low':p=>-p.price,
    'Size: large to small':p=>-p.size,
    'Size: small to large':p=>p.size,
  };
  for (const [sort,key] of Object.entries(keys)) {
    const values=searchListings({...q,sort}).map(key);
    assert.deepEqual(values,[...values].sort((a,b)=>a-b),sort);
  }
  assert.equal(searchListings({...q,sort:'Newest'})[0].id,9);
});

test('unknown hash route and invalid positive property ID do not become valid listings', () => {
  assert.equal(restoreRoute('#unknown-route',{}, {page:'results',q:defaults()}).page,'home');
  const restored=restoreRoute('#property/999999',{}, {page:'home',q:defaults()});
  assert.equal(restored.page,'property');
  assert.equal(base.some(p=>p.id===restored.property),false);
});

test('missing listing photo falls back once to a truthful local placeholder', () => {
  const image={src:'/assets/deliberately-unavailable-fixture.jpg',alt:'Illustrative interior',getAttribute(name){return name==='src'?this.src:null;}};
  handleListingImageError({currentTarget:image});
  assert.equal(image.src,missingPhoto);
  assert.equal(image.alt,'Photo unavailable');
  handleListingImageError({currentTarget:image});
  assert.equal(image.src,missingPhoto);
});
