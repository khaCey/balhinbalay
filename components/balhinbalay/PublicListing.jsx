'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import ListingContact from './ListingContact';

export default function PublicListing({listingId}) {
 const [listing,setListing]=useState(null),[error,setError]=useState(null),[attempt,setAttempt]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  fetch('/api/marketplace/public/listings/'+encodeURIComponent(listingId),{credentials:'omit',cache:'no-store',signal:controller.signal})
   .then(async response=>{const result=await response.json();if(!response.ok)throw new Error(response.status===404?'Listing not found.':'This listing could not be reached. Try again.');if(!result.listing)throw new Error('This listing could not be reached. Try again.');return result.listing;})
   .then(value=>{if(!controller.signal.aborted)setListing(value);}).catch(cause=>{if(!controller.signal.aborted)setError(cause.message);});
  return()=>controller.abort();
 },[listingId,attempt]);
 if(!listing)return <div className="narrow"><h1>Listing</h1>{error?<><p role="alert">{error}</p><button onClick={()=>{setError(null);setAttempt(n=>n+1);}}>Try again</button></>:<p role="status">Loading listing…</p>}<p><Link href="/search">Explore sample listings</Link></p></div>;
 const point=listing.location.map_point;
 return <article className="narrow"><div className="page-head"><h1>{listing.title}</h1><p>For {listing.transaction_type==='RENT'?'rent':'sale'} · {listing.property.property_type.toLowerCase()}</p></div><div className="panel"><h2>{listing.currency_code} {listing.price_amount}{listing.rental_terms&&' / '+listing.rental_terms.pricing_period.toLowerCase()}</h2><p>{listing.location.barangay}, {listing.location.city}</p>{listing.development&&<p>{listing.development.name}</p>}<p style={{whiteSpace:'pre-wrap'}}>{listing.description}</p>{listing.availability_status&&<p>{listing.availability_status==='AVAILABLE'?'Available':'Occupied'}{listing.available_from&&' · From '+listing.available_from}</p>}<dl>{Object.entries({...listing.property,...listing.details}).filter(([key,value])=>key!=='property_type'&&value!==null).map(([key,value])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{String(value)}</dd></div>)}</dl>{listing.rental_terms&&<dl>{Object.entries(listing.rental_terms).filter(([key,value])=>key!=='pricing_period'&&value!==null).map(([key,value])=><div key={key}><dt>{key.replaceAll('_',' ')}</dt><dd>{String(value)}</dd></div>)}</dl>}{listing.sale_terms?.payment_notes&&<p>{listing.sale_terms.payment_notes}</p>}<h2>Public location</h2>{point?<a href={'https://www.openstreetmap.org/?mlat='+encodeURIComponent(point.lat)+'&mlon='+encodeURIComponent(point.lng)+'#map=17/'+encodeURIComponent(point.lat)+'/'+encodeURIComponent(point.lng)} target="_blank" rel="noopener noreferrer">View confirmed public map location</a>:<p>No confirmed public map location is provided.</p>}</div><ListingContact key={listing.id} listingId={listing.id}/><p><Link href="/search">Explore sample listings</Link></p></article>;
}
