import express from 'express';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {MarketplaceError,invalid,object,expected,UUID,POLICY,LISTING_FIELDS,PROPERTY_FIELDS,DETAIL_FIELDS,RENT_FIELDS,fields,applicability,submissionErrors} from './marketplace-validation.js';

export const PUBLICATION_POLICY='marketplace_publication_v1';
const fail=(status,code,message)=>{throw new MarketplaceError(status,code,message);};
const realId=value=>{if(!UUID.test(String(value||'')))invalid('id','Use a real marketplace UUID.');return value;};
const nonnull=value=>Object.fromEntries(Object.entries(value).filter(([,v])=>v!=null));
const pick=(value,keys)=>Object.fromEntries(keys.map(k=>[k,value[k]??null]));

// Validate the frozen content again at publication. Never validate/project the
// mutable aggregate instead. Unknown/private fields cannot enter the projection.
export function publicationContent(payload,authority) {
 object(payload,['listing','property','details','rental_terms','sale_terms','development']);
 const frozen=object(payload.listing,LISTING_FIELDS);
 // pg DATE values in existing immutable submissions serialize as midnight ISO.
 // Accept that canonical representation without changing the stored submission.
 const date=frozen.available_from;
 const l=fields({...frozen,...(typeof date==='string'&&/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(date)?{available_from:date.slice(0,10)}:{})},LISTING_FIELDS,'listing');
 const p=fields(object(payload.property,PROPERTY_FIELDS),PROPERTY_FIELDS,'property');
 const d=fields(object(payload.details,DETAIL_FIELDS),DETAIL_FIELDS,'details');
 const r=fields(object(payload.rental_terms,RENT_FIELDS),RENT_FIELDS,'rental_terms');
 const s=fields(object(payload.sale_terms,['payment_notes']),['payment_notes'],'sale_terms');
 const development=payload.development===null?null:fields(object(payload.development,['name','development_type']),['name','development_type'],'development');
 applicability(p,d,nonnull(r),l.transaction_type);
 if(l.transaction_type!=='SALE'&&Object.keys(nonnull(s)).length)invalid('sale_terms','Only SALE has sale terms.');
 const errors=submissionErrors({listing:l,property:p,details:d,rental_terms:r,authority,development});
 if(Object.keys(errors).length)throw new MarketplaceError(422,'PUBLICATION_INVALID','Approved content does not satisfy publication requirements.',errors);
 return {listing:l,property:p,details:d,rental_terms:r,sale_terms:s,development};
}

async function approved(client,l,a) {
 if(l.review_status!=='approved'||!l.approved_submission_id||l.archived_at)fail(409,'APPROVAL_REQUIRED','A current approved submission is required.');
 const s=(await client.query(`SELECT s.* FROM listing_submissions s JOIN listing_submission_reviews r
   ON r.submission_id=s.id AND r.listing_id=s.listing_id AND r.outcome='approved'
   AND r.listing_version=s.listing_version+1
   WHERE s.id=$1 AND s.listing_id=$2 AND r.listing_version<$3
   AND NOT EXISTS(SELECT 1 FROM listing_submissions newer WHERE newer.listing_id=s.listing_id AND newer.listing_version>s.listing_version)`,[l.approved_submission_id,l.id,l.version])).rows[0];
 if(!s||s.validation_policy_version!==POLICY)fail(409,'APPROVAL_REQUIRED','A matching current reviewed submission is required.');
 const content=publicationContent(s.payload,a),p=content.property;
 const location=(await client.query('SELECT c.name AS city,b.name AS barangay FROM cities c JOIN barangays b ON b.city_id=c.id WHERE c.id=$1 AND b.id=$2',[p.city_id,p.barangay_id])).rows[0];
 if(!location)fail(422,'PUBLICATION_INVALID','Approved city and barangay must be recognised.');
 if(p.development_id) {
  const dev=(await client.query('SELECT development_type FROM developments WHERE id=$1 AND archived_at IS NULL',[p.development_id])).rows[0];
  if(!dev||dev.development_type!==content.development?.development_type)fail(422,'PUBLICATION_INVALID','Approved building context is unavailable.');
 }
 if(p.parent_property_id) {
  const parent=await client.query("SELECT 1 FROM properties WHERE id=$1 AND archived_at IS NULL AND property_type IN ('CONDO','APARTMENT','HOUSE','TOWNHOUSE')",[p.parent_property_id]);
  if(!parent.rowCount)fail(422,'PUBLICATION_INVALID','Approved residential parent is unavailable.');
 }
 return {submission:s,content,location};
}

