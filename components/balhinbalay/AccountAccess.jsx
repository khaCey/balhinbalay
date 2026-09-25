'use client';
import React,{useState} from 'react';
import {useApp} from './model';
import {Back,Button,Field} from './ui';
import {normaliseEmail,validateRegistration} from './registrationValidation';
import {registrationClient} from './registrationClient';

export default function AccountAccess({client=registrationClient}){
  const {state,nav,account,setAccount}=useApp();
  const [mode,setMode]=useState(state.page);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmation,setConfirmation]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [verified,setVerified]=useState(false);
  const actionToken=state.actionToken||'';
  const clear=()=>{setError('');setMessage('');};
  async function run(task){
    clear();setBusy(true);
    try{await task();}
    catch(cause){
      if(cause.code==='EMAIL_NOT_VERIFIED'){setMode('check-email');setError('Verify your email before signing in. Request another link below if needed.');}
      else if(cause.code==='RATE_LIMITED')setError('Too many requests. Please wait before trying again.');
      else setError(cause.message||'The request could not be completed.');
    }finally{setBusy(false);}
  }
  function submit(event){
    event.preventDefault();
    const address=normaliseEmail(email);
    if(mode==='register'){
      const issue=validateRegistration({email:address,password,confirmation});
      if(issue){setError(issue);return;}
      return run(async()=>{
        await client.register(address,password);
        setPassword('');setConfirmation('');setMode('check-email');
        setMessage('If this address is eligible, check your email and use the verification link before signing in.');
      });
    }
    if(mode==='login'){
      if(!address||!password){setError('Enter your email and password.');return;}
      return run(async()=>{
        const result=await client.login(address,password);
        setPassword('');setAccount(result.user||null);
        setMessage('You are signed in.');
      });
    }
    if(mode==='forgot-password'){
      if(!address){setError('Enter your email address.');return;}
      return run(async()=>{await client.forgot(address);setMode('reset-sent');setMessage('If this address is eligible, your request was received. If no email arrives, try again later.');});
    }
    if(mode==='reset-password'){
      const issue=validateRegistration({email:'reset@example.com',password,confirmation});
      if(issue){setError(issue);return;}
      if(!actionToken){setError('This reset link is incomplete. Request a new one.');return;}
      return run(async()=>{await client.reset(actionToken,password);setPassword('');setConfirmation('');setMode('reset-complete');setMessage('Password changed. Sign in with your new password.');});
    }
  }
  const resend=()=>run(async()=>{
    const address=normaliseEmail(email);
    if(!address){setError('Enter your email address first.');return;}
    await client.resend(address);
    setMessage('If eligible, your request was received. If no email arrives, try again later.');
  });
  const verify=()=>run(async()=>{
    if(!actionToken){setError('This verification link is incomplete. Request another link.');return;}
    await client.verify(actionToken);setVerified(true);setMessage('Your email is verified. You can now sign in.');
  });
  const logout=()=>run(async()=>{await client.logout();setAccount(null);setMode('login');setMessage('You are signed out.');});
  const title=account?'Your account':({register:'Create an account',login:'Sign in','check-email':'Check your email','verify-email':'Verify your email','forgot-password':'Reset your password','reset-sent':'Check your email','reset-password':'Choose a new password','reset-complete':'Password changed'})[mode]||'Your account';
  const emailField=<Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>;
  const passwordField=(newPassword=false)=><Field label={newPassword?'New password':'Password'} name="password" type="password" autoComplete={newPassword?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={newPassword?12:undefined} maxLength={128}/>;
  return <div className="narrow public-info account-access">
    <Back label="Explore places" page="home"/>
    <div className="page-head"><h1>{title}</h1></div>
    <div className="panel">
      {account?<><p><strong>{account.email}</strong></p><p>Email verified.</p><Button disabled={busy} onClick={logout}>{busy?'Signing out…':'Sign out'}</Button></>:
      mode==='check-email'?<><p>Registration needs an email verification link. Signing up does not itself verify your account.</p>{emailField}<Button disabled={busy} onClick={resend}>{busy?'Requesting…':'Resend verification email'}</Button><button className="text-btn" type="button" onClick={()=>nav('login')}>Return to sign in</button></>:
      mode==='verify-email'?<><p>Use the one-time action from your verification email.</p>{!verified&&<Button disabled={busy||!actionToken} onClick={verify}>{busy?'Verifying…':'Verify email'}</Button>}<button className="text-btn" type="button" onClick={()=>nav('login')}>Sign in</button><button className="text-btn" type="button" onClick={()=>{setMode('check-email');clear();}}>Request another link</button></>:
      mode==='reset-sent'||mode==='reset-complete'?<><button className="text-btn" type="button" onClick={()=>nav('login')}>Return to sign in</button></>:
      <form onSubmit={submit}>
        {mode!=='reset-password'&&emailField}
        {['register','login','reset-password'].includes(mode)&&passwordField(mode!=='login')}
        {['register','reset-password'].includes(mode)&&<Field label="Confirm password" name="confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required/>}
        <Button className="full" type="submit" disabled={busy}>{busy?'Please wait…':({register:'Create account',login:'Sign in','forgot-password':'Send reset link','reset-password':'Change password'})[mode]}</Button>
      </form>}
      {error&&<p role="alert" className="notice danger-notice">{error}</p>}
      {message&&<p role="status" className="notice">{message}</p>}
      {!account&&mode==='register'&&<button type="button" className="text-btn" onClick={()=>nav('login')}>Already registered? Sign in</button>}
      {!account&&mode==='login'&&<><button type="button" className="text-btn" onClick={()=>nav('register')}>Need an account? Register</button><button type="button" className="text-btn" onClick={()=>nav('forgot-password')}>Forgot password?</button></>}
    </div>
  </div>;
}
