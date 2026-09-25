// Retains the historical Nodemailer/SMTP transport and confirmation/reset copy intent.
// Missing SMTP configuration is fatal at startup; no token/link logging fallback exists.
import nodemailer from 'nodemailer';

export function createMailer(env=process.env,{ca}={}){
  for(const name of ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM'])if(!env[name])throw new Error(`${name} is required`);
  const secure=env.SMTP_SECURE==='true';
  const transport=nodemailer.createTransport({host:env.SMTP_HOST,port:Number(env.SMTP_PORT),secure,
    requireTLS:!secure,auth:{user:env.SMTP_USER,pass:env.SMTP_PASS},
    connectionTimeout:12000,greetingTimeout:8000,socketTimeout:12000,
    tls:{rejectUnauthorized:true,...(ca?{ca}:{})}});
  const send=async(to,subject,text)=>{
    const result=await transport.sendMail({from:env.SMTP_FROM,to,subject,text});
    if(!result.accepted?.includes(to))throw new Error('SMTP did not accept recipient');
  };
  return {
    verify:(to,url)=>send(to,'Verify your BalhinBalay account',
      `Use this link to verify your email: ${url}\n\nThis link expires in 24 hours. If you did not register, ignore this email.`),
    reset:(to,url)=>send(to,'Reset your BalhinBalay password',
      `Use this link to reset your password: ${url}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`),
    close:()=>transport.close(),
  };
}
