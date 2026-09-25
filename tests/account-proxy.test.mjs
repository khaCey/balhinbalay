import test from 'node:test';
import assert from 'node:assert/strict';
import {GET,POST} from '../app/api/auth/[...path]/route.js';

const site='https://balhinbalay.example';
const context=path=>({params:Promise.resolve({path:[path]})});
test('server proxy refuses to run without configured backend and never forwards arbitrary routes',async()=>{
  const original=process.env.ACCOUNT_API_ORIGIN;
  delete process.env.ACCOUNT_API_ORIGIN;
  try{
    const request=new Request(`${site}/api/auth/register`,{method:'POST',headers:{origin:site},body:'{}'});
    assert.equal((await POST(request,context('register'))).status,503);
    assert.equal((await POST(request,context('unrelated-marketplace-api'))).status,404);
  }finally{if(original===undefined)delete process.env.ACCOUNT_API_ORIGIN;else process.env.ACCOUNT_API_ORIGIN=original;}
});

test('server proxy forwards only account cookie and origin, keeps its secret out of the browser',async()=>{
  const oldFetch=globalThis.fetch,oldOrigin=process.env.ACCOUNT_API_ORIGIN,oldKey=process.env.ACCOUNT_PROXY_KEY;
  let seen;
  process.env.ACCOUNT_API_ORIGIN='https://account.example';
  process.env.ACCOUNT_PROXY_KEY='example-private-proxy-key';
  globalThis.fetch=async(url,options)=>{
    seen={url:String(url),options};
    return new Response(JSON.stringify({ok:true,user:{email:'a@example.com'}}),{headers:{'Content-Type':'application/json','Set-Cookie':'__Host-bb_session=opaque; Secure; HttpOnly; SameSite=Lax; Path=/'}});
  };
  try{
    const req=new Request(`${site}/api/auth/login`,{method:'POST',headers:{Origin:site,Cookie:'other=secret; __Host-bb_session=opaque'},body:'{"email":"a@example.com"}'});
    const result=await POST(req,context('login'));
    assert.equal(result.status,200);
    assert.equal(seen.url,'https://account.example/api/auth/login');
    assert.equal(seen.options.headers.get('cookie'),'__Host-bb_session=opaque');
    assert.equal(seen.options.headers.get('x-balhinbalay-proxy-key'),'example-private-proxy-key');
    assert.match(result.headers.get('set-cookie'),/HttpOnly/);
    assert.doesNotMatch(await result.text(),/example-private-proxy-key/);
    assert.equal((await POST(new Request(`${site}/api/auth/login`,{method:'POST',headers:{Origin:'https://other.example'},body:'{}'}),context('login'))).status,403);
    assert.equal((await GET(new Request(`${site}/api/auth/session`),context('session'))).status,200);
  }finally{
    globalThis.fetch=oldFetch;
    if(oldOrigin===undefined)delete process.env.ACCOUNT_API_ORIGIN;else process.env.ACCOUNT_API_ORIGIN=oldOrigin;
    if(oldKey===undefined)delete process.env.ACCOUNT_PROXY_KEY;else process.env.ACCOUNT_PROXY_KEY=oldKey;
  }
});
