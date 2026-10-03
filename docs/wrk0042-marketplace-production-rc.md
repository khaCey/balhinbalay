# WRK0042 marketplace production RC and later WRK0043 runbook

Prepared 3 October 2026 JST. **Preparation only. No production command below was executed by WRK0042.** Use only after Coordinator closes WRK0042 COMPLETE and the Owner explicitly confirms WRK0043's maintenance window on the exact reviewed candidate. Stop on every failed gate. WRK0019 and public-access policy remain separate.

## Exact source contract and assembly

Production input: `server` commit `c1f84c9366d421ca5eadc090f95c5b65d237b8c7`, tree `2ac64802879bf84a7132d577e9a0ee92adfe7e71`. Reviewed WRK0041 tip: `ea36a872621fc95b2f0820d7a17a629bfec0b3dd`, tree `127aa8ebec6064d89c84b2d214a1c63924366716`. Server is its exact common ancestor; the 13 reviewed WRK0037→0041 commits are retained through a two-parent RC assembly. No application, dependency or migration bytes are changed from the reviewed marketplace tip.

WRK0042 branch: `wrk0042-marketplace-production-rc`. **Obtain the exact final RC commit/tree from the accompanying WRK0042 verification report; never deploy a moving Work branch head.** A later server PR merge may have a different commit identity; it must contain the exact reviewed RC and have its exact tree. Record that promoted commit independently.

Five historical workflows are excluded: `wrk0037-marketplace.yml`, `wrk0038-messaging.yml`, `wrk0039-moderation.yml`, `wrk0040-publication.yml`, `wrk0041-contact.yml`. Their commits/runs remain historical evidence. The explicit `.github/workflows/wrk0042-marketplace-rc.yml` verifies only this Work branch on GitHub-hosted Ubuntu with a disposable `postgis/postgis:16-3.4` service, synthetic fixtures, full regressions and custom-backup restoration. It cannot run on `server` or deploy. Coordinator reviews its presence and the new manual preparation helpers as part of the RC. Existing production workflow, deploy script and PM2 ecosystem are unchanged.

New manual helpers: read-only migration/schema/account-digest verifier; a process-only environment loader; temporary loopback 503 responder. None runs at application startup. The existing migration runner alone applies SQL **when manually invoked**, globally serialises writers and performs the UUIDv7 principal backfill inside migration003's transaction.

## Migration catalogue

| Order | Reviewed file | SHA256 |
|---|---|---|
| 001 | 001_accounts.sql | 941a93460f29cbbaee3333db80df85b55f298634e6c1282127ab162dfe7afbc1 |
| 002 | 002_session_purpose.sql | 7b744abfb719f4a568b8d75e0b52bb54f24a29bcf3b13bc9e40429919b575510 |
| 003 | 003_marketplace_identity.sql | dd5f6c209b8df97c0fabbfc24cb51f0864fa85608f8e617be4dd72623fd71d2f |
| 004 | 004_property_listing_foundation.sql | 8bb58e2cd5a0bac2294047a0bcfc95f050c46abc323e4d17a5f6c552f988c470 |
| 005 | 005_marketplace_messaging.sql | d16584e0bda332b9fb39486a2323ee0d5d066083fc23db7549649cad775acbbf |
| 006 | 006_listing_moderation.sql | 71dcb5f7cd02b98a6f2d28ce58b3c3a51de74a772e7a7d0173243fe3cda4859c |

007 remains unused. No new migration. Expected live ledger is **001/002 only**, derived from the recorded account-only source; the actual production ledger/version/extension state is **unknown until WRK0043 preflight**. A different ledger stops execution for reconciliation. Ledger records filenames/times, not SQL hashes: source checksums do not retrospectively prove production SQL bytes. Verify schema and source evidence together.

Required PostgreSQL installation has usable PostGIS binaries and sufficient reviewed migration-role privileges for `CREATE EXTENSION postgis`, tables and backfill. CI PostgreSQL16/PostGIS3.4 proves isolated compatibility, not owner-PC PostgreSQL18 compatibility. Verify real server/tool versions, extension availability and backup restoration before mutation. No synthetic geography seed belongs in production. Recognised real City/Barangay catalogue is a separate operational prerequisite for complete submissions; if absent, stop that production smoke/rollout gate and seek a reviewed real reference import. Do not invent cities/barangays or import test fixtures.

