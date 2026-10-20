import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountPool} from '../../src/database.js';
import {snapshot} from '../../src/marketplace-validation.js';
import {publicationContent} from '../../src/marketplace-publication.js';

const connection=process.env.BB_MARKETPLACE_TEST_URL;
if(!connection)throw new Error('Disposable PostgreSQL URL required');
const url=new URL(connection);
if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname!=='/postgres'||process.env.BB_MARKETPLACE_DISPOSABLE!=='true')throw new Error('Synthetic disposable service only');

test('native calendar dates survive reads, immutable snapshots and publication without changing timestamps',async()=>{
  const pool=createAccountPool({connectionString:connection});
  try {
    const row=(await pool.query("SELECT DATE '2026-11-01' AS available_from, DATE '2024-02-29' AS leap_date, NULL::date AS unknown_date, TIMESTAMPTZ '2026-11-01T00:00:00Z' AS stamp")).rows[0];
    assert.equal(row.available_from,'2026-11-01');
    assert.equal(row.leap_date,'2024-02-29');
    assert.equal(row.unknown_date,null);
    assert.ok(row.stamp instanceof Date);
    assert.equal(row.stamp.toISOString(),'2026-11-01T00:00:00.000Z');
    const id='019a0000-0000-7000-8000-000000000001';
    const aggregate={listing:{title:'Synthetic date fixture',description:'Synthetic only',transaction_type:'SALE',price_amount:'12.0000',currency_code:'PHP',available_from:row.available_from},property:{property_type:'LAND',city_id:id,barangay_id:id,lot_area_sqm:'100.0000'},details:{},rental_terms:{},sale_terms:{},development:null};
    const frozen=JSON.parse(JSON.stringify(snapshot(aggregate)));
    assert.equal(frozen.listing.available_from,'2026-11-01');
    const authority={status:'active',verification_state:'verified'};
    assert.equal(publicationContent(frozen,authority).listing.available_from,'2026-11-01');
    // Known legacy midnight-UTC snapshots remain supported. A non-midnight
    // historical instant has no trustworthy original calendar timezone here.
    frozen.listing.available_from='2026-11-01T00:00:00.000Z';
    assert.equal(publicationContent(frozen,authority).listing.available_from,'2026-11-01');
    frozen.listing.available_from='2026-10-31T15:00:00.000Z';
    assert.throws(()=>publicationContent(frozen,authority),error=>error.status===422);
    aggregate.listing.available_from=null;
    assert.equal(JSON.parse(JSON.stringify(snapshot(aggregate))).listing.available_from,null);
  } finally {await pool.end();}
});
