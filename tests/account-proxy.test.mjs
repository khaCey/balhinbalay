import test from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST} from '../app/api/auth/[...path]/route.js';

const site='https://balhinbalay.com';
const context=path=>({params:Promise.resolve({path:[path]})});
const keep=(name,value)=>{if(value===undefined)delete process.env[name];else process.env[name]=value;};

test('server proxy refuses to run without configured backend and never forwards arbitrary routes',async()=>{
  const oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY,oldApp=process.env.APP_URL;
  delete process.env.ACCOUNT_API_ORIGIN;
  process.env.ACCOUNT_PROXY_KEY='example-private-proxy-key';
  process.env.APP_URL=site;
  try{
    const request=new Request(`${site}/api/auth/register`,{method:'POST',headers:{origin:site},body:'{}'});
    assert.equal((await POST(request,context('register'))).status,503);
    assert.equal((await POST(request,context('unrelated-marketplace-api'))).status,404);
  }finally{keep('ACCOUNT_API_ORIGIN',oldOrigin);keep('ACCOUNT_PROXY_KEY',oldKey);keep('APP_URL',oldApp);}
});

test('server proxy forwards only account cookie and configured browser origin, keeps its secret out of the browser',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY,oldApp=process.env.APP_URL;
  let seen;
  process.env.ACCOUNT_API_ORIGIN='https://account.example';
  process.env.ACCOUNT_PROXY_KEY='example-private-proxy-key';
  process.env.APP_URL=site;
  globalThis.fetch=async(url,options)=>{
    seen={url:String(url),options};
    return new Response(JSON.stringify({ok:true,user:{email:'a@example.com'}}),{headers:{'Content-Type':'application/json','Set-Cookie':'__Host-bb_session=opaque; Secure; HttpOnly; SameSite=Lax; Path=/'}});
  };
  try{
    // Model Cloudflare/Vinext: public browser Origin, private loopback request URL.
    const req=new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{Origin:site,Cookie:'other=secret; __Host-bb_session=opaque'},body:'{"email":"a@example.com"}'});
    const result=await POST(req,context('login'));
    assert.equal(result.status,200);
    assert.equal(seen.url,'https://account.example/api/auth/login');
    assert.equal(seen.options.headers.get('origin'),site);
    assert.equal(seen.options.headers.get('cookie'),'__Host-bb_session=opaque');
    assert.equal(seen.options.headers.get('x-balhinbalay-proxy-key'),'example-private-proxy-key');
    assert.match(result.headers.get('set-cookie'),/HttpOnly/);
    assert.doesNotMatch(await result.text(),/example-private-proxy-key/);
    assert.equal((await POST(new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}),context('login'))).status,403);
    assert.equal((await GET(new Request('http://127.0.0.1:8787/api/auth/session'),context('session'))).status,200);
  }finally{
    globalThis.fetch=oldFetch;
    keep('ACCOUNT_API_ORIGIN',oldOrigin);keep('ACCOUNT_PROXY_KEY',oldKey);keep('APP_URL',oldApp);
  }
});

test('APP_URL defines one browser origin; local browser HTTP is localhost-only with explicit allowance',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY;
  const oldNodeEnv=process.env.NODE_ENV,oldAllowLocal=process.env.ACCOUNT_ALLOW_LOCAL_HTTP,oldApp=process.env.APP_URL;
  process.env.ACCOUNT_API_ORIGIN='http://127.0.0.1:5000';
  process.env.ACCOUNT_PROXY_KEY='local-test-proxy-key';
  process.env.NODE_ENV='production';
  process.env.ACCOUNT_ALLOW_LOCAL_HTTP='true';
  globalThis.fetch=async()=>Response.json({ok:true});
  try{
    process.env.APP_URL='http://localhost:8787';
    assert.equal((await POST(new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{origin:'http://localhost:8787'},body:'{}'}),context('login'))).status,200);
    assert.equal((await POST(new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{origin:'http://127.0.0.1:8787'},body:'{}'}),context('login'))).status,403);
    process.env.APP_URL='http://127.0.0.1:8787';
    assert.equal((await POST(new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{origin:'http://127.0.0.1:8787'},body:'{}'}),context('login'))).status,503);
    process.env.APP_URL='http://account.example:8787';
    assert.equal((await POST(new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{origin:'http://account.example:8787'},body:'{}'}),context('login'))).status,503);
    process.env.APP_URL=site;
    assert.equal((await POST(new Request('http://127.0.0.1:8787/api/auth/login',{method:'POST',headers:{origin:site},body:'{}'}),context('login'))).status,200);
  }finally{
    globalThis.fetch=oldFetch;
    for(const [key,value] of [['ACCOUNT_API_ORIGIN',oldOrigin],['ACCOUNT_PROXY_KEY',oldKey],['NODE_ENV',oldNodeEnv],['ACCOUNT_ALLOW_LOCAL_HTTP',oldAllowLocal],['APP_URL',oldApp]])keep(key,value);
  }
});