## Production configuration and protected files

| Setting | Required meaning |
|---|---|
| MARKETPLACE_ENABLED | Exact `true` enables Lister/listing foundation; absent/other values disable it. |
| MARKETPLACE_MESSAGING_ENABLED | Exact `true` plus master enables participant messaging. |
| MARKETPLACE_MODERATION_ENABLED | Exact `true` plus master enables separate admin reviewer resources. |
| MARKETPLACE_PUBLICATION_ENABLED | Exact `true` plus master enables approved snapshot detail/activation and eligible real contact starts. |
| DATABASE_URL | Existing machine-local private loopback database and credentials. Never print it. |
| APP_URL | Existing canonical HTTPS Site origin, matching mutation checks. |
| SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM | Existing machine-local mail settings; preserve all. |
| PROXY_KEY / ACCOUNT_PROXY_KEY | Existing matching server-only proxy secrets; preserve all. |
| ADMIN_EMAILS | Existing server-only allowlist; reviewer still requires current active verified admin-purpose session. |
| ACCOUNT_API_ORIGIN / ACCOUNT_ALLOW_LOCAL_HTTP | Existing private loopback account proxy and accepted literal-loopback HTTP exception. |
| HOST / PORT | Existing account bind `127.0.0.1:5000`; Site remains `127.0.0.1:8787`. |

All four flags are required for this full marketplace rollout. With flags absent, capabilities remain disabled; startup never migrates. Enabled master requires003/004; messaging requires005; moderation/publication require006. Production must never set test variables `BB_MARKETPLACE_TEST_URL`, `BB_MARKETPLACE_DISPOSABLE`, `BB_MARKETPLACE_PG_CONTAINER` or the removed synthetic-start bypass.

The unchanged ecosystem reads existing secrets from `%USERPROFILE%\.balhinbalay\production.env` but **does not explicitly forward marketplace flags from that file**. The manual loader reads only its selected settings, validates them without displaying values, and puts flags/DB tool settings into the operator process. Use the existing PM2 `startOrRestart ... --update-env` path and verify the actual child-process flags below. Missing/incorrect inheritance fails the rollout; do not silently alter PM2 source or claim loading a file proves runtime configuration. Owner-authorised flag provisioning is a WRK0043 prerequisite; WRK0042 does not edit that file.

Protect environment/secrets, `%USERPROFILE%\pg18-balhinbalay` (verify actual cluster path later), PostgreSQL data, Cloudflare configuration/credentials, `%USERPROFILE%\.pm2` dump/runtime configuration, logs and automatic-deploy marker state. Do not create `%USERPROFILE%\.balhinbalay\server-deploy-enabled`, invoke `deploy-server.ps1`, run `git clean -xfd`, dump environments, or restore machine-local files from Git. Backups/digest proofs contain private metadata; keep them under a private ACL outside Git and never upload production data.

## Pre-deployment gates — authorised WRK0043 only

Execute in an owner-PC PowerShell terminal. Code blocks continue in the same session. Separate reviewed development checkout is `C:\GitHub\BalhinBalay-marketplace-review`; canonical live checkout remains `C:\GitHub\BalhinBalay-server`. Create the development checkout if necessary with normal Git, never overwrite an existing dirty folder. Install its frozen dependencies for read-only helpers. This is not the live checkout.

