import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../components/balhinbalay/PublicInfo.jsx',import.meta.url),'utf8');

test('privacy describes the implemented account and provider boundaries',()=>{
  assert.match(source,/Argon2id password hash/);
  assert.match(source,/does not store your plaintext password/);
  assert.match(source,/Verification and password-reset actions send email/);
  assert.match(source,/HttpOnly, Secure, SameSite=Lax session cookie/);
  assert.match(source,/server stores a digest of the session credential/);
  assert.match(source,/Cloudflare HTTPS and Cloudflare Tunnel/);
  assert.match(source,/sample listings and illustrative property information/);
  assert.match(source,/Saved places, saved searches, messaging and listing management are not available in this beta/);
});

test('terms describe required email verification without implying unsupported marketplace features',()=>{
  assert.doesNotMatch(source,/If account registration is enabled/i);
  assert.doesNotMatch(source,/if registration is available/i);
  assert.match(source,/Account registration requires email verification before you can sign in/);
  assert.match(source,/Registration does not enable Lister publishing or property transactions/);
  assert.match(source,/Viewing requests, messages and saved places cannot be created here/);
});