export function publicProjection(l,{content,location}) {
 const building=['CONDO','APARTMENT','ROOM'].includes(content.property.property_type)&&
  content.property.development_id&&['CONDOMINIUM','APARTMENT_BUILDING','BOARDING_HOUSE'].includes(content.development?.development_type);
 // Public disclosure is a separate server-managed, explicitly confirmed field.
 // Never copy private exact_location, generate offsets/centres or infer consent.
 // Unresolved standalone-property pin policy is not implemented in this slice.
 const point=building&&l.location_confirmed_at&&Number.isFinite(l.public_lat)&&Number.isFinite(l.public_lng)?{lat:l.public_lat,lng:l.public_lng}:null;
 return {id:l.id,published_at:l.published_at,...pick(content.listing,LISTING_FIELDS),
  property:pick(content.property,['property_type','bedrooms','bathrooms','parking_spaces','floor_area_sqm','lot_area_sqm','furnishing']),
  details:pick(content.details,DETAIL_FIELDS),rental_terms:content.listing.transaction_type==='RENT'?pick(content.rental_terms,RENT_FIELDS):null,
  sale_terms:content.listing.transaction_type==='SALE'?pick(content.sale_terms,['payment_notes']):null,
  development:content.development?pick(content.development,['name','development_type']):null,location:{city:location.city,barangay:location.barangay,map_point:point}};
}

export function publicListingRouter({pool,route}) {
 const router=express.Router();
 router.get('/listings/:id',route(async(req,res)=>{
  const notFound=()=>res.status(404).json({ok:false,code:'NOT_FOUND',message:'Listing not found.'});
  if(!UUID.test(String(req.params.id))||Object.keys(req.query).length)return notFound();
  const row=(await pool.query(`SELECT l.*,a.relationship,a.verification_state,a.status AS authority_status,
    ST_Y(l.public_map_point::geometry) AS public_lat,ST_X(l.public_map_point::geometry) AS public_lng
    FROM listings l JOIN properties prop ON prop.id=l.property_id AND prop.archived_at IS NULL
    JOIN principals p ON p.id=l.owner_principal_id AND p.kind='USER' AND p.archived_at IS NULL
    JOIN users u ON u.id=p.user_id AND u.status='active' AND u.email_verified_at IS NOT NULL AND u.deleted_at IS NULL AND u.anonymised_at IS NULL
    JOIN lister_access c ON c.user_id=u.id AND c.status='active'
    JOIN property_authorities a ON a.id=l.authority_id AND a.property_id=l.property_id AND a.principal_id=l.owner_principal_id
      AND a.status='active' AND a.verification_state='verified'
    WHERE l.id=$1 AND l.review_status='approved' AND l.market_status='active' AND l.archived_at IS NULL AND l.published_at IS NOT NULL`,[req.params.id])).rows[0];
  if(!row)return notFound();
  try {
   const result=await approved(pool,row,{status:row.authority_status,verification_state:row.verification_state});
   res.json({ok:true,listing:publicProjection(row,result)});
  }catch(error){if(error instanceof MarketplaceError)return notFound();throw error;}
 }));
 return router;
}

export function publicationRouter({pool,config,session,route,lister,principal,owned,audit,update}) {
 const router=express.Router();
 for(const action of ['activate','unlist'])router.post('/listings/:id/'+action,route(async(req,res)=>{
  const id=realId(req.params.id),data=object(req.body,['expected_version']),version=expected(data.expected_version);
  const result=await transaction(pool,async client=>{
   const actor=await session(client,req,config,false,true);await lister(client,actor.id,true);const subject=await principal(client,actor.id);
   const own=await owned(client,id,actor.id);
   const a=(await client.query('SELECT * FROM property_authorities WHERE id=$1 FOR UPDATE',[own.authority_id])).rows[0];
   if(!a||a.property_id!==own.property_id||a.principal_id!==subject||a.status!=='active'||a.verification_state!=='verified')fail(403,'PROPERTY_AUTHORITY_REQUIRED','Exact active manually approved property authority is required.');
   const p=(await client.query('SELECT archived_at FROM properties WHERE id=$1 FOR UPDATE',[own.property_id])).rows[0];
   const l=(await client.query('SELECT * FROM listings WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(String(l.version)!==version)fail(409,'VERSION_CONFLICT','This listing changed. Reload before changing publication.');
   if(!p||p.archived_at||l.archived_at||l.review_status!=='approved'||l.market_status!==(action==='activate'?'unlisted':'active'))fail(409,'PUBLICATION_STATE_CONFLICT','This listing cannot make that publication transition.');
   if(action==='activate')await approved(client,l,a);
   const next=action==='activate'?'active':'unlisted';
   await update(client,'listings','id',id,{market_status:next,...(action==='activate'&&!l.published_at?{published_at:new Date()}:{})},true);
   await client.query(`INSERT INTO listing_status_history(id,listing_id,acting_user_id,old_review_status,new_review_status,old_market_status,new_market_status,old_availability_status,new_availability_status,reason)
    VALUES($1,$2,$3,'approved','approved',$4,$5,$6,$6,$7)`,[uuidv7(),id,actor.id,l.market_status,next,l.availability_status,'Lister '+action]);
   await audit(client,actor.id,subject,'listing',id,'listing_'+action,{submission_id:l.approved_submission_id,old_market_status:l.market_status,new_market_status:next,old_version:l.version,new_version:String(BigInt(l.version)+1n),policy:PUBLICATION_POLICY});
   return {id,review_status:l.review_status,market_status:next,version:String(BigInt(l.version)+1n)};
  });
  res.json({ok:true,listing:result});
 }));
 return router;
}
