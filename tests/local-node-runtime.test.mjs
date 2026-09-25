import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../',import.meta.url);

test('local start uses Vinext Node instead of Wrangler/workerd',async()=>{
  const pkg=JSON.parse(await readFile(new URL('package.json',root),'utf8'));
  assert.match(pkg.scripts.start,/^vinext start\b/);
  assert.match(pkg.scripts.start,/--port 8787\b/);
  assert.doesNotMatch(pkg.scripts.start,/wrangler|workerd/i);
});

test('Cloudflare Vite runtime is gated to managed Sites execution',async()=>{
  const config=await readFile(new URL('vite.config.ts',root),'utf8');
  assert.match(config,/const managedLinux = readExecutionProfile\(\) === "managed-linux"/);
  assert.match(config,/if \(managedLinux\) \{[\s\S]*await import\("@cloudflare\/vite-plugin"\)/);
  assert.match(config,/\.\.\.managedCloudflarePlugins/);
});
