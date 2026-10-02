import test from 'node:test';
import assert from 'node:assert/strict';
import {marketplaceAllowed,marketplaceForward} from '../lib/marketplace-proxy.js';
const listing='019a0000-0000-7000-8000-000000000001',submission='019a0000-0000-7000-8000-000000000002';
const detail=['listings',listing,'submissions',submission];
const ctx=path=>({params:Promise.resolve({path})});
test('moderation allowlist grants exact admin review resources, never ordinary or publication paths',()=>{
 assert.equal(marketplaceAllowed('GET',['listing-submissions'],true),true);
 assert.equal(marketplaceAllowed('GET',detail,true),true);
 for(const verb of ['approve','reject'])assert.equal(marketplaceAllowed('POST',[...detail,verb],true),true);
 for(const path of [['listing-submissions'],detail,[...detail,'approve'],[...detail,'reject']])for(const method of ['GET','POST'])assert.equal(marketplaceAllowed(method,path,false),false);
 for(const verb of ['activate','unlist','withdraw','edit','delete'])assert.equal(marketplaceAllowed('POST',[...detail,verb],true),false);
 for(const path of [['listings',listing,'submissions','1'],[...detail,'approve','extra'],['listings','1','submissions',submission],['listings',listing,'submissions',submission,'..']])assert.equal(marketplaceAllowed('POST',path,true),false);
 for(const method of ['PATCH','DELETE','PUT'])assert.equal(marketplaceAllowed(method,detail,true),false);
});
test('moderation proxy strips ordinary credentials and blocks origin/query/body/path bypasses before upstream',async()=>{
 const saved={APP_URL:process.env.APP_URL,ACCOUNT_API_ORIGIN:process.env.ACCOUNT_API_ORIGIN,ACCOUNT_PROXY_KEY:process.env.ACCOUNT_PROXY_KEY},oldFetch=globalThis.fetch;
 Object.assign(process.env,{APP_URL:'https://site.invalid',ACCOUNT_API_ORIGIN:'https://private.invalid',ACCOUNT_PROXY_KEY:'synthetic-only'});
 let calls=0,sent;
 globalThis.fetch=async(url,options)=>{calls++;sent={url:String(url),options};return Response.json({ok:true},{headers:{'Set-Cookie':'must-not-escape'}});};
 const req=(suffix='',origin='https://site.invalid',body='{"expected_version":"3"}')=>new Request('https://site.invalid/api/admin/marketplace/'+[...detail,'approve'].join('/')+suffix,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:'__Host-bb_session=ordinary; __Host-bb_admin_session=reviewer; other=private'},body});
 try{
  const response=await marketplaceForward(req(),ctx([...detail,'approve']),'POST',true);assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(sent.options.headers.get('cookie'),'__Host-bb_admin_session=reviewer');assert.equal(sent.options.headers.get('origin'),'https://site.invalid');assert.equal(sent.options.redirect,'error');assert.match(sent.url,/\/api\/admin\/marketplace\/listings\//);assert.equal(sent.options.body,'{"expected_version":"3"}');
  const before=calls;
  assert.equal((await marketplaceForward(req('', 'https://attacker.invalid'),ctx([...detail,'approve']),'POST',true)).status,403);
  assert.equal((await marketplaceForward(req('?before='+submission),ctx([...detail,'approve']),'POST',true)).status,422);
  assert.equal((await marketplaceForward(req('','','x'.repeat(8193)),ctx([...detail,'approve']),'POST',true)).status,403);
  assert.equal((await marketplaceForward(req('','https://site.invalid','x'.repeat(8193)),ctx([...detail,'approve']),'POST',true)).status,413);
  assert.equal((await marketplaceForward(req(),ctx([...detail,'activate']),'POST',true)).status,404);
  assert.equal((await marketplaceForward(req(),ctx([...detail,'approve']),'POST',false)).status,404);
  assert.equal(calls,before);
 }finally{globalThis.fetch=oldFetch;for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
});
