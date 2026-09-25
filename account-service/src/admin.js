import argon2 from 'argon2';
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {createHash} from 'node:crypto';
import express from 'express';
import {v7 as uuidv7} from 'uuid';

const SESSION_COOKIE='__Host-bb_session';
const sha=value=>createHash('sha256').update(value).digest('hex');
const normaliseEmail=value=>typeof value==='string'?value.trim().toLowerCase():'';
const validEmail=value=>value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword=value=>typeof value==='string'&&value.length>=12&&value.length<=128;
const hashPassword=value=>argon2.hash(value,{type:argon2.argon2id,memoryCost:19456,timeCost:2,parallelism:1});

export function isLoopbackAddress(value){
  const address=String(value||'').toLowerCase();
  return address==='127.0.0.1'||address==='::1'||address==='::ffff:127.0.0.1';
}

const sameSecret=(expected,supplied)=>{
  const left=Buffer.from(String(expected||'')),right=Buffer.from(String(supplied||''));
  return left.length===right.length&&timingSafeEqual(left,right);
};
const asyncRoute=fn=>(req,res)=>Promise.resolve(fn(req,res)).catch(error=>{
  console.error('Local admin request failed:',error?.code||error?.name||'UNKNOWN');
  if(!res.headersSent)res.status(503).json({ok:false,code:'ADMIN_UNAVAILABLE',message:'Admin operation failed.'});
});
const cookieToken=req=>String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length+1)||'';
const asyncMiddleware=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(error=>{
  console.error('Admin middleware failed:',error?.code||error?.name||'UNKNOWN');
  if(!res.headersSent)res.status(503).json({ok:false,code:'ADMIN_UNAVAILABLE',message:'Admin operation failed.'});
});

const adminPage=token=>`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="bb-admin-token" content="${token}">
<title>BalhinBalay Account Admin</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;color:#172033;background:#f5f7fb}*{box-sizing:border-box}body{margin:0;padding:32px}main{max-width:1050px;margin:auto}.card{background:#fff;border:1px solid #dfe5ee;border-radius:16px;padding:20px;margin:0 0 20px;box-shadow:0 6px 24px #15213a0d}h1,h2{margin-top:0}form{display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:end}label{display:grid;gap:6px;font-size:14px;font-weight:600}input,button{font:inherit;border-radius:10px;border:1px solid #cfd7e4;padding:10px 12px}button{cursor:pointer;background:#172033;color:#fff;border-color:#172033}button.danger{background:#fff;color:#b42318;border-color:#f0b4ae}.muted{color:#667085;font-size:14px}.status{min-height:22px;margin:10px 0 0}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px 10px;border-bottom:1px solid #edf0f5;font-size:14px}th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#667085}.badge{display:inline-block;border-radius:999px;padding:4px 8px;background:#eef2f7}.verified{color:#067647}.pending{color:#b54708}@media(max-width:760px){body{padding:16px}form{grid-template-columns:1fr}th:nth-child(1),td:nth-child(1){display:none}}
</style>
</head>
<body>
<main>
  <section class="card">
    <h1>BalhinBalay Account Admin</h1>
    <p class="muted">Local-only owner tool. This page is served by the private account service and is not routed through balhinbalay.com.</p>
  </section>
  <section class="card">
    <h2>Create pre-verified account</h2>
    <form id="create-form">
      <label>Email<input id="email" type="email" maxlength="254" required autocomplete="off"></label>
      <label>Password<input id="password" type="password" minlength="12" maxlength="128" required autocomplete="new-password"></label>
      <button type="submit">Create active account</button>
    </form>
    <p id="message" class="status" role="status"></p>
  </section>
  <section class="card">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><h2 style="margin:0">Accounts</h2><button id="refresh" type="button">Refresh</button></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>Email</th><th>Status</th><th>Verified</th><th>Created</th><th></th></tr></thead><tbody id="accounts"></tbody></table></div>
  </section>
</main>
<script>
const token=document.querySelector('meta[name="bb-admin-token"]').content;
const rows=document.getElementById('accounts'),message=document.getElementById('message');
const text=value=>String(value??'');
async function api(path,options={}){
  const headers={...(options.headers||{}),'x-balhinbalay-admin-token':token};
  if(options.body)headers['content-type']='application/json';
  const response=await fetch(path,{...options,headers,credentials:'same-origin'});
  if(response.status===204)return null;
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.message||'Request failed.');
  return body;
}
function cell(value){const td=document.createElement('td');td.textContent=text(value);return td;}
async function load(){
  rows.replaceChildren();
  try{
    const {accounts}=await api('/admin/api/accounts');
    for(const account of accounts){
      const tr=document.createElement('tr');
      tr.append(cell(account.id),cell(account.email));
      const status=cell(account.status);status.className='badge '+(account.status==='active'?'verified':'pending');tr.append(status);
      tr.append(cell(account.email_verified_at?new Date(account.email_verified_at).toLocaleString():'No'));
      tr.append(cell(new Date(account.created_at).toLocaleString()));
      const actions=document.createElement('td'),button=document.createElement('button');button.type='button';button.className='danger';button.textContent='Delete';
      button.addEventListener('click',async()=>{if(!confirm('Delete '+account.email+'? This also removes its sessions and verification/reset actions.'))return;button.disabled=true;try{await api('/admin/api/accounts/'+encodeURIComponent(account.id),{method:'DELETE'});message.textContent='Deleted '+account.email;await load();}catch(error){message.textContent=error.message;}finally{button.disabled=false;}});
      actions.append(button);tr.append(actions);rows.append(tr);
    }
    if(!accounts.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.className='muted';td.textContent='No accounts found.';tr.append(td);rows.append(tr);}
  }catch(error){message.textContent=error.message;}
}
document.getElementById('create-form').addEventListener('submit',async event=>{
  event.preventDefault();message.textContent='';
  const button=event.currentTarget.querySelector('button');button.disabled=true;
  try{
    const body=await api('/admin/api/accounts',{method:'POST',body:JSON.stringify({email:document.getElementById('email').value,password:document.getElementById('password').value})});
    event.currentTarget.reset();message.textContent='Created verified account '+body.user.email;await load();
  }catch(error){message.textContent=error.message;}finally{button.disabled=false;}
});
document.getElementById('refresh').addEventListener('click',load);load();
</script>
</body>
</html>`;

