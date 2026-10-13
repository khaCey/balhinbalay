import express from 'express';
import {createHmac} from 'node:crypto';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {eligiblePublicListing} from './marketplace-publication.js';
import {MarketplaceError,invalid,object,expected,UUID} from './marketplace-validation.js';

export const REPORT_REASONS=['SUSPECTED_SCAM','INACCURATE_INFORMATION','UNAVAILABLE_PROPERTY','INAPPROPRIATE_CONTENT','OTHER'];
export const REPORT_STATUSES=['NEW','UNDER_REVIEW','RESOLVED','DISMISSED'];
const fail=(status,code,message)=>{throw new MarketplaceError(status,code,message);};
const id=value=>{if(!UUID.test(String(value||'')))fail(404,'NOT_FOUND','Not found.');return value;};
const text=(value,key)=>{if(value===undefined)return '';if(typeof value!=='string'||value.length>2000)invalid(key,'Use at most 2,000 characters.');return value.trim();};
export function reportInput(body) {
 const data=object(body,['reason','details']);
 if(!REPORT_REASONS.includes(data.reason))invalid('reason','Choose a report reason.');
 return {reason:data.reason,details:text(data.details,'details')};
}
export function reportReviewInput(body) {
 const data=object(body,['status','note','expected_version']);
 if(!REPORT_STATUSES.includes(data.status)||data.status==='NEW')invalid('status','Choose a review status.');
 return {status:data.status,note:text(data.note,'note'),version:expected(data.expected_version)};
}
export function reportQueueInput(query) {
 object(query,['before','limit','status']);
 const before=query.before===undefined?null:id(query.before);
 const limit=query.limit===undefined?20:Number(query.limit);
 if(!/^\d+$/.test(String(query.limit??20))||!Number.isInteger(limit)||limit<1||limit>100)invalid('limit','Use 1 to 100.');
 const status=query.status??null;
 if(status!==null&&!REPORT_STATUSES.includes(status))invalid('status','Choose a report status.');
 return {before,limit,status};
}
const reportFields='r.id,r.listing_id,r.reported_by_user_id,r.reason,r.details,r.status,r.version,r.created_at,r.updated_at,r.resolved_at';
export function listingReportRouter({pool,config,session,route,audit}) {
 const router=express.Router();
 router.post('/listings/:id/reports',route(async(req,res)=>{
  if(Object.keys(req.query).length)invalid('query','Unsupported query.');
  const listingId=id(req.params.id),data=reportInput(req.body);
  const result=await transaction(pool,async client=>{
   const actor=await session(client,req,config,false,true);
   // Exactly the current public-detail boundary; locks prevent unlisting or
   // capability/account/authority changes from racing the report insert.
   if(!await eligiblePublicListing(client,listingId,true))fail(404,'NOT_FOUND','Listing not found.');
   const bucket=createHmac('sha256',config.proxyKey).update('listing-report:'+actor.id).digest('hex');
   const count=await client.query(`INSERT INTO auth_rate_limits(bucket_hash,count,window_start) VALUES($1,1,now())
    ON CONFLICT(bucket_hash) DO UPDATE SET count=CASE WHEN auth_rate_limits.window_start<now()-interval '1 hour' THEN 1 ELSE auth_rate_limits.count+1 END,
    window_start=CASE WHEN auth_rate_limits.window_start<now()-interval '1 hour' THEN now() ELSE auth_rate_limits.window_start END RETURNING count`,[bucket]);
   if(count.rows[0].count>20)fail(429,'RATE_LIMITED','Please wait before reporting again.');
   const inserted=await client.query(`INSERT INTO listing_reports(id,listing_id,reported_by_user_id,reason,details)
    VALUES($1,$2,$3,$4,$5) ON CONFLICT(listing_id,reported_by_user_id) WHERE status IN ('NEW','UNDER_REVIEW') DO NOTHING RETURNING id,status`,[uuidv7(),listingId,actor.id,data.reason,data.details]);
   const report=inserted.rows[0]||(await client.query("SELECT id,status FROM listing_reports WHERE listing_id=$1 AND reported_by_user_id=$2 AND status IN ('NEW','UNDER_REVIEW')",[listingId,actor.id])).rows[0];
   if(!report)fail(409,'REPORT_CHANGED','The report changed. Try again.');
   if(inserted.rowCount)await audit(client,actor.id,null,'listing_report',report.id,'listing_report_created',{listing_id:listingId,reason:data.reason});
   return {report,created:!!inserted.rowCount};
  });
  res.status(result.created?201:200).json({ok:true,report:result.report,message:result.created?'Report received. Our team will review it.':'You already have an open report for this listing.'});
 }));
 return router;
}
export function listingReportAdminRouter({pool,config,session,route,audit}) {
 const router=express.Router();
 router.get('/listing-reports',route(async(req,res)=>{
  const {before,limit,status}=reportQueueInput(req.query);
  const result=await pool.query(`SELECT ${reportFields},u.email AS reporter_email FROM listing_reports r JOIN users u ON u.id=r.reported_by_user_id
   WHERE ($1::uuid IS NULL OR r.id<$1) AND ($2::text IS NULL OR r.status=$2) ORDER BY r.id DESC LIMIT $3`,[before,status,limit+1]);
  const reports=result.rows.slice(0,limit);
  res.json({ok:true,reports,next_cursor:result.rows.length>limit?reports.at(-1).id:null});
 }));
 router.get('/listing-reports/:id',route(async(req,res)=>{
  if(Object.keys(req.query).length)invalid('query','Unsupported query.');
  const reportId=id(req.params.id);
  const report=(await pool.query(`SELECT ${reportFields},u.email AS reporter_email FROM listing_reports r JOIN users u ON u.id=r.reported_by_user_id WHERE r.id=$1`,[reportId])).rows[0];
  if(!report)fail(404,'NOT_FOUND','Report not found.');
  const history=await pool.query('SELECT id,reviewed_by_user_id,old_status,new_status,note,created_at,report_version FROM listing_report_reviews WHERE report_id=$1 ORDER BY report_version',[reportId]);
  res.json({ok:true,report,history:history.rows});
 }));
 router.post('/listing-reports/:id/review',route(async(req,res)=>{
  if(Object.keys(req.query).length)invalid('query','Unsupported query.');
  const reportId=id(req.params.id),data=reportReviewInput(req.body);
  const report=await transaction(pool,async client=>{
   const actor=await session(client,req,config,true,true);
   const current=(await client.query('SELECT * FROM listing_reports WHERE id=$1 FOR UPDATE',[reportId])).rows[0];
   if(!current)fail(404,'NOT_FOUND','Report not found.');
   if(String(current.version)!==data.version)fail(409,'VERSION_CONFLICT','This report changed. Reload first.');
   if(!(current.status==='NEW'&&data.status==='UNDER_REVIEW'||current.status==='UNDER_REVIEW'&&['RESOLVED','DISMISSED'].includes(data.status)))fail(409,'REPORT_STATE_CONFLICT','This report cannot make that transition.');
   const next=(await client.query(`UPDATE listing_reports SET status=$2,version=version+1,updated_at=now(),
    resolved_at=CASE WHEN $2 IN ('RESOLVED','DISMISSED') THEN now() ELSE NULL END WHERE id=$1 RETURNING id,status,version`,[reportId,data.status])).rows[0];
   await client.query('INSERT INTO listing_report_reviews(id,report_id,reviewed_by_user_id,old_status,new_status,report_version,note) VALUES($1,$2,$3,$4,$5,$6,$7)',[uuidv7(),reportId,actor.id,current.status,next.status,next.version,data.note]);
   await audit(client,actor.id,null,'listing_report',reportId,'listing_report_reviewed',{old_status:current.status,new_status:next.status,version:next.version});
   return next;
  });
  res.json({ok:true,report});
 }));
 return router;
}
