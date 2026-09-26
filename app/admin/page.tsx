'use client';

import React,{useCallback,useEffect,useState} from 'react';

const css=`
.admin-root{min-height:100vh;background:#0f1720;color:#e8edf2;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:32px 18px 48px}.admin-shell{width:min(1080px,100%);margin:0 auto}.admin-login-shell{min-height:calc(100vh - 80px);display:grid;place-items:center}.admin-card{background:#151f2b;border:1px solid #2a3948;border-radius:18px;box-shadow:0 24px 70px #0007;padding:24px}.admin-login{width:min(440px,100%)}.admin-brand{display:flex;align-items:center;gap:12px;margin-bottom:28px}.admin-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#f59e0b;color:#111827;font-weight:900}.admin-kicker{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9aa8b6;font-weight:800}.admin-title{margin:5px 0 0;font-size:26px}.admin-subtitle{margin:8px 0 24px;color:#aab6c3;line-height:1.55}.admin-form{display:grid;gap:16px}.admin-field{display:grid;gap:7px;font-size:13px;font-weight:700}.admin-input{width:100%;border:1px solid #3a4a5b;background:#0d141c;color:#eef3f7;border-radius:11px;padding:12px 13px;font:inherit;outline:none}.admin-input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px #f59e0b26}.admin-button{border:0;border-radius:11px;padding:12px 15px;background:#f59e0b;color:#111827;font:inherit;font-weight:800;cursor:pointer}.admin-button:disabled{opacity:.55;cursor:not-allowed}.admin-secondary{background:#263442;color:#edf2f7}.admin-danger{background:#3b1d22;color:#ffccd1;border:1px solid #6a2a33;padding:8px 11px;border-radius:9px;font:inherit;font-weight:700;cursor:pointer}.admin-link{color:#c2cfda;text-decoration:none;font-size:13px}.admin-link:hover{text-decoration:underline}.admin-message{margin-top:14px;border-radius:10px;padding:11px 12px;font-size:13px;line-height:1.45}.admin-error{background:#3a1d22;color:#ffc7cf;border:1px solid #6a2c35}.admin-success{background:#173128;color:#b9f7d4;border:1px solid #285744}.admin-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}.admin-toolbar h1{margin:4px 0 5px;font-size:30px}.admin-muted{color:#aab6c3}.admin-grid{display:grid;grid-template-columns:minmax(280px,360px) 1fr;gap:20px;align-items:start}.admin-section h2{margin:0 0 8px;font-size:19px}.admin-section p{margin:0 0 18px}.admin-table-wrap{overflow:auto}.admin-table{width:100%;border-collapse:collapse;min-width:640px}.admin-table th,.admin-table td{text-align:left;padding:12px 10px;border-bottom:1px solid #273542;font-size:13px}.admin-table th{color:#91a0ad;text-transform:uppercase;letter-spacing:.05em;font-size:11px}.admin-status{display:inline-flex;border:1px solid #3a4a5b;border-radius:999px;padding:4px 8px;font-size:12px}.admin-top-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.admin-empty{padding:20px 0;color:#aab6c3}.admin-security-note{font-size:12px;color:#81909e;margin-top:18px;line-height:1.55}@media(max-width:780px){.admin-root{padding:20px 12px 36px}.admin-grid{grid-template-columns:1fr}.admin-toolbar{align-items:flex-start;flex-direction:column}.admin-card{padding:18px}}
`;

async function request(path,{method='GET',body}={}){
  let response;
  try{
    response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  }catch{
    const error=new Error('The admin service could not be reached.');
    error.code='NETWORK_ERROR';throw error;
  }
  const data=response.status===204?{}:await response.json().catch(()=>({}));
  if(!response.ok){
    const error=new Error(data.message||'The admin request could not be completed.');
    error.code=data.code||null;error.status=response.status;throw error;
  }
  return data;
}

const formatDate=value=>value?new Date(value).toLocaleString('en-GB'):'—';

