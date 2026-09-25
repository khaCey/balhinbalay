import {base, schools} from './data.js';
import {rankCityListings} from './ranking/cityRanking.js';
import {deriveAgeDays, isCityListingEligible, toRankingListing} from './ranking/rankingAdapter.js';

export function distance(a, b) {
  const rad = n => n * Math.PI / 180;
  const h = Math.sin(rad(a.lat - b.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(a.lng - b.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function searchListings(q, signals = {}, bounds = null, listings = base) {
  let list = listings.filter(p => p.mode === q.mode);
  if (q.method === 'City') list = list.filter(isCityListingEligible);
  if (q.method !== 'Map' && q.cities.length) list = list.filter(p => q.cities.includes(p.city));
  if (q.method === 'School') list = list.filter(p => distance(p, schools[q.school] || schools[0]) <= q.radius);
  if (q.method === 'Keyword' && q.keyword.trim()) {
    const words = q.keyword.toLowerCase().replace(/,/g, ' ').split(/\s+/).filter(Boolean);
    list = list.filter(p => words.every(w => `${p.title || ''} ${(p.tags || []).join(' ')} ${p.type || ''} ${p.area || ''} ${p.city || ''}`.toLowerCase().includes(w)));
  }
  const suppliedNumber = value => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  list = list.filter(p => (q.type === 'Any' || p.type === q.type) && (!q.min || suppliedNumber(p.price) && Number(p.price) >= +q.min) && (!q.max || suppliedNumber(p.price) && Number(p.price) <= +q.max) && (q.beds === 'Any' || suppliedNumber(p.beds) && Number(p.beds) >= +q.beds) && (q.baths === 'Any' || suppliedNumber(p.baths) && Number(p.baths) >= +q.baths) && (!q.size || suppliedNumber(p.size) && Number(p.size) >= +q.size) && q.tags.every(t => (p.tags || []).includes(t)));
  if (bounds && q.method === 'Map') list = list.filter(p => p.lat >= bounds.south && p.lat <= bounds.north && p.lng >= bounds.west && p.lng <= bounds.east);
  if (q.method === 'City' && q.sort === 'Recommended') {
    const ranked = rankCityListings(list.map(p => toRankingListing(p)), {
      listingType: q.mode === 'Buy' ? 'sale' : 'rent', cities: q.cities,
    });
    const originals = new Map(list.map(p => [p.id, p]));
    return ranked.map(({id, scores}) => ({...originals.get(id), scores}));
  }
  // Preserve the other search modes' existing demo behaviour; they are not rank-v1.
  const score = p => p.pop * .7 + p.quality * .15 + Math.max(0, 10 - p.age) * 1.5 + Math.min(15, (signals[p.type] || 0) * .6);
  const sorts = {'Newest': (a,b) => q.method === 'City' ? deriveAgeDays(a) - deriveAgeDays(b) : a.age-b.age, 'Price: low to high':(a,b)=>a.price-b.price, 'Price: high to low':(a,b)=>b.price-a.price, 'Size: large to small':(a,b)=>b.size-a.size, 'Size: small to large':(a,b)=>a.size-b.size, 'Recommended':(a,b)=>score(b)-score(a)};
  return list.sort(sorts[q.sort] || sorts.Recommended);
}
