import express from 'express';
import {createHmac} from 'node:crypto';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {MarketplaceError,UUID,invalid,object,expected} from './marketplace-validation.js';
import {MAX_PHOTO_BYTES,MAX_PHOTOS,PHOTO_TYPES,processPhoto,mediaStorage} from './media-storage.js';

const fail=(status,code,message)=>{throw new MarketplaceError(status,code,message);};
const id=value=>{if(!UUID.test(String(value||'')))invalid('id','Use a real marketplace UUID.');return value;};
const noQuery=req=>object(req.query,[]);
const projection=(row,base)=>({id:row.asset_id,width:row.width,height:row.height,url:base+'/'+row.asset_id+'/gallery',thumbnail_url:base+'/'+row.asset_id+'/thumb',share_url:base+'/'+row.asset_id+'/share'});
export async function draftMedia(client,listingId) {
 const rows=(await client.query(`SELECT m.asset_id,v.width,v.height FROM listing_media m JOIN media_variants v ON v.asset_id=m.asset_id AND v.variant='gallery'
  WHERE m.listing_id=$1 AND m.removed_at IS NULL ORDER BY m.position`,[listingId])).rows;
 return rows.map(row=>projection(row,'/api/marketplace/listings/'+listingId+'/media'));
}
export async function submittedMedia(client,listingId,submissionId,admin=false) {
 const rows=(await client.query(`SELECT m.asset_id,v.width,v.height FROM listing_submission_media m JOIN media_variants v ON v.asset_id=m.asset_id AND v.variant='gallery'
  WHERE m.listing_id=$1 AND m.submission_id=$2 ORDER BY m.position`,[listingId,submissionId])).rows;
 const base=admin?`/api/admin/marketplace/listings/${listingId}/submissions/${submissionId}/media`:`/api/marketplace/public/listings/${listingId}/media`;
 return rows.map(row=>projection(row,base));
}
export async function freezeMedia(client,listingId,submissionId) {
 await client.query(`INSERT INTO listing_submission_media(submission_id,listing_id,asset_id,position)
  SELECT $2,listing_id,asset_id,position FROM listing_media WHERE listing_id=$1 AND removed_at IS NULL ORDER BY position`,[listingId,submissionId]);
}
async function image(client,store,asset,variant) {
 if(!['gallery','thumb','share'].includes(variant))fail(404,'NOT_FOUND','Photo not found.');
 const row=(await client.query('SELECT * FROM media_variants WHERE asset_id=$1 AND variant=$2',[asset,variant])).rows[0];
 if(!row)fail(404,'NOT_FOUND','Photo not found.');
 try{return {data:await store.read(asset,variant,row),type:row.mime_type};}
 catch{fail(404,'NOT_FOUND','Photo not found.');}
}
function sendImage(res,result) {
 res.set({'Content-Type':result.type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'inline','Cross-Origin-Resource-Policy':'same-origin'}).send(result.data);
}

