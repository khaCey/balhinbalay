'use client';
import {useEffect,useState} from 'react';
const statuses=['NEW','UNDER_REVIEW','RESOLVED','DISMISSED'];
const label=value=>value.replaceAll('_',' ').toLowerCase();
async function request(path,body) {
 const response=await fetch('/api/admin/marketplace/'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||'Listing reports could not be reached.');
 return data;
}
export default function ListingReportsAdmin() {
 const [items,setItems]=useState([]),[cursor,setCursor]=useState(null),[status,setStatus]=useState('NEW'),[detail,setDetail]=useState(null),[note,setNote]=useState(''),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{let active=true;request('listing-reports?status='+status).then(data=>{if(active){setItems(data.reports);setCursor(data.next_cursor);setLoaded(true);}}).catch(cause=>{if(active)setError(cause.message);});return()=>{active=false;};},[status]);
 const load=async(more=false)=>{
  setBusy(true);setError('');
  try{const data=await request('listing-reports?status='+status+(more?'&before='+encodeURIComponent(cursor):''));setItems(old=>more?[...old,...data.reports]:data.reports);setCursor(data.next_cursor);setLoaded(true);}catch(cause){setError(cause.message);}finally{setBusy(false);}
 };
 const open=async item=>{setBusy(true);setDetail(null);setNote('');setError('');setMessage('');try{setDetail(await request('listing-reports/'+item.id));}catch(cause){setError(cause.message);}finally{setBusy(false);}};
 const review=async next=>{
  setBusy(true);setError('');setMessage('');
  try{await request('listing-reports/'+detail.report.id+'/review',{status:next,note,expected_version:detail.report.version});setDetail(null);setNote('');setMessage('Review saved. Listing publication has not been changed.');await load();}
  catch(cause){setError(cause.message);setDetail(null);}finally{setBusy(false);}
 };
 return <section className="admin-card admin-section" style={{marginTop:24}} aria-label="Listing reports"><div className="admin-toolbar"><div><h2>Listing reports</h2><p className="admin-muted">Reports do not automatically unlist properties. Resolve means the report review is complete; any listing action is separate.</p></div><button className="admin-button admin-secondary" disabled={busy||!loaded&&!error} onClick={()=>load()}>Refresh reports</button></div>
 <label className="admin-field">Report status<select className="admin-input" value={status} disabled={busy||!loaded&&!error} onChange={e=>{setMessage('');setLoaded(false);setItems([]);setCursor(null);setDetail(null);setError('');setStatus(e.target.value);}}>{statuses.map(value=><option key={value} value={value}>{label(value)}</option>)}</select></label>
 {error&&<p className="admin-message admin-error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}{!loaded&&!error&&<p role="status">Loading reports…</p>}{loaded&&!items.length&&<p>No reports in this status.</p>}
 {items.map(item=><article key={item.id} style={{marginTop:16}}><strong>{label(item.reason)}</strong><p className="admin-muted">{item.reporter_email} · {new Date(item.created_at).toLocaleString('en-GB')} · Listing {item.listing_id}</p><button className="admin-button admin-secondary" disabled={busy} onClick={()=>open(item)}>Review report</button></article>)}
 {cursor&&<button className="admin-button admin-secondary" disabled={busy} onClick={()=>load(true)}>More reports</button>}
 {detail&&<section aria-label="Report detail" style={{marginTop:20}}><h3>{label(detail.report.reason)}</h3><p>Reporter: {detail.report.reporter_email} ({detail.report.reported_by_user_id})</p><p>Listing: {detail.report.listing_id}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{detail.report.details||'No additional details.'}</p><p>Status: {label(detail.report.status)}</p><h4>Review history</h4><ul>{detail.history.map(item=><li key={item.id}>{label(item.old_status)} → {label(item.new_status)} · {new Date(item.created_at).toLocaleString('en-GB')}{item.note&&' · '+item.note}</li>)}</ul>
 {['NEW','UNDER_REVIEW'].includes(detail.report.status)&&<><label className="admin-field">Review note (optional)<textarea className="admin-input" maxLength={2000} disabled={busy} value={note} onChange={e=>setNote(e.target.value)}/></label><div className="admin-top-actions" style={{marginTop:12}}>{(detail.report.status==='NEW'?['UNDER_REVIEW']:['RESOLVED','DISMISSED']).map(next=><button className="admin-button" key={next} disabled={busy} onClick={()=>review(next)}>{next==='UNDER_REVIEW'?'Begin review':next==='RESOLVED'?'Resolve':'Dismiss'}</button>)}</div></>}</section>}
 </section>;
}
