// Runs against the synthetic built Site started by verify-listing-sharing.mjs.
// Browser-only route fixtures exercise UI state, never confer live authority.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
export async function verifyPhotoBrowser({app,listingId,jpeg,publicAsset}) {
 if(!process.env.BB_PLAYWRIGHT_MODULE)throw new Error('BB_PLAYWRIGHT_MODULE must point to the pinned test-only Playwright installation');
 const browserModule=await import(pathToFileURL(process.env.BB_PLAYWRIGHT_MODULE).href),{chromium}=browserModule.default||browserModule;
 const browser=await chromium.launch({headless:true});
 const directory=new URL('../.sites-runtime/media-browser/',import.meta.url);await mkdir(directory,{recursive:true});
 try{
  const context=await browser.newContext({viewport:{width:375,height:812}}),page=await context.newPage();
  const problems=[];page.on('pageerror',error=>problems.push(error.message));
  await page.route('**/api/auth/session',route=>route.fulfill({json:{ok:true,user:{id:'44444444-4444-4444-8444-444444444444',email:'synthetic@fixture.invalid',status:'active',email_verified_at:'2026-10-01T00:00:00Z'}}}));
  await page.goto(app+'/listing/'+listingId);await page.getByRole('img',{name:'Synthetic Cebu home — photo 1'}).waitFor();
  await page.getByRole('button',{name:'View photo 2',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.bb-gallery-main')?.src.endsWith('/33333333-3333-4333-8333-333333333333/gallery'));
  await page.waitForFunction(()=>{const img=document.querySelector('.bb-gallery-main');return img?.complete&&img.naturalWidth>0;});
  assert.equal(await page.locator('.bb-gallery-main').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  let reports=0;
  await page.route('**/api/marketplace/listings/'+listingId+'/reports',async route=>{
   assert.equal(route.request().method(),'POST');assert.deepEqual(route.request().postDataJSON(),{reason:'INACCURATE_INFORMATION',details:'Synthetic combined browser report'});reports++;
   await route.fulfill({status:201,json:{ok:true,message:'Report received. Our team will review it.'}});
  });
  await page.getByRole('button',{name:'Report listing',exact:true}).click();
  await page.getByLabel('Reason',{exact:true}).selectOption('INACCURATE_INFORMATION');
  await page.getByLabel('Details (optional)',{exact:true}).fill('Synthetic combined browser report');
  await page.getByRole('button',{name:'Submit report',exact:true}).click();await page.getByText('Report received. Our team will review it.',{exact:true}).waitFor();assert.equal(reports,1);
  assert.equal(await page.locator('.bb-gallery-main').evaluate(img=>img.complete&&img.naturalWidth>0),true,'Reporting preserves the visible photo gallery');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile gallery fits the viewport');
  await page.screenshot({path:new URL('gallery-375.png',directory).pathname,fullPage:true});
  await page.setViewportSize({width:1280,height:900});await page.screenshot({path:new URL('gallery-1280.png',directory).pathname,fullPage:true});
  await page.route('**/api/marketplace/public/listings/**/media/**',route=>route.fulfill({status:404,json:{ok:false}}));await page.reload();await page.getByText('Photo not available',{exact:true}).waitFor({timeout:10000});
  const propertyId='55555555-5555-4555-8555-555555555555',authorityId='66666666-6666-4666-8666-666666666666';
  let version='2',media=[],posts=0,patches=0,stale=false,approved=false;
  const photo=id=>({id,width:1200,height:630,url:`/api/marketplace/listings/${listingId}/media/${id}/gallery`,thumbnail_url:`/api/marketplace/listings/${listingId}/media/${id}/thumb`,share_url:`/api/marketplace/listings/${listingId}/media/${id}/share`});
  const state=()=>({ok:true,available:true,version,review_status:'draft',media});
  const draft=()=>({ok:true,listing:{id:listingId,title:'Saved synthetic draft',description:'Existing saved content',transaction_type:'SALE',price_amount:'1200000.00',currency_code:'PHP',review_status:approved?'approved':'draft',market_status:'unlisted',version},property:{id:propertyId,property_type:'HOUSE',version:'1'},authority:{id:authorityId,relationship:'OWNER',verification_state:'verified',version:'1'},details:{},rental_terms:{},sale_terms:{},private_location:{street_address:'Private fixture'},review_history:[]});
  await page.route('**/api/marketplace/reference-data*',route=>route.fulfill({json:{ok:true,cities:[],barangays:[],developments:[],parents:[],currencies:[]}}));
  await page.route('**/api/marketplace/listings/**',async route=>{
   const req=route.request(),path=new URL(req.url()).pathname;
   if(path===`/api/marketplace/listings/${listingId}`){await route.fulfill({json:draft()});return;}
   if(path.endsWith('/media')){
    if(req.method()==='POST'){
     posts++;assert.equal(req.headers()['x-listing-version'],version);assert.ok(req.postDataBuffer().length>0);await new Promise(resolve=>setTimeout(resolve,120));
     const asset=posts===1?publicAsset:'33333333-3333-4333-8333-333333333333';media=[...media,photo(asset)];version=String(BigInt(version)+1n);await route.fulfill({status:201,json:state()});return;
    }
    if(req.method()==='PATCH'){
     patches++;if(stale){stale=false;version=String(BigInt(version)+1n);await route.fulfill({status:409,json:{ok:false,message:'This listing changed. Reload it before changing photos.'}});return;}
     const data=req.postDataJSON();assert.equal(data.expected_version,version);media=data.asset_ids.map(id=>media.find(p=>p.id===id));version=String(BigInt(version)+1n);await new Promise(resolve=>setTimeout(resolve,100));await route.fulfill({json:state()});return;
    }
    await route.fulfill({json:state()});return;
   }
   await route.fulfill({contentType:'image/jpeg',body:jpeg});
  });
  await page.setViewportSize({width:375,height:812});await page.goto(app+'/editor/'+listingId);
  const input=page.getByLabel('Add listing photos');await input.waitFor();
  await page.getByLabel('Title',{exact:true}).fill('Unsaved title survives photo changes');
  await input.setInputFiles([{name:'one.jpg',mimeType:'image/jpeg',buffer:jpeg},{name:'two.jpg',mimeType:'image/jpeg',buffer:jpeg}]);
  await page.getByText('Photo 2',{exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('input[type=file]')?.disabled);
  assert.equal(posts,2);assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),'Unsaved title survives photo changes');
  const thumb=await page.locator('.bb-photo-grid img').first().boundingBox();assert.ok(Math.abs(thumb.width/thumb.height-4/3)<0.02,'Photo thumbnails retain 4:3 proportions');
  const remove=await page.getByRole('button',{name:'Remove',exact:true}).first().boundingBox();assert.ok(remove.width>=44&&remove.height>=44,'Photo controls have usable mobile targets');
  await page.getByRole('button',{name:'Make cover',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('input[type=file]')?.disabled);
  assert.equal(media[0].id,'33333333-3333-4333-8333-333333333333');assert.equal(patches,1);
  await page.getByRole('button',{name:'Move photo 1 later',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('input[type=file]')?.disabled);assert.equal(media[0].id,publicAsset);
  await page.getByRole('button',{name:'Remove',exact:true}).last().click();await page.waitForFunction(()=>!document.querySelector('input[type=file]')?.disabled);assert.equal(media.length,1);
  await page.screenshot({path:new URL('editor-375.png',directory).pathname,fullPage:true});
  const overflow=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,class:el.className,left:el.getBoundingClientRect().left+scrollX,right:el.getBoundingClientRect().right+scrollX,width:el.getBoundingClientRect().width,text:el.textContent?.slice(0,65)})).filter(el=>el.right>innerWidth+1||el.left< -1).slice(0,20)}));
  if(overflow.width>overflow.viewport)console.log('Mobile overflow diagnostics:',JSON.stringify(overflow));
  assert.ok(overflow.width<=overflow.viewport,'Mobile editor fits the viewport');
  await page.setViewportSize({width:1280,height:900});await page.screenshot({path:new URL('editor-1280.png',directory).pathname,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Desktop editor fits the viewport');await page.setViewportSize({width:375,height:812});
  stale=true;await page.getByRole('button',{name:'Remove',exact:true}).click();await page.getByRole('alert').filter({hasText:'This listing changed'}).waitFor();assert.equal(await input.isDisabled(),true);assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),'Unsaved title survives photo changes');assert.equal(media.length,1);
  await page.getByRole('button',{name:'Reload saved listing',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('input[type=file]')?.disabled);
  assert.equal(await page.getByLabel('Title',{exact:true}).inputValue(),'Saved synthetic draft');
  approved=true;await page.reload();await page.getByText('Submitted photos cannot be changed. They remain part of the saved review.').waitFor();assert.equal(await page.getByLabel('Add listing photos').count(),0);assert.equal(await page.getByRole('button',{name:'Remove',exact:true}).count(),0);
  assert.deepEqual(problems,[],'No uncaught browser errors');await context.close();
  console.log('PASS Chromium combined reporting/gallery, mobile/desktop gallery, two sequential uploads, unsaved-field preservation, cover/reorder/remove, stale-version recovery and approved read-only photos.');
 }finally{await browser.close();}
}
