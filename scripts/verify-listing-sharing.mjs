// Source-only smoke: a built Site and a synthetic loopback account service.
// No live credentials, database, network routing or deployment are used.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const listingId='11111111-1111-4111-8111-111111111111',asset='22222222-2222-4222-8222-222222222222';
const mediaBase=`/api/marketplace/public/listings/${listingId}/media/${asset}`;
const jpeg=await readFile(new URL('../public/sharing-default.jpg',import.meta.url));
let mode='photo',requests=0;
const fixture={id:listingId,title:'Synthetic Cebu home',description:'Synthetic listing for source verification only.',transaction_type:'SALE',price_amount:'1200000.00',currency_code:'PHP',availability_status:'AVAILABLE',available_from:null,property:{property_type:'HOUSE',bedrooms:2,bathrooms:1,floor_area_sqm:'60'},details:{},rental_terms:null,sale_terms:null,development:null,location:{city:'City of Cebu',barangay:'Lahug',map_point:null}};
const account=createServer((req,res)=>{
 assert.equal(req.headers['x-balhinbalay-proxy-key'],'synthetic-local-sharing-key');
 res.setHeader('Cache-Control','no-store');
 if(req.url===`/api/marketplace/public/listings/${listingId}`){
  requests++;assert.equal(req.headers.cookie,undefined);res.setHeader('Content-Type','application/json');
  if(mode==='gone'||mode==='unavailable'){res.statusCode=mode==='gone'?404:503;res.end(JSON.stringify({ok:false,listing:{title:'PRIVATE-WITHDRAWN-TITLE',description:'PRIVATE-ADDRESS'}}));return;}
  res.end(JSON.stringify({ok:true,listing:{...fixture,media:mode==='empty'?[]:[{id:asset,width:1200,height:630,url:mediaBase+'/gallery',thumbnail_url:mediaBase+'/thumb',share_url:mediaBase+'/share'}]}}));return;
 }
 if(req.url?.startsWith(mediaBase+'/')&&mode==='photo'){res.setHeader('Content-Type','image/jpeg');res.end(jpeg);return;}
 res.statusCode=404;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:false,code:'NOT_FOUND'}));
});
await new Promise(resolve=>account.listen(0,'127.0.0.1',resolve));
const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const app='http://127.0.0.1:'+port,logs=[];
const child=spawn(process.execPath,[fileURLToPath(new URL('../node_modules/vinext/dist/cli.js',import.meta.url)),'start','--hostname','127.0.0.1','--port',String(port)],{cwd:root,env:{...process.env,NODE_ENV:'production',APP_URL:'https://balhinbalay.com',ACCOUNT_API_ORIGIN:'http://127.0.0.1:'+account.address().port,ACCOUNT_ALLOW_LOCAL_HTTP:'true',ACCOUNT_PROXY_KEY:'synthetic-local-sharing-key'},stdio:['ignore','pipe','pipe']});
child.stdout.on('data',data=>logs.push(data.toString()));child.stderr.on('data',data=>logs.push(data.toString()));
const html=async(path,ua='facebookexternalhit/1.1')=>{const response=await fetch(app+path,{headers:{'user-agent':ua},signal:AbortSignal.timeout(20000)});return {response,text:await response.text()};};
const meta=(head,name)=>{const tag=head.match(new RegExp(`<meta\\b[^>]*(?:property|name)=["']${name}["'][^>]*>`,'i'))?.[0];return tag?.match(/content=["']([^"']*)["']/i)?.[1];};
const head=text=>{assert.ok(text.includes('</head>'),'Initial HTML has a head');return text.slice(0,text.indexOf('</head>'));};
try{
 let started=false;for(let i=0;i<200;i++){if(child.exitCode!==null)throw new Error('Site exited: '+logs.join(''));try{await fetch(app+'/favicon.svg',{signal:AbortSignal.timeout(500)});started=true;break;}catch{await new Promise(resolve=>setTimeout(resolve,100));}}
 assert.ok(started,'Built Site starts');
 for(const ua of ['facebookexternalhit/1.1','Twitterbot/1.0','LinkedInBot/1.0','WhatsApp/2.0','Mozilla/5.0']){
  const result=await html('/listing/'+listingId,ua);await mkdir(new URL('../.sites-runtime/',import.meta.url),{recursive:true});await writeFile(new URL('../.sites-runtime/sharing-'+(ua.startsWith('Mozilla')?'browser':'crawler')+'.html',import.meta.url),result.text);assert.equal(result.response.status,200);
  // Vinext streams browser metadata in the initial HTML body; known unfurlers
  // receive blocking metadata in <head>. Neither path relies on client fetch.
  const h=ua.startsWith('Mozilla')?result.text:head(result.text);
  assert.equal(meta(h,'og:title'),'Synthetic Cebu home | BalhinBalay');assert.equal(meta(h,'og:image'),'https://balhinbalay.com'+mediaBase+'/share');assert.equal(meta(h,'twitter:card'),'summary_large_image');assert.match(h,new RegExp(`<link[^>]+rel="canonical"[^>]+href="https://balhinbalay.com/listing/${listingId}"`));assert.doesNotMatch(result.text,/PRIVATE-WITHDRAWN|PRIVATE-ADDRESS/);
 }
 mode='empty';let result=await html('/listing/'+listingId);assert.equal(meta(head(result.text),'og:image'),'https://balhinbalay.com/sharing-default.jpg');
 mode='gone';result=await html('/listing/'+listingId);assert.equal(result.response.status,404);assert.doesNotMatch(result.text,/Synthetic Cebu home|1200000|Lahug|PRIVATE-WITHDRAWN|PRIVATE-ADDRESS|22222222/);assert.match(result.text,/noindex/);
 mode='unavailable';result=await html('/listing/'+listingId);assert.equal(meta(head(result.text),'og:title'),'Listing unavailable | BalhinBalay');assert.match(result.text,/noindex/);assert.doesNotMatch(result.text,/Synthetic Cebu home|PRIVATE-WITHDRAWN|PRIVATE-ADDRESS/);
 result=await html('/search');assert.equal(meta(head(result.text),'og:title'),'BalhinBalay — Find your place');
 const fallback=await fetch(app+'/sharing-default.jpg');assert.equal(fallback.status,200);assert.equal(fallback.headers.get('content-type'),'image/jpeg');assert.deepEqual(Buffer.from(await fallback.arrayBuffer()),jpeg);
 assert.ok(requests>=5,'Eligibility is fetched again on separate requests');
 console.log('PASS built initial HTTP HTML: crawler/browser metadata, cover, no-photo fallback, withdrawal, upstream outage, generic search and fallback JPEG.');
}finally{
 child.kill('SIGTERM');await Promise.race([new Promise(resolve=>child.once('exit',resolve)),new Promise(resolve=>setTimeout(()=>{child.kill('SIGKILL');resolve();},3000)).then(()=>{})]);
 await new Promise(resolve=>account.close(resolve));await mkdir(new URL('../.sites-runtime/',import.meta.url),{recursive:true});await writeFile(new URL('../.sites-runtime/sharing-http.log',import.meta.url),logs.join(''));
}
