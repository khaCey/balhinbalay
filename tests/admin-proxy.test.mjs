import test from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST,DELETE} from '../app/api/admin/[...path]/route.js';

const site='https://balhinbalay.com';
const context=path=>({params:Promise.resolve({path})});
const keep=(name,value)=>{if(value===undefined)delete process.env[name];else process.env[name]=value;};

test('admin Site proxy forwards only the dedicated admin session cookie',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY,oldApp=process.env.APP_URL;
  let seen;
  process.env.ACCOUNT_API_ORIGIN='https://account.example';process.env.ACCOUNT_PROXY_KEY='admin-private-key';process.env.APP_URL=site;
  globalThis.fetch=async(url,options)=>{seen={url:String(url),options};return new Response(JSON.stringify({ok:true,accounts:[]} ),{headers:{'Content-Type':'application/json'}});};
  try{
    const result=await GET(new Request('http://127.0.0.1:8787/api/admin/accounts',{headers:{Cookie:'other=secret; __Host-bb_session=ordinary; __Host-bb_admin_session=admin-opaque'}}),context(['accounts']));
    assert.equal(result.status,200);assert.equal(seen.url,'https://account.example/api/admin/accounts');
    assert.equal(seen.options.headers.get('cookie'),'__Host-bb_admin_session=admin-opaque');
    assert.doesNotMatch(seen.options.headers.get('cookie'),/__Host-bb_session=/);
    assert.equal(seen.options.headers.get('x-balhinbalay-proxy-key'),'admin-private-key');
    assert.doesNotMatch(await result.text(),/admin-private-key/);
  }finally{globalThis.fetch=oldFetch;keep('ACCOUNT_API_ORIGIN',oldOrigin);keep('ACCOUNT_PROXY_KEY',oldKey);keep('APP_URL',oldApp);}
});

test('admin login/session/logout paths are narrowly proxied and Set-Cookie is preserved',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY,oldApp=process.env.APP_URL;
  process.env.ACCOUNT_API_ORIGIN='https://account.example';process.env.ACCOUNT_PROXY_KEY='admin-private-key';process.env.APP_URL=site;
  let seen;
  globalThis.fetch=async(url,options)=>{
    seen={url:String(url),options};
    return new Response(JSON.stringify({ok:true,user:{email:'admin@example.com'}}),{headers:{'Content-Type':'application/json','Set-Cookie':'__Host-bb_admin_session=opaque; Path=/; Secure; HttpOnly; SameSite=Strict'}});
  };
  try{
    const login=await POST(new Request(`${site}/api/admin/login`,{method:'POST',headers:{Origin:site,'Content-Type':'application/json'},body:JSON.stringify({email:'admin@example.com',password:'secret password'})}),context(['login']));
    assert.equal(login.status,200);assert.equal(seen.url,'https://account.example/api/admin/login');
    assert.match(login.headers.get('set-cookie'),/^__Host-bb_admin_session=/);
    const session=await GET(new Request(`${site}/api/admin/session`),context(['session']));
    assert.equal(session.status,200);assert.equal(seen.url,'https://account.example/api/admin/session');
    const logout=await POST(new Request(`${site}/api/admin/logout`,{method:'POST',headers:{Origin:site,'Content-Type':'application/json'},body:'{}'}),context(['logout']));
    assert.equal(logout.status,200);assert.equal(seen.url,'https://account.example/api/admin/logout');
  }finally{globalThis.fetch=oldFetch;keep('ACCOUNT_API_ORIGIN',oldOrigin);keep('ACCOUNT_PROXY_KEY',oldKey);keep('APP_URL',oldApp);}
});

test('admin Site proxy validates browser origin, method/path and preserves 204',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY,oldApp=process.env.APP_URL;
  process.env.ACCOUNT_API_ORIGIN='https://account.example';process.env.ACCOUNT_PROXY_KEY='admin-private-key';process.env.APP_URL=site;
  let calls=0;globalThis.fetch=async()=>{calls++;return new Response(null,{status:204});};
  try{
    assert.equal((await POST(new Request(`${site}/api/admin/accounts`,{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}),context(['accounts']))).status,403);
    assert.equal((await GET(new Request(`${site}/api/admin/nope`),context(['nope']))).status,404);
    const result=await DELETE(new Request(`${site}/api/admin/accounts/123e4567-e89b-12d3-a456-426614174000`,{method:'DELETE',headers:{Origin:site}}),context(['accounts','123e4567-e89b-12d3-a456-426614174000']));
    assert.equal(result.status,204);assert.equal(calls,1);
  }finally{globalThis.fetch=oldFetch;keep('ACCOUNT_API_ORIGIN',oldOrigin);keep('ACCOUNT_PROXY_KEY',oldKey);keep('APP_URL',oldApp);}
});
