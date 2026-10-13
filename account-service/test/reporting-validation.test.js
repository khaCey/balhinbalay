import test from 'node:test';
import assert from 'node:assert/strict';
import {reportInput,reportReviewInput,reportQueueInput} from '../src/marketplace-reporting.js';
test('report policy rejects identity injection, unsupported reasons, oversized or non-text details',()=>{
 assert.deepEqual(reportInput({reason:'OTHER',details:'  A problem  '}),{reason:'OTHER',details:'A problem'});
 for(const body of [{reason:'invented'},{reason:'OTHER',reported_by_user_id:'someone'},{reason:'OTHER',details:null},{reason:'OTHER',details:'x'.repeat(2001)}])assert.throws(()=>reportInput(body));
});
test('review version and bounded queue options are validated',()=>{
 assert.deepEqual(reportReviewInput({status:'UNDER_REVIEW',expected_version:1}),{status:'UNDER_REVIEW',note:'',version:'1'});
 for(const body of [{status:'NEW',expected_version:1},{status:'RESOLVED'},{status:'DISMISSED',expected_version:1,note:22}])assert.throws(()=>reportReviewInput(body));
 assert.deepEqual(reportQueueInput({status:'NEW',limit:'2'}),{before:null,limit:2,status:'NEW'});
 for(const query of [{limit:'0'},{limit:'101'},{limit:'1e1'},{status:'UNKNOWN'},{reporter_email:'x'}])assert.throws(()=>reportQueueInput(query));
});
