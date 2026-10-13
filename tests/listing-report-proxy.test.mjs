import test from 'node:test';
import assert from 'node:assert/strict';
import {marketplaceAllowed,marketplaceForward} from '../lib/marketplace-proxy.js';
const id='01a00000-0000-7000-8000-000000000001';
test('report proxy exposes only the exact ordinary create and dedicated admin triage paths',()=>{
 assert.equal(marketplaceAllowed('POST',['listings',id,'reports']),true);
 assert.equal(marketplaceAllowed('GET',['listings',id,'reports']),false);
 assert.equal(marketplaceAllowed('GET',['listing-reports'],true),true);
 assert.equal(marketplaceAllowed('GET',['listing-reports',id],true),true);
 assert.equal(marketplaceAllowed('POST',['listing-reports',id,'review'],true),true);
 for(const method of ['GET','POST','PATCH'])assert.equal(marketplaceAllowed(method,['listing-reports',id]),false);
 assert.equal(marketplaceAllowed('PATCH',['listing-reports',id],true),false);
 assert.equal(marketplaceAllowed('POST',['public','listings',id,'reports']),false);
});
test('report forwarding keeps ordinary/admin credentials separate and validates triage queries',async()=>{
 const keys=['ACCOUNT_API_ORIGIN','APP_URL','ACCOUNT_PROXY_KEY'];const prior=keys.map(k=>process.env[k]);const previousFetch=globalThis.fetch;
 try{
  process.env.ACCOUNT_API_ORIGIN='https://service.synthetic.invalid';process.env.APP_URL='https://test.synthetic.invalid';process.env.ACCOUNT_PROXY_KEY='synthetic-only-proxy-key';
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push({url:String(url),options});return Response.json({ok:true});};
  const cookie='__Host-bb_session=ordinary; __Host-bb_admin_session=admin';
  const request=(path,method='GET')=>new Request('https://test.synthetic.invalid/api/'+path,{method,headers:{cookie,origin:'https://test.synthetic.invalid','content-type':'application/json'},...(method==='POST'?{body:'{"reason":"OTHER"}'}:{})});
  assert.equal((await marketplaceForward(request('listings/'+id+'/reports','POST'),{params:Promise.resolve({path:['listings',id,'reports']})},'POST')).status,200);
  assert.equal(calls[0].options.headers.get('cookie'),'__Host-bb_session=ordinary');
  assert.equal((await marketplaceForward(request('listing-reports?status=NEW&limit=2'),{params:Promise.resolve({path:['listing-reports']})},'GET',true)).status,200);
  assert.equal(calls[1].options.headers.get('cookie'),'__Host-bb_admin_session=admin');
  assert.match(calls[1].url,/status=NEW&limit=2/);
  assert.equal((await marketplaceForward(request('listing-reports?reporter_email=x'),{params:Promise.resolve({path:['listing-reports']})},'GET',true)).status,422);
  const cross=new Request('https://test.synthetic.invalid/api/listings/'+id+'/reports',{method:'POST',headers:{cookie,origin:'https://wrong.synthetic.invalid','content-type':'application/json'},body:'{}'});
  assert.equal((await marketplaceForward(cross,{params:Promise.resolve({path:['listings',id,'reports']})},'POST')).status,403);
 }finally{globalThis.fetch=previousFetch;keys.forEach((k,i)=>{if(prior[i]===undefined)delete process.env[k];else process.env[k]=prior[i];});}
});
