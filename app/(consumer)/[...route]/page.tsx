import {notFound} from 'next/navigation';
import {ConsumerScreen} from '@/components/balhinbalay/App';

const pages=new Set(['search','results','map','profile','login','register','recent','compare','about','contact','privacy','terms','verify-email','reset-password','forgot-password','saved','messages','settings','editProfile','owner','editor']);

// Vinext/App Router resolves these paths on a fresh HTTP request. The page
// selects the screen; the shared layout retains browser-only search state.
export default async function ConsumerRoute({params}: {params: Promise<{route: string[]}>}) {
  const {route}=await params;
  if(route.length===1 && pages.has(route[0]))return <ConsumerScreen page={route[0]}/>;
  if(route.length===2 && (route[0]==='property'||route[0]==='chat') && /^[1-9]\d*$/.test(route[1]))return <ConsumerScreen page={route[0]}/>;
  notFound();
}
