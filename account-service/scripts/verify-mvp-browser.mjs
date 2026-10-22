// Full browser acceptance against disposable PostgreSQL, the real Account app
// and a built Site. No request interception, live credentials or external mail.
import assert from 'node:assert/strict';
import {createServer as httpServer,request as httpRequest} from 'node:http';
import {createServer as httpsServer} from 'node:https';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {randomBytes} from 'node:crypto';
import {v7 as uuidv7} from 'uuid';
import argon2 from 'argon2';
import sharp from 'sharp';
import {createAccountPool} from '../src/database.js';
import {migrate} from '../src/migrate.js';
import {createAccountApp} from '../src/app.js';
import {mountMarketplace} from '../src/marketplace.js';
import {mountSiteAdmin} from '../src/site-admin.js';
import {ensureUserPrincipal} from '../src/marketplace-identity.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Explicit disposable PostgreSQL service required');
const url=new URL(connection);
if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!=='/postgres')throw new Error('Loopback disposable root database only');
if(!process.env.BB_PLAYWRIGHT_MODULE)throw new Error('Pinned test-only Playwright module required');
const root=fileURLToPath(new URL('../../',import.meta.url));
const directory=await mkdtemp(join(tmpdir(),'bb-mvp-browser-'));
const evidence=join(root,'.sites-runtime','mvp-browser');await mkdir(evidence,{recursive:true});
const adminPool=createAccountPool({connectionString:connection});
const db='bb_wrk0084_acceptance',title='Synthetic MVP acceptance home';
let pool,account,edge,site,browser,created=false;
const logs=[],checks=[],errors=[];
const pass=label=>{checks.push(label);console.log('PASS '+label);};
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const close=async server=>{if(server){server.closeAllConnections?.();await new Promise(resolve=>server.close(resolve));}};
const field=(page,label)=>page.getByLabel(new RegExp('^'+label));
try{
 await adminPool.query(`CREATE DATABASE ${db} TEMPLATE template0`);created=true;
 pool=createAccountPool({connectionString:new URL('/'+db,connection).href});await migrate(pool);
 const password='Fixture-'+randomBytes(20).toString('hex')+'!';
 const passwordHash=await argon2.hash(password);
 const users={};
 for(const role of ['owner','reviewer','seeker']){
  const id=uuidv7(),email=role+'@mvp-fixture.invalid';users[role]={id,email};
  await pool.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,$2,$3,'active',now())",[id,email,passwordHash]);await ensureUserPrincipal(pool,id);
 }
 const region=uuidv7(),city=uuidv7(),barangay=uuidv7();
 await pool.query("INSERT INTO regions VALUES($1,'MVP-REGION','Synthetic region')",[region]);
 await pool.query("INSERT INTO cities(id,region_id,code,name,locality_type) VALUES($1,$2,'MVP-CITY','Synthetic Cebu','CITY')",[city,region]);
 await pool.query("INSERT INTO barangays VALUES($1,$2,'MVP-BRGY','Synthetic Lahug')",[barangay,city]);
 // Test-only self-signed HTTPS edge allows the actual Secure host cookies.
 execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-days','1','-keyout',join(directory,'key.pem'),'-out',join(directory,'cert.pem'),'-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore'});
 let sitePort;
 edge=httpsServer({key:await readFile(join(directory,'key.pem')),cert:await readFile(join(directory,'cert.pem'))},(req,res)=>{
  const forwarded=httpRequest({hostname:'127.0.0.1',port:sitePort,path:req.url,method:req.method,headers:req.headers},upstream=>{res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);});
  forwarded.on('error',()=>{res.writeHead(502);res.end();});req.pipe(forwarded);
 });await listen(edge);
 const appOrigin='https://127.0.0.1:'+edge.address().port;
 const config={appOrigin,proxyKey:randomBytes(32).toString('hex'),adminEmails:[users.reviewer.email],marketplaceEnabled:true,moderationEnabled:true,publicationEnabled:true,messagingEnabled:true,mediaEnabled:true,mediaRoot:join(directory,'photos'),sessionDays:14,verificationHours:24,resetMinutes:15};
 await mkdir(config.mediaRoot,{mode:0o700});
 const mailer={verify:async()=>{throw new Error('No external mail permitted in acceptance fixtures');},reset:async()=>{throw new Error('No external mail permitted in acceptance fixtures');}};
 const app=createAccountApp({pool,config,mailer});mountMarketplace(app,{pool,config});mountSiteAdmin(app,{pool,config});account=httpServer(app);await listen(account);
 const probe=httpServer();await listen(probe);sitePort=probe.address().port;await close(probe);
 site=spawn(process.execPath,[join(root,'node_modules/vinext/dist/cli.js'),'start','--hostname','127.0.0.1','--port',String(sitePort)],{cwd:root,env:{...process.env,NODE_ENV:'production',APP_URL:appOrigin,ACCOUNT_API_ORIGIN:'http://127.0.0.1:'+account.address().port,ACCOUNT_ALLOW_LOCAL_HTTP:'true',ACCOUNT_PROXY_KEY:config.proxyKey},stdio:['ignore','pipe','pipe']});
 site.stdout.on('data',x=>logs.push(String(x)));site.stderr.on('data',x=>logs.push(String(x)));
 let ready=false;for(let i=0;i<200;i++){if(site.exitCode!==null)throw new Error('Built Site exited');try{if((await fetch('http://127.0.0.1:'+sitePort+'/favicon.svg')).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}assert.ok(ready,'Built Site starts');
 const browserModule=await import(pathToFileURL(process.env.BB_PLAYWRIGHT_MODULE).href),{chromium}=browserModule.default||browserModule;
 browser=await chromium.launch({headless:true});
 async function pageFor(role,mobile=false){const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:mobile?{width:375,height:812}:{width:1280,height:900}});const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await context.tracing.start({screenshots:true,snapshots:true});return {page,context,role};}
 const owner=await pageFor('owner',true),reviewer=await pageFor('reviewer'),seeker=await pageFor('seeker'),guest=await pageFor('guest',true);
 const pages=[owner,reviewer,seeker,guest];
 async function api(actor,path,{method='GET',body,status=200}={}){
  const result=await actor.page.evaluate(async({path,method,body})=>{const response=await fetch(path,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});return {status:response.status,body:await response.json()};},{path,method,body});assert.equal(result.status,status,JSON.stringify(result));return result.body;
 }
 async function login(actor){const p=actor.page;await p.goto(appOrigin+(actor.role==='reviewer'?'/admin':'/login'));await p.getByLabel(actor.role==='reviewer'?'Admin email':'Email',{exact:true}).fill(users[actor.role].email);await p.getByLabel('Password',{exact:true}).fill(password);await p.getByRole('button',{name:actor.role==='reviewer'?'Sign in to admin':'Sign in',exact:true}).click();await p.getByRole('heading',{name:actor.role==='reviewer'?'Account management':'Your corner.',exact:true}).waitFor();}
 try{
  await guest.page.goto(appOrigin+'/admin');await guest.page.getByRole('heading',{name:'Admin login',exact:true}).waitFor();await api(guest,'/api/admin/accounts',{status:401});
  await login(owner);await api(owner,'/api/admin/accounts',{status:401});await login(reviewer);await api(reviewer,'/api/auth/session',{status:401});await login(seeker);pass('real user/admin login, secure cookies and separate session purposes');
  await owner.page.goto(appOrigin+'/owner');await owner.page.getByRole('button',{name:'Request listing access',exact:true}).click();await owner.page.getByText('Your access request is awaiting manual review.',{exact:true}).waitFor();
  await reviewer.page.reload();await reviewer.page.getByRole('row').filter({hasText:users.owner.email}).filter({has:reviewer.page.getByRole('button',{name:'Grant / restore',exact:true})}).getByRole('button',{name:'Grant / restore',exact:true}).click();await reviewer.page.getByText('Decision saved.',{exact:true}).waitFor();
  await owner.page.reload();await field(owner.page,'Your relationship to the property').selectOption('OWNER');await owner.page.getByRole('button',{name:'Create private draft',exact:true}).click();await owner.page.waitForURL('**/editor/*');const id=owner.page.url().split('/').at(-1);assert.match(id,/^[a-f0-9-]{36}$/);
  await field(owner.page,'Title').fill(title);await field(owner.page,'Description').fill('Synthetic real-service browser acceptance listing.');await field(owner.page,'Physical property type').selectOption('HOUSE');await field(owner.page,'For rent or sale').selectOption('RENT');await field(owner.page,'Asking amount').fill('15000');await field(owner.page,'Currency').selectOption('PHP');await field(owner.page,'Availability').selectOption('AVAILABLE');await field(owner.page,'Available from').fill('2026-11-01');await field(owner.page,'Recognised city').selectOption(city);await field(owner.page,'Barangay').selectOption(barangay);await field(owner.page,'Pricing period').selectOption('MONTHLY');await field(owner.page,'street address').fill('PRIVATE-MVP-STREET');await owner.page.getByRole('button',{name:'Save private draft',exact:true}).click();await owner.page.getByText('Private draft saved.',{exact:true}).waitFor();
  const jpeg=await sharp({create:{width:100,height:70,channels:3,background:'#547f99'}}).jpeg().toBuffer();await owner.page.getByLabel('Add listing photos',{exact:true}).setInputFiles({name:'fixture.jpg',mimeType:'image/jpeg',buffer:jpeg});await owner.page.getByText('Photo 1',{exact:true}).waitFor();
  const privateDraft=await api(owner,'/api/marketplace/listings/'+id);const media=await api(owner,'/api/marketplace/listings/'+id+'/media');const photo=media.media[0];await api(guest,'/api/marketplace/public/listings/'+id,{status:404});
  await reviewer.page.reload();await reviewer.page.getByRole('button',{name:'Approve authority',exact:true}).click();await reviewer.page.getByText('Decision saved.',{exact:true}).waitFor();
  await owner.page.reload();await owner.page.getByText('Your property authority: Approved. No listing becomes public through this editor.',{exact:true}).waitFor();await owner.page.getByRole('button',{name:'Save and submit for review',exact:true}).click();await owner.page.getByText('Submitted for review. Your listing is not public.',{exact:true}).waitFor();pass('browser Lister request/grant, complete dated rental draft, photo upload, manual authority and immutable submission');
  await reviewer.page.reload();const moderation=reviewer.page.getByRole('region',{name:'Listing moderation',exact:true});await moderation.getByRole('button',{name:'Review submission',exact:true}).click();await moderation.getByRole('img',{name:title+' — photo 1',exact:true}).waitFor();assert.ok(!await moderation.innerText().then(x=>x.includes('PRIVATE-MVP-STREET')));await moderation.getByRole('button',{name:'Approve submission',exact:true}).click();await moderation.getByText('Submission approved. The listing remains unlisted.',{exact:true}).waitFor();await api(guest,'/api/marketplace/public/listings/'+id,{status:404});
  await owner.page.goto(appOrigin+'/owner');await owner.page.getByRole('button',{name:'Activate',exact:true}).click();await owner.page.getByText('Listing is public.',{exact:true}).waitFor();
  await guest.page.goto(appOrigin+'/search');await guest.page.getByRole('button',{name:'Keyword',exact:true}).click();await field(guest.page,'Keyword').fill(title);await guest.page.getByRole('button',{name:'Find a place',exact:true}).click();await guest.page.getByRole('link',{name:title,exact:true}).click();await guest.page.getByRole('heading',{name:title,exact:true}).waitFor();await guest.page.getByRole('img',{name:title+' — photo 1',exact:true}).waitFor();await guest.page.getByRole('link',{name:'Sign in to contact',exact:true}).waitFor();await guest.page.getByRole('link',{name:'Sign in to report',exact:true}).waitFor();
  const published=await api(guest,'/api/marketplace/public/listings/'+id);assert.equal(published.listing.available_from,'2026-11-01');assert.doesNotMatch(JSON.stringify(published),/PRIVATE-MVP|owner@mvp-fixture/);assert.equal(published.listing.location.map_point,null);assert.equal(published.listing.media[0].id,photo.id);
  const crawler=await guest.context.request.get(appOrigin+'/listing/'+id,{headers:{'user-agent':'facebookexternalhit/1.1'}});const html=await crawler.text();assert.ok(html.includes('og:image'));assert.ok(html.includes('/'+photo.id+'/share'));assert.doesNotMatch(html,/PRIVATE-MVP-STREET/);pass('admin photo review leaves unlisted; Lister activates; real public search/detail, date, guest gates and initial sharing HTML');
  await guest.page.screenshot({path:join(evidence,'public-mobile.png'),fullPage:true});
  await seeker.page.goto(appOrigin+'/listing/'+id);await seeker.page.getByLabel('First message',{exact:true}).fill('Synthetic first enquiry');await seeker.page.getByRole('button',{name:'Send in-app message',exact:true}).click();await seeker.page.waitForURL('**/chat/*');await seeker.page.getByText('Synthetic first enquiry',{exact:true}).waitFor();const thread=seeker.page.url().split('/').at(-1);
  await owner.page.goto(appOrigin+'/messages');await owner.page.getByRole('link',{name:title,exact:true}).click();await owner.page.getByLabel('Message',{exact:true}).fill('Synthetic Lister reply');await owner.page.getByRole('button',{name:'Send message',exact:true}).click();await owner.page.getByText('Synthetic Lister reply',{exact:true}).waitFor();await seeker.page.reload();await seeker.page.getByText('Synthetic Lister reply',{exact:true}).waitFor();await api(reviewer,'/api/marketplace/conversations/'+thread,{status:401});await api(guest,'/api/marketplace/conversations/'+thread,{status:401});pass('real first contact, shared two-person inbox/thread and reply persistence with guest/admin-purpose denial');
  await seeker.page.goto(appOrigin+'/listing/'+id);const report=seeker.page.getByRole('region',{name:'Report listing',exact:true});await report.getByRole('button',{name:'Report listing',exact:true}).click();await report.getByRole('combobox').selectOption('INACCURATE_INFORMATION');await report.getByLabel('Details (optional)',{exact:true}).fill('PRIVATE-MVP-REPORT');await report.getByRole('button',{name:'Submit report',exact:true}).click();await report.getByText('Report received. Our team will review it.',{exact:true}).waitFor();
  await reviewer.page.reload();const reports=reviewer.page.getByRole('region',{name:'Listing reports',exact:true});await reports.getByRole('button',{name:'Review report',exact:true}).click();await reports.getByText('PRIVATE-MVP-REPORT',{exact:true}).waitFor();await reports.getByRole('button',{name:'Begin review',exact:true}).click();await reports.getByRole('combobox').selectOption('UNDER_REVIEW');await reports.getByRole('button',{name:'Review report',exact:true}).click();await reports.getByRole('button',{name:'Resolve',exact:true}).click();await reports.getByText('Review saved. Listing publication has not been changed.',{exact:true}).waitFor();
  const afterReport=await api(guest,'/api/marketplace/public/listings/'+id);assert.deepEqual(afterReport,published);assert.doesNotMatch(JSON.stringify(afterReport),/PRIVATE-MVP-REPORT|seeker@mvp-fixture/);await api(owner,'/api/admin/marketplace/listing-reports',{status:401});pass('real report submission and admin NEW→UNDER_REVIEW→RESOLVED; reporter privacy and publication preserved');
  const capabilityRow=()=>reviewer.page.getByRole('row').filter({hasText:users.owner.email}).filter({has:reviewer.page.getByRole('button',{name:'Grant / restore',exact:true})});
  await capabilityRow().getByRole('button',{name:'Suspend',exact:true}).click();await reviewer.page.getByText('Decision saved.',{exact:true}).waitFor();
  await seeker.page.goto(appOrigin+'/chat/'+thread);await seeker.page.getByText('Messages are paused while the original Lister access is inactive. History remains readable. Refresh to check whether access has been restored.',{exact:true}).waitFor();assert.equal(await seeker.page.getByLabel('Message',{exact:true}).isDisabled(),true);await seeker.page.getByText('Synthetic Lister reply',{exact:true}).waitFor();await api(guest,'/api/marketplace/public/listings/'+id,{status:404});
  await capabilityRow().getByRole('button',{name:'Grant / restore',exact:true}).click();await reviewer.page.getByText('Decision saved.',{exact:true}).waitFor();await seeker.page.reload();await seeker.page.getByRole('button',{name:'Send message',exact:true}).waitFor();assert.equal(await seeker.page.getByLabel('Message',{exact:true}).isDisabled(),false);await api(guest,'/api/marketplace/public/listings/'+id);pass('Lister suspension freezes new messages and public eligibility while retaining history; restoration recovers both');
  await owner.page.goto(appOrigin+'/owner');await owner.page.getByRole('button',{name:'Unlist',exact:true}).click();await owner.page.getByText('Listing is no longer public.',{exact:true}).waitFor();await api(guest,'/api/marketplace/public/listings/'+id,{status:404});assert.equal((await guest.context.request.get(appOrigin+photo.share_url.replace('/listings/','/public/listings/'))).status(),404);
  const withdrawn=await guest.context.request.get(appOrigin+'/listing/'+id,{headers:{'user-agent':'facebookexternalhit/1.1'}});assert.equal(withdrawn.status(),404);assert.doesNotMatch(await withdrawn.text(),/Synthetic MVP acceptance home|PRIVATE-MVP/);
  await seeker.page.goto(appOrigin+'/chat/'+thread);await seeker.page.getByLabel('Message',{exact:true}).fill('Synthetic reply after unlisting');await seeker.page.getByRole('button',{name:'Send message',exact:true}).click();await seeker.page.getByText('Synthetic reply after unlisting',{exact:true}).waitFor();pass('unlisting withdraws detail/media/metadata while original private thread remains replyable');
  assert.equal(privateDraft.listing.title,title);assert.deepEqual(errors,[],'No uncaught browser errors');pass('complete MVP journey without mocked API responses or uncaught browser errors');
 }catch(error){
  for(const actor of pages)console.error('Fixture browser state '+actor.role+': '+(await actor.page.locator('body').innerText().catch(()=>'' )).slice(-3500));
  throw error;
 }finally{
  for(const actor of pages){await writeFile(join(evidence,actor.role+'-last-page.txt'),await actor.page.locator('body').innerText().catch(()=>''));await actor.context.tracing.stop({path:join(evidence,actor.role+'-trace.zip')});await actor.context.close();}
 }
}finally{
 await browser?.close();
 if(site){site.kill('SIGTERM');await Promise.race([new Promise(resolve=>site.once('exit',resolve)),new Promise(resolve=>setTimeout(()=>{site.kill('SIGKILL');resolve();},3000))]);}
 await close(edge);await close(account);await pool?.end();
 if(created)await adminPool.query(`DROP DATABASE ${db}`);await adminPool.end();
 await writeFile(join(evidence,'result.json'),JSON.stringify({checks,errors},null,2));await writeFile(join(evidence,'site.log'),logs.join(''));await rm(directory,{recursive:true,force:true});
}
