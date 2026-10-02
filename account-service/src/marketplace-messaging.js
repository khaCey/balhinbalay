import express from 'express';
import {v7 as uuidv7} from 'uuid';
import {transaction} from './marketplace-identity.js';
import {MarketplaceError,invalid,object,UUID} from './marketplace-validation.js';
import {approvedPublication} from './marketplace-publication.js';

const fail=(status,code,message)=>{throw new MarketplaceError(status,code,message);};
const uuid=value=>{if(typeof value!=='string'||!UUID.test(value))invalid('id','Use a real UUID.');return value.toLowerCase();};
export function messageInput(value,start=false) {
  const data=object(value,start?['listing_id','first_message','client_request_id']:['body','client_request_id']);
  const body=start?data.first_message:data.body;
  if(typeof body!=='string'||!body.trim()||body.length>2000||Buffer.byteLength(body)>6000||body.includes('\0'))invalid('body','Use nonempty text, at most 2000 characters and 6000 UTF-8 bytes.');
  return {body,client_request_id:uuid(data.client_request_id),...(start?{listing_id:uuid(data.listing_id)}:{})};
}
function page(query) {
  if(Object.keys(query).some(k=>!['before','limit'].includes(k)))invalid('query','Unsupported query.');
  const limit=query.limit===undefined?30:Number(query.limit);
  if(typeof query.limit==='object'||!Number.isInteger(limit)||limit<1||limit>100)invalid('limit','Use 1–100.');
  return {before:query.before?uuid(query.before):null,limit};
}
async function member(client,id,actor,lock=false) {
  const result=await client.query(`SELECT c.*,p.id AS participant_id FROM conversations c
    JOIN conversation_participants p ON p.conversation_id=c.id AND p.user_id=$2 WHERE c.id=$1 ${lock?'FOR UPDATE OF c':''}`,[id,actor]);
  if(!result.rowCount)fail(404,'NOT_FOUND','Conversation not found.');return result.rows[0];
}
async function capability(client,recipient,lock=false) {
  return (await client.query(`SELECT status FROM lister_access WHERE user_id=$1 ${lock?'FOR UPDATE':''}`,[recipient])).rows[0]?.status==='active';
}
async function context(client,c) {
  const participants=(await client.query(`SELECT p.id,p.side,CASE WHEN u.deleted_at IS NOT NULL OR u.anonymised_at IS NOT NULL THEN 'Deleted user' WHEN p.side='LISTER' THEN 'Lister' ELSE 'Seeker' END AS label
    FROM conversation_participants p JOIN users u ON u.id=p.user_id WHERE p.conversation_id=$1 ORDER BY p.side`,[c.id])).rows;
  const can_send=await capability(client,c.recipient_user_id);
  return {id:c.id,listing_context:c.listing_context,participants,own_participant_id:c.participant_id,created_at:c.created_at,updated_at:c.updated_at,can_read:true,can_send,send_reason:can_send?null:'CONVERSATION_FROZEN'};
}
const messageColumns=`m.id,m.body,m.created_at,m.sender_participant_id,CASE WHEN u.deleted_at IS NOT NULL OR u.anonymised_at IS NOT NULL THEN 'Deleted user' WHEN p.side='LISTER' THEN 'Lister' ELSE 'Seeker' END AS sender_label`;
const messageJoin='FROM messages m JOIN conversation_participants p ON p.id=m.sender_participant_id JOIN users u ON u.id=p.user_id';
async function messageResult(client,id) {return (await client.query(`SELECT ${messageColumns} ${messageJoin} WHERE m.id=$1`,[id])).rows[0];}
async function duplicate(client,c,data) {
  const old=(await client.query('SELECT id,body FROM messages WHERE sender_participant_id=$1 AND client_request_id=$2',[c.participant_id,data.client_request_id])).rows[0];
  if(old&&old.body!==data.body)fail(409,'IDEMPOTENCY_CONFLICT','This request key was used for different text.');
  return old;
}
async function insertMessage(client,c,data) {
  const id=uuidv7();
  await client.query('INSERT INTO messages(id,conversation_id,sender_participant_id,body,client_request_id) VALUES($1,$2,$3,$4,$5)',[id,c.id,c.participant_id,data.body,data.client_request_id]);
  await client.query('UPDATE conversations SET version=version+1,updated_at=now() WHERE id=$1',[c.id]);
  return messageResult(client,id);
}
export function messagingRouter({pool,config,session,route}) {
  const router=express.Router();
  router.get('/',route(async(req,res)=>{
    const {before,limit}=page(req.query),actor=req.marketplaceActor.id;
    if(before)await member(pool,before,actor);
    const result=await pool.query(`SELECT c.*,p.id AS participant_id FROM conversations c JOIN conversation_participants p ON p.conversation_id=c.id
      WHERE p.user_id=$1 AND ($2::uuid IS NULL OR (c.created_at,c.id)<(SELECT created_at,id FROM conversations WHERE id=$2)) ORDER BY c.created_at DESC,c.id DESC LIMIT $3`,[actor,before,limit+1]);
    res.json({ok:true,conversations:await Promise.all(result.rows.slice(0,limit).map(c=>context(pool,c))),next_cursor:result.rows.length>limit?result.rows[limit-1].id:null});
  }));
  router.get('/:id',route(async(req,res)=>{
    object(req.query,[]);const c=await member(pool,uuid(req.params.id),req.marketplaceActor.id);
    res.json({ok:true,conversation:await context(pool,c)});
  }));
  router.get('/:id/messages',route(async(req,res)=>{
    const {before,limit}=page(req.query),c=await member(pool,uuid(req.params.id),req.marketplaceActor.id);
    let cursor=null;
    if(before){cursor=(await pool.query('SELECT created_at FROM messages WHERE id=$1 AND conversation_id=$2',[before,c.id])).rows[0];if(!cursor)fail(404,'NOT_FOUND','Message not found.');}
    const rows=(await pool.query(`SELECT ${messageColumns} ${messageJoin} WHERE m.conversation_id=$1
      AND ($2::uuid IS NULL OR (m.created_at,m.id)<(SELECT created_at,id FROM messages WHERE id=$2 AND conversation_id=$1)) ORDER BY m.created_at DESC,m.id DESC LIMIT $3`,[c.id,before,limit+1])).rows;
    res.json({ok:true,messages:rows.slice(0,limit).reverse(),next_cursor:rows.length>limit?rows[limit-1].id:null});
  }));
  router.post('/:id/messages',route(async(req,res)=>{
    const id=uuid(req.params.id),data=messageInput(req.body);
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,false,true);
      // Identity/membership precedes recipient lock; fixed capability→thread order
      // is shared with start and existing manual capability transitions.
      const found=await member(client,id,actor.id);
      const active=await capability(client,found.recipient_user_id,true);
      const c=await member(client,id,actor.id,true),old=await duplicate(client,c,data);
      if(old)return {message:await messageResult(client,old.id),replayed:true};
      if(!active)fail(403,'CONVERSATION_FROZEN','Messages are paused while the original Lister access is inactive.');
      return {message:await insertMessage(client,c,data),replayed:false};
    });res.status(result.replayed?200:201).json({ok:true,...result});
  }));
  router.post('/',route(async(req,res)=>{
    // Real initiation requires the reviewed publication module. The existing
    // messaging flag still controls this entire router, with no fixture bypass.
    if(!config.publicationEnabled)fail(503,'CONVERSATION_START_UNAVAILABLE','New conversations are not available yet.');
    const data=messageInput(req.body,true);
    const result=await transaction(pool,async client=>{
      const actor=await session(client,req,config,false,true);
      // A committed start retry resolves its original recipient, even after
      // ownership, listing state or capability changes. It performs no new write.
      const retry=(await client.query(`SELECT c.*,p.id AS participant_id FROM conversations c JOIN conversation_participants p ON p.conversation_id=c.id
        JOIN messages m ON m.sender_participant_id=p.id WHERE c.listing_id=$1 AND c.initiator_user_id=$2 AND p.user_id=$2 AND m.client_request_id=$3`,[data.listing_id,actor.id,data.client_request_id])).rows[0];
      if(retry){const old=await duplicate(client,retry,data);return {conversation:await context(client,retry),message:await messageResult(client,old.id),replayed:true};}
      const l=(await client.query('SELECT * FROM listings WHERE id=$1',[data.listing_id])).rows[0];
      if(!l)fail(404,'NOT_FOUND','Listing not found.');
      if(l.responsible_lister_user_id===actor.id)fail(422,'SELF_CONTACT','You cannot contact yourself.');
      const recipient=l.responsible_lister_user_id;
      const eligible=await client.query("SELECT id FROM users WHERE id=$1 AND status='active' AND email_verified_at IS NOT NULL AND deleted_at IS NULL AND anonymised_at IS NULL FOR SHARE",[recipient]);
      if(!eligible.rowCount||!await capability(client,recipient,true))fail(403,'LISTER_ACCESS_REQUIRED','An active responsible Lister is required.');
      // Match activation's capability→authority→property→listing lock order.
      // Otherwise simultaneous unlisting and contact could form a lock cycle.
      const authority=(await client.query(`SELECT a.* FROM property_authorities a JOIN principals p ON p.id=a.principal_id
        WHERE a.id=$1 AND a.property_id=$2 AND a.principal_id=$3 AND a.status='active' AND a.verification_state='verified'
        AND p.kind='USER' AND p.user_id=$4 AND p.archived_at IS NULL FOR SHARE OF a,p`,[l.authority_id,l.property_id,l.owner_principal_id,recipient])).rows[0];
      const property=(await client.query('SELECT id FROM properties WHERE id=$1 AND archived_at IS NULL FOR SHARE',[l.property_id])).rows[0];
      const current=(await client.query('SELECT * FROM listings WHERE id=$1 FOR SHARE',[l.id])).rows[0];
      if(!current||current.responsible_lister_user_id!==recipient||current.owner_principal_id!==l.owner_principal_id||current.authority_id!==l.authority_id||current.property_id!==l.property_id)fail(409,'LISTING_CHANGED','The listing changed. Retry.');
      if(current.review_status!=='approved'||current.market_status!=='active'||current.archived_at||!current.published_at||!authority||!property)fail(403,'LISTING_NOT_CONTACTABLE','This listing cannot start a conversation.');
      let approved;
      try{approved=await approvedPublication(client,current,authority);}
      catch(error){if(error instanceof MarketplaceError)fail(403,'LISTING_NOT_CONTACTABLE','This listing cannot start a conversation.');throw error;}
      const id=uuidv7(),snapshot={listing_id:current.id,title:approved.content.listing.title,property_type:approved.content.property.property_type,transaction_type:approved.content.listing.transaction_type};
      const created=await client.query(`INSERT INTO conversations(id,listing_id,initiator_user_id,recipient_user_id,listing_owner_principal_id,listing_context)
        VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(listing_id,initiator_user_id,recipient_user_id) DO NOTHING RETURNING id`,[id,current.id,actor.id,recipient,current.owner_principal_id,snapshot]);
      const conversationId=created.rowCount?id:(await client.query('SELECT id FROM conversations WHERE listing_id=$1 AND initiator_user_id=$2 AND recipient_user_id=$3',[current.id,actor.id,recipient])).rows[0].id;
      if(created.rowCount)await client.query("INSERT INTO conversation_participants(id,conversation_id,user_id,side) VALUES($1,$2,$3,'SEEKER'),($4,$2,$5,'LISTER')",[uuidv7(),id,actor.id,uuidv7(),recipient]);
      const c=await member(client,conversationId,actor.id,true),old=await duplicate(client,c,data);
      const message=old?await messageResult(client,old.id):await insertMessage(client,c,data);
      return {conversation:await context(client,c),message,replayed:!!old};
    });res.status(result.replayed?200:201).json({ok:true,...result});
  }));
  return router;
}
