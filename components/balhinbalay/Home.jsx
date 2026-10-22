import {useApp} from './model';
import {Button,Icon,Segment} from './ui';
import {useRealListings} from './realInventory';
import RealListingCard from './RealListingCard';

export function SearchBox(){
 const {state,setQuery,startSearch,chooseMethod}=useApp();
 return <div className="search-card"><div className="row between"><Segment/><span className="search-caption">Your next chapter</span></div>
  <label className="field"><span>City (optional)</span><input value={state.q.cities[0]||''} onChange={e=>setQuery({cities:e.target.value?[e.target.value]:[]})} placeholder="City of Cebu"/></label>
  <Button className="full search-submit" icon="search" onClick={()=>startSearch()}>Find a place</Button>
  <div className="alternatives">{[['Map','map','Map'],['Keyword','spark','Keyword']].map(([m,i,t])=><button key={m} onClick={()=>chooseMethod(m)}><Icon name={i}/>{t}</button>)}</div>
 </div>;
}

export default function Home(){
 const {state,startSearch}=useApp();
 const {listings,loading,error,retry}=useRealListings({mode:state.q.mode,sort:'Newest'},{limit:3});
 return <><div className="home-hero"><div><div className="eyebrow"><Icon name="pin"/>A place to call yours</div><h1>Where do you<br/>want to <span>live?</span></h1><p className="hero-copy">Find your city. Explore real places.<br/>Feel a little closer to home.</p></div><SearchBox/></div>
  <section className="section"><div className="section-head"><div><h2>Recently published homes</h2><p>Real places ready to explore.</p></div><button className="text-btn" onClick={()=>startSearch({...state.q,method:'City',cities:[]})}>See all →</button></div>
   {loading?<p role="status">Loading real listings…</p>:error?<div><p role="alert">{error}</p><Button className="secondary" onClick={retry}>Try again</Button></div>:listings.length?<div className="rail">{listings.map(listing=><RealListingCard key={listing.id} listing={listing}/>)}</div>:<p className="muted">No real {state.q.mode==='Buy'?'sale':'rental'} listings are active right now. Check back soon.</p>}
  </section>
 </>;
}