```powershell
$ErrorActionPreference='Stop'
function Invoke-Native([string]$Command,[string[]]$Arguments) {
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed; stop the maintenance procedure" }
}
$Live='C:\GitHub\BalhinBalay-server'
$Review='C:\GitHub\BalhinBalay-marketplace-review'
$RcSha=(Read-Host 'Exact Coordinator-approved RC commit from WRK0042 report').Trim()
$RcTree=(Read-Host 'Exact Coordinator-approved RC tree from WRK0042 report').Trim()
if ($RcSha -notmatch '^[0-9a-f]{40}$' -or $RcTree -notmatch '^[0-9a-f]{40}$') { throw 'Exact review identities required' }
$OldSha='c1f84c9366d421ca5eadc090f95c5b65d237b8c7'
$OldTree='2ac64802879bf84a7132d577e9a0ee92adfe7e71'
Set-Location $Review
Invoke-Native git @('fetch','origin')
if (@(git status --porcelain).Count -ne 0) { throw 'Review checkout is dirty' }
Invoke-Native git @('switch','--detach',$RcSha)
if ((git rev-parse HEAD).Trim() -ne $RcSha -or (git rev-parse 'HEAD^{tree}').Trim() -ne $RcTree) { throw 'Review checkout identity mismatch' }
Invoke-Native npm @('ci','--prefix','account-service')
Invoke-Native node @('account-service/scripts/verify-marketplace-release.js','files')
Set-Location $Live
Invoke-Native git @('fetch','origin')
if (@(git status --porcelain).Count -ne 0 -or (git branch --show-current).Trim() -ne 'server') { throw 'Live checkout is not clean server' }
if ((git rev-parse HEAD).Trim() -ne $OldSha -or (git rev-parse 'HEAD^{tree}').Trim() -ne $OldTree -or (git rev-parse origin/server).Trim() -ne $OldSha) { throw 'Recorded baseline diverged; reconcile before proceeding' }
if (Test-Path (Join-Path $env:USERPROFILE '.balhinbalay\server-deploy-enabled')) { throw 'Automatic deployment must remain disabled' }
$Runtime=pm2 jlist | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Runtime identity unavailable' }
foreach ($name in @('balhinbalay-site','balhinbalay-account')) {
  $processes=@($Runtime | Where-Object name -eq $name)
  if ($processes.Count -ne 1 -or $processes[0].pm2_env.status -ne 'online') { throw 'Existing runtime must be reconciled' }
  $expectedCwd=if ($name -eq 'balhinbalay-account') { Join-Path $Live 'account-service' } else { $Live }
  $expectedScript=if ($name -eq 'balhinbalay-account') { Join-Path $Live 'account-service\src\server.js' } else { Join-Path $Live 'ops\windows\site-runner.cjs' }
  if ($processes[0].pm2_env.pm_cwd -ne $expectedCwd -or $processes[0].pm2_env.pm_exec_path -ne $expectedScript) { throw 'Runtime is not using canonical source' }
}
# Keep the raw runtime object private. Record only names/status/cwd/script/PID/start time.
$Runtime | ForEach-Object { [pscustomobject]@{name=$_.name;pid=$_.pid;status=$_.pm2_env.status;cwd=$_.pm2_env.pm_cwd;script=$_.pm2_env.pm_exec_path;started=$_.pm2_env.pm_uptime} }
$Runtime=$null
. (Join-Path $Review 'ops\windows\load-marketplace-environment.ps1')
foreach ($flag in @('MARKETPLACE_ENABLED','MARKETPLACE_MESSAGING_ENABLED','MARKETPLACE_MODERATION_ENABLED','MARKETPLACE_PUBLICATION_ENABLED')) {
  if ([Environment]::GetEnvironmentVariable($flag,'Process') -cne 'true') { throw 'Owner-authorised rollout flags are absent; stop' }
}
$Evidence=Join-Path $env:USERPROFILE ('.balhinbalay\release-evidence\'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $Evidence | Out-Null
# Verify this directory has only the approved owner/admin ACL before saving proofs/backups.
Invoke-Native pg_dump @('--version')
Invoke-Native pg_restore @('--version')
Invoke-Native node @((Join-Path $Review 'account-service/scripts/verify-marketplace-release.js'),'before','--record',(Join-Path $Evidence 'preliminary-before.json'))
```

Also verify existing private listeners, local/public health, Cloudflare's existing route/access state and deployed build provenance. Checkout equality is not by itself proof that a running process loaded the latest build. Record executable path/start time and baseline build provenance; if ambiguous, stop for reconciliation, do not redeploy merely to infer identity. Confirm backup tool/server version compatibility, approved migration-role privileges and available PostGIS installation. `pg_dump --version` alone does not prove usability. The preliminary digest is not the final quiescent proof.

