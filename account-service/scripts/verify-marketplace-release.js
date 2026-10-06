// Manual, read-only release gate. This file never invokes the migration runner.
import {createHash} from 'node:crypto';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {Pool} from 'pg';

export const CATALOGUE={
  '001_accounts.sql':'941a93460f29cbbaee3333db80df85b55f298634e6c1282127ab162dfe7afbc1',
  '002_session_purpose.sql':'7b744abfb719f4a568b8d75e0b52bb54f24a29bcf3b13bc9e40429919b575510',
  '003_marketplace_identity.sql':'dd5f6c209b8df97c0fabbfc24cb51f0864fa85608f8e617be4dd72623fd71d2f',
  '004_property_listing_foundation.sql':'8bb58e2cd5a0bac2294047a0bcfc95f050c46abc323e4d17a5f6c552f988c470',
  '005_marketplace_messaging.sql':'d16584e0bda332b9fb39486a2323ee0d5d066083fc23db7549649cad775acbbf',
  '006_listing_moderation.sql':'71dcb5f7cd02b98a6f2d28ce58b3c3a51de74a772e7a7d0173243fe3cda4859c',
};
const directory=fileURLToPath(new URL('../migrations/',import.meta.url));
const hash=x=>createHash('sha256').update(x).digest('hex');
function requireEqual(a,b,message){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(message);}
export async function verifyFiles(dir=directory){
  const names=(await readdir(dir)).filter(x=>/^\d+_[a-z_]+\.sql$/.test(x)).sort();
  requireEqual(names,Object.keys(CATALOGUE),'Unexpected migration catalogue');
  for(const name of names)if(hash(await readFile(join(dir,name)))!==CATALOGUE[name])throw new Error('Migration checksum mismatch: '+name);
  return CATALOGUE;
}
export function localDatabaseUrl(value){
  let url;try{url=new URL(value);}catch{throw new Error('A private local database URL is required');}
  if(!['postgres:','postgresql:'].includes(url.protocol)||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||!/^\/[A-Za-z0-9_]+$/.test(url.pathname))throw new Error('A private local database URL is required');
  return url;
}
const originals={
  users:'id,email,password_hash,status,email_verified_at,created_at,updated_at',
  auth_sessions:'id,user_id,token_hash,created_at,last_used_at,expires_at,revoked_at,purpose',
  account_actions:'id,user_id,purpose,token_hash,created_at,expires_at,consumed_at,invalidated_at,sent_at',
  auth_rate_limits:'bucket_hash,count,window_start',
};
const requiredTables=['currencies','organisations','organisation_memberships','permissions','organisation_membership_permissions','principals','lister_access','regions','provinces','cities','barangays','developments','properties','condo_details','apartment_details','house_details','townhouse_details','room_details','land_details','property_private_locations','property_authorities','property_aliases','property_merge_events','features','property_features','development_features','listings','rental_terms','sale_terms','listing_submissions','listing_status_history','listing_price_history','audit_events','conversations','conversation_participants','messages','listing_submission_reviews'];
const requiredTriggers=['properties_aggregate_check','listings_aggregate_check','listing_submissions_immutable','listing_status_history_immutable','listing_price_history_immutable','audit_events_immutable','conversation_two_participants','conversation_participant_mapping','conversation_context_immutable','conversation_no_delete','participants_immutable','messages_immutable','listing_submission_reviews_immutable'];
export function requirePreserved(before,after){
  requireEqual(before.accounts,after.accounts,'Original account/session/action identity changed');
  requireEqual(before.ledger,after.ledger.slice(0,before.ledger.length),'Original migration ledger changed');
}
export async function inspectDatabase(pool,stage,previous){
  if(!['before','after'].includes(stage))throw new Error('Unknown release gate');
  await verifyFiles();
  const c=await pool.connect();
  try{
    await c.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const identity=(await c.query('SELECT current_database() AS database,current_setting(\'server_version_num\') AS server_version')).rows[0];
    const ledger=(await c.query('SELECT name,applied_at FROM schema_migrations ORDER BY name')).rows.map(r=>({name:r.name,applied_at:r.applied_at.toISOString()}));
    requireEqual(ledger.map(r=>r.name),Object.keys(CATALOGUE).slice(0,stage==='before'?2:6),'Unexpected production migration ledger');
    const accounts={};
    for(const [table,columns] of Object.entries(originals)){
      const rows=(await c.query(`SELECT row_to_json(t) AS row FROM (SELECT ${columns} FROM ${table} ORDER BY ${table==='auth_rate_limits'?'bucket_hash':'id'}) t`)).rows.map(r=>r.row);
      accounts[table]={count:rows.length,sha256:hash(JSON.stringify(rows))};
    }
    const postgis=(await c.query("SELECT default_version,installed_version FROM pg_available_extensions WHERE name='postgis'")).rows[0];
    if(!postgis)throw new Error('PostGIS is unavailable on this PostgreSQL installation');
    const tables=(await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows.map(r=>r.tablename);
    if(stage==='before'){
      if(requiredTables.some(name=>tables.includes(name)))throw new Error('Unexpected existing marketplace schema');
    }else{
      if(!postgis.installed_version||requiredTables.some(name=>!tables.includes(name)))throw new Error('Required marketplace schema is absent');
      const invalid=(await c.query("SELECT count(*)::int n FROM pg_constraint WHERE connamespace='public'::regnamespace AND NOT convalidated")).rows[0].n;
      if(invalid)throw new Error('Unvalidated public schema constraints');
      const triggers=(await c.query("SELECT tgname FROM pg_trigger t JOIN pg_class r ON r.oid=t.tgrelid JOIN pg_namespace n ON n.oid=r.relnamespace WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgenabled IN ('O','A')")).rows.map(r=>r.tgname);
      if(requiredTriggers.some(name=>!triggers.includes(name)))throw new Error('Required marketplace history/participant triggers are disabled or absent');
      const missing=(await c.query("SELECT count(*)::int n FROM users u WHERE (SELECT count(*) FROM principals p WHERE p.user_id=u.id AND p.kind='USER')<>1")).rows[0].n;
      if(missing)throw new Error('User principal backfill is incomplete');
    }
    const result={format:'balhinbalay-release-v1',stage,...identity,migrations:CATALOGUE,ledger,accounts,postgis};
    if(previous){
      if(previous.format!==result.format||previous.stage!=='before'||previous.database!==result.database||previous.server_version!==result.server_version)throw new Error('Invalid pre-migration identity record');
      requireEqual(previous.migrations,CATALOGUE,'Pre-migration catalogue differs');requirePreserved(previous,result);
    }
    await c.query('COMMIT');return result;
  }catch(error){await c.query('ROLLBACK');throw error;}finally{c.release();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  let pool;
  try{
    const [stage,...args]=process.argv.slice(2);
    if(stage==='files'){if(args.length)throw new Error('Unexpected argument');console.log(JSON.stringify(await verifyFiles(),null,2));}
    else{
      const options={};for(let i=0;i<args.length;i+=2){if(!['--record','--previous'].includes(args[i])||!args[i+1]||options[args[i]])throw new Error('Invalid gate arguments');options[args[i]]=args[i+1];}
      if(!options['--record']||(stage==='after'&&!options['--previous'])||(stage==='before'&&options['--previous']))throw new Error('A private evidence record is required');
      localDatabaseUrl(process.env.DATABASE_URL);
      pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
      const previous=options['--previous']?JSON.parse(await readFile(options['--previous'],'utf8')):undefined;
      const result=await inspectDatabase(pool,stage,previous);
      await writeFile(resolve(options['--record']),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
      console.log('Read-only release gate PASS; private digest record saved.');
    }
  }catch(error){const safe=/^(Unexpected |Migration checksum|Original |Required marketplace|PostGIS |Unvalidated |User principal |Invalid pre-migration|Pre-migration|A private|Unknown release|Invalid gate|A private evidence)/.test(error.message);console.error(safe?error.message:'Release gate failed; inspect privately without publishing database errors or credentials.');process.exitCode=1;}
  finally{if(pool)await pool.end();}
}
