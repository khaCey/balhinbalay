import test from 'node:test';
import assert from 'node:assert/strict';
import {types} from 'pg';
import {createAccountPool} from '../src/database.js';

test('account calendar-date parsing is pool-local and preserves other driver types',async()=>{
  const defaultDate=types.getTypeParser(1082,'text');
  const pool=createAccountPool({max:3});
  try {
    const parsers=pool.options.types;
    assert.equal(parsers.getTypeParser(1082,'text')('2024-02-29'),'2024-02-29');
    assert.equal(parsers.getTypeParser(1082)('2026-11-01'),'2026-11-01');
    assert.equal(types.getTypeParser(1082,'text'),defaultDate);
    assert.equal(parsers.getTypeParser(1082,'binary'),types.getTypeParser(1082,'binary'));
    for(const oid of [1114,1184,23,1700])assert.equal(parsers.getTypeParser(oid,'text'),types.getTypeParser(oid,'text'));
    assert.equal(pool.options.max,3);
  } finally {await pool.end();}
});
