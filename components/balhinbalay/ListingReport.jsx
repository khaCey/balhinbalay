'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useApp} from './model';
import {Button} from './ui';
import {marketplaceRequest} from './Marketplace';

const reasons=[['SUSPECTED_SCAM','Suspected scam'],['INACCURATE_INFORMATION','Inaccurate information'],['UNAVAILABLE_PROPERTY','Unavailable property'],['INAPPROPRIATE_CONTENT','Inappropriate content'],['OTHER','Other']];
export default function ListingReport({listingId}) {
 const {account,sessionChecked}=useApp();
 const [open,setOpen]=useState(false),[reason,setReason]=useState(reasons[0][0]),[details,setDetails]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[signedOut,setSignedOut]=useState(false);
 const submit=async event=>{
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{const result=await marketplaceRequest('listings/'+encodeURIComponent(listingId)+'/reports',{method:'POST',body:{reason,details}});setMessage(result.message);setOpen(false);setDetails('');}
  catch(cause){setError(cause.message||'Your report could not be sent.');if(cause.code==='UNAUTHENTICATED')setSignedOut(true);}
  finally{setBusy(false);}
 };
 return <section className="panel" aria-label="Report listing"><h2>Report this listing</h2><p>Tell our team about a problem. Your account identity is visible to authorised admins and is not shared with the Lister. Reports are reviewed before any listing action.</p>
 {message?<p role="status">{message}</p>:!sessionChecked?<p role="status">Checking your account…</p>:!account||signedOut?<Link href="/login">Sign in to report</Link>:!open?<Button onClick={()=>setOpen(true)}>Report listing</Button>:<form onSubmit={submit}>
 <label className="field" style={{display:'grid',gap:8}}>Reason<select value={reason} disabled={busy} onChange={e=>setReason(e.target.value)}>{reasons.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
 <label className="field" style={{display:'grid',gap:8}}>Details (optional)<textarea value={details} maxLength={2000} disabled={busy} onChange={e=>setDetails(e.target.value)} style={{width:'100%',minHeight:110}}/></label>
 <Button type="submit" disabled={busy}>{busy?'Sending…':'Submit report'}</Button> <Button type="button" disabled={busy} onClick={()=>setOpen(false)}>Cancel</Button></form>}
 {error&&<p role="alert">{error}</p>}</section>;
}
