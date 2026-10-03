import express from 'express';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {MarketplaceError,invalid,object,expected,UUID} from './marketplace-validation.js';

const fail=(status,code,message)=>{throw new MarketplaceError(status,code,message);};
const id=value=>{if(!UUID.test(String(value||'')))invalid('id','Use a real marketplace UUID.');return value;};
const path='/listings/:listingId/submissions/:submissionId';
// Read models deliberately omit account email/phone, session data and private
// exact locations. Content being reviewed is the submitted snapshot, never a
// mixture of current mutable property values and submitted values.
const pending=`SELECT s.id,s.listing_id,s.listing_version,s.property_version,s.validation_policy_version,
 s.submitted_by_user_id,s.submitted_at,s.payload,l.version AS expected_version
 FROM listing_submissions s JOIN listings l ON l.id=s.listing_id
 WHERE l.review_status='pending' AND l.market_status='unlisted'
 AND s.listing_version=l.version-1
 AND NOT EXISTS(SELECT 1 FROM listing_submission_reviews r WHERE r.submission_id=s.id)`;

export function moderationRouter({pool,config,session,route,audit,statusHistory,update}) {
 const router=express.Router();
 router.get('/listing-submissions',route(async(req,res)=>{
  object(req.query,['before']);
  const before=req.query.before?id(req.query.before):null;
  const result=await pool.query(pending+' AND ($1::uuid IS NULL OR s.id<$1) ORDER BY s.id DESC LIMIT 101',[before]);
  const items=result.rows.slice(0,100).map(({payload,...row})=>({...row,title:payload.listing?.title||''}));
  res.json({ok:true,submissions:items,next_cursor:result.rows.length>100?items.at(-1).id:null});
 }));
 router.get(path,route(async(req,res)=>{
  object(req.query,[]);
  const listingId=id(req.params.listingId),submissionId=id(req.params.submissionId);
  const row=(await pool.query(pending+' AND l.id=$1 AND s.id=$2',[listingId,submissionId])).rows[0];
  if(!row)fail(404,'NOT_FOUND','Pending submission not found.');
  // Current authority/capability is labelled context, separate from the frozen
  // content. Approval alone does not authorise public activation.
  const context=(await pool.query(`SELECT l.property_id,l.authority_id,l.responsible_lister_user_id,
   a.relationship,a.verification_state,a.status AS authority_status,c.status AS lister_status
   FROM listings l JOIN property_authorities a ON a.id=l.authority_id
   LEFT JOIN lister_access c ON c.user_id=l.responsible_lister_user_id WHERE l.id=$1`,[listingId])).rows[0];
  const history=await pool.query(`SELECT s.id AS submission_id,s.submitted_at,s.listing_version,
   r.reviewer_user_id,r.outcome,r.reason,r.reviewed_at FROM listing_submissions s
   LEFT JOIN listing_submission_reviews r ON r.submission_id=s.id WHERE s.listing_id=$1 ORDER BY s.listing_version`,[listingId]);
  res.json({ok:true,submission:row,context,history:history.rows});
 }));
 for(const action of ['approve','reject'])router.post(path+'/'+action,route(async(req,res)=>{
  const listingId=id(req.params.listingId),submissionId=id(req.params.submissionId);
  const data=object(req.body,action==='reject'?['expected_version','reason']:['expected_version']);
  const version=expected(data.expected_version);
  const reason=action==='reject'&&typeof data.reason==='string'?data.reason.trim():null;
  if(action==='reject'&&(!reason||reason.length>2000))invalid('reason','Enter a rejection reason of 1 to 2000 characters.');
  const result=await transaction(pool,async client=>{
   // Recheck the live session/account/allowlist inside the write transaction.
   const actor=await session(client,req,config,true,true);
   const l=(await client.query('SELECT * FROM listings WHERE id=$1 FOR UPDATE',[listingId])).rows[0];
   const s=(await client.query('SELECT * FROM listing_submissions WHERE id=$1 AND listing_id=$2',[submissionId,listingId])).rows[0];
   if(!l||!s)fail(404,'NOT_FOUND','Submission not found.');
   if(String(l.version)!==version||l.review_status!=='pending'||l.market_status!=='unlisted'||BigInt(s.listing_version)+1n!==BigInt(l.version))
    fail(409,'REVIEW_CONFLICT','This submission changed or has already been reviewed. Reload the pending queue.');
   const owner=(await client.query('SELECT user_id FROM principals WHERE id=$1',[l.owner_principal_id])).rows[0];
   if(action==='approve'&&[owner?.user_id,l.responsible_lister_user_id,s.submitted_by_user_id].includes(actor.id))
    fail(403,'SELF_APPROVAL_FORBIDDEN','You cannot approve your own listing.');
   const outcome=action==='approve'?'approved':'rejected',reviewId=uuidv7();
   const review=(await client.query(`INSERT INTO listing_submission_reviews(id,submission_id,listing_id,reviewer_user_id,outcome,reason,listing_version)
    VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,[reviewId,submissionId,listingId,actor.id,outcome,reason,l.version])).rows[0];
   await update(client,'listings','id',listingId,{review_status:outcome,market_status:'unlisted',approved_submission_id:action==='approve'?submissionId:null},true);
   await statusHistory(client,listingId,actor.id,'pending',outcome,l.availability_status,l.availability_status,reason||'submission approved; not public');
   await audit(client,actor.id,null,'listing',listingId,'submission_'+outcome,{submission_id:submissionId,review_id:reviewId,old_version:l.version,new_version:String(BigInt(l.version)+1n),reason});
   return {review,listing:{id:listingId,version:String(BigInt(l.version)+1n),review_status:outcome,market_status:'unlisted',approved_submission_id:action==='approve'?submissionId:null}};
  });
  res.json({ok:true,...result});
 }));
 return router;
}
