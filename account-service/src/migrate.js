import {readdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Pool} from 'pg';
import {resolve} from 'node:path';

const dir=fileURLToPath(new URL('../migrations/',import.meta.url));
export async function migrate(pool){
  const client=await pool.connect();
  try{
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
    for(const name of (await readdir(dir)).filter(x=>/^\d+_[a-z_]+\.sql$/.test(x)).sort()){
      const exists=await client.query('SELECT 1 FROM schema_migrations WHERE name=$1',[name]);
      if(exists.rowCount)continue;
      await client.query('BEGIN');
      try{
        await client.query(await readFile(new URL(`../migrations/${name}`,import.meta.url),'utf8'));
        await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);
        await client.query('COMMIT');
      }catch(error){await client.query('ROLLBACK');throw error;}
    }
  }finally{client.release();}
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
  if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required');
  const pool=new Pool({connectionString:process.env.DATABASE_URL});
  try{await migrate(pool);process.stdout.write('Account migrations applied.\n');}
  finally{await pool.end();}
}
