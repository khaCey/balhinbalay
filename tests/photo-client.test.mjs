import test from 'node:test';
import assert from 'node:assert/strict';
import {photoUrl,photoResult,uploadPhoto} from '../components/balhinbalay/photoClient.js';
const id='11111111-1111-4111-8111-111111111111',asset='22222222-2222-4222-8222-222222222222',base=`/api/marketplace/listings/${id}/media/${asset}`;
const result={ok:true,available:true,version:'3',media:[{id:asset,url:base+'/gallery',thumbnail_url:base+'/thumb',share_url:base+'/share'}]};
function xhr(){return {headers:{},upload:{},open(method,url){this.method=method;this.url=url;},setRequestHeader(k,v){this.headers[k]=v;},send(file){this.file=file;},abort(){this.onabort();}};}
test('photo client accepts only exact same-origin raster URLs and complete successful results',()=>{
 assert.equal(photoUrl(base+'/gallery'),base+'/gallery');for(const value of ['https://evil.invalid'+base+'/share',base+'/original',base+'/share?token=x','javascript:alert(1)',base+'/../share'])assert.equal(photoUrl(value),null);assert.deepEqual(photoResult(result),result);assert.throws(()=>photoResult({...result,media:[{url:base+'/gallery'}]}));
});
test('upload sends version, credentials and progress and requires a valid 201 result',async()=>{
 const x=xhr(),progress=[],file={type:'image/jpeg',size:3};const promise=uploadPhoto(id,'2',file,n=>progress.push(n),{xhrFactory:()=>x});assert.equal(x.headers['X-Listing-Version'],'2');assert.equal(x.withCredentials,true);assert.equal(x.file,file);x.upload.onprogress({lengthComputable:true,loaded:1,total:2});x.status=201;x.responseText=JSON.stringify(result);x.onload();assert.deepEqual(await promise,result);assert.deepEqual(progress,[50]);
});
test('HTTP errors, unreadable responses, disconnects, timeouts and aborts never imply saved photos',async()=>{
 for(const kind of ['http','bad','timeout','network','abort']){const x=xhr(),signal=new AbortController(),promise=uploadPhoto(id,'2',{type:'image/png'},null,{xhrFactory:()=>x,signal:signal.signal});if(kind==='http'){x.status=409;x.responseText=JSON.stringify({message:'Reload first'});x.onload();}if(kind==='bad'){x.status=201;x.responseText='bad';x.onload();}if(kind==='timeout')x.ontimeout();if(kind==='network')x.onerror();if(kind==='abort')signal.abort();await assert.rejects(promise,/Reload|Reload|reload|connection|cancelled|timed out/i);}
});
