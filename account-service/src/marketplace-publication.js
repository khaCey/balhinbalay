import express from 'express';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {MarketplaceError,invalid,object,expected,UUID,POLICY,LISTING_FIELDS,PROPERTY_FIELDS,DETAIL_FIELDS,RENT_FIELDS,fields,applicability,submissionErrors} from './marketplace-validation.js';

export const PUBLICATION_POLICY='marketplace_publication_v1';
// Public collection and detail share the same eligibility boundary.
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

export async function approvedPublication(client,l,a) {
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

const PUBLIC_CANDIDATES=`SELECT l.*,a.relationship,a.verification_state,a.status AS authority_status,
    ST_Y(l.public_map_point::geometry) AS public_lat,ST_X(l.public_map_point::geometry) AS public_lng
    FROM listings l JOIN properties prop ON prop.id=l.property_id AND prop.archived_at IS NULL
    JOIN principals p ON p.id=l.owner_principal_id AND p.kind='USER' AND p.archived_at IS NULL
    JOIN users u ON u.id=p.user_id AND u.status='active' AND u.email_verified_at IS NOT NULL AND u.deleted_at IS NULL AND u.anonymised_at IS NULL
    JOIN lister_access c ON c.user_id=u.id AND c.status='active'
    JOIN property_authorities a ON a.id=l.authority_id AND a.property_id=l.property_id AND a.principal_id=l.owner_principal_id
      AND a.status='active' AND a.verification_state='verified'
    WHERE l.review_status='approved' AND l.market_status='active' AND l.archived_at IS NULL AND l.published_at IS NOT NULL`;

const integer=(value,defaultValue,max)=>{
 if(value===undefined)return defaultValue;
 if(!/^\d+$/.test(String(value))||Number(value)>max)invalid('pagination','Use a valid page and limit.');
 return Number(value);
};
const amount=(value,key)=>{
 if(value===undefined)return null;
 if(!/^(?:\d+)(?:\.\d{1,4})?$/.test(String(value))||!Number.isFinite(Number(value)))invalid(key,'Use a valid number.');
 return Number(value);
};

export function publicSearchOptions(query) {
 object(query,['page','limit','sort','transaction_type','city','property_type','min_price','max_price','min_bedrooms','min_bathrooms','min_floor_area','keyword']);
 const page=integer(query.page,1,100000),limit=integer(query.limit,20,50);
 if(page<1||limit<1)invalid('pagination','Use a valid page and limit.');
 const sort=query.sort??'newest';
 if(!['newest','price_asc','price_desc','area_asc','area_desc'].includes(sort))invalid('sort','Unsupported sort.');
 const transaction_type=query.transaction_type??null;
 if(transaction_type!==null&&!['RENT','SALE'].includes(transaction_type))invalid('transaction_type','Unsupported transaction type.');
 const property_type=query.property_type??null;
 if(property_type!==null&&!['CONDO','APARTMENT','HOUSE','TOWNHOUSE','ROOM','LAND'].includes(property_type))invalid('property_type','Unsupported property type.');
 const city=query.city===undefined?null:String(query.city).trim();
 const keyword=query.keyword===undefined?null:String(query.keyword).trim();
 if((city&&city.length>100)||(keyword&&keyword.length>200))invalid('search','Search text is too long.');
 const min_price=amount(query.min_price,'min_price'),max_price=amount(query.max_price,'max_price');
 const min_bedrooms=amount(query.min_bedrooms,'min_bedrooms'),min_bathrooms=amount(query.min_bathrooms,'min_bathrooms'),min_floor_area=amount(query.min_floor_area,'min_floor_area');
 if(min_price!==null&&max_price!==null&&min_price>max_price)invalid('price','Maximum price must be at least minimum price.');
 return {page,limit,sort,transaction_type,property_type,city,keyword,min_price,max_price,min_bedrooms,min_bathrooms,min_floor_area};
}

export function searchPublicProjections(listings,options) {
 const text=value=>String(value??'').toLocaleLowerCase();
 const words=text(options.keyword).split(/\s+/).filter(Boolean);
 const result=listings.filter(l=>{
  const price=Number(l.price_amount),property=l.property||{};
  if(options.transaction_type&&l.transaction_type!==options.transaction_type)return false;
  if(options.property_type&&property.property_type!==options.property_type)return false;
  if(options.city&&text(l.location.city)!==text(options.city))return false;
  if(options.min_price!==null&&price<options.min_price)return false;
  if(options.max_price!==null&&price>options.max_price)return false;
  if(options.min_bedrooms!==null&&Number(property.bedrooms)<options.min_bedrooms)return false;
  if(options.min_bathrooms!==null&&Number(property.bathrooms)<options.min_bathrooms)return false;
  if(options.min_floor_area!==null&&Number(property.floor_area_sqm)<options.min_floor_area)return false;
  const haystack=text([l.title,l.description,l.location.city,l.location.barangay].join(' '));
  return words.every(word=>haystack.includes(word));
 });
 const value=l=>options.sort.startsWith('price')?Number(l.price_amount):options.sort.startsWith('area')?Number(l.property.floor_area_sqm):new Date(l.published_at).getTime();
 const direction=options.sort==='price_asc'||options.sort==='area_asc'?1:-1;
 result.sort((a,b)=>{
  const av=value(a),bv=value(b);
  if(!Number.isFinite(av)&&Number.isFinite(bv))return 1;
  if(Number.isFinite(av)&&!Number.isFinite(bv))return -1;
  return direction*(av-bv)||a.id.localeCompare(b.id);
 });
 const offset=(options.page-1)*options.limit;
 return {listings:result.slice(offset,offset+options.limit),page:options.page,limit:options.limit,total:result.length,has_more:offset+options.limit<result.length};
}

export function publicListingRouter({pool,route}) {
 const router=express.Router();
 router.get('/listings',route(async(req,res)=>{
  const options=publicSearchOptions(req.query);
  const rows=(await pool.query(`${PUBLIC_CANDIDATES} ORDER BY l.id`)).rows;
  const listings=[];
  for(const row of rows)try{
   const approved=await approvedPublication(pool,row,{status:row.authority_status,verification_state:row.verification_state});
   listings.push(publicProjection(row,approved));
  }catch(error){if(!(error instanceof MarketplaceError))throw error;}
  res.json({ok:true,...searchPublicProjections(listings,options)});
 }));
 router.get('/listings/:id',route(async(req,res)=>{
  const notFound=()=>res.status(404).json({ok:false,code:'NOT_FOUND',message:'Listing not found.'});
  if(!UUID.test(String(req.params.id))||Object.keys(req.query).length)return notFound();
  const row=(await pool.query(`${PUBLIC_CANDIDATES} AND l.id=$1`,[req.params.id])).rows[0];
  if(!row)return notFound();
  try {
   const result=await approvedPublication(pool,row,{status:row.authority_status,verification_state:row.verification_state});
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
   if(action==='activate')await approvedPublication(client,l,a);
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
