import test from 'node:test';
import assert from 'node:assert/strict';
import {messageInput} from '../src/marketplace-messaging.js';
const id='0199b172-945c-7000-8000-000000000001';
test('text/idempotency shape rejects identity, empty, oversized and invalid input',()=>{
 assert.equal(messageInput({body:'Hello <script>',client_request_id:id}).body,'Hello <script>');
 for(const extra of [{sender_id:id},{recipient_user_id:id},{mine:true},{attachments:[]}])assert.throws(()=>messageInput({body:'Hi',client_request_id:id,...extra}));
 for(const body of ['', '   ', 'x'.repeat(2001), '\0', '😀'.repeat(1600)])assert.throws(()=>messageInput({body,client_request_id:id}));
 assert.throws(()=>messageInput({body:'Hi',client_request_id:'1'}));
 assert.throws(()=>messageInput({first_message:'Hi',client_request_id:id},true));
});
