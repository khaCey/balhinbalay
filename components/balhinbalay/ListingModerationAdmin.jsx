'use client';
import {useEffect,useState} from 'react';

async function request(path,body) {
 const response=await fetch('/api/admin/marketplace/'+path,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.message||'Listing moderation could not be reached.');
 return data;
}
const resource=item=>`listings/${item.listing_id}/submissions/${item.id}`;
const date=value=>new Date(value).toLocaleString('en-GB');
// Mounted only inside the separate authenticated Admin Portal. Server authority
// is rechecked for every read/write; this UI never confers reviewer permissions.
export default function ListingModerationAdmin() {
 const [items,setItems]=useState([]),[cursor,setCursor]=useState(null),[detail,setDetail]=useState(null),[reason,setReason]=useState(''),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{let active=true;request('listing-submissions').then(data=>{if(active){setItems(data.submissions);setCursor(data.next_cursor);setLoaded(true);}}).catch(cause=>{if(active)setError(cause.message);});return()=>{active=false;};},[]);
 const load=async(more=false)=>{
  setBusy(true);setError('');setDetail(null);
  try{const data=await request('listing-submissions'+(more?'?before='+encodeURIComponent(cursor):''));setItems(old=>more?[...old,...data.submissions]:data.submissions);setCursor(data.next_cursor);setLoaded(true);}catch(cause){setError(cause.message);}finally{setBusy(false);}
 };
 const open=async item=>{setBusy(true);setError('');setMessage('');setDetail(null);setReason('');try{setDetail(await request(resource(item)));}catch(cause){setError(cause.message);}finally{setBusy(false);}};
 const decide=async action=>{
  if(!detail)return;
  if(action==='reject'&&!reason.trim()){setError('Enter a rejection reason.');return;}
  setBusy(true);setError('');setMessage('');
  try{await request(resource(detail.submission)+'/'+action,{expected_version:detail.submission.expected_version,...(action==='reject'?{reason:reason.trim()}:{})});setMessage(action==='approve'?'Submission approved. The listing remains unlisted.':'Submission rejected. The Lister may save changes and resubmit.');await load();}
  catch(cause){setError(cause.message);setDetail(null);}finally{setBusy(false);}
 };
 return <section className="admin-card admin-section" style={{marginTop:24}} aria-label="Listing moderation">
  <div className="admin-toolbar"><div><h2>Pending listing submissions</h2><p className="admin-muted">Review submitted content. Approval keeps the listing unlisted.</p></div><button className="admin-button admin-secondary" disabled={busy} onClick={()=>load()}>Refresh queue</button></div>
  {error&&<p className="admin-message admin-error" role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  {!loaded&&!error&&<p role="status">Loading pending submissions…</p>}
  {loaded&&!items.length&&<p>No pending submissions.</p>}
  {items.map(item=><article key={item.id} style={{marginBottom:12}}><strong>{item.title||'Submitted listing'}</strong><p className="admin-muted">{date(item.submitted_at)} · {item.listing_id}</p><button className="admin-button admin-secondary" disabled={busy} onClick={()=>open(item)}>Review submission</button></article>)}
  {cursor&&<button className="admin-button admin-secondary" disabled={busy} onClick={()=>load(true)}>More submissions</button>}
  {detail&&<section aria-label="Submission detail"><h3>{detail.submission.payload.listing.title}</h3><p>Submitted {date(detail.submission.submitted_at)} · {detail.submission.id}</p>
   <h4>Immutable submitted content</h4><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(detail.submission.payload,null,2)}</pre>
   <h4>Current review context</h4><p>Property authority: {detail.context.verification_state} / {detail.context.authority_status}. Responsible Lister capability: {detail.context.lister_status||'none'}. Relationship: {detail.context.relationship}.</p>
   <h4>Submission history</h4><ul>{detail.history.map(item=><li key={item.submission_id}>{date(item.submitted_at)} · {item.outcome||'pending'}{item.reviewed_at&&` · reviewed ${date(item.reviewed_at)}`}{item.reason&&` · ${item.reason}`}</li>)}</ul>
   <label className="admin-field">Rejection reason<textarea className="admin-input" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)} disabled={busy}/></label>
   <div className="admin-top-actions" style={{marginTop:12}}><button className="admin-button" disabled={busy} onClick={()=>decide('approve')}>Approve submission</button><button className="admin-danger" disabled={busy||!reason.trim()} onClick={()=>decide('reject')}>Reject submission</button></div>
  </section>}
 </section>;
}
