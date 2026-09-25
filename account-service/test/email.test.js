import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {SMTPServer} from 'smtp-server';
import {createMailer} from '../src/email.js';

test('historical Nodemailer transport sends verification and reset messages over authenticated local STARTTLS',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'bb-smtp-'));
  const key=join(dir,'key.pem'),cert=join(dir,'cert.pem');
  let server,mailer;
  try{
    execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',cert,
      '-days','1','-subj','/CN=127.0.0.1','-addext','subjectAltName=IP:127.0.0.1'],{stdio:'ignore'});
    const received=[];
    server=new SMTPServer({secure:false,key:await readFile(key),cert:await readFile(cert),
      onAuth(auth,session,callback){callback(null,{user:auth.username});},
      onData(stream,session,callback){
        let text='';stream.on('data',chunk=>{text+=chunk.toString();});
        stream.on('end',()=>{received.push(text);callback();});
      }});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const env={SMTP_HOST:'127.0.0.1',SMTP_PORT:String(server.server.address().port),SMTP_USER:'test',SMTP_PASS:'local-only',
      SMTP_FROM:'support@balhinbalay.example',SMTP_SECURE:'false'};
    mailer=createMailer(env,{ca:await readFile(cert)});
    await mailer.verify('recipient@example.com','https://balhinbalay.example/#verify-email/test-action');
    await mailer.reset('recipient@example.com','https://balhinbalay.example/#reset-password/test-action');
    assert.equal(received.length,2);
    assert.match(received[0],/verify-email\/test-action/);
    assert.match(received[1],/reset-password\/test-action/);
  }finally{
    mailer?.close();
    if(server)await new Promise(resolve=>server.close(resolve));
    await rm(dir,{recursive:true,force:true});
  }
});

test('SMTP configuration cannot fall back to logging an action link',()=>{
  assert.throws(()=>createMailer({SMTP_HOST:'localhost'}),/SMTP_PORT is required/);
});
