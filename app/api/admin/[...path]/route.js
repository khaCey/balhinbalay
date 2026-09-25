// Same-origin Site boundary for authenticated account administration. The
// account service remains private on the owner PC; this route forwards only the
// narrow admin account actions after checking the configured browser origin.
const sessionCookie=value=>String(value||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-bb_session='))||'';
const error=(status,message,code='SERVICE_UNAVAILABLE')=>Response.json({ok:false,code,message},{status,headers:{'Cache-Control':'no-store'}});

function browserOrigin(){
  const value=process.env.APP_URL;
  if(!value)return null;
  let origin;
  try{origin=new URL(value);}catch{return null;}
  const localHttpEnabled=process.env.NODE_ENV==='development'||process.env.ACCOUNT_ALLOW_LOCAL_HTTP==='true';
  const localHttp=localHttpEnabled&&origin.protocol==='http:'&&origin.hostname==='localhost';
  if(!(origin.protocol==='https:'||localHttp)||origin.pathname!=='/'||origin.search||origin.hash)return null;
  return origin.origin;
}

function pathParts(context){
  const raw=context;
  return Array.isArray(raw?.path)?raw.path:[];
}

async function forward(req,context,method){
  const path=pathParts(await context.params);
  const valid=(method==='GET'||method==='POST')&&path.length===1&&path[0]==='accounts'
    ||method==='DELETE'&&path.length===2&&path[0]==='accounts'&&/^[0-9a-f-]{16,}$/i.test(path[1]);
  if(!valid)return error(404,'Not found.','NOT_FOUND');
  const endpoint=process.env.ACCOUNT_API_ORIGIN,secret=process.env.ACCOUNT_PROXY_KEY;
  if(!endpoint||!secret)return error(503,'Account administration is not available yet.');
  const appOrigin=browserOrigin();
  if(!appOrigin)return error(503,'Account service is not configured.');
  let origin;
  try{origin=new URL(endpoint);}catch{return error(503,'Account service is not configured.');}
  const localHttpEnabled=process.env.NODE_ENV==='development'||process.env.ACCOUNT_ALLOW_LOCAL_HTTP==='true';
  const loopbackHttp=localHttpEnabled&&origin.protocol==='http:'&&/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:[/?#]|$)/i.test(endpoint);
  if(!(origin.protocol==='https:'||loopbackHttp)||origin.pathname!=='/'||origin.search||origin.hash)
    return error(503,'Account service is not configured.');
  if(method!=='GET'&&req.headers.get('origin')!==appOrigin)return error(403,'Forbidden.','ORIGIN_REJECTED');
  const headers=new Headers({'x-balhinbalay-proxy-key':secret,'accept':'application/json'});
  const incomingOrigin=req.headers.get('origin');
  if(incomingOrigin)headers.set('origin',incomingOrigin);
  if(method==='POST')headers.set('content-type','application/json');
  const cookie=sessionCookie(req.headers.get('cookie'));
  if(cookie)headers.set('cookie',cookie);
  const suffix=path.length===2?`/${encodeURIComponent(path[1])}`:'';
  let upstream;
  try{upstream=await fetch(new URL(`/api/admin/accounts${suffix}`,origin),{
    method,headers,body:method==='POST'?await req.text():undefined,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000),
  });}catch{return error(503,'Account service could not be reached. Try again later.');}
  const body=await upstream.text();
  const setCookie=upstream.headers.get('set-cookie');
  if(upstream.status===204){
    const responseHeaders=new Headers({'Cache-Control':'no-store'});
    if(setCookie)responseHeaders.set('Set-Cookie',setCookie);
    return new Response(null,{status:204,headers:responseHeaders});
  }
  if(!upstream.headers.get('content-type')?.includes('application/json'))return error(502,'Account service returned an invalid response.');
  const responseHeaders=new Headers({'Content-Type':'application/json','Cache-Control':'no-store'});
  if(setCookie)responseHeaders.set('Set-Cookie',setCookie);
  return new Response(body,{status:upstream.status,headers:responseHeaders});
}

export const dynamic='force-dynamic';
export const GET=(req,context)=>forward(req,context,'GET');
export const POST=(req,context)=>forward(req,context,'POST');
export const DELETE=(req,context)=>forward(req,context,'DELETE');