test('HTTP account origins are limited to literal loopback hosts with explicit local opt-in; HTTPS still works',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN;
  const oldKey=process.env.ACCOUNT_PROXY_KEY,oldNodeEnv=process.env.NODE_ENV;
  const oldAllowLocal=process.env.ACCOUNT_ALLOW_LOCAL_HTTP,oldApp=process.env.APP_URL;
  const requested=[];
  globalThis.fetch=async url=>{
    requested.push(String(url));
    return Response.json({ok:true});
  };
  process.env.ACCOUNT_PROXY_KEY='local-test-proxy-key';
  process.env.APP_URL=site;
  try{
    const cases=[
      {environment:'development',allowLocal:undefined,origin:'http://localhost:5000',allowed:true},
      {environment:'development',allowLocal:undefined,origin:'http://127.0.0.1:5000',allowed:true},
      {environment:'production',allowLocal:'true',origin:'http://localhost:5000',allowed:true},
      {environment:'production',allowLocal:'true',origin:'http://127.0.0.1:5000',allowed:true},
      {environment:'production',allowLocal:'true',origin:'http://account.example:5000',allowed:false},
      {environment:'production',allowLocal:'true',origin:'http://localhost.evil.example:5000',allowed:false},
      {environment:'production',allowLocal:'true',origin:'http://127.1:5000',allowed:false},
      {environment:'production',allowLocal:'false',origin:'http://localhost:5000',allowed:false},
      {environment:'production',allowLocal:undefined,origin:'http://127.0.0.1:5000',allowed:false},
      {environment:'test',allowLocal:undefined,origin:'http://127.0.0.1:5000',allowed:false},
      {environment:'production',allowLocal:undefined,origin:'https://account.example',allowed:true},
    ];
    for(const entry of cases){
      process.env.NODE_ENV=entry.environment;
      if(entry.allowLocal===undefined)delete process.env.ACCOUNT_ALLOW_LOCAL_HTTP;
      else process.env.ACCOUNT_ALLOW_LOCAL_HTTP=entry.allowLocal;
      process.env.ACCOUNT_API_ORIGIN=entry.origin;
      const previous=requested.length;
      const req=new Request(`${site}/api/auth/register`,{
        method:'POST',headers:{origin:site},body:'{}',
      });
      const result=await POST(req,context('register'));
      assert.equal(result.status,entry.allowed?200:503,`${entry.environment}/${entry.allowLocal}: ${entry.origin}`);
      assert.equal(requested.length,previous+Number(entry.allowed),entry.origin);
      if(entry.allowed)assert.equal(requested.at(-1),`${entry.origin}/api/auth/register`);
    }
    process.env.NODE_ENV='production';
    process.env.ACCOUNT_ALLOW_LOCAL_HTTP='true';
    for(const suffix of ['/extra','/?q=1','/#fragment']){
      process.env.ACCOUNT_API_ORIGIN=`http://127.0.0.1:5000${suffix}`;
      const before=requested.length;
      assert.equal((await GET(new Request(`${site}/api/auth/session`),context('session'))).status,503);
      assert.equal(requested.length,before);
    }
    process.env.ACCOUNT_API_ORIGIN='http://127.0.0.1:5000';
    delete process.env.ACCOUNT_PROXY_KEY;
    assert.equal((await GET(new Request(`${site}/api/auth/session`),context('session'))).status,503);
  }finally{
    globalThis.fetch=oldFetch;
    for(const [key,value] of [['ACCOUNT_API_ORIGIN',oldOrigin],['ACCOUNT_PROXY_KEY',oldKey],['NODE_ENV',oldNodeEnv],['ACCOUNT_ALLOW_LOCAL_HTTP',oldAllowLocal],['APP_URL',oldApp]])keep(key,value);
  }
});
