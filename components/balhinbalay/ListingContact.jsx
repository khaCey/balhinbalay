'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useApp} from './model';
import {Button} from './ui';
import {marketplaceRequest} from './Marketplace';
import {contactRequest,sendContact} from '@/lib/listing-contact';

export default function ListingContact({listingId}) {
 const {account,sessionChecked}=useApp(),router=useRouter();
 const [text,setText]=useState(''),[request,setRequest]=useState(null),[sending,setSending]=useState(false),[error,setError]=useState(''),[signIn,setSignIn]=useState(false);
 const send=async event=>{
  event.preventDefault();if(sending||!account||!sessionChecked)return;
  setError('');setSending(true);
  try{const payload=contactRequest(listingId,text,request);setRequest(payload);await sendContact(payload,marketplaceRequest,path=>router.push(path));}
  catch(cause){if(cause.code==='UNAUTHENTICATED'){setSignIn(true);setError('Your session has ended. Sign in again to contact this Lister.');}else setError(cause.message||'Your message could not be sent. Try again.');}
  finally{setSending(false);}
 };
 return <section className="panel"><h2>Contact the Lister</h2>{!sessionChecked?<p role="status">Checking your account…</p>:!account||signIn?<><p>Sign in with your verified BalhinBalay account to send an in-app message.</p><Link href="/login">Sign in to contact</Link></>:<form onSubmit={send}><label className="field" style={{display:'grid',gap:8}}>Your message<textarea aria-label="First message" maxLength={2000} value={text} onChange={event=>setText(event.target.value)} disabled={sending} style={{width:'100%',minHeight:110,padding:10,border:'1px solid #ccd3d7',borderRadius:8}}/></label><Button type="submit" disabled={sending||!text.trim()}>{sending?'Sending…':'Send in-app message'}</Button></form>}{error&&<p role="alert" className="marketplace-error">{error}</p>}</section>;
}