Create/list a preliminary custom backup while still live to establish tool access and available storage. **A live backup does not cover later writes.** The final stopped-runtime backup and its verified isolated restoration below are mandatory before any source/production DB mutation. Confirm a separately provisioned private scratch restore database can be created/dropped on this installation without touching the production database. Never attach Site/account to the restore copy.

## Maintenance window, final backup and usable-restore gate

Announce the accepted planned downtime; keep Cloudflare/public-access policy unchanged. The loopback503 responder occupies the existing Site port only while Site is stopped. There is a short downtime gap when taking over/releasing the port. It cannot serve503 simultaneously with Site smoke on that same port; this procedure does not claim otherwise.

```powershell
Invoke-Native pm2 @('stop','balhinbalay-site','balhinbalay-account')
$Stopped=pm2 jlist | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or @($Stopped | Where-Object { $_.name -in @('balhinbalay-site','balhinbalay-account') -and $_.pm2_env.status -ne 'stopped' }).Count -ne 0) { throw 'Runtime stop failed' }
$Stopped=$null
if (Get-NetTCPConnection -LocalPort 5000,8787 -State Listen -ErrorAction SilentlyContinue) { throw 'Runtime listeners remain active' }
$Maintenance=Start-Process node -ArgumentList @((Join-Path $Review 'ops\windows\maintenance-server.cjs')) -PassThru -RedirectStandardOutput (Join-Path $Evidence 'maintenance-out.log') -RedirectStandardError (Join-Path $Evidence 'maintenance-error.log')
Start-Sleep -Seconds 1
if ($Maintenance.HasExited -or (& curl.exe -s -o NUL -w '%{http_code}' 'http://127.0.0.1:8787/') -ne '503') { throw 'Maintenance responder failed' }
# Verify the existing external Site URL also shows maintenance within its unchanged access policy.
$Before=Join-Path $Evidence 'before.json'
Invoke-Native node @((Join-Path $Review 'account-service/scripts/verify-marketplace-release.js'),'before','--record',$Before)
$Backup=Join-Path $Evidence 'postgres-before-marketplace.dump'
Invoke-Native pg_dump @('--no-password','--format=custom','--no-owner','--file',$Backup)
if ((Get-Item $Backup).Length -le 0) { throw 'Backup is empty' }
Invoke-Native pg_restore @('--list',$Backup)
Get-FileHash -Algorithm SHA256 $Backup | Select-Object Algorithm,Hash,Path
$RestoreDb='bb_preflight_'+(Get-Date -Format 'yyyyMMddHHmmss')
$ProductionDatabaseUrl=$env:DATABASE_URL
Invoke-Native createdb @('--no-password','--maintenance-db','postgres','--template','template0',$RestoreDb)
Invoke-Native pg_restore @('--no-password','--exit-on-error','--no-owner','--dbname',$RestoreDb,$Backup)
$RestoreUrl=[System.UriBuilder]$ProductionDatabaseUrl
$RestoreUrl.Path='/'+$RestoreDb
$env:DATABASE_URL=$RestoreUrl.Uri.AbsoluteUri
Invoke-Native node @((Join-Path $Review 'account-service/scripts/verify-marketplace-release.js'),'before','--record',(Join-Path $Evidence 'restored-before.json'))
$env:DATABASE_URL=$ProductionDatabaseUrl
$A=Get-Content $Before -Raw | ConvertFrom-Json
$B=Get-Content (Join-Path $Evidence 'restored-before.json') -Raw | ConvertFrom-Json
if (($A.accounts | ConvertTo-Json -Depth 10 -Compress) -ne ($B.accounts | ConvertTo-Json -Depth 10 -Compress) -or ($A.ledger | ConvertTo-Json -Depth 10 -Compress) -ne ($B.ledger | ConvertTo-Json -Depth 10 -Compress)) { throw 'Restored backup identity/ledger differs' }
# ONLY the explicitly named separate scratch copy is dropped, never the production DB.
Invoke-Native dropdb @('--no-password','--maintenance-db','postgres',$RestoreDb)
$A=$null; $B=$null; $RestoreUrl=$null; $ProductionDatabaseUrl=$null
```

