const UUID='[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const safe=new RegExp(`^/api/(?:marketplace/(?:public/)?listings/${UUID}|admin/marketplace/listings/${UUID}/submissions/${UUID})/media/${UUID}/(?:gallery|thumb|share)$`,'i');
export const photoUrl=value=>typeof value==='string'&&safe.test(value)?value:null;
export function photoResult(data) {
 if(!data?.ok||typeof data.available!=='boolean'||!/^\d+$/.test(String(data.version))||!Array.isArray(data.media)||data.media.length>20||data.media.some(m=>!photoUrl(m.url)||!photoUrl(m.thumbnail_url)||!photoUrl(m.share_url)))throw new Error('Invalid photo response. Reload the listing.');
 return data;
}
export async function photoRequest(listingId,body,signal) {
 const response=await fetch('/api/marketplace/listings/'+encodeURIComponent(listingId)+'/media',{method:body?'PATCH':'GET',credentials:'same-origin',cache:'no-store',signal,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||'Photos could not be reached. Reload the listing before retrying.');
 return photoResult(data);
}
export function uploadPhoto(listingId,version,file,onProgress,{signal,xhrFactory=()=>new XMLHttpRequest()}={}) {
 return new Promise((resolve,reject)=>{
  const xhr=xhrFactory(),abort=()=>xhr.abort();let settled=false;
  const finish=(error,data)=>{if(settled)return;settled=true;signal?.removeEventListener('abort',abort);if(error)reject(error);else resolve(data);};
  xhr.open('POST','/api/marketplace/listings/'+encodeURIComponent(listingId)+'/media');
  xhr.withCredentials=true;xhr.timeout=60000;
  xhr.setRequestHeader('Content-Type',file.type);xhr.setRequestHeader('X-Listing-Version',String(version));
  xhr.upload.onprogress=event=>{if(event.lengthComputable)onProgress?.(Math.min(100,Math.round(event.loaded/event.total*100)));};
  xhr.onload=()=>{let data;try{data=JSON.parse(xhr.responseText);}catch{return finish(new Error('Upload response was unreadable. Reload the listing to check whether it saved.'));}if(xhr.status!==201)return finish(new Error(data.message||'The photo was not saved. Reload the listing before retrying.'));try{finish(null,photoResult(data));}catch(error){finish(error);}};
  xhr.onerror=()=>finish(new Error('Upload connection lost. Reload the listing to check whether the photo saved.'));
  xhr.ontimeout=()=>finish(new Error('Upload timed out. Reload the listing to check whether the photo saved.'));
  xhr.onabort=()=>finish(new Error('Upload cancelled. Reload the listing to check whether the photo saved.'));
  if(signal?.aborted)return finish(new Error('Upload cancelled.'));
  signal?.addEventListener('abort',abort,{once:true});xhr.send(file);
 });
}
