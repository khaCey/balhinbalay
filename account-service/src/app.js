import express from 'express';
import argon2 from 'argon2';
import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {v7 as uuidv7} from 'uuid';

const SESSION_COOKIE='__Host-bb_session';
const sha=value=>createHash('sha256').update(value).digest('hex');
const token=()=>randomBytes(32).toString('base64url');
const email=value=>typeof value==='string'?value.trim().toLowerCase():'';
const validEmail=value=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword=value=>typeof value==='string'&&value.length>=12&&value.length<=128;
const hashPassword=value=>argon2.hash(value,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});

class Failure extends Error{
  constructor(status,code,message){super(message);this.status=status;this.code=code;}
}
const bad=(code,message)=>new Failure(400,code,message);
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
const publicUser=row=>({id:row.id,email:row.email,email_verified_at:row.email_verified_at,status:row.status});
const cookieToken=req=>{
  const part=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${SESSION_COOKIE}=`));
  return part?.slice(SESSION_COOKIE.length+1)||'';
};

async function tx(pool,fn){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    try{const result=await fn(client);await client.query('COMMIT');return result;}
    catch(error){await client.query('ROLLBACK');throw error;}
  }finally{client.release();}
}

export function createAccountApp({pool,mailer,config}){
  if(!pool||!mailer||!config?.appOrigin||!config?.proxyKey)throw new Error('Database, mailer, origin and proxy key required');
  const app=express();
  const dummyHash=hashPassword('dummy account timing value');
  app.disable('x-powered-by');
  app.use(express.json({limit:'8kb'}));
  const bucket=value=>createHmac('sha256',config.proxyKey).update(value).digest('hex');
  async function limit(scope,value,max,minutes){
    const key=bucket(`${scope}:${value}`),now=new Date();
    const r=await pool.query(`INSERT INTO auth_rate_limits(bucket_hash,count,window_start)
      VALUES($1,1,$2) ON CONFLICT(bucket_hash) DO UPDATE SET
      count=CASE WHEN auth_rate_limits.window_start < $3 THEN 1 ELSE auth_rate_limits.count+1 END,
      window_start=CASE WHEN auth_rate_limits.window_start < $3 THEN $2 ELSE auth_rate_limits.window_start END
      RETURNING count`,[key,now,new Date(now.getTime()-minutes*60000)]);
    if(r.rows[0].count>max)throw new Failure(429,'RATE_LIMITED','Please wait before trying again.');
  }
  const url=(purpose,value)=>`${config.appOrigin}/#${purpose}/${encodeURIComponent(value)}`;
  async function issue(client,userId,purpose,minutes){
    const raw=token();
    await client.query(`UPDATE account_actions SET invalidated_at=now()
      WHERE user_id=$1 AND purpose=$2 AND consumed_at IS NULL AND invalidated_at IS NULL`,[userId,purpose]);
    const id=uuidv7();
    await client.query(`INSERT INTO account_actions(id,user_id,purpose,token_hash,expires_at)
      VALUES($1,$2,$3,$4,$5)`,[id,userId,purpose,sha(raw),new Date(Date.now()+minutes*60000)]);
    return {raw,id};
  }
  async function deliver(user,action,purpose){
    try{
      if(purpose==='verify')await mailer.verify(user.email,url('verify-email',action.raw));
      else await mailer.reset(user.email,url('reset-password',action.raw));
      await pool.query('UPDATE account_actions SET sent_at=now() WHERE id=$1',[action.id]);
    }catch{
      // A pending account remains recoverable through resend; no secret or SMTP error is logged.
      console.error('Account email delivery failed.');
      await pool.query('UPDATE account_actions SET invalidated_at=now() WHERE id=$1',[action.id]);
      throw new Failure(503,'EMAIL_UNAVAILABLE','Email could not be sent. Try again or request a new link.');
    }
  }
  async function consume(client,raw,purpose){
    if(typeof raw!=='string'||raw.length<30||raw.length>200)throw bad('INVALID_TOKEN','This link is invalid.');
    const digest=sha(raw);
    const result=await client.query(`UPDATE account_actions SET consumed_at=now()
      WHERE token_hash=$1 AND purpose=$2 AND consumed_at IS NULL AND invalidated_at IS NULL AND expires_at>now()
      RETURNING user_id`,[digest,purpose]);
    if(result.rowCount)return result.rows[0].user_id;
    const previous=await client.query('SELECT consumed_at,invalidated_at,expires_at FROM account_actions WHERE token_hash=$1 AND purpose=$2',[digest,purpose]);
    const record=previous.rows[0];
    if(record?.consumed_at)throw bad('ALREADY_USED','This link has already been used.');
    if(record?.expires_at&&new Date(record.expires_at)<=new Date())throw bad('EXPIRED_TOKEN','This link has expired. Request another one.');
    throw bad('INVALID_TOKEN','This link is invalid.');
  }
  async function lockActionUser(client,raw,purpose){
    if(typeof raw!=='string'||raw.length<30||raw.length>200)return;
    const action=await client.query('SELECT user_id FROM account_actions WHERE token_hash=$1 AND purpose=$2',[sha(raw),purpose]);
    if(action.rowCount)await client.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[action.rows[0].user_id]);
  }

  // The separate Site proxy holds this key; never accept unsigned browser-to-PC traffic.
  app.use('/api/auth',(req,res,next)=>{
    const supplied=req.get('x-balhinbalay-proxy-key')||'';
    const expected=Buffer.from(config.proxyKey),actual=Buffer.from(supplied);
    if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return res.status(403).json({code:'FORBIDDEN',message:'Forbidden.'});
    if(req.method!=='GET'&&req.get('origin')!==config.appOrigin)return res.status(403).json({code:'ORIGIN_REJECTED',message:'Forbidden.'});
    next();
  });

  app.post('/api/auth/register',wrap(async(req,res)=>{
    const address=email(req.body?.email),password=req.body?.password;
    if(!validEmail(address))throw bad('INVALID_EMAIL','Enter a valid email address.');
    if(!validPassword(password))throw bad('INVALID_PASSWORD','Use 12 to 128 characters for your password.');
    await limit('register-ip',req.ip,100,60);
    await limit('register-email',address,4,60);
    const digest=await hashPassword(password);
    let created;
    try{created=await tx(pool,async client=>{
      const user={id:uuidv7(),email:address};
      await client.query(`INSERT INTO users(id,email,password_hash,status) VALUES($1,$2,$3,'pending')`,[user.id,address,digest]);
      return {user,action:await issue(client,user.id,'verify',config.verificationHours*60)};
    });}catch(error){if(error.code==='23505')return res.status(202).json({ok:true,message:'If this address is eligible, check your email or request a new link.'});throw error;}
    await deliver(created.user,created.action,'verify');
    res.status(201).json({ok:true,message:'Check your email to verify your account.'});
  }));

  app.post('/api/auth/resend-verification',wrap(async(req,res)=>{
    const address=email(req.body?.email);
    if(!validEmail(address))throw bad('INVALID_EMAIL','Enter a valid email address.');
    await limit('resend-ip',req.ip,100,60);
    await limit('resend-email',address,3,60);
    const pending=await tx(pool,async client=>{
      const found=await client.query('SELECT id,email,status,email_verified_at FROM users WHERE email=$1 FOR UPDATE',[address]);
      const user=found.rows[0];
      if(!user||user.email_verified_at||user.status!=='pending')return null;
      const last=await client.query(`SELECT sent_at FROM account_actions WHERE user_id=$1 AND purpose='verify'
        AND sent_at IS NOT NULL ORDER BY sent_at DESC LIMIT 1`,[user.id]);
      if(last.rows[0]&&Date.now()-new Date(last.rows[0].sent_at).getTime()<60000)return null;
      return {user,action:await issue(client,user.id,'verify',config.verificationHours*60)};
    });
    if(pending)try{await deliver(pending.user,pending.action,'verify');}
    catch(error){if(error.code!=='EMAIL_UNAVAILABLE')throw error;}
    res.status(202).json({ok:true,message:'If eligible, your request was received. If no email arrives, try again later.'});
  }));

  app.post('/api/auth/verify-email',wrap(async(req,res)=>{
    const user=await tx(pool,async client=>{
      await lockActionUser(client,req.body?.token,'verify');
      const id=await consume(client,req.body?.token,'verify');
      const result=await client.query(`UPDATE users SET email_verified_at=now(),status='active',updated_at=now()
        WHERE id=$1 AND email_verified_at IS NULL AND status='pending' RETURNING id,email,email_verified_at,status`,[id]);
      if(!result.rowCount)throw bad('ALREADY_VERIFIED','This account is already verified or unavailable.');
      return result.rows[0];
    });
    res.json({ok:true,user:publicUser(user)});
  }));

  app.post('/api/auth/login',wrap(async(req,res)=>{
    const address=email(req.body?.email),password=req.body?.password;
    if(!validEmail(address)||typeof password!=='string')throw bad('INVALID_CREDENTIALS','Invalid email or password.');
    await limit('login-ip',req.ip,300,60);
    await limit('login-email',address,10,15);
    const result=await pool.query('SELECT id,email,password_hash,status,email_verified_at FROM users WHERE email=$1',[address]);
    const user=result.rows[0];
    if(!user){await argon2.verify(await dummyHash,password);throw new Failure(401,'INVALID_CREDENTIALS','Invalid email or password.');}
    if(!await argon2.verify(user.password_hash,password))throw new Failure(401,'INVALID_CREDENTIALS','Invalid email or password.');
    if(user.status==='pending'||!user.email_verified_at)throw new Failure(403,'EMAIL_NOT_VERIFIED','Verify your email before signing in.');
    if(user.status!=='active')throw new Failure(403,'ACCOUNT_UNAVAILABLE','This account is unavailable.');
    const raw=token();
    await pool.query('INSERT INTO auth_sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,$4)',
      [uuidv7(),user.id,sha(raw),new Date(Date.now()+config.sessionDays*86400000)]);
    res.cookie(SESSION_COOKIE,raw,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:config.sessionDays*86400000});
    res.json({ok:true,user:publicUser(user)});
  }));

  app.get('/api/auth/session',wrap(async(req,res)=>{
    const raw=cookieToken(req);
    if(!raw)return res.status(401).json({code:'UNAUTHENTICATED',message:'Sign in required.'});
    const result=await pool.query(`SELECT u.id,u.email,u.status,u.email_verified_at,s.id AS session_id
      FROM auth_sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now()
      AND u.status='active' AND u.email_verified_at IS NOT NULL`,[sha(raw)]);
    if(!result.rowCount)return res.status(401).json({code:'UNAUTHENTICATED',message:'Session expired. Sign in again.'});
    await pool.query('UPDATE auth_sessions SET last_used_at=now() WHERE id=$1',[result.rows[0].session_id]);
    res.json({ok:true,user:publicUser(result.rows[0])});
  }));

  app.post('/api/auth/logout',wrap(async(req,res)=>{
    const raw=cookieToken(req);
    if(raw)await pool.query('UPDATE auth_sessions SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL',[sha(raw)]);
    res.clearCookie(SESSION_COOKIE,{secure:true,httpOnly:true,sameSite:'lax',path:'/'});
    res.json({ok:true});
  }));

  app.post('/api/auth/forgot-password',wrap(async(req,res)=>{
    const address=email(req.body?.email);
    if(!validEmail(address))throw bad('INVALID_EMAIL','Enter a valid email address.');
    await limit('reset-ip',req.ip,100,60);
    await limit('reset-email',address,3,60);
    const candidate=await tx(pool,async client=>{
      const found=await client.query('SELECT id,email,status,email_verified_at FROM users WHERE email=$1 FOR UPDATE',[address]);
      const user=found.rows[0];
      if(!user||!user.email_verified_at||user.status!=='active')return null;
      return {user,action:await issue(client,user.id,'reset',config.resetMinutes)};
    });
    if(candidate)try{await deliver(candidate.user,candidate.action,'reset');}
    catch(error){if(error.code!=='EMAIL_UNAVAILABLE')throw error;}
    res.status(202).json({ok:true,message:'If eligible, your request was received. If no email arrives, try again later.'});
  }));

  app.post('/api/auth/reset-password',wrap(async(req,res)=>{
    const password=req.body?.password;
    if(!validPassword(password))throw bad('INVALID_PASSWORD','Use 12 to 128 characters for your password.');
    await limit('reset-submit-ip',req.ip,30,60);
    const digest=await hashPassword(password);
    await tx(pool,async client=>{
      await lockActionUser(client,req.body?.token,'reset');
      const id=await consume(client,req.body?.token,'reset');
      const updated=await client.query(`UPDATE users SET password_hash=$1,updated_at=now()
        WHERE id=$2 AND status='active' AND email_verified_at IS NOT NULL RETURNING id`,[digest,id]);
      if(!updated.rowCount)throw bad('INVALID_TOKEN','This reset link is invalid.');
      await client.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL',[id]);
      await client.query(`UPDATE account_actions SET invalidated_at=now() WHERE user_id=$1 AND purpose='reset'
        AND consumed_at IS NULL AND invalidated_at IS NULL`,[id]);
    });
    res.json({ok:true,message:'Password changed. Sign in with your new password.'});
  }));

  app.use((error,req,res,_next)=>{
    void _next; // Express identifies error handlers by four arguments.
    if(error instanceof Failure)return res.status(error.status).json({ok:false,code:error.code,message:error.message});
    // Never log request bodies, URLs, passwords, action tokens, SQL parameters or SMTP errors.
    console.error('Account request failed:',error?.code||error?.name||'UNKNOWN');
    res.status(503).json({ok:false,code:'SERVICE_UNAVAILABLE',message:'Account service unavailable. Try again later.'});
  });
  return app;
}
