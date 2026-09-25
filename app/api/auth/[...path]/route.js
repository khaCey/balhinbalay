// Same-origin boundary for the separate account service. Configuration is server-only.
// The account API's public HTTPS endpoint and this Site's secrets must be provisioned
// after IDE0153's deployment topology is approved. No browser bundle receives them.
const postPaths=new Set(['register','verify-email','resend-verification','login','logout','forgot-password','reset-password']);
const sessionCookie=value=>String(value||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-bb_session='))||'';
const error=(status,message)=>Response.json({ok:false,code:'SERVICE_UNAVAILABLE',message},{status,headers:{'Cache-Control':'no-store'}});

async function forward(req,context,method){
  const {path}=await context.params;
  const action=Array.isArray(path)&&path.length===1?path[0]:'';
  if(!(method==='GET'&&action==='session')&&!(method==='POST'&&postPaths.has(action)))
    return Response.json({ok:false,code:'NOT_FOUND',message:'Not found.'},{status:404});
  const endpoint=process.env.ACCOUNT_API_ORIGIN,secret=process.env.ACCOUNT_PROXY_KEY;
  if(!endpoint||!secret)return error(503,'Account registration is not available yet.');
  let origin;
  try{origin=new URL(endpoint);}catch{return error(503,'Account service is not configured.');}
  // Plain HTTP is allowed only for literal loopback hosts during dev or an explicit
  // server-only local Wrangler opt-in. All other configurations still require HTTPS.
  const localHttpEnabled=process.env.NODE_ENV==='development'||process.env.ACCOUNT_ALLOW_LOCAL_HTTP==='true';
  const loopbackHttp=localHttpEnabled&&origin.protocol==='http:'&&
    /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:[/?#]|$)/i.test(endpoint);
  if(!(origin.protocol==='https:'||loopbackHttp)||origin.pathname!=='/'||origin.search||origin.hash)
    return error(503,'Account service is not configured.');
  const incomingOrigin=req.headers.get('origin');
  if(method==='POST'&&incomingOrigin!==new URL(req.url).origin)
    return Response.json({ok:false,code:'ORIGIN_REJECTED',message:'Forbidden.'},{status:403});
  const headers=new Headers({'x-balhinbalay-proxy-key':secret,'accept':'application/json'});
  if(incomingOrigin)headers.set('origin',incomingOrigin);
  if(method==='POST')headers.set('content-type','application/json');
  const cookie=sessionCookie(req.headers.get('cookie'));
  if(cookie)headers.set('cookie',cookie);
  let upstream;
  try{upstream=await fetch(new URL(`/api/auth/${action}`,origin),{
    method,headers,body:method==='POST'?await req.text():undefined,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000),
  });}catch{return error(503,'Account service could not be reached. Try again later.');}
  const body=await upstream.text();
  if(!upstream.headers.get('content-type')?.includes('application/json'))return error(502,'Account service returned an invalid response.');
  const responseHeaders=new Headers({'Content-Type':'application/json','Cache-Control':'no-store'});
  const setCookie=upstream.headers.get('set-cookie');
  if(setCookie)responseHeaders.set('Set-Cookie',setCookie);
  return new Response(body,{status:upstream.status,headers:responseHeaders});
}

export const dynamic='force-dynamic';
export const GET=(req,context)=>forward(req,context,'GET');
export const POST=(req,context)=>forward(req,context,'POST');
