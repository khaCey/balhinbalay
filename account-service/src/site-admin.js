import express from 'express';
import argon2 from 'argon2';
import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {v7 as uuidv7} from 'uuid';

const ADMIN_COOKIE='__Host-bb_admin_session';
const sha=value=>createHash('sha256').update(value).digest('hex');
const adminSessionSha=value=>sha(`admin:${value}`);
const token=()=>randomBytes(32).toString('base64url');
const normaliseEmail=value=>typeof value==='string'?value.trim().toLowerCase():'';
const validEmail=value=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword=value=>typeof value==='string'&&value.length>=12&&value.length<=128;
const hashPassword=value=>argon2.hash(value,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});
const publicUser=row=>({id:row.id,email:row.email,status:row.status,email_verified_at:row.email_verified_at});

const sameSecret=(expected,supplied)=>{
  const left=Buffer.from(String(expected||'')),right=Buffer.from(String(supplied||''));
  return left.length===right.length&&timingSafeEqual(left,right);
};
const cookieToken=req=>String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length+1)||'';
const fail=(res,status,code,message)=>res.status(status).json({ok:false,code,message});
const asyncRoute=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(error=>{
  console.error('Site admin request failed:',error?.code||error?.name||'UNKNOWN');
  if(!res.headersSent)res.status(503).json({ok:false,code:'ADMIN_UNAVAILABLE',message:'Account service unavailable. Try again later.'});
});

