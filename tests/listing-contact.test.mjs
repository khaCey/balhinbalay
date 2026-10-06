import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {contactRequest,sendContact} from '../lib/listing-contact.js';
const listing='019a0000-0000-7000-8000-000000000001',thread='019a0000-0000-7000-8000-000000000002';
test('real contact request rejects sample identifiers and retains the same key for retries without client identities',()=>{
 for(const sample of [1,'1',null])assert.throws(()=>contactRequest(sample,'Hello'));
 assert.throws(()=>contactRequest(listing,'  '));
 const first=contactRequest(listing,'Hello');assert.equal(contactRequest(listing,'Hello',first),first);assert.notEqual(contactRequest(listing,'Changed',first).client_request_id,first.client_request_id);
 assert.deepEqual(Object.keys(first).sort(),['client_request_id','first_message','listing_id']);
});
test('contact flow sends through the existing messaging API and navigates only on successful real UUID response',async()=>{
 const payload=contactRequest(listing,'Hello');let sent,path;
 await sendContact(payload,async(resource,options)=>{sent={resource,options};return {conversation:{id:thread}};},value=>{path=value;});
 assert.equal(sent.resource,'conversations');assert.equal(sent.options.method,'POST');assert.deepEqual(sent.options.body,payload);assert.equal(path,'/chat/'+thread);
 path=null;const authError=Object.assign(new Error('Sign in'),{code:'UNAUTHENTICATED'});await assert.rejects(sendContact(payload,async()=>{throw authError;},v=>{path=v;}),authError);assert.equal(path,null);
 await assert.rejects(sendContact(payload,async()=>({conversation:{id:1}}),v=>{path=v;}));assert.equal(path,null);
});
test('public real detail alone integrates the authenticated in-app composer; sample detail keeps messaging disabled',async()=>{
 const [publicUI,contactUI,sample]=await Promise.all(['../components/balhinbalay/PublicListing.jsx','../components/balhinbalay/ListingContact.jsx','../components/balhinbalay/Property.jsx'].map(path=>readFile(new URL(path,import.meta.url),'utf8')));
 assert.match(publicUI,/<ListingContact key=\{listing.id\} listingId=\{listing.id\}/);assert.doesNotMatch(sample,/ListingContact|contactRequest|sendContact|POST.*conversations/);
 assert.match(contactUI,/!sessionChecked/);assert.match(contactUI,/!account\|\|signIn/);assert.match(contactUI,/Checking your account/);assert.match(contactUI,/Sign in to contact/);assert.match(contactUI,/UNAUTHENTICATED/);assert.match(contactUI,/Sending…/);assert.match(contactUI,/role="alert"/);
 assert.doesNotMatch(contactUI,/localStorage|recipient_user_id|sender_id|participants|\.email|\.phone|mailto:|tel:/);
});
