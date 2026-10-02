import {readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Pool} from 'pg';
import {resolve,join} from 'node:path';
import {ensureUserPrincipal} from './marketplace-identity.js';

const dir=fileURLToPath(new URL('../migrations/',import.meta.url));
export async function migrate(pool,{directory=dir}={}){
  const client=await pool.connect();
  try{
    // One writer across all service instances; keep the existing ledger and
    // per-migration transaction boundary. This never runs automatically at boot.
    await client.query('SELECT pg_advisory_lock(37190037)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    for(const name of (await readdir(directory)).filter(x=>/^\d+_[a-z_]+\.sql$/.test(x)).sort()){
      const exists=await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
      if(exists.rowCount)continue;
      await client.query('BEGIN');
      try{
        await client.query(await readFile(join(directory,name),'utf8'));
        if(name==='003_marketplace_identity.sql'){
          const users=await client.query('SELECT id FROM users ORDER BY id');
          for(const user of users.rows)await ensureUserPrincipal(client,user.id);
        }
        await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);
        await client.query('COMMIT');
      }catch(error){await client.query('ROLLBACK');throw error;}
    }
  }finally{await client.query('SELECT pg_advisory_unlock(37190037)');client.release();}
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
  const pool=new Pool({connectionString:process.env.DATABASE_URL});
  try{await migrate(pool);process.stdout.write('Account migrations applied.\n');}
  finally{await pool.end();}
}