On any failure keep both runtimes stopped and maintenance active. If a restore command fails while DATABASE_URL temporarily points at the scratch copy, re-run the loader before further private inspection; never run migrations on an ambiguous target. Preserve failed restore/evidence for diagnosis. Verify no other writer/admin session is mutating the production database during the quiescent interval. If the operator cannot guarantee that, stop rather than compare unstable fingerprints.

## Exact promotion, stopped install/build and manual migrations

Only after verified backup: later authorised Coordinator/Owner promotes the reviewed RC PR to `server`. That action is **not WRK0042**. Automatic-deploy marker stays absent. Confirm the PR's exact candidate tree and all gates; do not substitute another branch tip.

```powershell
Set-Location $Live
Invoke-Native git @('fetch','origin')
$PromotedSha=(git rev-parse origin/server).Trim()
Invoke-Native git @('merge-base','--is-ancestor',$RcSha,$PromotedSha)
if ((git rev-parse "$PromotedSha^{tree}").Trim() -ne $RcTree) { throw 'Promoted server tree differs from exact reviewed RC' }
if (@(git status --porcelain).Count -ne 0 -or (git rev-parse HEAD).Trim() -ne $OldSha) { throw 'Live source changed since preflight' }
Invoke-Native git @('merge','--ff-only',$PromotedSha)
if ((git rev-parse HEAD).Trim() -ne $PromotedSha -or (git rev-parse 'HEAD^{tree}').Trim() -ne $RcTree) { throw 'Live candidate identity mismatch' }
Invoke-Native pnpm @('install','--frozen-lockfile')
Invoke-Native npm @('ci','--prefix','account-service')
Invoke-Native pnpm @('audit','--prod','--audit-level=high')
Invoke-Native npm @('audit','--omit=dev','--audit-level=high','--prefix','account-service')
Invoke-Native pnpm @('build')
if (-not (Test-Path 'dist\server\index.js') -or -not (Test-Path 'dist\client\vinext-client-entry-manifest.json')) { throw 'Production build outputs absent' }
Invoke-Native node @('account-service/scripts/verify-marketplace-release.js','files')
Invoke-Native git @('diff','--check')
if (@(git status --porcelain).Count -ne 0) { throw 'Source is not clean after build' }
. .\ops\windows\load-marketplace-environment.ps1
# Existing runner applies only pending003–006 in order, including003 principal backfill.
# Never execute the raw003 SQL with psql; it would skip the reviewed JS backfill.
Invoke-Native npm @('run','migrate','--prefix','account-service')
Invoke-Native node @('account-service/scripts/verify-marketplace-release.js','after','--previous',$Before,'--record',(Join-Path $Evidence 'after.json'))
```

The after gate requires exact ledger001–006, unchanged original ledger/account/session/action/rate-limit digests, all marketplace tables, validated constraints, enabled history/participant triggers, PostGIS and exactly one USER principal per user. It never repairs data. Inspect real geography readiness separately using authorised read-only evidence; no synthetic seed. Do not enable incomplete publication smoke to force a pass. Store checksum catalogue, exact source/tree, build outputs and private before/after records together.

## Restart and commit/runtime confirmation

Only after every preceding gate passes. Preserve the existing approved PM2 names/cwd/scripts; clear DB-tool secret variables before PM2 so they are not inherited unnecessarily. Required secrets continue to come from the unchanged ecosystem file. Keep the four approved flags in this terminal.

