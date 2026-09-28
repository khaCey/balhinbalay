'use client';
import React,{useEffect,useState} from 'react';
import {useApp} from './model';
import {Back,Button,Field} from './ui';
import {normaliseEmail,validateRegistration} from './registrationValidation';
import {registrationClient} from './registrationClient';
import {isTerminalResetError,resetViewMode,shouldRedirectSignedInAuth} from './accountAccessState';

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
  const viewMode=resetViewMode(mode,actionToken);
  const clear=()=>{setError('');setMessage('');};
  useEffect(()=>{
    if(account&&shouldRedirectSignedInAuth(mode))nav('profile');
  },[account,mode,nav]);
  async function run(task){
    clear();setBusy(true);
    try{await task();}
    catch(cause){
      if(mode==='reset-password'&&isTerminalResetError(cause.code)){
        setPassword('');setConfirmation('');setMode('reset-invalid');
        setError(cause.message||'This reset link can no longer be used.');
      }
      else if(cause.code==='EMAIL_NOT_VERIFIED'){setMode('check-email');setError('Verify your email before signing in. Request another link below if needed.');}
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
        await client.login(address,password);
        const session=await client.session();
        if(!session.user)throw new Error('Sign-in could not establish a server session.');
        setPassword('');setAccount(session.user);nav('profile');
      });
    }
    if(mode==='forgot-password'){
      if(!address){setError('Enter your email address.');return;}
      return run(async()=>{await client.forgot(address);setMode('reset-sent');setMessage('If this address is eligible, your request was received. If no email arrives, try again later.');});
    }
    if(mode==='reset-password'){
      const issue=validateRegistration({email:'reset@example.com',password,confirmation});
      if(issue){setError(issue);return;}
      if(!actionToken){setPassword('');setConfirmation('');setMode('reset-invalid');setError('This reset link is incomplete. Request a new one.');return;}
      return run(async()=>{await client.reset(actionToken,password);setAccount(null);setPassword('');setConfirmation('');setMode('reset-complete');setMessage('Password changed. Sign in with your new password.');});
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
  const title=({register:'Create an account',login:'Sign in','check-email':'Check your email','verify-email':'Verify your email','forgot-password':'Reset your password','reset-sent':'Check your email','reset-password':'Choose a new password','reset-invalid':'Reset link unavailable','reset-complete':'Password changed'})[viewMode]||'Your account';
  const emailField=<Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}/>;
  const passwordField=(newPassword=false)=><Field label={newPassword?'New password':'Password'} name="password" type="password" autoComplete={newPassword?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} required minLength={newPassword?12:undefined} maxLength={128}/>;
  return <div className="narrow public-info account-access">
    <Back label="Explore places" page="home"/>
    <div className="page-head"><h1>{title}</h1></div>
    <div className="panel">
      {viewMode==='check-email'?<><p>Registration needs an email verification link. Signing up does not itself verify your account.</p>{emailField}<Button disabled={busy} onClick={resend}>{busy?'Requesting…':'Resend verification email'}</Button><button className="text-btn" type="button" onClick={()=>nav('login')}>Return to sign in</button></>:
      viewMode==='verify-email'?<><p>Use the one-time action from your verification email.</p>{!verified&&<Button disabled={busy||!actionToken} onClick={verify}>{busy?'Verifying…':'Verify email'}</Button>}<button className="text-btn" type="button" onClick={()=>nav('login')}>Sign in</button><button className="text-btn" type="button" onClick={()=>{setMode('check-email');clear();}}>Request another link</button></>:
      viewMode==='reset-invalid'?<><p>This password reset link can no longer be used.</p><button className="text-btn" type="button" onClick={()=>nav('forgot-password')}>Request a new reset link</button><button className="text-btn" type="button" onClick={()=>nav('login')}>Return to sign in</button></>:
      viewMode==='reset-sent'||viewMode==='reset-complete'?<><button className="text-btn" type="button" onClick={()=>nav('login')}>Return to sign in</button></>:
      <form onSubmit={submit}>
        {viewMode!=='reset-password'&&emailField}
        {['register','login','reset-password'].includes(viewMode)&&passwordField(viewMode!=='login')}
        {['register','reset-password'].includes(viewMode)&&<Field label="Confirm password" name="confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} required/>}
        <Button className="full" type="submit" disabled={busy}>{busy?'Please wait…':({register:'Create account',login:'Sign in','forgot-password':'Send reset link','reset-password':'Change password'})[viewMode]}</Button>
      </form>}
      {error&&<p role="alert" className="notice danger-notice">{error}</p>}
      {message&&<p role="status" className="notice">{message}</p>}
      {viewMode==='register'&&<button type="button" className="text-btn" onClick={()=>nav('login')}>Already registered? Sign in</button>}
      {viewMode==='login'&&<><button type="button" className="text-btn" onClick={()=>nav('register')}>Need an account? Register</button><button type="button" className="text-btn" onClick={()=>nav('forgot-password')}>Forgot password?</button></>}
    </div>
  </div>;
}
