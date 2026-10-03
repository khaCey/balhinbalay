import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readConfig} from '../src/config.js';
import {verifyFiles,localDatabaseUrl} from '../scripts/verify-marketplace-release.js';
const env={DATABASE_URL:'postgresql://synthetic:synthetic@localhost/fixture',APP_URL:'https://fixture.invalid',SMTP_HOST:'smtp.invalid',SMTP_PORT:'587',SMTP_USER:'synthetic',SMTP_PASS:'synthetic',SMTP_FROM:'synthetic@fixture.invalid',PROXY_KEY:'synthetic-proxy-key-01234567890123456789'};
test('marketplace defaults off and child flags cannot bypass master',()=>{
  for(const e of [env,{...env,MARKETPLACE_ENABLED:'TRUE'},{...env,MARKETPLACE_MESSAGING_ENABLED:'true',MARKETPLACE_MODERATION_ENABLED:'true',MARKETPLACE_PUBLICATION_ENABLED:'true'}]){
    const c=readConfig(e);for(const k of ['marketplaceEnabled','messagingEnabled','moderationEnabled','publicationEnabled'])assert.equal(c[k],false);
  }
  const c=readConfig({...env,MARKETPLACE_ENABLED:'true',MARKETPLACE_MESSAGING_ENABLED:'true',MARKETPLACE_MODERATION_ENABLED:'true',MARKETPLACE_PUBLICATION_ENABLED:'true'});
  for(const k of ['marketplaceEnabled','messagingEnabled','moderationEnabled','publicationEnabled'])assert.equal(c[k],true);
});
test('release catalogue rejects unused migration007 and changed reviewed bytes',async()=>{
  await verifyFiles();const dir=await mkdtemp(join(tmpdir(),'bb-wrk0042-files-'));
  try{
    await cp(new URL('../migrations/',import.meta.url),dir,{recursive:true});await writeFile(join(dir,'007_unreviewed.sql'),'SELECT 1;');await assert.rejects(verifyFiles(dir),/catalogue/);
    await rm(join(dir,'007_unreviewed.sql'));await writeFile(join(dir,'003_marketplace_identity.sql'),'SELECT 1;');await assert.rejects(verifyFiles(dir),/checksum/);
  }finally{await rm(dir,{recursive:true});}
});
test('manual gate rejects nonlocal/malformed database URLs without exposing credentials',()=>{
  for(const value of ['bad','postgresql://private-password@remote.invalid/prod','https://localhost/prod'])assert.throws(()=>localDatabaseUrl(value),/private local/);
  assert.equal(localDatabaseUrl(env.DATABASE_URL).pathname,'/fixture');
});
