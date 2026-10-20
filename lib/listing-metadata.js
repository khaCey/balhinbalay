import {marketplaceForward} from './marketplace-proxy.js';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE='https://balhinbalay.com';
const fallback=BASE+'/sharing-default.jpg';
const clean=(value,max)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
export async function fetchListingForRender(id) {
 if(!UUID.test(String(id)))return {status:'not-found'};
 try {
  const response=await marketplaceForward(new Request(BASE+'/listing/'+id),{params:Promise.resolve({path:['public','listings',id]})},'GET');
  if(response.status===404)return {status:'not-found'};
  if(!response.ok)return {status:'unavailable'};
  const data=await response.json();
  if(!data.ok||data.listing?.id!==id||typeof data.listing.title!=='string')return {status:'unavailable'};
  return {status:'found',listing:data.listing};
 }catch{return {status:'unavailable'};}
}
export function listingMetadata(id,result) {
 const canonical=BASE+'/listing/'+id;
 if(result.status!=='found')return {title:'Listing unavailable | BalhinBalay',description:'This listing is not currently available.',robots:{index:false,follow:false},alternates:{canonical},openGraph:{type:'website',title:'Listing unavailable | BalhinBalay',description:'This listing is not currently available.',url:canonical,siteName:'BalhinBalay',images:[{url:fallback,width:1200,height:630,alt:'BalhinBalay — Find your place'}]},twitter:{card:'summary_large_image',title:'Listing unavailable | BalhinBalay',description:'This listing is not currently available.',images:[fallback]}};
 const l=result.listing,title=clean(l.title,180)+' | BalhinBalay';
 // Do not copy the free-text description, exact address, contact or private
 // payload. Only explicitly public price and city/barangay enter the summary.
 const amount=/^\d+(?:\.\d{1,4})?$/.test(String(l.price_amount))?String(l.price_amount):'';
 const currency=/^[A-Z]{3}$/.test(String(l.currency_code))?l.currency_code:'';
 const description=clean([l.transaction_type==='RENT'?'For rent':'For sale',[currency,amount].filter(Boolean).join(' '),[clean(l.location?.barangay,100),clean(l.location?.city,100)].filter(Boolean).join(', ')].filter(Boolean).join(' · '),300);
 const cover=l.media?.[0];
 const image=cover&&UUID.test(String(cover.id))?`${BASE}/api/marketplace/public/listings/${id}/media/${cover.id}/share`:fallback;
 return {title,description,alternates:{canonical},openGraph:{type:'website',siteName:'BalhinBalay',url:canonical,title,description,images:[{url:image,width:1200,height:630,alt:clean(l.title,180)}]},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