export function mountLocalAdmin(app,{pool,config}={}){
  if(!app||!pool)throw new Error('Admin app and database required');
  const token=randomBytes(32).toString('base64url');
  const loopbackOnly=(req,res,next)=>{
    if(!isLoopbackAddress(req.socket?.remoteAddress))return res.status(404).type('text').send('Not found.');
    next();
  };
  const requireToken=(req,res,next)=>{
    if(!sameSecret(token,req.get('x-balhinbalay-admin-token')))return res.status(403).json({ok:false,code:'FORBIDDEN',message:'Forbidden.'});
    next();
  };

  app.get('/admin',loopbackOnly,(req,res)=>{
    res.set({
      'Cache-Control':'no-store',
      'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      'Referrer-Policy':'no-referrer',
      'X-Content-Type-Options':'nosniff',
      'X-Frame-Options':'DENY'
    });
    res.type('html').send(adminPage(token));
  });
  app.use('/admin/api',loopbackOnly,requireToken);

  app.get('/admin/api/accounts',asyncRoute(async(_req,res)=>{
    const result=await pool.query(`SELECT id,email,status,email_verified_at,created_at,updated_at
      FROM users ORDER BY created_at DESC,email ASC`);
    res.json({ok:true,accounts:result.rows});
  }));

  app.post('/admin/api/accounts',asyncRoute(async(req,res)=>{
    const address=normaliseEmail(req.body?.email),password=req.body?.password;
    if(!validEmail(address))return res.status(400).json({ok:false,code:'INVALID_EMAIL',message:'Enter a valid email address.'});
    if(!validPassword(password))return res.status(400).json({ok:false,code:'INVALID_PASSWORD',message:'Use 12 to 128 characters for the password.'});
    const passwordHash=await hashPassword(password),id=uuidv7();
    try{
      const result=await pool.query(`INSERT INTO users(id,email,password_hash,status,email_verified_at)
        VALUES($1,$2,$3,'active',now())
        RETURNING id,email,status,email_verified_at,created_at,updated_at`,[id,address,passwordHash]);
      res.status(201).json({ok:true,user:result.rows[0]});
    }catch(error){
      if(error.code==='23505')return res.status(409).json({ok:false,code:'ACCOUNT_EXISTS',message:'An account with that email already exists.'});
      throw error;
    }
  }));

  app.delete('/admin/api/accounts/:id',asyncRoute(async(req,res)=>{
    const result=await pool.query('DELETE FROM users WHERE id=$1 RETURNING id,email',[req.params.id]);
    if(!result.rowCount)return res.status(404).json({ok:false,code:'ACCOUNT_NOT_FOUND',message:'Account not found.'});
    res.status(204).end();
  }));

  // Site-facing admin API. The Site proxy supplies the same private key used by
  // public auth routes, while this layer still requires a live account session
  // whose email is explicitly allowlisted in server configuration.
  const expected=Buffer.from(String(config?.proxyKey||''));
  const requireProxy=(req,res,next)=>{
    const supplied=Buffer.from(String(req.get('x-balhinbalay-proxy-key')||''));
    if(!expected.length||supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return res.status(403).json({ok:false,code:'FORBIDDEN',message:'Forbidden.'});
    if(req.method!=='GET'&&req.get('origin')!==config?.appOrigin)return res.status(403).json({ok:false,code:'ORIGIN_REJECTED',message:'Forbidden.'});
    next();
  };
  const requireAdmin=asyncMiddleware(async(req,res,next)=>{
    const allowlist=new Set(Array.isArray(config?.adminEmails)?config.adminEmails.map(normaliseEmail):[]);
    if(!allowlist.size)return res.status(503).json({ok:false,code:'ADMIN_NOT_CONFIGURED',message:'Admin access is not configured.'});
    const raw=cookieToken(req);
    if(!raw)return res.status(401).json({ok:false,code:'UNAUTHENTICATED',message:'Sign in required.'});
    const result=await pool.query(`SELECT u.id,u.email,u.status,u.email_verified_at
      FROM auth_sessions s JOIN users u ON u.id=s.user_id
      WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now()
      AND u.status='active' AND u.email_verified_at IS NOT NULL`,[sha(raw)]);
    if(!result.rowCount)return res.status(401).json({ok:false,code:'UNAUTHENTICATED',message:'Sign in required.'});
    if(!allowlist.has(normaliseEmail(result.rows[0].email)))return res.status(403).json({ok:false,code:'ADMIN_FORBIDDEN',message:'Admin access required.'});
    req.adminUser=result.rows[0];
    next();
  });
  const mountAccounts=router=>{
    router.get('/accounts',asyncRoute(async(_req,res)=>{
      const result=await pool.query(`SELECT id,email,status,email_verified_at,created_at,updated_at
        FROM users ORDER BY created_at DESC,email ASC`);
      res.json({ok:true,accounts:result.rows});
    }));
    router.post('/accounts',asyncRoute(async(req,res)=>{
      const address=normaliseEmail(req.body?.email),password=req.body?.password;
      if(!validEmail(address))return res.status(400).json({ok:false,code:'INVALID_EMAIL',message:'Enter a valid email address.'});
      if(!validPassword(password))return res.status(400).json({ok:false,code:'INVALID_PASSWORD',message:'Use 12 to 128 characters for the password.'});
      const passwordHash=await hashPassword(password),id=uuidv7();
      try{
        const result=await pool.query(`INSERT INTO users(id,email,password_hash,status,email_verified_at)
          VALUES($1,$2,$3,'active',now())
          RETURNING id,email,status,email_verified_at,created_at,updated_at`,[id,address,passwordHash]);
        res.status(201).json({ok:true,user:result.rows[0]});
      }catch(error){
        if(error.code==='23505')return res.status(409).json({ok:false,code:'ACCOUNT_EXISTS',message:'An account with that email already exists.'});
        throw error;
      }
    }));
    router.delete('/accounts/:id',asyncRoute(async(req,res)=>{
      const result=await pool.query('DELETE FROM users WHERE id=$1 RETURNING id,email',[req.params.id]);
      if(!result.rowCount)return res.status(404).json({ok:false,code:'ACCOUNT_NOT_FOUND',message:'Account not found.'});
      res.status(204).end();
    }));
  };
  const adminRouter=express.Router();
  adminRouter.use(requireProxy,requireAdmin);
  mountAccounts(adminRouter);
  app.use('/api/admin',adminRouter);
}
