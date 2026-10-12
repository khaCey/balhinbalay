import {useEffect,useState} from 'react';

const TYPES={Condo:'CONDO',Apartment:'APARTMENT',House:'HOUSE',Townhouse:'TOWNHOUSE',Room:'ROOM',Land:'LAND'};
const SORTS={'Newest':'newest','Price: low to high':'price_asc','Price: high to low':'price_desc','Size: large to small':'area_desc','Size: small to large':'area_asc'};

export function realSearchParams(q={},page=1,limit=50) {
 const params=new URLSearchParams({page:String(page),limit:String(limit),sort:SORTS[q.sort]||'newest'});
 if(q.mode)params.set('transaction_type',q.mode==='Buy'?'SALE':'RENT');
 if(q.cities?.[0])params.set('city',q.cities[0]);
 if(q.type&&q.type!=='Any'&&TYPES[q.type])params.set('property_type',TYPES[q.type]);
 for(const [field,value] of [['min_price',q.min],['max_price',q.max],['min_bedrooms',q.beds],['min_bathrooms',q.baths],['min_floor_area',q.size]])
  if(value!==undefined&&value!==null&&value!==''&&value!=='Any')params.set(field,String(value));
 if(q.keyword?.trim())params.set('keyword',q.keyword.trim());
 return params;
}

export async function fetchRealListings(q,{signal,limit=50,all=false}={}) {
 let page=1,items=[],total=0,more;
 do {
  const response=await fetch('/api/marketplace/public/listings?'+realSearchParams(q,page,limit),{credentials:'omit',cache:'no-store',signal});
  if(!response.ok)throw new Error('Real listings could not be reached. Try again.');
  const data=await response.json();
  if(!data.ok||!Array.isArray(data.listings))throw new Error('Real listings could not be reached. Try again.');
  items=items.concat(data.listings);total=data.total;more=data.has_more;page++;
 }while(all&&more);
 return {listings:items,total};
}

export function useRealListings(q,{limit=50,all=false}={}) {
 const [value,setValue]=useState({key:null,listings:[],total:0,loading:true,error:null});
 const key=JSON.stringify([q?.mode,q?.cities?.[0],q?.type,q?.min,q?.max,q?.beds,q?.baths,q?.size,q?.keyword,q?.sort,limit,all]);
 useEffect(()=>{
  const controller=new AbortController();
  fetchRealListings(q,{signal:controller.signal,limit,all}).then(data=>{
   if(!controller.signal.aborted)setValue({key,...data,loading:false,error:null});
  }).catch(error=>{if(!controller.signal.aborted)setValue({key,listings:[],total:0,loading:false,error:error.message});});
  return()=>controller.abort();
 // The serialized query is the complete public request contract.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 return value.key===key?value:{listings:[],total:0,loading:true,error:null};
}

export function realMapPins(listings) {
 return listings.filter(listing=>Number.isFinite(listing.location?.map_point?.lat)&&Number.isFinite(listing.location?.map_point?.lng));
}
