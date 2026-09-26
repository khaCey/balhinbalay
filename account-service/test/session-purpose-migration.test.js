import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {v7 as uuidv7} from 'uuid';

const digest=value=>createHash('sha256').update(value).digest('hex');

test('002_session_purpose preserves existing sessions as ordinary user sessions',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'bb-session-purpose-migration-'));
  const database=new PGlite(dir);
  try{
    await database.exec(await readFile(new URL('../migrations/001_accounts.sql',import.meta.url),'utf8'));
    const userId=uuidv7(),sessionId=uuidv7();
    await database.query(`INSERT INTO users(id,email,password_hash,status,email_verified_at)
      VALUES($1,'admin@example.com','test-hash','active',now())`,[userId]);
    await database.query(`INSERT INTO auth_sessions(id,user_id,token_hash,expires_at)
      VALUES($1,$2,$3,$4)`,[sessionId,userId,digest('existing-ordinary-session'),new Date(Date.now()+86400000)]);

    await database.exec(await readFile(new URL('../migrations/002_session_purpose.sql',import.meta.url),'utf8'));

    const migrated=await database.query('SELECT purpose FROM auth_sessions WHERE id=$1',[sessionId]);
    assert.equal(migrated.rows[0].purpose,'user');

    await assert.rejects(
      database.query(`INSERT INTO auth_sessions(id,user_id,token_hash,purpose,expires_at)
        VALUES($1,$2,$3,'unexpected',$4)`,[uuidv7(),userId,digest('invalid-purpose-session'),new Date(Date.now()+86400000)]),
    );
  }finally{
    await database.close();
    await rm(dir,{recursive:true,force:true});
  }
});
