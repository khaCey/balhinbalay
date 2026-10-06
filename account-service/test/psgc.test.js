import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadPackage,validateReference,geographyId,COUNTS,PACKAGE_DIRECTORY} from '../scripts/provision-psgc.js';

const pkg=await loadPackage();
test('Pinned PSGC files and exact expected hierarchy verify without any network dependency',()=>{
  assert.deepEqual(pkg.manifest.counts,COUNTS);
  assert.equal(pkg.manifest.source.sha256,'31892bc2bdde3ea0682562d9412b5bab4d45a0be5e5a5b4f6c9d7714b94bca5d');
  assert.equal(pkg.manifest.effective_date,'2026-06-30');
  assert.equal(pkg.manifest.release_date,'2026-07-13');
  assert.equal(pkg.hierarchy.province_null_locality_codes.length,43);
  assert.equal(pkg.rows.cities.find(r=>r.code==='1381701000').province_code,null); // Pateros
  assert.equal(pkg.rows.cities.find(r=>r.code==='0990101000').region_code,'0900000000'); // Isabela
  for(const r of pkg.rows.cities.filter(r=>r.code.startsWith('19999')))assert.equal(r.province_code,null);
  assert.equal(pkg.rows.barangays.filter(r=>r.city_code==='1380600000').length,897);
  assert.equal(pkg.rows.cities.find(r=>r.code==='0702223000').province_code,'0702200000');
  assert.equal(pkg.rows.provinces.find(r=>r.code==='1804500000').region_code,'1800000000');
  assert.equal(pkg.rows.provinces.find(r=>r.code==='0906600000').region_code,'0900000000');
});
test('Every geographic identity has a deterministic code-based UUID and no unrelated/private fields',()=>{
  const ids=new Set();
  for(const [table,rows] of Object.entries(pkg.rows))for(const row of rows){
    assert.equal(row.id,geographyId(row.code));assert.equal(ids.has(row.id),false);ids.add(row.id);
    assert.doesNotMatch(JSON.stringify(Object.keys(row)),/address|unit|room|location|population|latitude|longitude|postal|phone|email/);
    if(table==='barangays')assert.equal(typeof row.city_code,'string');
  }
  assert.equal(ids.size,43752);
  // Name bytes, including source whitespace, are retained deliberately.
  assert.equal(pkg.rows.cities.find(r=>r.code==='0730600000').name,'City of Cebu ');
});
test('Duplicate conflicting codes, wrong identity and invalid Barangay/City parent fail explicitly',()=>{
  let rows=structuredClone(pkg.rows);rows.barangays[1]={...rows.barangays[0],name:'Conflicting duplicate'};
  assert.throws(()=>validateReference(rows),/duplicate or unordered/);
  rows=structuredClone(pkg.rows);rows.barangays[0].city_code=pkg.rows.cities.find(r=>r.code==='0702223000').code;
  assert.throws(()=>validateReference(rows),/invalid Barangay\/City parent/);
  rows=structuredClone(pkg.rows);rows.cities[0].id=pkg.rows.cities[1].id;
  assert.throws(()=>validateReference(rows),/invalid geographic identity/);
  rows=structuredClone(pkg.rows);rows.cities.find(r=>r.code==='0702223000').province_code='1804500000';
  assert.throws(()=>validateReference(rows),/invalid Province\/Region/);
});
test('Altered provisioning bytes and a rewritten manifest fail the pinned checksum gate',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'bb-psgc-checksum-'));
  try{
    await cp(PACKAGE_DIRECTORY,dir,{recursive:true});
    const path=join(dir,'barangays.json'),bytes=await readFile(path);
    await writeFile(path,Buffer.concat([bytes,Buffer.from('\n')]));
    await assert.rejects(loadPackage({directory:dir}),/provisioning checksum mismatch/);
    await writeFile(path,bytes);
    const manifest=join(dir,'manifest.json');await writeFile(manifest,(await readFile(manifest,'utf8'))+'\n');
    await assert.rejects(loadPackage({directory:dir}),/manifest checksum mismatch/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('An altered authoritative source is rejected before use',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'bb-psgc-source-'));
  try{const source=join(dir,'altered.xlsx');await writeFile(source,'Altered source bytes');await assert.rejects(loadPackage({source}),/authoritative source checksum mismatch/);}
  finally{await rm(dir,{recursive:true,force:true});}
});
