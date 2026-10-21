// Disposable compatibility evidence only; this does not authorise deployment.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,copyFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {v7 as uuidv7} from 'uuid';
import {createAccountPool} from '../../src/database.js';
import {migrate} from '../../src/migrate.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable PostgreSQL/PostGIS URL required');
const url=new URL(connection);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Synthetic disposable service only');
const source=new URL('../../migrations/',import.meta.url);
const catalogue=(await readdir(source)).filter(n=>n.endsWith('.sql')).sort();
assert.equal(catalogue.length,8);
const root=createAccountPool({connectionString:connection});
await test('WRK0071 fresh, historical, reporting-first and media-first catalogues converge',async t=>{
 try{
  for(const [suffix,prefix] of [['fresh',[]],['six',catalogue.slice(0,6)],['reporting',catalogue.slice(0,7)],['media',[...catalogue.slice(0,6),catalogue[7]]]]){
   await t.test(suffix,async()=>{
    const name='bb_wrk0071_'+suffix,dir=await mkdtemp(join(tmpdir(),'bb-catalogue-'));
    let pool;
    try{
     await root.query(`CREATE DATABASE ${name} TEMPLATE template0`);
     pool=createAccountPool({connectionString:new URL('/'+name,connection).href});
     for(const file of prefix)await copyFile(new URL(file,source),join(dir,file));
     await migrate(pool,{directory:dir});
     let before;
     if(prefix.length){
      await pool.query("INSERT INTO users(id,email,password_hash,status,email_verified_at) VALUES($1,'preserved@synthetic.invalid','synthetic','active',now())",[uuidv7()]);
      before=(await pool.query('SELECT * FROM users')).rows;
     }
     await migrate(pool);await migrate(pool);
     assert.deepEqual((await pool.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map(r=>r.name),catalogue);
     if(before)assert.deepEqual((await pool.query('SELECT * FROM users')).rows,before);
     const tables=(await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows.map(r=>r.tablename);
     for(const table of ['listing_reports','listing_report_reviews','media_assets','media_variants','listing_media','listing_submission_media'])assert.ok(tables.includes(table),table);
    }finally{
     await pool?.end();await root.query(`DROP DATABASE IF EXISTS ${name}`);await rm(dir,{recursive:true,force:true});
    }
   });
  }
 }finally{await root.end();}
});
