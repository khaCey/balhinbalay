// Explicit marketplace boundary. No arbitrary-path or ordinary/admin cookie crossover.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function marketplaceAllowed(method,path,admin=false) {
  if(!Array.isArray(path)||path.some(x=>typeof x!=='string'))return false;
  const key=path.join('/');
  if(admin) {
    if(method==='GET'&&path.length===1&&['lister-access','property-authorities'].includes(key))return true;
    return method==='POST'&&path.length===3&&UUID.test(path[1])&&
      (path[0]==='lister-access'&&['approve','suspend','revoke'].includes(path[2])||path[0]==='property-authorities'&&path[2]==='approve');
  }
  if(['GET','POST'].includes(method)&&key==='me/lister-access')return true;
  if(method==='GET'&&['me/listings','reference-data'].includes(key))return true;
  if(['GET','POST'].includes(method)&&key==='conversations')return true;
  if(method==='GET'&&path.length===2&&path[0]==='conversations'&&UUID.test(path[1]))return true;
  if(['GET','POST'].includes(method)&&path.length===3&&path[0]==='conversations'&&UUID.test(path[1])&&path[2]==='messages')return true;
  if(method==='POST'&&key==='listings')return true;
  if(['GET','PATCH'].includes(method)&&path.length===2&&path[0]==='listings'&&UUID.test(path[1]))return true;
  return method==='POST'&&path.length===3&&path[0]==='listings'&&UUID.test(path[1])&&path[2]==='submissions';
}
const error=(status,code,message)=>Response.json({ok:false,code,message},{status,headers:{'Cache-Control':'no-store'}});
function origin(value,localAllowed,service=false) {
  try {
    const url=new URL(value);
    const local=localAllowed&&url.protocol==='http:'&&(service?['localhost','127.0.0.1'].includes(url.hostname):url.hostname==='localhost');
    if(url.username||url.password||url.pathname!=='/'||url.search||url.hash||!(url.protocol==='https:'||local))return null;
    return url;
  } catch {return null;}
}
export async function marketplaceForward(req,context,method,admin=false) {
  const path=(await context.params)?.path;
  if(!marketplaceAllowed(method,path,admin))return error(404,'NOT_FOUND','Not found.');
  const local=process.env.NODE_ENV==='development'||process.env.ACCOUNT_ALLOW_LOCAL_HTTP==='true';
  const service=origin(process.env.ACCOUNT_API_ORIGIN,local,true),app=origin(process.env.APP_URL,local);
  const secret=process.env.ACCOUNT_PROXY_KEY;
  if(!service||!app||!secret)return error(503,'MARKETPLACE_UNAVAILABLE','Listings are not available yet.');
  if(method!=='GET'&&req.headers.get('origin')!==app.origin)return error(403,'ORIGIN_REJECTED','Forbidden.');
  const incoming=new URL(req.url),query=new URLSearchParams();
  const permitted=admin?['before']:path.join('/')==='reference-data'?['city_id','city_query']:path.join('/')==='me/listings'||path[0]==='conversations'&&(path.length===1||path[2]==='messages')?['before','limit']:[];
  for(const [key,value] of incoming.searchParams) {
    if(!permitted.includes(key)||query.has(key)||value.length>100)return error(422,'INVALID_INPUT','Unsupported query.');
    query.set(key,value);
  }
  let body;
  if(method!=='GET') {
    if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return error(415,'JSON_REQUIRED','Use JSON.');
    // Bound streamed input too; Content-Length alone cannot be trusted.
    const reader=req.body?.getReader();const chunks=[];let bytes=0;
    if(reader) {
      try { while(true) { const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>8192){await reader.cancel();return error(413,'BODY_TOO_LARGE','Use at most 8 KiB.');}chunks.push(chunk.value); } }
      catch {return error(400,'INVALID_BODY','Invalid request body.');}
    }
    const data=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}
    body=new TextDecoder().decode(data)||'{}';
  }
  const headers=new Headers({'x-balhinbalay-proxy-key':secret,accept:'application/json'});
  if(method!=='GET'){headers.set('origin',app.origin);headers.set('content-type','application/json');}
  const name=admin?'__Host-bb_admin_session':'__Host-bb_session';
  const cookie=String(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
  if(cookie)headers.set('cookie',cookie);
  const upstream=new URL(`${admin?'/api/admin/marketplace':'/api/marketplace'}/${path.map(encodeURIComponent).join('/')}`,service);
  upstream.search=query.toString();
  try {
    const response=await fetch(upstream,{method,headers,body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!response.headers.get('content-type')?.includes('application/json'))return error(502,'INVALID_RESPONSE','Invalid listings response.');
    return new Response(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  } catch {return error(503,'MARKETPLACE_UNAVAILABLE','Listings could not be reached. Try again later.');}
}
