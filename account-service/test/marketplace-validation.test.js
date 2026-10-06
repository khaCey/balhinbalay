import test from 'node:test';
import assert from 'node:assert/strict';
import {fields,applicability,submissionErrors,snapshot,POLICY,LISTING_FIELDS,RENT_FIELDS} from '../src/marketplace-validation.js';
const aggregate=()=>({listing:{title:'t',description:'d',transaction_type:'RENT',price_amount:'1.0001',currency_code:'PHP'},property:{property_type:'HOUSE',city_id:'city',barangay_id:'barangay'},authority:{status:'active',verification_state:'verified'},details:{},rental_terms:{pricing_period:'MONTHLY'},sale_terms:{},development:null,private_location:{street_address:'PRIVATE'}});

test('submission policy preserves zero/null and zero-photo accepted first-slice contract',()=>{
 const x=aggregate();assert.equal(POLICY,'marketplace_submission_v1');assert.deepEqual(submissionErrors(x),{});x.property.property_type='ROOM';x.property.parent_property_id='parent';x.details={max_occupants:2,bathroom_access:'NONE'};x.rental_terms={pricing_period:'DAILY',offering_mode:'BEDSPACE',current_occupants:0};assert.deepEqual(submissionErrors(x),{});assert.equal(snapshot(x).rental_terms.current_occupants,0);assert.ok(!JSON.stringify(snapshot(x)).includes('PRIVATE'));assert.ok(!('photos' in snapshot(x)));
});
test('draft supplied-value checks reject rounded/mis-typed/unsupported values and preserve decimal strings',()=>{
 assert.deepEqual(fields({price_amount:'1.0001'},LISTING_FIELDS,'listing'),{price_amount:'1.0001'});
 for(const value of [1,'0','-1','1.00001','1e2'])assert.throws(()=>fields({price_amount:value},LISTING_FIELDS,'listing'));
 for(const value of ['not-a-date','2026-02-30','9999-99-99'])assert.throws(()=>fields({available_from:value},LISTING_FIELDS,'listing'));
 assert.deepEqual(fields({deposit:'0',current_occupants:0},RENT_FIELDS,'rental_terms'),{deposit:'0',current_occupants:0});
 assert.throws(()=>fields({status:'active'},LISTING_FIELDS,'listing'));
 assert.throws(()=>applicability({property_type:'ROOM'}, {max_occupants:1}, {current_occupants:2},'RENT'));
});
test('submission completeness is separate from draft checks: authority, building, room, land and optional fields',()=>{
 const x=aggregate();x.authority.verification_state='declared';assert.ok(submissionErrors(x).authority);x.authority.verification_state='verified';x.property.property_type='LAND';assert.ok(submissionErrors(x)['property.lot_area_sqm']);x.property.lot_area_sqm='0.1';assert.deepEqual(submissionErrors(x),{});x.property.property_type='CONDO';assert.ok(submissionErrors(x)['property.development_id']);x.development={development_type:'CONDOMINIUM'};assert.deepEqual(submissionErrors(x),{});
});
