import express from 'express';
import {messagingRouter} from './marketplace-messaging.js';
import {createHash,timingSafeEqual} from 'node:crypto';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {MarketplaceError,invalid,object,fields,expected,UUID,RELATIONSHIPS,LISTING_FIELDS,PROPERTY_FIELDS,DETAIL_FIELDS,RENT_FIELDS,PRIVATE_FIELDS,applicability,submissionErrors,snapshot,POLICY} from './marketplace-validation.js';

const fail=(status,code,message)=>{throw new MarketplaceError(status,code,message);};
const sha=value=>createHash('sha256').update(value).digest('hex');
const cookie=(req,name)=>String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';
const sameSecret=(a,b)=>{const left=Buffer.from(String(a||'')),right=Buffer.from(String(b||''));return left.length===right.length&&timingSafeEqual(left,right);};
const route=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(error=>{
  if(error instanceof MarketplaceError)return res.status(error.status).json({ok:false,code:error.code,message:error.message,...(error.fields?{fields:error.fields}:{})});
  if(['23503','23514','22P02','22003','22007','22008'].includes(error.code))return res.status(422).json({ok:false,code:'INVALID_INPUT',message:'The supplied fields or relationships are invalid.'});
  console.error('Marketplace request failed:',error.code||error.name);
  res.status(503).json({ok:false,code:'MARKETPLACE_UNAVAILABLE',message:'Listings could not be reached. Try again later.'});
});
const uuid=value=>{if(!UUID.test(String(value||'')))invalid('id','Use a real marketplace UUID.');return value;};
const capProjection=row=>row?{status:row.status,version:row.version,requested_at:row.requested_at}:null;
const authorityProjection=row=>({id:row.id,relationship:row.relationship,status:row.status,verification_state:row.verification_state,version:row.version});
const extension={CONDO:'condo_details',APARTMENT:'apartment_details',HOUSE:'house_details',TOWNHOUSE:'townhouse_details',ROOM:'room_details',LAND:'land_details'};
const extensionFields={CONDO:['floor_number'],APARTMENT:['floor_number'],HOUSE:['storeys','year_built'],TOWNHOUSE:['storeys','year_built'],ROOM:['max_occupants','bathroom_access'],LAND:[]};

