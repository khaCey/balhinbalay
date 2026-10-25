'use client';
import {useEffect,useState,useRef} from 'react';
const KEY='balhinbalay-install-dismissed-until';
const WEEK=7*24*60*60*1000;
export default function InstallPrompt(){
 const suppressed=useRef(false);
 const [prompt,setPrompt]=useState(null),[ios,setIos]=useState(false),[hidden,setHidden]=useState(true),[busy,setBusy]=useState(false);
 useEffect(()=>{
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  let dismissed=false;
  try{dismissed=Number(localStorage.getItem(KEY))>Date.now();}catch{}
  if(standalone()||dismissed){suppressed.current=true;return;}
  const isIos=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const onPrompt=e=>{if(suppressed.current||standalone())return;e.preventDefault();setPrompt(e);setHidden(false);};
  let timer;
  const installed=()=>{suppressed.current=true;clearTimeout(timer);setPrompt(null);setHidden(true);};
  const display=window.matchMedia('(display-mode: standalone)');
  const onDisplay=()=>{if(standalone())installed();};
  window.addEventListener('beforeinstallprompt',onPrompt);
  window.addEventListener('appinstalled',installed);
  display.addEventListener('change',onDisplay);
  // Give the page time to render; never claim iOS supports a native install prompt.
  timer=isIos?setTimeout(()=>{if(!suppressed.current&&!standalone()){setIos(true);setHidden(false);}},12000):null;
  return()=>{clearTimeout(timer);window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',installed);display.removeEventListener('change',onDisplay);};
 },[]);
 const dismiss=()=>{suppressed.current=true;setHidden(true);try{localStorage.setItem(KEY,String(Date.now()+WEEK));}catch{}};
 const install=async()=>{
  if(!prompt||busy)return;setBusy(true);
  try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome!=='accepted')dismiss();else setHidden(true);}
  catch{setHidden(true);}
  finally{setPrompt(null);setBusy(false);}
 };
 if(hidden)return null;
 return <aside className="install-banner" aria-label="Install BalhinBalay">
  <div><strong>Add BalhinBalay to your home screen</strong><p>{ios?'Open your browser’s Share menu, choose Add to Home Screen, then Add. If that option is unavailable, open this page in Safari.':'Open BalhinBalay directly from your home screen.'}</p></div>
  <div className="install-actions">{!ios&&prompt&&<button type="button" className="btn" onClick={install} disabled={busy}>{busy?'Opening…':'Install'}</button>}<button type="button" className="btn secondary" onClick={dismiss}>Not now</button></div>
 </aside>;
}
