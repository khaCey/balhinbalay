// Explicit marketplace boundary. No arbitrary-path or ordinary/admin cookie crossover.
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function marketplaceAllowed(method,path,admin=false) {
  if(!Array.isArray(path)||path.some(x=>typeof x!=='string'))return false;
  const key=path.join('/');
  const variant=value=>['gallery','thumb','share'].includes(value);
  if(admin&&method==='GET'&&path.length===7&&path[0]==='listings'&&UUID.test(path[1])&&path[2]==='submissions'&&UUID.test(path[3])&&path[4]==='media'&&UUID.test(path[5])&&variant(path[6]))return true;
  if(!admin&&path[0]==='listings'&&UUID.test(path[1])&&path[2]==='media') {
    if(path.length===3&&['GET','POST','PATCH'].includes(method))return true;
    if(path.length===5&&method==='GET'&&UUID.test(path[3])&&variant(path[4]))return true;
  }
  if(!admin&&method==='GET'&&path.length===6&&path[0]==='public'&&path[1]==='listings'&&UUID.test(path[2])&&path[3]==='media'&&UUID.test(path[4])&&variant(path[5]))return true;
  if(admin) {
    if(method==='GET'&&key==='listing-reports')return true;
    if(path[0]==='listing-reports'&&UUID.test(path[1])) {
      if(method==='GET'&&path.length===2)return true;
      if(method==='POST'&&path.length===3&&path[2]==='review')return true;
    }
    if(method==='GET'&&path.length===1&&['lister-access','property-authorities','listing-submissions'].includes(key))return true;
    if(path[0]==='listings'&&UUID.test(path[1])&&path[2]==='submissions'&&UUID.test(path[3])) {
      if(method==='GET'&&path.length===4)return true;
      if(method==='POST'&&path.length===5&&['approve','reject'].includes(path[4]))return true;
    }
    return method==='POST'&&path.length===3&&UUID.test(path[1])&&
      (path[0]==='lister-access'&&['approve','suspend','revoke'].includes(path[2])||path[0]==='property-authorities'&&path[2]==='approve');
  }
  if(['GET','POST'].includes(method)&&key==='me/lister-access')return true;
  if(method==='GET'&&key==='public/listings')return true;
  if(method==='GET'&&path.length===3&&path[0]==='public'&&path[1]==='listings'&&UUID.test(path[2]))return true;
  if(method==='POST'&&path.length===3&&path[0]==='listings'&&UUID.test(path[1])&&['activate','unlist','reports'].includes(path[2]))return true;
  if(method==='GET'&&['me/listings','reference-data'].includes(key))return true;
  if(['GET','POST'].includes(method)&&key==='conversations')return true;
  if(method==='GET'&&path.length===2&&path[0]==='conversations'&&UUID.test(path[1]))return true;
  if(['GET','POST'].includes(method)&&path.length===3&&path[0]==='conversations'&&UUID.test(path[1])&&path[2]==='messages')return true;
  if(method==='POST'&&key==='listings')return true;
  if(['GET','PATCH'].includes(method)&&path.length===2&&path[0]==='listings'&&UUID.test(path[1]))return true;
  return method==='POST'&&path.length===3&&path[0]==='listings'&&UUID.test(path[1])&&path[2]==='submissions';
}
const error=(status,code,message)=>Response.json({ok:false,code,message},{status,headers:{'Cache-Control':'no-store'}});
const MAX_IMAGE_BYTES=8*1024*1024;
let activeUploads=0;
async function boundedBody(body,limit) {
  const reader=body?.getReader(),chunks=[];let length=0;
  if(reader)try{while(true){const part=await reader.read();if(part.done)break;length+=part.value.byteLength;if(length>limit){await reader.cancel();throw new RangeError('Body too large');}chunks.push(part.value);}}finally{reader.releaseLock();}
  const data=new Uint8Array(length);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}return data;
}
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
  const permitted=admin?(path.join('/')==='listing-reports'?['before','limit','status']:path.length===1?['before']:[]):path.join('/')==='public/listings'?['page','limit','sort','transaction_type','city','property_type','min_price','max_price','min_bedrooms','min_bathrooms','min_floor_area','keyword']:path.join('/')==='reference-data'?['city_id','city_query']:path.join('/')==='me/listings'||path[0]==='conversations'&&(path.length===1||path[2]==='messages')?['before','limit']:[];
  for(const [key,value] of incoming.searchParams) {
    if(!permitted.includes(key)||query.has(key)||value.length>(key==='keyword'?200:100))return error(422,'INVALID_INPUT','Unsupported query.');
    query.set(key,value);
  }
  const upload=!admin&&method==='POST'&&path.length===3&&path[0]==='listings'&&path[2]==='media';
  if(upload&&activeUploads>=2)return error(503,'IMAGE_PROCESSING_BUSY','Photo uploads are busy. Please try again shortly.');
  if(upload)activeUploads++;
  try {
  const binary=method==='GET'&&path.at(-3)==='media';
  const headers=new Headers({'x-balhinbalay-proxy-key':secret,accept:binary?'image/webp,image/jpeg':'application/json'});
  const name=admin?'__Host-bb_admin_session':'__Host-bb_session';
  const cookie=String(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
  if(cookie&&!(path[0]==='public'&&!admin))headers.set('cookie',cookie);
  if(method!=='GET')headers.set('origin',app.origin);
  const upstream=new URL(`${admin?'/api/admin/marketplace':'/api/marketplace'}/${path.map(encodeURIComponent).join('/')}`,service);
  upstream.search=query.toString();
  let body;
  if(method!=='GET') {
    const type=req.headers.get('content-type')?.toLowerCase()||'';
    if(upload) {
      if(!cookie)return error(401,'UNAUTHENTICATED','Sign in required.');
      if(!['image/jpeg','image/png','image/webp'].includes(type))return error(415,'IMAGE_TYPE_REJECTED','Use JPEG, PNG or WebP.');
      const version=req.headers.get('x-listing-version');
      if(!/^[1-9]\d{0,18}$/.test(version||''))return error(422,'INVALID_INPUT','Reload the listing before uploading.');
      // Verify the actual session/owner before buffering a binary upload. The
      // account service rechecks authority and version after decoding as well.
      try {
        const check=await fetch(upstream,{headers:new Headers({'x-balhinbalay-proxy-key':secret,cookie,accept:'application/json'}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});
        if(!check.headers.get('content-type')?.includes('application/json'))return error(502,'INVALID_RESPONSE','Invalid listings response.');
        const state=await check.json();
        if(!check.ok)return Response.json(state,{status:check.status,headers:{'Cache-Control':'no-store'}});
        if(!state.available)return error(503,'MEDIA_UNAVAILABLE','Photo uploads are not configured yet.');
        if(String(state.version)!==version)return error(409,'VERSION_CONFLICT','This listing changed. Reload it before uploading.');
      }catch{return error(503,'MARKETPLACE_UNAVAILABLE','Listings could not be reached. Try again later.');}
      headers.set('x-listing-version',version);headers.set('content-type',type);
    }else {
      if(!type.startsWith('application/json'))return error(415,'JSON_REQUIRED','Use JSON.');
      headers.set('content-type','application/json');
    }
    try{const data=await boundedBody(req.body,upload?MAX_IMAGE_BYTES:8192);body=upload?data:new TextDecoder().decode(data)||'{}';}
    catch(cause){return error(cause instanceof RangeError?413:400,cause instanceof RangeError?'BODY_TOO_LARGE':'INVALID_BODY',upload?'Each photo must be 8 MiB or smaller.':'Use at most 8 KiB of valid JSON.');}
  }
  try {
    const response=await fetch(upstream,{method,headers,body,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(upload?45000:15000)});
    if(binary&&response.ok) {
      const type=response.headers.get('content-type');
      if(!['image/jpeg','image/webp'].includes(type))return error(502,'INVALID_RESPONSE','Invalid photo response.');
      const data=await boundedBody(response.body,MAX_IMAGE_BYTES);
      if(!data.length)return error(502,'INVALID_RESPONSE','Photo unavailable.');
      return new Response(data,{status:200,headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline','Cross-Origin-Resource-Policy':'same-origin'}});
    }
    if(!response.headers.get('content-type')?.includes('application/json'))return error(502,'INVALID_RESPONSE','Invalid listings response.');
    return new Response(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
  } catch {return error(503,'MARKETPLACE_UNAVAILABLE','Listings could not be reached. Try again later.');}
  }finally{if(upload)activeUploads--;}
}
