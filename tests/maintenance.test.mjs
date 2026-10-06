import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createRequire} from 'node:module';
const {createMaintenanceServer}=createRequire(import.meta.url)('../ops/windows/maintenance-server.cjs');
test('maintenance responds 503 without reflecting private request data',async()=>{
  const server=createMaintenanceServer();server.listen(0,'127.0.0.1');await once(server,'listening');
  try{
    const response=await fetch(`http://127.0.0.1:${server.address().port}/private-synthetic-path`,{method:'POST',body:'private-synthetic-body',headers:{Cookie:'private-synthetic-cookie'}});
    assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('retry-after'),'120');
    const body=await response.text();assert.ok(body.includes('scheduled maintenance'));assert.ok(!body.includes('private-synthetic'));
  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
test('maintenance HEAD is 503 with no response body',async()=>{
  const server=createMaintenanceServer();server.listen(0,'127.0.0.1');await once(server,'listening');
  try{const response=await fetch(`http://127.0.0.1:${server.address().port}/`,{method:'HEAD'});assert.equal(response.status,503);assert.equal(await response.text(),'');}
  finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