export function mountSiteAdmin(app,{pool,config}={}){
  if(!app||!pool||!config?.proxyKey||!config?.appOrigin)throw new Error('Site admin app, database, origin and proxy key required');
  const router=express.Router();
  const allowlist=new Set(Array.isArray(config.adminEmails)?config.adminEmails.map(normaliseEmail):[]);
  const expectedProxy=String(config.proxyKey);
  const dummyHash=hashPassword('dummy admin timing value');
  const bucket=value=>createHmac('sha256',expectedProxy).update(value).digest('hex');

  async function limit(scope,value,max,minutes){
    const key=bucket(`${scope}:${value}`),now=new Date();
    const result=await pool.query(`INSERT INTO auth_rate_limits(bucket_hash,count,window_start)
      VALUES($1,1,$2) ON CONFLICT(bucket_hash) DO UPDATE SET
      count=CASE WHEN auth_rate_limits.window_start < $3 THEN 1 ELSE auth_rate_limits.count+1 END,
      window_start=CASE WHEN auth_rate_limits.window_start < $3 THEN $2 ELSE auth_rate_limits.window_start END
      RETURNING count`,[key,now,new Date(now.getTime()-minutes*60000)]);
    if(result.rows[0].count>max)return false;
    return true;
  }

  const requireProxy=(req,res,next)=>{
    if(!sameSecret(expectedProxy,req.get('x-balhinbalay-proxy-key')))return fail(res,403,'FORBIDDEN','Forbidden.');
    if(req.method!=='GET'&&req.get('origin')!==config.appOrigin)return fail(res,403,'ORIGIN_REJECTED','Forbidden.');
    next();
  };

  const readAdmin=async raw=>{
    if(!raw)return null;
    const result=await pool.query(`SELECT u.id,u.email,u.status,u.email_verified_at,s.id AS session_id
      FROM auth_sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND s.purpose='admin' AND s.revoked_at IS NULL AND s.expires_at>now()
      AND u.status='active' AND u.email_verified_at IS NOT NULL`,[adminSessionSha(raw)]);
    const user=result.rows[0];
    if(!user||!allowlist.has(normaliseEmail(user.email)))return null;
    return user;
  };

  const requireAdmin=asyncRoute(async(req,res,next)=>{
    if(!allowlist.size)return fail(res,503,'ADMIN_NOT_CONFIGURED','Admin access is not configured.');
    const raw=cookieToken(req),user=await readAdmin(raw);
    if(!user)return fail(res,401,'UNAUTHENTICATED','Admin sign-in required.');
    await pool.query('UPDATE auth_sessions SET last_used_at=now() WHERE id=$1',[user.session_id]);
    req.adminUser=user;
    next();
  });

  router.use(requireProxy);

  router.post('/login',asyncRoute(async(req,res)=>{
    if(!allowlist.size)return fail(res,503,'ADMIN_NOT_CONFIGURED','Admin access is not configured.');
    const address=normaliseEmail(req.body?.email),password=req.body?.password;
    const ipAllowed=await limit('admin-login-ip',req.ip,120,60);
    if(!ipAllowed)return fail(res,429,'RATE_LIMITED','Please wait before trying again.');
    if(validEmail(address)){
      const emailAllowed=await limit('admin-login-email',address,10,15);
      if(!emailAllowed)return fail(res,429,'RATE_LIMITED','Please wait before trying again.');
    }
    if(!validEmail(address)||typeof password!=='string'){
      await argon2.verify(await dummyHash,String(password||''));
      return fail(res,401,'INVALID_ADMIN_CREDENTIALS','Invalid administrator credentials.');
    }
    const result=await pool.query('SELECT id,email,password_hash,status,email_verified_at FROM users WHERE email=$1',[address]);
    const user=result.rows[0];
    if(!user){
      await argon2.verify(await dummyHash,password);
      return fail(res,401,'INVALID_ADMIN_CREDENTIALS','Invalid administrator credentials.');
    }
    const passwordOk=await argon2.verify(user.password_hash,password);
    if(!passwordOk||user.status!=='active'||!user.email_verified_at||!allowlist.has(normaliseEmail(user.email)))
      return fail(res,401,'INVALID_ADMIN_CREDENTIALS','Invalid administrator credentials.');
    const raw=token(),days=Number(config.sessionDays||14);
    await pool.query(`INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at)
      VALUES($1,$2,$3,'admin',$4)`,[uuidv7(),user.id,adminSessionSha(raw),new Date(Date.now()+days*86400000)]);
    res.cookie(ADMIN_COOKIE,raw,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:days*86400000});
    res.json({ok:true,user:publicUser(user)});
  }));

  router.get('/session',requireAdmin,asyncRoute(async(req,res)=>{
    res.json({ok:true,user:publicUser(req.adminUser)});
  }));

  router.post('/logout',asyncRoute(async(req,res)=>{
    const raw=cookieToken(req);
    if(raw)await pool.query("UPDATE auth_sessions SET revoked_at=now() WHERE token_hash=$1 AND purpose='admin' AND revoked_at IS NULL",[adminSessionSha(raw)]);
    res.clearCookie(ADMIN_COOKIE,{httpOnly:true,secure:true,sameSite:'strict',path:'/'});
    res.json({ok:true});
  }));

  router.get('/accounts',requireAdmin,asyncRoute(async(_req,res)=>{
    const result=await pool.query(`SELECT id,email,status,email_verified_at,created_at,updated_at
      FROM users ORDER BY created_at DESC,email ASC`);
    res.json({ok:true,accounts:result.rows});
  }));

  router.post('/accounts',requireAdmin,asyncRoute(async(req,res)=>{
    const address=normaliseEmail(req.body?.email),password=req.body?.password;
    if(!validEmail(address))return fail(res,400,'INVALID_EMAIL','Enter a valid email address.');
    if(!validPassword(password))return fail(res,400,'INVALID_PASSWORD','Use 12 to 128 characters for the password.');
    const passwordHash=await hashPassword(password),id=uuidv7();
    try{
      const result=await pool.query(`INSERT INTO users(id,email,password_hash,status,email_verified_at)
        VALUES($1,$2,$3,'active',now())
        RETURNING id,email,status,email_verified_at,created_at,updated_at`,[id,address,passwordHash]);
      res.status(201).json({ok:true,user:result.rows[0]});
    }catch(error){
      if(error.code==='23505')return fail(res,409,'ACCOUNT_EXISTS','An account with that email already exists.');
      throw error;
    }
  }));

  router.delete('/accounts/:id',requireAdmin,asyncRoute(async(req,res)=>{
    const result=await pool.query('DELETE FROM users WHERE id=$1 RETURNING id,email',[req.params.id]);
    if(!result.rowCount)return fail(res,404,'ACCOUNT_NOT_FOUND','Account not found.');
    res.status(204).end();
  }));

  router.use((_req,res)=>fail(res,404,'NOT_FOUND','Not found.'));
  app.use('/api/admin',router);
}
