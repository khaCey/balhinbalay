'use client';
/* eslint-disable @next/next/no-img-element -- Direct same-origin images retain session checks and no-store; optimisation would cache protected bytes. */
import {useEffect,useRef,useState} from 'react';
import {photoRequest,photoUrl,uploadPhoto} from './photoClient';
import {Button} from './ui';

const css=`.bb-photo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:12px;margin:16px 0}.bb-photo-grid figure{margin:0;min-width:0}.bb-photo-grid img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:8px}.bb-photo-controls{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.bb-photo-controls button{min-width:44px;min-height:44px;padding:7px;font:inherit;font-size:13px}.bb-photo-upload{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}.bb-photo-upload label{display:grid;min-width:0;gap:8px}.bb-photo-upload input{width:100%;min-width:0;max-width:100%;min-height:44px}.bb-photo-error{color:#a12520}.bb-gallery{margin:20px 0}.bb-gallery-main{width:100%;height:auto;aspect-ratio:16/10;max-height:580px;object-fit:contain;background:#eef3f6;border-radius:12px}.bb-gallery-thumbs{display:flex;gap:8px;overflow-x:auto;padding:10px 2px}.bb-gallery-thumbs button{flex:0 0 80px;padding:3px;background:white;border:2px solid transparent;border-radius:7px}.bb-gallery-thumbs button[aria-pressed=true]{border-color:#1476a5}.bb-gallery-thumbs img{width:100%;height:55px;object-fit:cover}.bb-gallery-empty{padding:30px;background:#eef3f6;border-radius:12px;text-align:center}`;

export function PhotoGallery({media=[],title='Listing',empty=true}) {
 const [selected,setSelected]=useState(null),[failed,setFailed]=useState([]);
 const photos=media.filter(p=>photoUrl(p.url)&&photoUrl(p.thumbnail_url)&&!failed.includes(p.id));
 const active=photos.find(p=>p.id===selected)||photos[0];
 if(!active)return empty?<div className="bb-gallery-empty"><style>{css}</style>Photo not available</div>:null;
 return <section className="bb-gallery" aria-label="Listing photos"><style>{css}</style><img className="bb-gallery-main" ref={node=>{if(node?.complete&&node.naturalWidth===0)setFailed(old=>old.includes(active.id)?old:[...old,active.id]);}} src={active.url} width={active.width} height={active.height} alt={`${title} — photo ${photos.indexOf(active)+1}`} onError={()=>setFailed(old=>[...old,active.id])}/>{photos.length>1&&<div className="bb-gallery-thumbs" aria-label="Choose a photo">{photos.map((photo,index)=><button key={photo.id} type="button" aria-label={`View photo ${index+1}`} aria-pressed={photo.id===active.id} onClick={()=>setSelected(photo.id)}><img src={photo.thumbnail_url} alt="" loading="lazy"/></button>)}</div>}</section>;
}

export default function ListingPhotos({listingId,version,editable,disabled,onChange,onBusy}) {
 const [data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[progress,setProgress]=useState(null),[retry,setRetry]=useState(0);
 const working=useRef(false),controller=useRef(null);
 useEffect(()=>{
  const cancel=new AbortController();
  photoRequest(listingId,null,cancel.signal).then(result=>{if(!cancel.signal.aborted){setData(result);setError(String(result.version)!==String(version)?'This listing changed. Reload the saved listing before changing photos.':'');}}).catch(cause=>{if(!cancel.signal.aborted)setError(cause.message);});
  return()=>cancel.abort();
 },[listingId,version,retry]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const ready=!!data?.available&&!error&&String(data.version)===String(version);
 const canEdit=editable&&ready&&!disabled&&!busy;
 const install=result=>{setData(result);onChange(result);};
 const run=async action=>{
  if(working.current||!canEdit)return;
  working.current=true;setBusy(true);onBusy(true);setError('');controller.current=new AbortController();
  try{await action(controller.current.signal);}catch(cause){setError(cause.message);}finally{working.current=false;setBusy(false);setProgress(null);onBusy(false);}
 };
 const upload=files=>{
  const chosen=Array.from(files||[]);if(!chosen.length)return;
  return run(async signal=>{
   if(chosen.length+data.media.length>20)throw new Error('Use up to 20 photos per listing.');
   for(const file of chosen)if(!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>8*1024*1024)throw new Error('Use JPEG, PNG or WebP photos, each up to 8 MiB.');
   let current=data;
   for(let i=0;i<chosen.length;i++){
    setProgress({file:i+1,total:chosen.length,percent:0});
    current=await uploadPhoto(listingId,current.version,chosen[i],percent=>setProgress({file:i+1,total:chosen.length,percent}),{signal});
    install(current);
   }
  });
 };
 const order=ids=>run(async signal=>install(await photoRequest(listingId,{expected_version:data.version,asset_ids:ids},signal)));
 const move=(index,step)=>{const ids=data.media.map(p=>p.id);[ids[index],ids[index+step]]=[ids[index+step],ids[index]];order(ids);};
 return <section className="panel" aria-label="Listing photos"><style>{css}</style><h2>Photos <small>(optional)</small></h2><p>{editable?'The first photo is your cover. Photos are submitted for review with your listing.':'Submitted photos cannot be changed. They remain part of the saved review.'}</p>{error&&<p className="bb-photo-error" role="alert">{error}</p>}{!data&&!error&&<p role="status">Loading photos…</p>}{data&&!data.available&&<p>Photo uploads are not configured yet. You can save and submit a listing without photos.</p>}{data?.media.length>0&&<div className="bb-photo-grid">{data.media.map((photo,index)=><figure key={photo.id}><img src={photo.thumbnail_url} alt={`Listing photo ${index+1}`} width="480" height="360"/><figcaption>{index===0?'Cover photo':`Photo ${index+1}`}</figcaption>{editable&&<div className="bb-photo-controls">{index>0&&<button type="button" disabled={!canEdit} onClick={()=>order([photo.id,...data.media.filter(p=>p.id!==photo.id).map(p=>p.id)])}>Make cover</button>}{index>0&&<button type="button" aria-label={`Move photo ${index+1} earlier`} disabled={!canEdit} onClick={()=>move(index,-1)}>←</button>}{index<data.media.length-1&&<button type="button" aria-label={`Move photo ${index+1} later`} disabled={!canEdit} onClick={()=>move(index,1)}>→</button>}<button type="button" disabled={!canEdit} onClick={()=>order(data.media.filter(p=>p.id!==photo.id).map(p=>p.id))}>Remove</button></div>}</figure>)}</div>}{editable&&data?.available&&<div className="bb-photo-upload"><label>Add photos<input aria-label="Add listing photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={!canEdit||data.media.length>=20} onChange={e=>{const files=e.target.files;upload(files);e.target.value='';}}/></label><small>Up to 20 photos · JPEG, PNG or WebP · 8 MiB each. Location metadata is removed.</small></div>}{progress&&<div role="status"><p>Photo {progress.file} of {progress.total} · {progress.percent===100?'Processing…':`${progress.percent}% uploaded`}</p><progress value={progress.percent} max="100"/></div>}{error&&<Button type="button" className="secondary" disabled={busy||disabled} onClick={()=>{setError('');setRetry(n=>n+1);}}>Retry photo status</Button>}</section>;
}
