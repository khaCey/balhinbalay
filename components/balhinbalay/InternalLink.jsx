'use client';
import {useRouter} from 'next/navigation';

// Keep real anchor semantics while avoiding the framework's broken lazy Link export.
export default function InternalLink({href,onClick,target,download,children,...props}){
 const router=useRouter();
 function follow(event){
  onClick?.(event);
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||(target&&target!=='_self')||download!=null)return;
  const destination=new URL(href,window.location.href);
  if(destination.origin!==window.location.origin)return;
  event.preventDefault();
  router.push(destination.pathname+destination.search+destination.hash);
 }
 return <a {...props} href={href} target={target} download={download} onClick={follow}>{children}</a>;
}
