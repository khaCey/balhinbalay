import {createContext, startTransition, useContext, useEffect, useRef, useState} from 'react';
import {base, defaults, initial, photos, schools} from './data';
import {navigationSnapshot, normaliseQuery, restoreDemo, restoreRoute, routeHash, suppliedCosts} from './browserState.js';
import {registrationClient} from './registrationClient.js';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export const money = v => '₱' + Number(v || 0).toLocaleString('en-PH');
export const compact = v => v >= 1e6 ? '₱' + (v / 1e6).toFixed(1) + 'm' : '₱' + Math.round(v / 1000) + 'k';
export const img = p => p.images?.[0] || photos[p.photo || 0];
export const propertyImages = p => p.images?.length ? p.images : [photos[p.photo || 0], photos[((p.photo || 0) + 2) % 3], photos[((p.photo || 0) + 1) % 3]];
export const initials = name => String(name || '').split(' ').map(x => x[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'BB';
export {distance, searchListings} from './searchListings.js';
export const filterCount = q => ['type','min','max','beds','baths','size'].reduce((n,k) => n + (q[k] && q[k] !== 'Any' ? 1 : 0), 0) + q.tags.length;
export const summary = q => [q.type !== 'Any' ? q.type : 'All property types', q.min || q.max ? `${q.min ? compact(q.min) : 'Any price'} – ${q.max ? compact(q.max) : 'No limit'}` : 'Any budget', q.beds !== 'Any' ? q.beds + '+ bedrooms' : '', q.method === 'Keyword' ? q.keyword : '', ...q.tags, q.method === 'School' ? schools[q.school].name + ' · ' + q.radius + ' km' : ''].filter(Boolean).join(' · ');
export const costs = suppliedCosts;
export function useAppModel() {
  // Match the server's first render; restore browser-only state after hydration.
  const [db, setDb] = useState(() => structuredClone(initial));
  const [ready, setReady] = useState(false);
  const [state, setState] = useState({page:'home',q:defaults(),savedTab:'Properties',compare:[],property:1,photo:0,chat:1,mapSelected:null,mapCenter:null,mapZoom:null,mapBounds:null,returnPage:'results',draft:null});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const [account,writeAccount]=useState(null);
  const accountRevision=useRef(0);
  const setAccount=user=>{accountRevision.current++;writeAccount(user);};
  const timer = useRef(null);
  const patch = change => setState(s => ({...s, ...(typeof change === 'function' ? change(s) : change)}));
  const update = fn => setDb(d => {const next = structuredClone(d); fn(next); return next;});
  const notify = text => {setToast(text); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 3200);};
  useEffect(() => {
    let stored;
    try {
      stored = JSON.parse(localStorage.getItem('balhinbalay-react-demo-v1') || 'null');
    } catch { /* A fresh demo is usable when storage is unavailable. */ }
    startTransition(() => {
      if (stored) setDb(restoreDemo(stored, initial));
      setReady(true);
    });
    const fromHash = () => setState(current => ({...current,...restoreRoute(location.hash,history.state,current)}));
    fromHash(); window.addEventListener('popstate', fromHash); window.addEventListener('hashchange', fromHash);
    return () => {window.removeEventListener('popstate', fromHash); window.removeEventListener('hashchange', fromHash); clearTimeout(timer.current);};
  }, []);
  useEffect(() => {if (ready) {try {localStorage.setItem('balhinbalay-react-demo-v1',JSON.stringify(db));} catch {console.warn('BalhinBalay demo state could not be saved in this browser.');}}}, [db,ready]);
  useEffect(()=>{
    let active=true;const revision=accountRevision.current;
    registrationClient.session().then(result=>{if(active&&revision===accountRevision.current)writeAccount(result.user||null);})
      .catch(()=>{if(active&&revision===accountRevision.current)writeAccount(null);});
    return ()=>{active=false;};
  },[]);
  useEffect(() => {if (ready) history.replaceState(navigationSnapshot(state),'',routeHash(state.page,state));}, [ready,state]);
  const prop = id => [...base,...db.owner].find(p => p.id === Number(id)) || base[0];
  const nav = (page,extra={}) => {setModal(null); const next={...state,page,...extra}; history.replaceState(navigationSnapshot(state),'',routeHash(state.page,state)); history.pushState(navigationSnapshot(next),'',routeHash(page,next)); patch({page,...extra}); window.scrollTo(0,0);};
  const setQuery = change => patch(s=>({q:normaliseQuery({...s.q,...change})}));
  const signal = (d,p,n) => {d.signals[p.type]=(d.signals[p.type]||0)+n;};
  const openProperty = id => {const p=prop(id); update(d=>{if(d.recent.includes(p.id))signal(d,p,1);d.recent=[p.id,...d.recent.filter(x=>x!==p.id)].slice(0,12);}); nav('property',{property:p.id,photo:0,returnPage:['map','saved','results','owner','compare','chat'].includes(state.page)?state.page:'home'});};
  const toggleSave = id => {const p=prop(id),was=db.saved.includes(id);update(d=>{d.saved=was?d.saved.filter(x=>x!==id):[id,...d.saved];if(!was)signal(d,p,3);});notify(was?'Removed from saved places':'A possibility worth keeping. Saved!');};
  const compare = id => {if (!state.compare.includes(id) && state.compare.length >= 3) return notify('Compare up to three places. Remove one to add another.');patch({compare:state.compare.includes(id)?state.compare.filter(x=>x!==id):[...state.compare,id]});};
  const startSearch = (query=state.q) => {if(query.method==='City'&&!query.cities.length){setModal({type:'cities'});return;} if(query.method==='School')query={...query,cities:[schools[query.school].city]}; update(d=>{d.lastSearch=structuredClone(query);d.recentCities=[...new Set([...query.cities,...d.recentCities])].slice(0,6);});nav(query.method==='Map'?'map':'results',{q:query,mapSelected:null,mapCenter:null,mapZoom:null,mapBounds:null});};
  const chooseMethod = method => {const q={...state.q,method};if(method==='Map')startSearch(q);else nav('search',{q});};
  const openChat = id => {update(d=>{const c=d.convos.find(c=>c.id===id);if(c)c.unread=false;});nav('chat',{chat:id});};
  const message = (property,text='') => {const existing=db.convos.find(c=>c.property===property); const id=existing?.id||Date.now(); update(d=>{let c=d.convos.find(c=>c.id===id);if(!c){c={id,property,unread:false,messages:[]};d.convos.unshift(c);}c.unread=false;if(text.trim())c.messages.push({text:text.trim(),mine:true,time:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})});signal(d,prop(property),5);});nav('chat',{chat:id});};
  const newListing = p => nav('editor',{draft:p?{...structuredClone(p),images:propertyImages(p)}:{mode:'Rent',type:'Condo',city:'Cebu City',region:'Central Visayas',province:'Cebu',lat:10.332,lng:123.906,beds:1,baths:1,size:30,tags:[],images:[],owner:'Sample owner'}});
  return {db,update,state,patch,nav,setQuery,prop,modal,setModal,toast,notify,openProperty,toggleSave,compare,startSearch,chooseMethod,openChat,message,newListing,account,setAccount};
}
export async function readImage(file) {
  if (!file.type.startsWith('image/') || file.size > 3e6) throw new Error('Choose an image smaller than 3 MB.');
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read this image.'));reader.onload=()=>{const im=new Image();im.onerror=()=>reject(new Error('Could not read this image.'));im.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,1000/im.width);canvas.width=Math.round(im.width*scale);canvas.height=Math.round(im.height*scale);canvas.getContext('2d').drawImage(im,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.8));};im.src=reader.result;};reader.readAsDataURL(file);});
}