```powershell
foreach ($name in @('DATABASE_URL','PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSSLMODE')) { [Environment]::SetEnvironmentVariable($name,$null,'Process') }
Stop-Process -Id $Maintenance.Id
Invoke-Native pm2 @('startOrRestart','ops/windows/ecosystem.server.config.cjs','--update-env')
$Runtime=pm2 jlist | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Runtime confirmation failed' }
foreach ($name in @('balhinbalay-site','balhinbalay-account')) {
  $processes=@($Runtime | Where-Object name -eq $name)
  if ($processes.Count -ne 1 -or $processes[0].pm2_env.status -ne 'online') { throw 'Restart did not produce expected online runtime' }
  $expectedCwd=if ($name -eq 'balhinbalay-account') { Join-Path $Live 'account-service' } else { $Live }
  $expectedScript=if ($name -eq 'balhinbalay-account') { Join-Path $Live 'account-service\src\server.js' } else { Join-Path $Live 'ops\windows\site-runner.cjs' }
  if ($processes[0].pm2_env.pm_cwd -ne $expectedCwd -or $processes[0].pm2_env.pm_exec_path -ne $expectedScript) { throw 'Restart source path mismatch' }
  if ($name -eq 'balhinbalay-account') {
    foreach ($flag in @('MARKETPLACE_ENABLED','MARKETPLACE_MESSAGING_ENABLED','MARKETPLACE_MODERATION_ENABLED','MARKETPLACE_PUBLICATION_ENABLED')) {
      if ($processes[0].pm2_env.$flag -cne 'true') { throw 'Child process did not inherit reviewed marketplace flags' }
    }
  }
}
$Runtime | ForEach-Object { [pscustomobject]@{name=$_.name;pid=$_.pid;status=$_.pm2_env.status;cwd=$_.pm2_env.pm_cwd;script=$_.pm2_env.pm_exec_path;started=$_.pm2_env.pm_uptime} }
$Runtime=$null
if ((git rev-parse HEAD).Trim() -ne $PromotedSha -or (git rev-parse 'HEAD^{tree}').Trim() -ne $RcTree) { throw 'Restart source identity changed' }
Get-NetTCPConnection -LocalPort 5000,8787 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess
```

Both application listeners must remain loopback-only; verify process ownership, not merely open ports. PostgreSQL and account port must remain private. Confirm Site local/public health and ordinary account APIs through the existing HTTPS Site proxy. There is no invented account `/health` endpoint. Use auth/session and controlled authenticated requests. Save exact promoted commit/tree, build evidence and process identities; commit identity alone cannot prove response behaviour. Do not run `pm2 save` before successful smoke. When all gates pass, existing authorised runtime-save procedure may preserve successful state; no PM2 ecosystem edit is required.

The announced maintenance window remains open during controlled smoke. The temporary503 listener has been released because Site needs its port; this is planned downtime handling, not a zero-downtime/router change. A failed restart or smoke means immediately stop both runtimes and resume the same reviewed loopback responder.

## Targeted controlled production smoke — prepare now, execute in WRK0043 only

Use Owner-approved controlled real accounts/real geography, a reviewer distinct from the Lister, and two ordinary verified participants. Record resource UUIDs and results privately; no credentials/message bodies/private locations in public evidence. Keep test listing unlisted at completion unless Owner explicitly approves its inventory use. Do not repeat accepted broad registration/mail/reset/responsive/browse QA or WRK0019 checks.

| Sequence | Action and expected gate |
|---|---|
| 1 | Ordinary existing account login/session/refresh and intentional sign-out remain healthy; ordinary session cannot authorise admin resources. |
| 2 | `/owner`: request additive Lister access, pending denies draft creation; separate admin grants it. Active capability permits private draft. |
| 3 | `/editor/:uuid`: create/save incomplete draft; manage-own read persists and outsider read404. No browser-local demo persistence. |
| 4 | Complete text-first accepted fields with recognised City/Barangay; zero photos/no coordinate is valid. Declared authority denies submission; separate admin approves exact authority. |
| 5 | Submit immutable pending/unlisted snapshot; version conflict fails; private location/contact excluded from snapshot. |
| 6 | Separate `/admin` reviewer sees pending queue/detail; ordinary session/non-allowlisted admin denied. Approve chooses exact submission/reviewer/time, stays unlisted. For a separate controlled record, reject with reason then eligible edit/resubmit preserves prior history. |
| 7 | Lister Activate succeeds only on approved valid snapshot/authority/capability; Owner UI reports active/version. |
| 8 | Genuine `/listing/:uuid` and public detailAPI show approved snapshot, City+Barangay; no street/unit/room/exact private coordinate/email/phone/secret/live draft leakage. Coordinate-free listing has no fabricated map point. |
| 9 | Other verified ordinary user uses real detail in-app Contact, correct server-selected UUID thread/first message; retry reuses original. Self-contact/outsider/forged recipient denied. |
| 10 | Original Lister opens inbox/thread and replies; both participants read history. Suspension/revocation freezes both new senders but history remains; admin restoration resumes sending. |
| 11 | Unlist: public listingUUID/detail404 and new initiator cannot start; existing original participants still read/reply. No participant reassignment. |
| 12 | Numeric sample detail/cards/search remain illustrative and cannot initiate real conversations. Guest compare/recently-viewed/sample browse retain accepted behaviour. |