function proxy(config) {
  return route(async(req,res,next)=>{
    if(!sameSecret(config.proxyKey,req.get('x-balhinbalay-proxy-key')))fail(403,'FORBIDDEN','Forbidden.');
    if(req.method!=='GET'&&req.get('origin')!==config.appOrigin)fail(403,'ORIGIN_REJECTED','Forbidden.');
    res.set('Cache-Control','no-store');next();
  });
}
async function session(client,req,config,admin=false,lock=false) {
  const raw=cookie(req,admin?'__Host-bb_admin_session':'__Host-bb_session');
  if(!raw||raw.length>200)fail(401,'UNAUTHENTICATED',admin?'Admin sign-in required.':'Sign in required.');
  const result=await client.query(`SELECT u.id,u.email,s.id AS session_id FROM auth_sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.purpose=$2 AND s.revoked_at IS NULL AND s.expires_at>now()
    AND u.status='active' AND u.email_verified_at IS NOT NULL AND u.deleted_at IS NULL AND u.anonymised_at IS NULL
    ${lock?'FOR SHARE OF u,s':''}`,[sha(admin?'admin:'+raw:raw),admin?'admin':'user']);
  const actor=result.rows[0];
  if(!actor)fail(401,'UNAUTHENTICATED','Sign in required.');
  if(admin&&!new Set(config.adminEmails||[]).has(actor.email.toLowerCase()))fail(403,'ADMIN_FORBIDDEN','Admin access required.');
  return actor;
}
async function lister(client,userId,lock=false) {
  const result=await client.query(`SELECT * FROM lister_access WHERE user_id=$1 ${lock?'FOR UPDATE':''}`,[userId]);
  if(result.rows[0]?.status!=='active')fail(403,'LISTER_ACCESS_REQUIRED','Active Lister access is required.');
  return result.rows[0];
}
async function principal(client,userId) {
  const result=await client.query("SELECT id FROM principals WHERE kind='USER' AND user_id=$1 AND archived_at IS NULL",[userId]);
  if(!result.rowCount)fail(503,'MARKETPLACE_UNAVAILABLE','The marketplace identity is not available.');
  return result.rows[0].id;
}
async function audit(client,actor,subject,type,id,action,metadata={}) {
  await client.query('INSERT INTO audit_events(id,actor_user_id,acting_principal_id,entity_type,entity_uuid,action,metadata) VALUES($1,$2,$3,$4,$5,$6,$7)',[uuidv7(),actor,subject,type,id,action,metadata]);
}
async function owned(client,id,userId) {
  const result=await client.query(`SELECT l.* FROM listings l JOIN principals p ON p.id=l.owner_principal_id WHERE l.id=$1 AND p.kind='USER' AND p.user_id=$2`,[id,userId]);
  if(!result.rowCount)fail(404,'NOT_FOUND','Listing not found.');
  return result.rows[0];
}
async function aggregate(client,l) {
  const p=(await client.query('SELECT * FROM properties WHERE id=$1',[l.property_id])).rows[0];
  const a=(await client.query('SELECT * FROM property_authorities WHERE id=$1',[l.authority_id])).rows[0];
  const d=p.property_type?(await client.query(`SELECT * FROM ${extension[p.property_type]} WHERE property_id=$1`,[p.id])).rows[0]||{}:{};
  const r=(await client.query('SELECT * FROM rental_terms WHERE listing_id=$1',[l.id])).rows[0]||{};
  const s=(await client.query('SELECT * FROM sale_terms WHERE listing_id=$1',[l.id])).rows[0]||{};
  const location=(await client.query('SELECT street_address,unit_identifier,room_identifier,version FROM property_private_locations WHERE property_id=$1',[p.id])).rows[0]||{};
  const dev=p.development_id?(await client.query('SELECT id,name,development_type,archived_at FROM developments WHERE id=$1',[p.development_id])).rows[0]:null;
  return {listing:l,property:p,authority:authorityProjection(a),details:d,rental_terms:r,sale_terms:s,private_location:location,development:dev};
}
async function update(client,table,idField,id,values,increment=false) {
  const entries=Object.entries(values);
  if(!entries.length&&!increment)return;
  const setters=entries.map(([key],i)=>`${key}=$${i+2}`);
  if(increment)setters.push('version=version+1','updated_at=now()');
  await client.query(`UPDATE ${table} SET ${setters.join(',')} WHERE ${idField}=$1`,[id,...entries.map(([,value])=>value)]);
}
async function replace(client,table,idField,id,keys,values) {
  await client.query(`DELETE FROM ${table} WHERE ${idField}=$1`,[id]);
  const all=[idField,...keys];
  await client.query(`INSERT INTO ${table}(${all.join(',')}) VALUES(${all.map((_,i)=>'$'+(i+1)).join(',')})`,[id,...keys.map(k=>values[k]??null)]);
}
function body(req,create=false) {
  return object(req.body,['listing','property','details','rental_terms','sale_terms','private_location','relationship','development',...(create?['property_id','authority_id']:['expected_version','expected_property_version','expected_authority_version'])]);
}
async function development(client,actor,subject,value) {
  const data=fields(value,['name','development_type','city_id','barangay_id','year_completed','floor_count'],'development');
  const id=uuidv7();
  await client.query('INSERT INTO developments(id,created_by_user_id,managing_principal_id) VALUES($1,$2,$3)',[id,actor,subject]);
  await update(client,'developments','id',id,data);
  return id;
}
async function validateContext(client,p,subject) {
  if(p.development_id) {
    const result=await client.query('SELECT 1 FROM developments WHERE id=$1 AND archived_at IS NULL AND (managing_principal_id=$2 OR created_by_user_id=(SELECT user_id FROM principals WHERE id=$2))',[p.development_id,subject]);
    if(!result.rowCount)invalid('property.development_id','Choose your authorised building context.');
  }
  if(p.parent_property_id) {
    const result=await client.query("SELECT 1 FROM properties p JOIN property_authorities a ON a.property_id=p.id WHERE p.id=$1 AND a.principal_id=$2 AND a.status='active' AND p.archived_at IS NULL",[p.parent_property_id,subject]);
    if(!result.rowCount)invalid('property.parent_property_id','Choose your authorised residential parent.');
  }
}
async function save(client,current,data,actor,subject) {
  const p={...current.property,...fields(data.property,PROPERTY_FIELDS,'property')};
  if(data.development!==undefined)p.development_id=await development(client,actor,subject,data.development);
  const l={...current.listing,...fields(data.listing,LISTING_FIELDS,'listing')};
  const typeChanged=p.property_type!==current.property.property_type;
  const transactionChanged=l.transaction_type!==current.listing.transaction_type;
  const d={...(typeChanged?{}:current.details),...fields(data.details,DETAIL_FIELDS,'details')};
  const r={...(transactionChanged?{}:current.rental_terms),...fields(data.rental_terms,RENT_FIELDS,'rental_terms')};
  const s={...(transactionChanged?{}:current.sale_terms),...fields(data.sale_terms,['payment_notes'],'sale_terms')};
  if(l.transaction_type!=='SALE'&&data.sale_terms&&Object.keys(data.sale_terms).length)invalid('sale_terms','Only SALE has sale terms.');
  applicability(p,d,r,l.transaction_type);
  await validateContext(client,p,subject);
  const old=current.listing,oldPeriod=current.rental_terms.pricing_period??null;
  if(old.price_amount!==l.price_amount||old.currency_code!==l.currency_code||oldPeriod!==(r.pricing_period??null))
    await client.query('INSERT INTO listing_price_history(id,listing_id,acting_user_id,old_amount,new_amount,old_currency,new_currency,old_period,new_period) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[uuidv7(),l.id,actor,old.price_amount,l.price_amount,old.currency_code,l.currency_code,oldPeriod,r.pricing_period??null]);
  if(old.availability_status!==l.availability_status)await statusHistory(client,l.id,actor,old.review_status,old.review_status,old.availability_status,l.availability_status,'draft availability changed');
  await update(client,'properties','id',p.id,Object.fromEntries(PROPERTY_FIELDS.map(k=>[k,p[k]??null])),true);
  for(const table of Object.values(extension))await client.query(`DELETE FROM ${table} WHERE property_id=$1`,[p.id]);
  if(p.property_type)await replace(client,extension[p.property_type],'property_id',p.id,extensionFields[p.property_type],d);
  await client.query('DELETE FROM rental_terms WHERE listing_id=$1',[l.id]);
  await client.query('DELETE FROM sale_terms WHERE listing_id=$1',[l.id]);
  if(l.transaction_type==='RENT')await replace(client,'rental_terms','listing_id',l.id,RENT_FIELDS,r);
  if(l.transaction_type==='SALE')await replace(client,'sale_terms','listing_id',l.id,['payment_notes'],s);
  if(data.private_location!==undefined) {
    const location=fields(data.private_location,PRIVATE_FIELDS,'private_location');
    await client.query('INSERT INTO property_private_locations(property_id) VALUES($1) ON CONFLICT DO NOTHING',[p.id]);
    await update(client,'property_private_locations','property_id',p.id,location,true);
  }
  if(data.relationship!==undefined&&data.relationship!==current.authority.relationship) {
    if(!RELATIONSHIPS.includes(data.relationship))invalid('relationship','Declare a supported property relationship.');
    if(expected(data.expected_authority_version,'expected_authority_version')!==String(current.authority.version))fail(409,'VERSION_CONFLICT','The property authority changed. Reload before saving.');
    await update(client,'property_authorities','id',current.authority.id,{relationship:data.relationship,verification_state:'declared',verified_at:null,verified_by_user_id:null},true);
  }
  await update(client,'listings','id',l.id,Object.fromEntries(LISTING_FIELDS.map(k=>[k,l[k]??null])),true);
  await audit(client,actor,subject,'listing',l.id,'draft_saved',{property_id:p.id});
  return aggregate(client,(await client.query('SELECT * FROM listings WHERE id=$1',[l.id])).rows[0]);
}
async function statusHistory(client,id,actor,oldReview,newReview,oldAvailability,newAvailability,reason) {
  await client.query(`INSERT INTO listing_status_history(id,listing_id,acting_user_id,old_review_status,new_review_status,old_market_status,new_market_status,old_availability_status,new_availability_status,reason)
    VALUES($1,$2,$3,$4,$5,'unlisted','unlisted',$6,$7,$8)`,[uuidv7(),id,actor,oldReview,newReview,oldAvailability,newAvailability,reason]);
}

export function mountMarketplace(app,{pool,config}) {
  const router=express.Router();
  router.use(proxy(config),route(async(req,res,next)=>{req.marketplaceActor=await session(pool,req,config);next();}));
  router.get('/me/lister-access',route(async(req,res)=>{
    const result=await pool.query('SELECT * FROM lister_access WHERE user_id=$1',[req.marketplaceActor.id]);
    res.json({ok:true,lister_access:capProjection(result.rows[0])});
  }));
  router.post('/me/lister-access',route(async(req,res)=>{
    object(req.body||{},[]);
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,false,true),subject=await principal(client,actor.id);
      const row=await client.query("INSERT INTO lister_access(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING RETURNING *",[actor.id]);
      if(row.rowCount)await audit(client,actor.id,subject,'lister_access',actor.id,'capability_requested');
      return (await client.query('SELECT * FROM lister_access WHERE user_id=$1',[actor.id])).rows[0];
    });
    res.json({ok:true,lister_access:capProjection(result)});
  }));
  router.get('/reference-data',route(async(req,res)=>{
    const keys=Object.keys(req.query);if(keys.some(k=>!['city_id','city_query'].includes(k)))invalid('query','Unsupported query parameter.');
    const city=req.query.city_id?uuid(req.query.city_id):null;
    const search=String(req.query.city_query||'');if(search.length>100)invalid('city_query','Use at most 100 characters.');
    const subject=await principal(pool,req.marketplaceActor.id);
    const cities=await pool.query("SELECT id,code,name FROM cities WHERE strpos(lower(name),lower($1))>0 OR id=$2 ORDER BY (id=$2) DESC NULLS LAST,name,id LIMIT 100",[search,city]);
    const barangays=city?await pool.query('SELECT id,code,name FROM barangays WHERE city_id=$1 ORDER BY name,id LIMIT 1000',[city]):{rows:[]};
    const buildings=await pool.query('SELECT id,name,development_type FROM developments WHERE archived_at IS NULL AND managing_principal_id=$1 ORDER BY id DESC LIMIT 100',[subject]);
    const parents=await pool.query("SELECT DISTINCT p.id,p.property_type FROM properties p JOIN property_authorities a ON a.property_id=p.id WHERE a.principal_id=$1 AND a.status='active' AND p.archived_at IS NULL AND p.property_type IN ('CONDO','APARTMENT','HOUSE','TOWNHOUSE') ORDER BY p.id DESC LIMIT 100",[subject]);
    res.json({ok:true,cities:cities.rows,barangays:barangays.rows,developments:buildings.rows,parents:parents.rows,currencies:(await pool.query('SELECT code,minor_units FROM currencies ORDER BY code')).rows});
  }));
  router.get('/me/listings',route(async(req,res)=>{
    if(Object.keys(req.query).some(k=>!['before','limit'].includes(k)))invalid('query','Unsupported query parameter.');
    const before=req.query.before?uuid(req.query.before):null;
    const limit=req.query.limit===undefined?20:Number(req.query.limit);if(!Number.isInteger(limit)||limit<1||limit>100)invalid('limit','Use 1 to 100.');
    const result=await pool.query(`SELECT l.id,l.title,l.review_status,l.market_status,l.version,l.created_at FROM listings l JOIN principals p ON p.id=l.owner_principal_id
      WHERE p.kind='USER' AND p.user_id=$1 AND ($2::uuid IS NULL OR l.id<$2) ORDER BY l.id DESC LIMIT $3`,[req.marketplaceActor.id,before,limit+1]);
    const more=result.rows.length>limit,rows=result.rows.slice(0,limit);
    res.json({ok:true,listings:rows,next_cursor:more?rows.at(-1).id:null});
  }));
  router.post('/listings',route(async(req,res)=>{
    const data=body(req,true);
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,false,true);await lister(client,actor.id,true);const subject=await principal(client,actor.id);
      let propertyId,authorityId;
      if(data.property_id) {
        propertyId=uuid(data.property_id);authorityId=uuid(data.authority_id);
        if(['property','details','private_location','relationship','development'].some(k=>data[k]!==undefined))invalid('property_id','Create the advert first, then use a versioned owned draft save.');
        const authority=await client.query("SELECT 1 FROM property_authorities WHERE id=$1 AND property_id=$2 AND principal_id=$3 AND status='active' FOR UPDATE",[authorityId,propertyId,subject]);
        if(!authority.rowCount)fail(404,'NOT_FOUND','Property not found.');
        await client.query('SELECT id FROM properties WHERE id=$1 FOR UPDATE',[propertyId]);
      } else {
        if(data.authority_id!==undefined)invalid('authority_id','Authority is server-derived for a new property.');
        if(!RELATIONSHIPS.includes(data.relationship))invalid('relationship','Declare your relationship to the property.');
        propertyId=uuidv7();authorityId=uuidv7();
        await client.query('INSERT INTO properties(id,created_by_user_id) VALUES($1,$2)',[propertyId,actor.id]);
        await client.query('INSERT INTO property_authorities(id,property_id,principal_id,relationship) VALUES($1,$2,$3,$4)',[authorityId,propertyId,subject,data.relationship]);
        await audit(client,actor.id,subject,'property_authority',authorityId,'authority_declared',{property_id:propertyId,relationship:data.relationship});
      }
      const id=uuidv7();
      await client.query('INSERT INTO listings(id,property_id,owner_principal_id,authority_id,created_by_user_id,responsible_lister_user_id) VALUES($1,$2,$3,$4,$5,$5)',[id,propertyId,subject,authorityId,actor.id]);
      await statusHistory(client,id,actor.id,null,'draft',null,null,'private draft created');
      const current=await aggregate(client,(await client.query('SELECT * FROM listings WHERE id=$1',[id])).rows[0]);
      if(data.property_id) {
        // Existing physical facts must never be saved without an expected version.
        const l=fields(data.listing,LISTING_FIELDS,'listing'),r=fields(data.rental_terms,RENT_FIELDS,'rental_terms'),s=fields(data.sale_terms,['payment_notes'],'sale_terms');
        applicability(current.property,current.details,r,l.transaction_type);
        await update(client,'listings','id',id,l);
        if(l.transaction_type==='RENT')await replace(client,'rental_terms','listing_id',id,RENT_FIELDS,r);
        else if(Object.keys(r).length)invalid('rental_terms','Only RENT has rental terms.');
        if(l.transaction_type==='SALE')await replace(client,'sale_terms','listing_id',id,['payment_notes'],s);
        else if(Object.keys(s).length)invalid('sale_terms','Only SALE has sale terms.');
        await audit(client,actor.id,subject,'listing',id,'draft_created',{property_id:propertyId});
        return aggregate(client,(await client.query('SELECT * FROM listings WHERE id=$1',[id])).rows[0]);
      }
      return save(client,current,data,actor.id,subject);
    });
    res.status(201).json({ok:true,...result});
  }));
  router.get('/listings/:id',route(async(req,res)=>{
    const l=await owned(pool,uuid(req.params.id),req.marketplaceActor.id);
    res.json({ok:true,...await aggregate(pool,l)});
  }));
  router.patch('/listings/:id',route(async(req,res)=>{
    const data=body(req),id=uuid(req.params.id),lv=expected(data.expected_version),pv=expected(data.expected_property_version,'expected_property_version');
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,false,true);await lister(client,actor.id,true);const subject=await principal(client,actor.id);
      const l=await owned(client,id,actor.id);
      const authority=await client.query('SELECT * FROM property_authorities WHERE id=$1 FOR UPDATE',[l.authority_id]);
      if(authority.rows[0].status!=='active')fail(403,'PROPERTY_AUTHORITY_REQUIRED','Active property authority is required.');
      const locks=[l.property_id,...(data.property?.parent_property_id?[uuid(data.property.parent_property_id)]:[])].sort();
      await client.query('SELECT id FROM properties WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[locks]);
      const locked=(await client.query('SELECT * FROM listings WHERE id=$1 FOR UPDATE',[id])).rows[0];
      const current=await aggregate(client,locked);
      if(locked.review_status!=='draft'||locked.market_status!=='unlisted')fail(409,'DRAFT_ONLY','Only an unsubmitted private draft can be edited.');
      if(String(locked.version)!==lv||String(current.property.version)!==pv)fail(409,'VERSION_CONFLICT','This draft changed. Reload before saving.');
      return save(client,current,data,actor.id,subject);
    });
    res.json({ok:true,...result});
  }));
  router.post('/listings/:id/submissions',route(async(req,res)=>{
    const data=object(req.body,['expected_version','expected_property_version']),id=uuid(req.params.id),lv=expected(data.expected_version),pv=expected(data.expected_property_version,'expected_property_version');
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,false,true);await lister(client,actor.id,true);const subject=await principal(client,actor.id);
      const l=await owned(client,id,actor.id);
      await client.query('SELECT id FROM property_authorities WHERE id=$1 FOR UPDATE',[l.authority_id]);
      await client.query('SELECT id FROM properties WHERE id=$1 FOR UPDATE',[l.property_id]);
      const locked=(await client.query('SELECT * FROM listings WHERE id=$1 FOR UPDATE',[id])).rows[0];
      const current=await aggregate(client,locked);
      if(locked.review_status!=='draft'||locked.market_status!=='unlisted')fail(409,'DRAFT_ONLY','Only the first draft submission is supported.');
      if(String(locked.version)!==lv||String(current.property.version)!==pv)fail(409,'VERSION_CONFLICT','This draft changed. Reload before submitting.');
      await validateContext(client,current.property,subject);
      const errors=submissionErrors(current);
      if(Object.keys(errors).length)throw new MarketplaceError(422,'SUBMISSION_INVALID','Complete the required fields and property approval.',errors);
      const sid=uuidv7();
      await client.query('INSERT INTO listing_submissions(id,listing_id,listing_version,property_version,validation_policy_version,payload,submitted_by_user_id) VALUES($1,$2,$3,$4,$5,$6,$7)',[sid,id,locked.version,current.property.version,POLICY,snapshot(current),actor.id]);
      await update(client,'listings','id',id,{review_status:'pending',market_status:'unlisted'},true);
      await statusHistory(client,id,actor.id,'draft','pending',locked.availability_status,locked.availability_status,'first submission');
      await audit(client,actor.id,subject,'listing',id,'submitted',{submission_id:sid,policy:POLICY});
      return {id:sid,listing_id:id,review_status:'pending',market_status:'unlisted',validation_policy_version:POLICY};
    });
    res.status(201).json({ok:true,submission:result});
  }));
  if(config.messagingEnabled)router.use('/conversations',messagingRouter({pool,config,session,route}));
  router.use((_req,res)=>res.status(404).json({ok:false,code:'NOT_FOUND',message:'Not found.'}));
  app.use('/api/marketplace',router);
}

