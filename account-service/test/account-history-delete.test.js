import test from 'node:test';
import assert from 'node:assert/strict';
import {guardedDeleteAccount} from '../src/marketplace-identity.js';

function restrictedPool(code) {
  const calls=[];
  let released=false;
  const error=Object.assign(new Error('Synthetic database failure'),{code});
  const pool={connect:async()=>({
    async query(sql) {
      calls.push(sql);
      if(sql.startsWith('SELECT id'))return {rowCount:1,rows:[{id:'synthetic'}]};
      if(sql.includes('to_regclass'))return {rows:[{present:null}]};
      if(sql.startsWith('DELETE'))throw error;
      return {rowCount:0,rows:[]};
    },
    release(){released=true;},
  })};
  return {pool,calls,error,released:()=>released};
}

for(const code of ['23503','23001']) {
  test(`retained account history (${code}) returns a conflict after rollback`,async()=>{
    const fixture=restrictedPool(code);
    assert.deepEqual(await guardedDeleteAccount(fixture.pool,'synthetic'),{history:true,rowCount:0,rows:[]});
    assert.ok(fixture.calls.includes('ROLLBACK'));
    assert.ok(!fixture.calls.includes('COMMIT'));
    assert.ok(fixture.released());
  });
}

test('unrelated deletion failures still propagate after rollback',async()=>{
  const fixture=restrictedPool('08006');
  await assert.rejects(guardedDeleteAccount(fixture.pool,'synthetic'),error=>error===fixture.error);
  assert.ok(fixture.calls.includes('ROLLBACK'));
  assert.ok(fixture.released());
});
