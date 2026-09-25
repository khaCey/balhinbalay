'use client';
import React,{useEffect,useState} from 'react';
import {useApp} from './model';
import {Back,Button,Field} from './ui';
import {registrationClient} from './registrationClient';

const formatDate=value=>value?new Date(value).toLocaleString('en-GB'):'—';

export default function AdminAccounts({client=registrationClient}){
  const {account}=useApp();
  const [accounts,setAccounts]=useState([]);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(true);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [forbidden,setForbidden]=useState(false);
  const load=async()=>{
    setBusy(true);setError('');
    try{const result=await client.adminAccounts();setAccounts(result.accounts||[]);setForbidden(false);}
    catch(cause){setAccounts([]);setForbidden(cause.code==='ADMIN_FORBIDDEN');setError(cause.message||'Admin accounts could not be loaded.');}
    finally{setBusy(false);}
  };
  useEffect(()=>{if(account)load();},[account]);
  const create=async event=>{
    event.preventDefault();setMessage('');setError('');setBusy(true);
    try{const result=await client.createAdminAccount(email,password);setEmail('');setPassword('');setMessage(`Created ${result.user.email}.`);await load();}
    catch(cause){setError(cause.message||'Account could not be created.');setBusy(false);}
  };
  const remove=async user=>{
    if(!window.confirm(`Delete ${user.email}? This also removes its sessions and verification/reset actions.`))return;
    setMessage('');setError('');setBusy(true);
    try{await client.deleteAdminAccount(user.id);setMessage(`Deleted ${user.email}.`);await load();}
    catch(cause){setError(cause.message||'Account could not be deleted.');setBusy(false);}
  };
  return <div className="narrow public-info">
    <Back label="Profile" page="profile"/>
    <div className="page-head"><h1>Admin · Accounts</h1><p className="muted">Manage ordinary BalhinBalay accounts from the authenticated admin session.</p></div>
    {!account?<div className="panel"><p>Sign in with an authorised admin account to continue.</p></div>:
      forbidden?<div className="panel"><h2>Admin access required</h2><p>Your account is signed in, but it is not authorised for account management.</p></div>:
      <>
        <div className="panel"><h2>Create pre-verified account</h2><p className="muted">The account is active and email-verified immediately. Lister access is not changed here.</p><form onSubmit={create}><Field label="Email" name="admin-email" type="email" autoComplete="off" value={email} onChange={event=>setEmail(event.target.value)} required maxLength={254}/><Field label="Password" name="admin-password" type="password" autoComplete="new-password" value={password} onChange={event=>setPassword(event.target.value)} required minLength={12} maxLength={128}/><Button className="full" type="submit" disabled={busy}>{busy?'Working…':'Create account'}</Button></form></div>
        <div className="panel"><div className="row" style={{justifyContent:'space-between',alignItems:'center'}}><h2>Accounts</h2><Button className="secondary" type="button" disabled={busy} onClick={load}>Refresh</Button></div>{busy&&!accounts.length?<p className="muted">Loading accounts…</p>:accounts.length?<div className="table-wrap"><table><thead><tr><th>Email</th><th>Status</th><th>Verified</th><th>Created</th><th/></tr></thead><tbody>{accounts.map(user=><tr key={user.id}><td>{user.email}</td><td>{user.status}</td><td>{user.email_verified_at?'Yes':'No'}</td><td>{formatDate(user.created_at)}</td><td><button className="text-btn danger-text" type="button" onClick={()=>remove(user)} disabled={busy}>Delete</button></td></tr>)}</tbody></table></div>:<p className="muted">No accounts found.</p>}</div>
      </>}
    {error&&<p role="alert" className="notice danger-notice">{error}</p>}
    {message&&<p role="status" className="notice">{message}</p>}
  </div>;
}