export function marketplaceAdminRouter({pool,config}) {
  const router=express.Router();
  router.use(proxy(config),route(async(req,res,next)=>{req.marketplaceAdmin=await session(pool,req,config,true);next();}));
  router.get('/lister-access',route(async(req,res)=>{
    if(Object.keys(req.query).some(k=>!['before','limit'].includes(k)))invalid('query','Unsupported query.');
    const before=req.query.before?uuid(req.query.before):null;
    const result=await pool.query('SELECT user_id,status,version,requested_at FROM lister_access WHERE ($1::uuid IS NULL OR user_id<$1) ORDER BY user_id DESC LIMIT 101',[before]);
    res.json({ok:true,lister_access:result.rows.slice(0,100),next_cursor:result.rows.length>100?result.rows[99].user_id:null});
  }));
  for(const action of ['approve','suspend','revoke'])router.post('/lister-access/:id/'+action,route(async(req,res)=>{
    const id=uuid(req.params.id),data=object(req.body,['expected_version']),version=expected(data.expected_version);
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,true,true);
      const target=(await client.query("SELECT id FROM users WHERE id=$1 AND status='active' AND email_verified_at IS NOT NULL AND deleted_at IS NULL AND anonymised_at IS NULL FOR SHARE",[id])).rows[0];
      if(!target)fail(404,'NOT_FOUND','Eligible user not found.');
      const current=(await client.query('SELECT * FROM lister_access WHERE user_id=$1 FOR UPDATE',[id])).rows[0];
      if(!current)fail(404,'NOT_FOUND','Lister request not found.');
      if(String(current.version)!==version)fail(409,'VERSION_CONFLICT','This capability changed. Reload first.');
      const values=action==='approve'?{status:'active',activated_at:new Date(),activated_by_user_id:actor.id}:action==='suspend'?{status:'suspended',suspended_at:new Date()}:{status:'revoked',revoked_at:new Date()};
      await update(client,'lister_access','user_id',id,values,true);
      await audit(client,actor.id,null,'lister_access',id,'capability_'+action,{old_status:current.status,new_status:values.status});
      return capProjection((await client.query('SELECT * FROM lister_access WHERE user_id=$1',[id])).rows[0]);
    });
    res.json({ok:true,lister_access:result});
  }));
  router.get('/property-authorities',route(async(req,res)=>{
    if(Object.keys(req.query).some(k=>k!=='before'))invalid('query','Unsupported query.');
    const before=req.query.before?uuid(req.query.before):null;
    const result=await pool.query("SELECT a.id,a.property_id,a.principal_id,p.user_id,a.relationship,a.verification_state,a.status,a.version FROM property_authorities a JOIN principals p ON p.id=a.principal_id WHERE a.verification_state IN ('declared','pending') AND ($1::uuid IS NULL OR a.id<$1) ORDER BY a.id DESC LIMIT 101",[before]);
    res.json({ok:true,property_authorities:result.rows.slice(0,100),next_cursor:result.rows.length>100?result.rows[99].id:null});
  }));
  router.post('/property-authorities/:id/approve',route(async(req,res)=>{
    const id=uuid(req.params.id),data=object(req.body,['expected_version']),version=expected(data.expected_version);
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,true,true);
      const target=(await client.query('SELECT a.principal_id,p.user_id FROM property_authorities a JOIN principals p ON p.id=a.principal_id WHERE a.id=$1 AND p.kind=\'USER\'',[id])).rows[0];
      if(!target)fail(404,'NOT_FOUND','Property authority not found.');
      const user=await client.query("SELECT id FROM users WHERE id=$1 AND status='active' AND email_verified_at IS NOT NULL AND deleted_at IS NULL AND anonymised_at IS NULL FOR SHARE",[target.user_id]);
      if(!user.rowCount)fail(404,'NOT_FOUND','Eligible user not found.');
      await lister(client,target.user_id,true);
      const current=(await client.query('SELECT * FROM property_authorities WHERE id=$1 FOR UPDATE',[id])).rows[0];
      if(String(current.version)!==version)fail(409,'VERSION_CONFLICT','This declaration changed. Reload first.');
      if(current.status!=='active')fail(403,'PROPERTY_AUTHORITY_REQUIRED','Active authority is required.');
      await update(client,'property_authorities','id',id,{verification_state:'verified',verified_by_user_id:actor.id,verified_at:new Date()},true);
      await audit(client,actor.id,null,'property_authority',id,'authority_approved',{property_id:current.property_id,relationship:current.relationship});
      return authorityProjection((await client.query('SELECT * FROM property_authorities WHERE id=$1',[id])).rows[0]);
    });
    res.json({ok:true,authority:result});
  }));
  router.use((_req,res)=>res.status(404).json({ok:false,code:'NOT_FOUND',message:'Not found.'}));
  return router;
}
