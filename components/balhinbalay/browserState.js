import {base,defaults} from './data.js';

const MODES = new Set(['Rent','Buy']);
const METHODS = new Set(['City','Keyword','School','Map']);
const SORTS = new Set(['Recommended','Newest','Price: low to high','Price: high to low','Size: large to small','Size: small to large']);
const PAGES = new Set(['home','search','results','map','property','saved','recent','compare','messages','chat','profile','settings','editProfile','owner','editor','admin','about','contact','privacy','terms','register','login','verify-email','forgot-password','reset-password']);
const text = (value, fallback = '') => typeof value === 'string' ? value : fallback;
const finite = value => Number.isFinite(Number(value)) ? Number(value) : null;
const uniqueStrings = value => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string'))] : [];
const validId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

export function normaliseQuery(value) {
  const fallback = defaults();
  const source = value && typeof value === 'object' ? value : {};
  const numberOrBlank = key => source[key] === '' || source[key] === undefined || source[key] === null ? fallback[key] : (finite(source[key]) ?? fallback[key]);
  return {
    mode: MODES.has(source.mode) ? source.mode : fallback.mode,
    method: METHODS.has(source.method) ? source.method : fallback.method,
    cities: uniqueStrings(source.cities),
    keyword: text(source.keyword),
    school: Math.max(0, Math.trunc(numberOrBlank('school'))),
    radius: Math.max(0, numberOrBlank('radius')),
    type: text(source.type, fallback.type),
    min: numberOrBlank('min'), max: numberOrBlank('max'),
    beds: source.beds === 'Any' ? 'Any' : numberOrBlank('beds'),
    baths: source.baths === 'Any' ? 'Any' : numberOrBlank('baths'),
    size: numberOrBlank('size'),
    tags: uniqueStrings(source.tags),
    sort: SORTS.has(source.sort) ? source.sort : fallback.sort,
  };
}

export function restoreDemo(value, initial) {
  if (!value || typeof value !== 'object') return structuredClone(initial);
  const result = structuredClone(initial);
  // Historical browser-only saves, messages and listings are not real account data.
  result.recent = (Array.isArray(value.recent) ? value.recent : []).map(validId).filter(id=>base.some(p=>p.id===id)).slice(0,12);
  result.recentCities = uniqueStrings(value.recentCities).slice(0,6);
  result.signals = value.signals && typeof value.signals === 'object' && !Array.isArray(value.signals) ? Object.fromEntries(Object.entries(value.signals).filter(([,v])=>Number.isFinite(Number(v))).map(([k,v])=>[k,Number(v)])) : result.signals;
  // Authentication identity is authoritative server state. Never restore the old
  // browser-only profile or demo signed-in flag from localStorage.
  if (value.lastSearch && typeof value.lastSearch === 'object') result.lastSearch = normaliseQuery(value.lastSearch);
  return result;
}

export function routeHash(page, state = {}) {
  if (page === 'property') return state.property ? `#property/${state.property}` : '#property';
  if (page === 'chat') return state.chat ? `#chat/${state.chat}` : '#chat';
  if (['verify-email','reset-password'].includes(page))return state.actionToken?`#${page}/${encodeURIComponent(state.actionToken)}`:`#${page}`;
  return page === 'home' ? '#home' : `#${page}`;
}

export function navigationSnapshot(state) {
  return {bbRoute:true,page:state.page,q:normaliseQuery(state.q),savedTab:text(state.savedTab,'Properties'),compare:(Array.isArray(state.compare)?state.compare:[]).map(validId).filter(Boolean).slice(0,3),property:validId(state.property),chat:validId(state.chat),mapSelected:validId(state.mapSelected),mapCenter:state.mapCenter&&finite(state.mapCenter.lat)!==null&&finite(state.mapCenter.lng)!==null?{lat:finite(state.mapCenter.lat),lng:finite(state.mapCenter.lng)}:null,mapZoom:finite(state.mapZoom),mapBounds:state.mapBounds&&typeof state.mapBounds==='object'?state.mapBounds:null,returnPage:PAGES.has(state.returnPage)?state.returnPage:'results'};
}

export function restoreRoute(hash, historyState, current) {
  const [rawPage, rawId] = String(hash || '').replace(/^#/,'').split('/');
  const page = PAGES.has(rawPage) ? rawPage : 'home';
  const same = historyState?.bbRoute && historyState.page === page;
  const saved = same ? navigationSnapshot({...current,...historyState,page}) : {...current,page};
  if (page === 'property') return {...saved,property:validId(rawId),photo:0};
  if (page === 'chat') return {...saved,chat:validId(rawId)};
  if (['verify-email','reset-password'].includes(page)){
    let actionToken='';
    try{actionToken=rawId?decodeURIComponent(rawId):'';}catch{ /* Invalid URL encoding cannot become a token. */ }
    return {...saved,actionToken};
  }
  if (saved.actionToken) return {...saved,actionToken:''};
  return saved;
}

export function suppliedCosts(property = {}) {
  const supplied = key => property[key] === '' || property[key] === null || property[key] === undefined || !Number.isFinite(Number(property[key])) ? null : Number(property[key]);
  return {deposit:supplied('deposit'),advance:supplied('advance'),broker:supplied('broker'),association:supplied('association'),keyMoney:supplied('keyMoney'),reservation:supplied('reservation'),other:supplied('other'),utilities:typeof property.utilities==='string'&&property.utilities.trim()?property.utilities.trim():null};
}
