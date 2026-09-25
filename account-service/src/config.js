export function readConfig(env=process.env){
  const required=['DATABASE_URL','APP_URL','SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM','PROXY_KEY'];
  for(const name of required)if(!env[name])throw new Error(`${name} is required`);
  const appUrl=new URL(env.APP_URL);
  if(appUrl.protocol!=='https:'&&!(env.NODE_ENV==='development'&&appUrl.hostname==='localhost'))
    throw new Error('APP_URL must use HTTPS outside local development');
  if(appUrl.pathname!=='/'||appUrl.search||appUrl.hash)throw new Error('APP_URL must be an origin');
  const port=Number(env.SMTP_PORT);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('SMTP_PORT is invalid');
  if(env.PROXY_KEY.length<32)throw new Error('PROXY_KEY must be at least 32 characters');
  const adminEmails=String(env.ADMIN_EMAILS||'').split(',').map(value=>value.trim().toLowerCase()).filter(Boolean);
  if(adminEmails.some(value=>value.length>254||!/^\S+@\S+\.\S+$/.test(value)))throw new Error('ADMIN_EMAILS contains an invalid email');
  return {appOrigin:appUrl.origin,port,secure:env.SMTP_SECURE==='true',proxyKey:env.PROXY_KEY,
    adminEmails:[...new Set(adminEmails)],sessionDays:14,verificationHours:24,resetMinutes:15};
}