export function mediaRouter({pool,config,session,lister,principal,owned,route,audit,update,statusHistory}) {
 const router=express.Router(),store=config.mediaEnabled?mediaStorage(config.mediaRoot):null;
 const path='/listings/:id/media';
 async function owner(client,req,version,write=false) {
  const actor=await session(client,req,config,false,true);await lister(client,actor.id,true);
  const subject=await principal(client,actor.id),own=await owned(client,id(req.params.id),actor.id);
  const a=(await client.query('SELECT * FROM property_authorities WHERE id=$1 FOR UPDATE',[own.authority_id])).rows[0];
  if(!a||a.principal_id!==subject||a.property_id!==own.property_id||a.status!=='active')fail(403,'PROPERTY_AUTHORITY_REQUIRED','Active property authority is required.');
  const p=(await client.query('SELECT archived_at FROM properties WHERE id=$1 FOR UPDATE',[own.property_id])).rows[0];
  const l=(await client.query('SELECT * FROM listings WHERE id=$1 FOR UPDATE',[own.id])).rows[0];
  if(!p||p.archived_at||l.archived_at)fail(404,'NOT_FOUND','Listing not found.');
  if(version!==undefined&&String(l.version)!==version)fail(409,'VERSION_CONFLICT','This listing changed. Reload it before changing photos.');
  if(write&&(!['draft','rejected'].includes(l.review_status)||l.market_status!=='unlisted'))fail(409,'DRAFT_ONLY','Only a private draft or rejected listing can change photos.');
  return {actor,subject,l};
 }
 const enabled=()=>{if(!store)fail(503,'MEDIA_UNAVAILABLE','Photo uploads are not configured yet. Your draft can still be saved without photos.');};
 async function changed(client,{actor,subject,l},action) {
  if(l.review_status==='rejected')await statusHistory(client,l.id,actor.id,'rejected','draft',l.availability_status,l.availability_status,'rejected listing photos revised as private draft');
  await update(client,'listings','id',l.id,{review_status:'draft',approved_submission_id:null},true);
  await audit(client,actor.id,subject,'listing',l.id,action,{old_version:String(l.version),new_version:String(BigInt(l.version)+1n)});
  return {ok:true,available:true,version:String(BigInt(l.version)+1n),review_status:'draft',media:await draftMedia(client,l.id)};
 }
 router.get(path,route(async(req,res)=>{
  noQuery(req);
  const result=await transaction(pool,async client=>{const {l}=await owner(client,req);return {ok:true,available:!!store,version:String(l.version),media:store?await draftMedia(client,l.id):[]};});
  res.json(result);
 }));
 const preflight=route(async(req,_res,next)=>{
  noQuery(req);enabled();
  const type=String(req.get('Content-Type')||'').toLowerCase();
  if(!PHOTO_TYPES.includes(type))fail(415,'IMAGE_TYPE_REJECTED','Use JPEG, PNG or WebP.');
  const version=expected(req.get('X-Listing-Version'));
  await transaction(pool,client=>owner(client,req,version,true));
  const bucket=createHmac('sha256',config.proxyKey).update('listing-photo:'+req.marketplaceActor.id).digest('hex');
  const now=new Date(),result=await pool.query(`INSERT INTO auth_rate_limits(bucket_hash,count,window_start) VALUES($1,1,$2)
   ON CONFLICT(bucket_hash) DO UPDATE SET count=CASE WHEN auth_rate_limits.window_start<$3 THEN 1 ELSE auth_rate_limits.count+1 END,
   window_start=CASE WHEN auth_rate_limits.window_start<$3 THEN $2 ELSE auth_rate_limits.window_start END RETURNING count`,[bucket,now,new Date(now.getTime()-3600000)]);
  if(result.rows[0].count>30)fail(429,'RATE_LIMITED','Please wait before uploading more photos.');
  req.photoVersion=version;next();
 });
 router.post(path,preflight,express.raw({type:PHOTO_TYPES,limit:MAX_PHOTO_BYTES}),route(async(req,res)=>{
  const processed=await processPhoto(req.body,req.get('Content-Type')),asset=uuidv7();let stored=false;
  try {
   const result=await transaction(pool,async client=>{
    const context=await owner(client,req,req.photoVersion,true),l=context.l;
    const counts=(await client.query('SELECT count(*)::int total,count(*) FILTER(WHERE removed_at IS NULL)::int active FROM listing_media WHERE listing_id=$1',[l.id])).rows[0];
    if(counts.active>=MAX_PHOTOS)fail(422,'PHOTO_LIMIT','Use up to 20 photos per listing.');
    if(counts.total>=100)fail(422,'PHOTO_HISTORY_LIMIT','This draft has reached its stored-photo limit. Contact BalhinBalay for help.');
    await store.write(asset,processed);stored=true;
    await client.query("INSERT INTO media_assets(id,owner_principal_id,created_by_user_id,media_type) VALUES($1,$2,$3,'IMAGE')",[asset,context.subject,context.actor.id]);
    for(const [variant,v] of Object.entries(processed))await client.query('INSERT INTO media_variants(asset_id,variant,mime_type,width,height,byte_length,sha256) VALUES($1,$2,$3,$4,$5,$6,$7)',[asset,variant,v.mime_type,v.width,v.height,v.byte_length,v.sha256]);
    await client.query('INSERT INTO listing_media(listing_id,asset_id,position) VALUES($1,$2,$3)',[l.id,asset,counts.active]);
    return changed(client,context,'listing_photo_uploaded');
   });
   res.status(201).json(result);
  }catch(error){
   // A COMMIT network error is ambiguous: never delete possibly committed bytes.
   if(stored)try{const exists=await pool.query('SELECT 1 FROM media_assets WHERE id=$1',[asset]);if(!exists.rowCount)await store.removeUncommitted(asset);}catch{/* Retain private orphan for reviewed reconciliation. */}
   throw error;
  }
 }));
 router.patch(path,route(async(req,res)=>{
  noQuery(req);enabled();const data=object(req.body,['expected_version','asset_ids']),version=expected(data.expected_version);
  if(!Array.isArray(data.asset_ids)||data.asset_ids.length>MAX_PHOTOS||data.asset_ids.some(x=>!UUID.test(String(x)))||new Set(data.asset_ids).size!==data.asset_ids.length)invalid('asset_ids','Use a unique ordered list of up to 20 attached photo IDs.');
  const result=await transaction(pool,async client=>{
   const context=await owner(client,req,version,true),l=context.l;
   const current=(await client.query('SELECT asset_id FROM listing_media WHERE listing_id=$1 AND removed_at IS NULL ORDER BY position',[l.id])).rows.map(x=>x.asset_id);
   if(data.asset_ids.some(x=>!current.includes(x)))fail(422,'INVALID_PHOTO','Choose only photos currently attached to this draft.');
   await client.query(`UPDATE listing_media SET position=CASE WHEN asset_id=ANY($2::uuid[]) THEN array_position($2::uuid[],asset_id)-1 ELSE NULL END,
    removed_at=CASE WHEN asset_id=ANY($2::uuid[]) THEN NULL ELSE now() END WHERE listing_id=$1 AND removed_at IS NULL`,[l.id,data.asset_ids]);
   return changed(client,context,'listing_photos_reordered');
  });res.json(result);
 }));
 router.get(path+'/:asset/:variant',route(async(req,res)=>{
  noQuery(req);enabled();const asset=id(req.params.asset);
  const result=await transaction(pool,async client=>{
   const {l}=await owner(client,req);
   if(!(await client.query('SELECT 1 FROM listing_media WHERE listing_id=$1 AND asset_id=$2 AND removed_at IS NULL',[l.id,asset])).rowCount)fail(404,'NOT_FOUND','Photo not found.');
   return image(client,store,asset,req.params.variant);
  });sendImage(res,result);
 }));
 router.use((error,_req,res,next)=>{if(error.type==='entity.too.large')return res.status(413).json({ok:false,code:'PHOTO_TOO_LARGE',message:'Each photo must be 8 MiB or smaller.'});next(error);});
 return router;
}
export function adminMediaRouter({pool,config,session,route}) {
 const router=express.Router();
 router.get('/listings/:id/submissions/:submission/media/:asset/:variant',route(async(req,res)=>{
  noQuery(req);if(!config.mediaEnabled)fail(404,'NOT_FOUND','Photo not found.');
  const listing=id(req.params.id),submission=id(req.params.submission),asset=id(req.params.asset);
  const result=await transaction(pool,async client=>{
   await session(client,req,config,true,true);
   if(!(await client.query('SELECT 1 FROM listing_submission_media WHERE listing_id=$1 AND submission_id=$2 AND asset_id=$3',[listing,submission,asset])).rowCount)fail(404,'NOT_FOUND','Photo not found.');
   return image(client,mediaStorage(config.mediaRoot),asset,req.params.variant);
  });sendImage(res,result);
 }));return router;
}
export function publicMediaRouter({pool,config,route,eligiblePublicListing}) {
 const router=express.Router();
 router.get('/listings/:id/media/:asset/:variant',route(async(req,res)=>{
  noQuery(req);if(!config.mediaEnabled)fail(404,'NOT_FOUND','Photo not found.');
  const listing=id(req.params.id),asset=id(req.params.asset);
  const result=await transaction(pool,async client=>{
   const found=await eligiblePublicListing(client,listing,true);
   if(!found||!(await client.query('SELECT 1 FROM listing_submission_media WHERE listing_id=$1 AND submission_id=$2 AND asset_id=$3',[listing,found.approved.submission.id,asset])).rowCount)fail(404,'NOT_FOUND','Photo not found.');
   return image(client,mediaStorage(config.mediaRoot),asset,req.params.variant);
  });sendImage(res,result);
 }));return router;
}
