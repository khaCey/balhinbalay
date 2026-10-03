// Explicit offline provisioning only. Never imported by application startup.
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import {isDeepStrictEqual} from 'node:util';
import {v5 as uuidv5} from 'uuid';
import {Pool} from 'pg';
import {CATALOGUE,localDatabaseUrl,verifyFiles} from './verify-marketplace-release.js';

export const MANIFEST_SHA256='8899a5601d98a355ff1e7651e79f35a4c5bbcfcfc0f77a62ea34073a216a8c63';
export const PACKAGE_DIRECTORY=fileURLToPath(new URL('../reference/psgc-2q2026/',import.meta.url));
export const COUNTS={regions:18,provinces:82,cities:1642,barangays:42010};
const TABLES=Object.keys(COUNTS);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const fail=message=>{throw new Error('PSGC '+message);};
const equal=isDeepStrictEqual;
export const geographyId=code=>uuidv5('https://balhinbalay.com/reference/psgc/'+code,uuidv5.URL);
const columns={regions:['id','code','name'],provinces:['id','code','name','region_code'],
  cities:['id','code','name','region_code','province_code','locality_type'],barangays:['id','code','name','city_code']};

export function validateReference(rows) {
  if(!rows||!equal(Object.keys(rows).sort(),[...TABLES].sort()))fail('package tables differ');
  const codes=new Map(),ids=new Set(),maps={};
  for(const table of TABLES){
    const list=rows[table];
    if(!Array.isArray(list)||list.length!==COUNTS[table])fail('count mismatch: '+table);
    maps[table]=new Map();
    let previous='';
    for(const row of list){
      if(!row||!equal(Object.keys(row).sort(),[...columns[table]].sort()))fail('unexpected fields: '+table);
      if(typeof row.code!=='string'||!/^\d{10}$/.test(row.code)||row.code<=previous)fail('duplicate or unordered code: '+table);
      previous=row.code;
      if(typeof row.name!=='string'||!row.name.trim()||row.name.includes('\0'))fail('empty or invalid authoritative name');
      if(row.id!==geographyId(row.code)||ids.has(row.id)||codes.has(row.code))fail('duplicate or invalid geographic identity: '+row.code);
      codes.set(row.code,table);ids.add(row.id);maps[table].set(row.code,row);
    }
  }
  for(const row of rows.regions)if(!/^\d{2}00000000$/.test(row.code))fail('invalid Region code');
  for(const row of rows.provinces){
    if(!maps.regions.has(row.region_code)||row.region_code!==row.code.slice(0,2)+'00000000'||!row.code.endsWith('00000'))fail('invalid Province parent: '+row.code);
  }
  for(const row of rows.cities){
    if(!maps.regions.has(row.region_code)||row.region_code!==row.code.slice(0,2)+'00000000'||!row.code.endsWith('000')||!['CITY','MUNICIPALITY'].includes(row.locality_type))fail('invalid City/Municipality parent/type: '+row.code);
    const expectedProvince=row.code.slice(0,5)+'00000';
    if(maps.provinces.has(expectedProvince)){
      if(row.province_code!==expectedProvince||maps.provinces.get(row.province_code).region_code!==row.region_code)fail('invalid Province/Region hierarchy: '+row.code);
    }else if(row.province_code!==null)fail('invalid non-null Province: '+row.code);
  }
  const exceptions=rows.cities.filter(r=>r.province_code===null).map(r=>r.code);
  if(exceptions.length!==43)fail('province-null administrative exception count');
  if(rows.cities.filter(r=>r.locality_type==='CITY').length!==149)fail('city type count');
  for(const row of rows.barangays){
    let parent=row.code.slice(0,7)+'000';
    if(row.code.startsWith('13806'))parent='1380600000'; // PSA Notes A.1, Manila districts.
    if(!maps.cities.has(row.city_code)||row.city_code!==parent)fail('invalid Barangay/City parent: '+row.code);
  }
  return maps;
}

