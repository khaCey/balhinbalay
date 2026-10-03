import test from 'node:test';
import assert from 'node:assert/strict';
import {publicationContent,publicProjection} from '../src/marketplace-publication.js';
import {readConfig} from '../src/config.js';
const id='019a0000-0000-7000-8000-000000000001';
const authority={status:'active',verification_state:'verified'};
const snapshot=()=>({listing:{title:'Approved',description:'Reviewed text',transaction_type:'SALE',price_amount:'12.0000',currency_code:'PHP',available_from:'2026-11-01T00:00:00.000Z'},property:{property_type:'LAND',city_id:id,barangay_id:id,lot_area_sqm:'100.0000'},details:{},rental_terms:{},sale_terms:{payment_notes:null},development:null});
test('publication validator rechecks approved completeness and rejects private/unknown or inapplicable snapshot fields',()=>{
 const good=publicationContent(snapshot(),authority);assert.equal(good.listing.available_from,'2026-11-01');
 for(const mutate of [s=>s.listing.title='',s=>s.property.lot_area_sqm=null,s=>s.private_location={street_address:'private'},s=>s.property.unit_identifier='private',s=>s.property.bedrooms=2,s=>s.listing.available_from='2026-02-30T00:00:00.000Z',s=>s.listing.available_from='2026-11-01T12:00:00.000Z']){const value=snapshot();mutate(value);assert.throws(()=>publicationContent(value,authority),error=>error.status===422);}
 assert.throws(()=>publicationContent(snapshot(),{status:'revoked',verification_state:'verified'}),e=>e.code==='PUBLICATION_INVALID');
});
test('public field projection drops internal/contact/draft/location secrets and cannot infer a pin',()=>{
 const content=publicationContent(snapshot(),authority);const row={id,published_at:'now',title:'unreviewed',email:'private',phone:'private',exact_location:{lat:1,lng:2},public_lat:14,public_lng:121,location_confirmed_at:'now'};
 const p=publicProjection(row,{content,location:{city:'City',barangay:'Barangay'}});assert.equal(p.title,'Approved');assert.equal(p.location.map_point,null);assert.doesNotMatch(JSON.stringify(p),/unreviewed|private|exact_location|city_id|barangay_id|development_id|parent_property_id/);
});
test('publication remains explicitly disabled unless both marketplace/publication flags are enabled',()=>{
 const env={DATABASE_URL:'synthetic',APP_URL:'https://site.invalid',SMTP_HOST:'synthetic',SMTP_PORT:'587',SMTP_USER:'synthetic',SMTP_PASS:'synthetic',SMTP_FROM:'test@invalid.test',PROXY_KEY:'x'.repeat(32)};
 assert.equal(readConfig(env).publicationEnabled,false);assert.equal(readConfig({...env,MARKETPLACE_PUBLICATION_ENABLED:'true'}).publicationEnabled,false);assert.equal(readConfig({...env,MARKETPLACE_ENABLED:'true',MARKETPLACE_PUBLICATION_ENABLED:'true'}).publicationEnabled,true);
});
