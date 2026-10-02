import test from 'node:test';
import assert from 'node:assert/strict';
import {routePath,restorePath,navigationSnapshot,legacyPath} from '../components/balhinbalay/browserState.js';
import {marketplaceAllowed} from '../lib/marketplace-proxy.js';
const id='0199b172-945c-7000-8000-000000000001';
test('chat clean paths and navigation retain real UUIDs without demo fallback',()=>{
 assert.equal(routePath('chat',{chat:id}),'/chat/'+id);
 assert.equal(restorePath('/chat/'+id,'',null,{page:'home'}).chat,id);
 assert.equal(navigationSnapshot({page:'chat',chat:id}).chat,id);
 assert.equal(legacyPath('#chat/'+id),'/chat/'+id);
 assert.equal(legacyPath('#chat/1'),null);
 assert.equal(routePath('chat',{chat:1}),'/messages');
 assert.equal(restorePath('/chat/1','',null,{page:'home'}).chat,null);
});
test('messaging proxy allows only exact ordinary conversation resources',()=>{
 for(const method of ['GET','POST']){assert.equal(marketplaceAllowed(method,['conversations']),true);assert.equal(marketplaceAllowed(method,['conversations',id,'messages']),true);}
 assert.equal(marketplaceAllowed('GET',['conversations',id]),true);
 for(const path of [['conversations','1'],['conversations',id,'participants'],['conversations',id,'messages','extra']])assert.equal(marketplaceAllowed('POST',path),false);
 for(const method of ['DELETE','PATCH'])assert.equal(marketplaceAllowed(method,['conversations',id,'messages']),false);
 assert.equal(marketplaceAllowed('GET',['conversations'],true),false);
});