export default function AdminPortal(){
  const [state,setState]=useState('checking');
  const [admin,setAdmin]=useState(null);
  const [accounts,setAccounts]=useState([]);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [newEmail,setNewEmail]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [loadingAccounts,setLoadingAccounts]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');

  const loadAccounts=useCallback(async()=>{
    setLoadingAccounts(true);setError('');
    try{
      const result=await request('/api/admin/accounts');
      setAccounts(result.accounts||[]);
      return true;
    }catch(cause){
      if(cause.status===401||cause.status===403){setAdmin(null);setState('signed-out');}
      setError(cause.message);
      return false;
    }finally{setLoadingAccounts(false);}
  },[]);

  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const result=await request('/api/admin/session');
        if(!active)return;
        setAdmin(result.user);setState('ready');
        await loadAccounts();
      }catch(cause){
        if(!active)return;
        setAdmin(null);setState('signed-out');
        if(cause.status!==401)setError(cause.message);
      }
    })();
    return()=>{active=false;};
  },[loadAccounts]);

  const login=async event=>{
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try{
      const result=await request('/api/admin/login',{method:'POST',body:{email,password}});
      setAdmin(result.user);setPassword('');setState('ready');
      await loadAccounts();
    }catch(cause){setError(cause.message);}
    finally{setBusy(false);}
  };

  const logout=async()=>{
    setBusy(true);setError('');setMessage('');
    try{await request('/api/admin/logout',{method:'POST',body:{}});}catch(cause){setError(cause.message);}
    finally{setAccounts([]);setAdmin(null);setState('signed-out');setBusy(false);}
  };

  const createAccount=async event=>{
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try{
      const result=await request('/api/admin/accounts',{method:'POST',body:{email:newEmail,password:newPassword}});
      setNewEmail('');setNewPassword('');setMessage(`Created verified account ${result.user.email}.`);
      await loadAccounts();
    }catch(cause){setError(cause.message);}
    finally{setBusy(false);}
  };

  const removeAccount=async user=>{
    if(!window.confirm(`Delete ${user.email}? This also removes its sessions and verification/reset actions.`))return;
    setBusy(true);setError('');setMessage('');
    try{
      await request(`/api/admin/accounts/${encodeURIComponent(user.id)}`,{method:'DELETE'});
      setMessage(`Deleted ${user.email}.`);
      await loadAccounts();
    }catch(cause){setError(cause.message);}
    finally{setBusy(false);}
  };

  if(state==='checking')return <div className="admin-root"><style>{css}</style><div className="admin-login-shell"><div className="admin-card admin-login"><div className="admin-brand"><div className="admin-mark">BB</div><div><div className="admin-kicker">Administration</div><h1 className="admin-title">Checking admin session…</h1></div></div><p className="admin-muted">Verifying the dedicated admin session.</p></div></div></div>;

  if(state==='signed-out')return <div className="admin-root"><style>{css}</style><div className="admin-login-shell"><div className="admin-card admin-login"><div className="admin-brand"><div className="admin-mark">BB</div><div><div className="admin-kicker">BalhinBalay</div><h1 className="admin-title">Admin login</h1></div></div><p className="admin-subtitle">This is a separate administrative sign-in. A normal BalhinBalay login does not grant access here.</p><form className="admin-form" onSubmit={login}><label className="admin-field">Admin email<input className="admin-input" type="email" autoComplete="username" required maxLength={254} value={email} onChange={event=>setEmail(event.target.value)}/></label><label className="admin-field">Password<input className="admin-input" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/></label><button className="admin-button" type="submit" disabled={busy}>{busy?'Signing in…':'Sign in to admin'}</button></form>{error&&<div className="admin-message admin-error" role="alert">{error}</div>}<p className="admin-security-note">Only verified accounts explicitly authorised on the server can create an admin session.</p><a className="admin-link" href="/">← Back to BalhinBalay</a></div></div></div>;

  return <div className="admin-root"><style>{css}</style><div className="admin-shell"><div className="admin-toolbar"><div><div className="admin-kicker">BalhinBalay Administration</div><h1>Account management</h1><div className="admin-muted">Signed in as {admin?.email}</div></div><div className="admin-top-actions"><a className="admin-link" href="/">Public site</a><button className="admin-button admin-secondary" type="button" onClick={logout} disabled={busy}>Admin logout</button></div></div>{error&&<div className="admin-message admin-error" role="alert">{error}</div>}{message&&<div className="admin-message admin-success" role="status">{message}</div>}<div className="admin-grid"><section className="admin-card admin-section"><h2>Create pre-verified account</h2><p className="admin-muted">Creates an ordinary active account with email verification already satisfied. This does not grant Lister or admin access.</p><form className="admin-form" onSubmit={createAccount}><label className="admin-field">Email<input className="admin-input" type="email" autoComplete="off" required maxLength={254} value={newEmail} onChange={event=>setNewEmail(event.target.value)}/></label><label className="admin-field">Temporary password<input className="admin-input" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={newPassword} onChange={event=>setNewPassword(event.target.value)}/></label><button className="admin-button" type="submit" disabled={busy}>{busy?'Working…':'Create account'}</button></form></section><section className="admin-card admin-section"><div className="admin-toolbar" style={{marginBottom:12}}><div><h2>Accounts</h2><p className="admin-muted">Current BalhinBalay account records.</p></div><button className="admin-button admin-secondary" type="button" disabled={busy||loadingAccounts} onClick={loadAccounts}>{loadingAccounts?'Loading…':'Refresh'}</button></div>{loadingAccounts&&!accounts.length?<div className="admin-empty">Loading accounts…</div>:accounts.length?<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Email</th><th>Status</th><th>Verified</th><th>Created</th><th/></tr></thead><tbody>{accounts.map(user=><tr key={user.id}><td>{user.email}</td><td><span className="admin-status">{user.status}</span></td><td>{user.email_verified_at?'Yes':'No'}</td><td>{formatDate(user.created_at)}</td><td><button className="admin-danger" type="button" disabled={busy} onClick={()=>removeAccount(user)}>Delete</button></td></tr>)}</tbody></table></div>:<div className="admin-empty">No accounts found.</div>}</section></div></div></div>;
}