export async function loadPackage({directory=PACKAGE_DIRECTORY,source}={}) {
  const bytes=await readFile(join(directory,'manifest.json'));
  if(hash(bytes)!==MANIFEST_SHA256)fail('manifest checksum mismatch');
  const manifest=JSON.parse(bytes);
  const files=[...TABLES.map(t=>t+'.json'),'hierarchy.json'];
  if(manifest.format!=='balhinbalay-psgc-2q2026-v1'||!equal(manifest.counts,COUNTS)||!equal(Object.keys(manifest.files).sort(),files.sort()))fail('invalid pinned manifest');
  const loaded={};
  for(const name of files){
    const data=await readFile(join(directory,name)),expected=manifest.files[name];
    if(data.length!==expected.size_bytes||hash(data)!==expected.sha256)fail('provisioning checksum mismatch: '+name);
    loaded[name]=JSON.parse(data);
  }
  if(source){const raw=await readFile(source);if(raw.length!==manifest.source.size_bytes||hash(raw)!==manifest.source.sha256)fail('authoritative source checksum mismatch');}
  const rows=Object.fromEntries(TABLES.map(t=>[t,loaded[t+'.json']]));
  validateReference(rows);
  const hierarchy=loaded['hierarchy.json'];
  if(!equal(hierarchy.counts,COUNTS)||!equal(hierarchy.province_null_locality_codes,rows.cities.filter(r=>r.province_code===null).map(r=>r.code))||rows.barangays.filter(r=>r.city_code==='1380600000').length!==897)fail('hierarchy summary differs');
  return {manifest,rows,hierarchy};
}

