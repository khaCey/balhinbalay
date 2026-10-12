import {useEffect,useMemo,useRef,useState} from 'react';
import {NativeSelect} from '@/components/ui/native-select';
import {defaults} from './data';
import {useApp,filterCount,compact} from './model';
import {normaliseQuery} from './browserState';
import {Button,Icon,Segment,TabBar,Empty} from './ui';
import {SearchBox} from './Home';
import {useRealListings,realMapPins} from './realInventory';
import RealListingCard from './RealListingCard';

export function SearchPage(){
 const {state,setQuery,startSearch,chooseMethod}=useApp(),q=state.q;
 return <div className="search-layout"><div className="page-head"><div className="eyebrow">Find your place</div><h1>Start somewhere you love.</h1><p>Search real currently available listings.</p></div>
  <TabBar items={[['City','pin'],['Keyword','spark'],['Map','map']]} value={q.method} onChange={chooseMethod}/>
  {q.method==='City'?<SearchBox/>:q.method==='Map'?<div className="panel"><p className="small muted">Only confirmed public listing locations appear as map pins. Other listings remain in the results list.</p><Button className="full" icon="map" onClick={()=>startSearch()}>Open map</Button></div>:<form className="panel" onSubmit={e=>{e.preventDefault();startSearch();}}><Segment/><label className="field"><span>Keyword</span><input value={q.keyword} onChange={e=>setQuery({keyword:e.target.value})} placeholder="Title, description, city or barangay"/></label><label className="field"><span>City (optional)</span><input value={q.cities[0]||''} onChange={e=>setQuery({cities:e.target.value?[e.target.value]:[]})} placeholder="City of Cebu"/></label><Button type="submit" className="full" icon="search">Find a place</Button></form>}
 </div>;
}

export function ResultsPage(){
 const {state,setQuery,setModal,nav}=useApp(),q=state.q,isMap=state.page==='map';
 const {listings,total,loading,error}=useRealListings(q,{all:true});
 const pins=realMapPins(listings),count=filterCount(q);
 const title=q.method==='Map'?'Explore the map':q.cities[0]||'All cities';
 return <><div className="results-head"><div className="results-location"><h1>{title}</h1><p>{q.mode==='Rent'?'Places to rent':'Places to buy'}</p></div></div>
  <div className="chips results-chips"><button className={'chip '+(count?'active':'')} onClick={()=>setModal({type:'filters'})}><Icon name="filter"/>Filters{count>0&&<span className="count">{count}</span>}</button><button className="chip" onClick={()=>setQuery({mode:q.mode==='Rent'?'Buy':'Rent'})}>{q.mode}<Icon name="down"/></button><button className="chip" onClick={()=>setModal({type:'filters'})}>{q.min||q.max?`${q.min?compact(q.min):'Any'} – ${q.max?compact(q.max):'Any'}`:'Price'}<Icon name="down"/></button><button className="chip" onClick={()=>setModal({type:'filters'})}>{q.beds==='Any'?'Bedrooms':q.beds+'+ beds'}<Icon name="down"/></button></div>
  <div className="results-toolbar"><span className="small muted" id="result-count">{loading?'Loading…':error?'Unavailable':`${total} ${total===1?'place':'places'}`}</span><div className="row"><NativeSelect className="sort" value={q.sort} onChange={e=>setQuery({sort:e.target.value})} aria-label="Sort properties">{['Newest','Price: low to high','Price: high to low','Size: large to small','Size: small to large'].map(s=><option key={s}>{s}</option>)}</NativeSelect><Button className="secondary" icon={isMap?'list':'map'} onClick={()=>nav(isMap?'results':'map')}>{isMap?'List':'Map'}</Button></div></div>
  {error?<p role="alert">{error}</p>:loading?<p role="status">Loading real listings…</p>:isMap?<><MapView listings={listings}/><p className="micro muted">Only confirmed public locations have pins. {listings.length-pins.length} matching {listings.length-pins.length===1?'listing has':'listings have'} no public map point. Map data © OpenStreetMap contributors.</p></>:listings.length?<div className="grid">{listings.map(listing=><RealListingCard key={listing.id} listing={listing}/>)}</div>:<Empty title="No real listings match just yet." copy="Try a wider budget, fewer filters or another city." label="Reset filters" onClick={()=>setQuery(normaliseQuery({...defaults(),mode:q.mode,method:'City'}))}/>}
 </>;
}

let leafletPromise;
function loadLeaflet(){if(window.L)return Promise.resolve(window.L);if(!leafletPromise)leafletPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='/assets/leaflet.js';script.onload=()=>resolve(window.L);script.onerror=()=>{leafletPromise=null;reject(new Error('Map unavailable'));};document.head.appendChild(script);});return leafletPromise;}
export function MapView({listings}){
 const {state,patch,nav}=useApp(),el=useRef(null),mapRef=useRef(null);
 const pins=useMemo(()=>realMapPins(listings),[listings]),patchRef=useRef(patch);
 const [failed,setFailed]=useState(false),[offline,setOffline]=useState(false);
 useEffect(()=>{patchRef.current=patch;},[patch]);
 useEffect(()=>{let disposed=false;loadLeaflet().then(L=>{if(disposed||!el.current)return;const map=L.map(el.current,{zoomControl:false}).setView([10.337,123.918],13);mapRef.current=map;L.control.zoom({position:'topright'}).addTo(map);let failures=0;L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap',crossOrigin:true}).on('tileload',()=>{failures=0;setOffline(false);}).on('tileerror',()=>{if(++failures>=3)setOffline(true);}).addTo(map);if(pins.length)map.fitBounds(L.latLngBounds(pins.map(p=>[p.location.map_point.lat,p.location.map_point.lng])),{padding:[50,70],maxZoom:14});for(const p of pins)L.marker([p.location.map_point.lat,p.location.map_point.lng],{icon:L.divIcon({className:'',html:`<div class="price-pin">${compact(Number(p.price_amount))}</div>`,iconSize:[72,32],iconAnchor:[36,16]}),title:p.title,keyboard:true}).addTo(map).on('click',()=>patchRef.current({mapSelected:p.id}));map.invalidateSize();}).catch(()=>{if(!disposed)setFailed(true);});return()=>{disposed=true;mapRef.current?.remove();mapRef.current=null;};},[pins]);
 const selected=pins.find(p=>p.id===state.mapSelected);
 return <div className="map-wrap"><div className="map-canvas" ref={el} aria-label="Map of confirmed public listing locations"/>{failed?<div className="map-fallback"><Empty title="Map is unavailable" copy="Your search is ready in list view." label="View list" onClick={()=>nav('results')}/></div>:<><div className="map-counter">{offline?'Map tiles offline · Confirmed pins still available':`${pins.length} ${pins.length===1?'public pin':'public pins'}`}</div>{selected&&<div className="map-preview"><button className="map-preview-close" aria-label="Close listing preview" onClick={()=>patch({mapSelected:null})}><Icon name="close"/></button><RealListingCard listing={selected} compact/></div>}</>}</div>;
}