Check expected private API projections via browser Network without exporting cookies or full credential-bearing HARs. Confirm flags from actual backend process, not a client build value. Stop rollout on any concrete regression; do not silently change the RC. Mark later WRK0043 REVIEW only when its own acceptance gates pass.

## Failure and rollback/recovery boundaries

| Failure point | Mandatory response |
|---|---|
| Before any source/DB mutation | Stop. Preserve old runtime/source/config; if already stopped, old source may be restarted with its original machine-local settings after health checks. No migration rollback needed. |
| Source/install/build failure before migrations | Keep offline/503. Exact pre-window source is c1f84c…/tree2ac648… only if verified in preflight. Restore local tracked source to that exact commit without deleting machine-local files, use its frozen dependencies/build/original flags and approved runtime path. Do not rewind remote `server` or trigger automatic deployment. |
| During migration | Keep offline; each file is atomic but the **chain is not one transaction**. Earlier003/004/005 may already have committed. Record actual ledger and error privately. Do not infer complete rollback, blindly rerun SQL or start the app. Coordinator reviews a forward recovery or an explicitly authorised restore to a separate recovery database. |
| After migrations before restart | Preserve migrated DB and backup. Fail closed until exact schema/account proofs/build/config pass. No automatic down-migration or DROP marketplace tables. Old account-only source compatibility with the changed production DB is not certified; do not call source-only rollback safe. |
| Restart/runtime failure | Stop both apps, resume503, retain new DB/evidence. Diagnose privately; source/config/DB recovery needs reviewed instructions, not an automatic destructive reset. |
| Public smoke failure / writes after restart | Stop apps, resume503, take a new current-state backup before recovery. Pre-window restore would discard legitimate intervening accounts/drafts/history/messages. Require explicit Owner data-loss/reconciliation decision and reviewed recovery plan; preserve both backups. No destructive in-place restore is authorised by this runbook. |

For pre-migration-only local source recovery, while runtimes remain stopped:

```powershell
Set-Location $Live
if (@(git status --porcelain).Count -ne 0) { throw 'Unexpected local changes; inspect instead of overwriting' }
Invoke-Native git @('switch','--detach',$OldSha)
if ((git rev-parse 'HEAD^{tree}').Trim() -ne $OldTree) { throw 'Recovery source mismatch' }
Invoke-Native pnpm @('install','--frozen-lockfile')
Invoke-Native npm @('ci','--prefix','account-service')
Invoke-Native pnpm @('build')
foreach ($flag in @('MARKETPLACE_ENABLED','MARKETPLACE_MESSAGING_ENABLED','MARKETPLACE_MODERATION_ENABLED','MARKETPLACE_PUBLICATION_ENABLED')) { [Environment]::SetEnvironmentVariable($flag,'false','Process') }
foreach ($name in @('DATABASE_URL','PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSSLMODE')) { [Environment]::SetEnvironmentVariable($name,$null,'Process') }
Stop-Process -Id $Maintenance.Id
Invoke-Native pm2 @('startOrRestart','ops/windows/ecosystem.server.config.cjs','--update-env')
```

This intentionally leaves the local checkout detached at the recorded old commit for diagnosis; it does not move remote/server history. Apply only when the production ledger remains001/002 and no marketplace migration committed. Verify original runtime/account health before ending downtime. Historical security/auth rollback `83d0decfd08fe026d73d1be3a56abf2691053558`/tree`0d4ff7a5fe5872383c03b6b0fc158086d1c717ca` and blocked618d807 evidence remain unchanged; this marketplace procedure does not reinterpret that older rollback as the current pre-window server composition.

WRK0042 tests actual `pg_dump`/`pg_restore` against **separate disposable account-only and full marketplace copies** with synthetic data, proving archive usability/identity preservation in that environment. It does not certify owner-PC tools, production backup usability, whole-chain atomicity, an in-place destructive rollback or recovery after real writes. WRK0043 must execute and record its own mandatory backup/schema/runtime/smoke gates.