const selects={
  regions:'SELECT id,code,name FROM regions ORDER BY code',
  provinces:'SELECT p.id,p.code,p.name,r.code AS region_code FROM provinces p JOIN regions r ON r.id=p.region_id ORDER BY p.code',
  cities:'SELECT c.id,c.code,c.name,r.code AS region_code,p.code AS province_code,c.locality_type FROM cities c JOIN regions r ON r.id=c.region_id LEFT JOIN provinces p ON p.id=c.province_id ORDER BY c.code',
  barangays:'SELECT b.id,b.code,b.name,c.code AS city_code FROM barangays b JOIN cities c ON c.id=b.city_id ORDER BY b.code',
};
async function requireLedger(client){
  const names=(await client.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map(r=>r.name);
  if(!equal(names,Object.keys(CATALOGUE)))fail('requires exact migration ledger 001–006');
  const extension=await client.query("SELECT 1 FROM pg_extension WHERE extname='postgis'");
  if(!extension.rowCount)fail('requires installed PostGIS');
}
async function assess(client,rows,{allowMissing=false}={}) {
  const stored={},byCode=new Map(),byId=new Map(),counts={},missing={},extras={};
  for(const table of TABLES){
    stored[table]=(await client.query(selects[table])).rows;
    counts[table]=stored[table].length;
    for(const row of stored[table]){
      if(byCode.has(row.code))fail('conflicting geographic level for existing code: '+row.code);
      if(byId.has(row.id))fail('existing UUID reused across geographic identities');
      byCode.set(row.code,{table,row});byId.set(row.id,{table,code:row.code});
    }
  }
  for(const table of TABLES){
    const expectedCodes=new Set(rows[table].map(r=>r.code));
    extras[table]=stored[table].filter(r=>!expectedCodes.has(r.code)).map(r=>r.code);
    missing[table]=[];
    for(const expected of rows[table]){
      const existing=byCode.get(expected.code);
      if(!existing){
        if(!allowMissing)fail('missing reference: '+expected.code);
        const occupied=byId.get(expected.id);
        if(occupied)fail('new reference UUID conflicts with existing identity: '+expected.code);
        missing[table].push(expected.code);continue;
      }
      if(existing.table!==table)fail('conflicting geographic level for existing code: '+expected.code);
      // Existing correct UUIDs are retained; parent identity is compared by PSGC
      // code, not by forcing the deterministic UUID onto previously stored rows.
      for(const key of columns[table].filter(k=>k!=='id'))if(existing.row[key]!==expected[key])fail('conflict '+expected.code+' field '+key);
    }
  }
  return {counts,missing,extras};
}

export async function verifyGeography(pool,rows){
  validateReference(rows);await verifyFiles();
  const client=await pool.connect();
  try{
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await requireLedger(client);
    const result=await assess(client,rows);
    await client.query('COMMIT');return {verified:true,...result};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

export async function applyGeography(pool,rows){
  validateReference(rows);await verifyFiles();
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout='15s'; SET LOCAL statement_timeout='120s'");
    await requireLedger(client);
    // Serialise provisioning and concurrent reference writes before inspecting.
    // Ordinary application reads may continue, but WRK0043 requires stopped runtime.
    await client.query('LOCK TABLE regions,provinces,cities,barangays IN SHARE ROW EXCLUSIVE MODE');
    const before=await assess(client,rows,{allowMissing:true});
    const inserted={};
    inserted.regions=(await client.query(`INSERT INTO regions(id,code,name)
      SELECT s.id,s.code,s.name FROM jsonb_to_recordset($1::jsonb) AS s(id uuid,code text,name text)
      WHERE NOT EXISTS(SELECT 1 FROM regions e WHERE e.code=s.code)`,[JSON.stringify(rows.regions)])).rowCount;
    inserted.provinces=(await client.query(`INSERT INTO provinces(id,code,name,region_id)
      SELECT s.id,s.code,s.name,r.id FROM jsonb_to_recordset($1::jsonb) AS s(id uuid,code text,name text,region_code text)
      JOIN regions r ON r.code=s.region_code WHERE NOT EXISTS(SELECT 1 FROM provinces e WHERE e.code=s.code)`,[JSON.stringify(rows.provinces)])).rowCount;
    inserted.cities=(await client.query(`INSERT INTO cities(id,code,name,region_id,province_id,locality_type)
      SELECT s.id,s.code,s.name,r.id,p.id,s.locality_type FROM jsonb_to_recordset($1::jsonb) AS s(id uuid,code text,name text,region_code text,province_code text,locality_type text)
      JOIN regions r ON r.code=s.region_code LEFT JOIN provinces p ON p.code=s.province_code
      WHERE NOT EXISTS(SELECT 1 FROM cities e WHERE e.code=s.code)`,[JSON.stringify(rows.cities)])).rowCount;
    inserted.barangays=(await client.query(`INSERT INTO barangays(id,code,name,city_id)
      SELECT s.id,s.code,s.name,c.id FROM jsonb_to_recordset($1::jsonb) AS s(id uuid,code text,name text,city_code text)
      JOIN cities c ON c.code=s.city_code WHERE NOT EXISTS(SELECT 1 FROM barangays e WHERE e.code=s.code)`,[JSON.stringify(rows.barangays)])).rowCount;
    for(const table of TABLES)if(inserted[table]!==before.missing[table].length)fail('insert count differs: '+table);
    const after=await assess(client,rows);
    await client.query('COMMIT');return {verified:true,inserted,...after};
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  let pool;
  try{
    const [command,...args]=process.argv.slice(2);
    if(!['files','verify','apply'].includes(command))fail('usage: files [--source FILE] | verify | apply --runtime-stopped');
    const source=command==='files'&&args.length===2&&args[0]==='--source'?args[1]:undefined;
    if(command==='files'&&args.length&&!source||command==='verify'&&args.length||command==='apply'&&!equal(args,['--runtime-stopped']))fail('invalid command arguments');
    const pkg=await loadPackage({source});
    if(command==='files')console.log(JSON.stringify({verified:true,manifest_sha256:MANIFEST_SHA256,...pkg.manifest},null,2));
    else{
      localDatabaseUrl(process.env.DATABASE_URL);
      pool=new Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
      const result=await (command==='apply'?applyGeography(pool,pkg.rows):verifyGeography(pool,pkg.rows));
      console.log(JSON.stringify({command,manifest_sha256:MANIFEST_SHA256,...result},null,2));
    }
  }catch(error){console.error(error.message.startsWith('PSGC ')?error.message:'PSGC operation failed; inspect database/file errors privately without publishing credentials.');process.exitCode=1;}
  finally{if(pool)await pool.end();}
}
