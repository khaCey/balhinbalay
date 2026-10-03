# WRK0044 pinned authoritative geography package

This is preparation for WRK0043. It never authorises deployment or production
database mutation. The exact WRK0044 branch/commit/tree must be independently
Coordinator reviewed before later source promotion. `server` remains the
reviewed WRK0042 baseline's separate production branch.

## Pinned source and attribution

Philippine Statistics Authority (PSA), **PSGC 2Q 2026 Publication Datafile**,
geographic state **30 June 2026**; corresponding PSA release **13 July 2026**,
reference **2026-219**.

- Official publication: <https://psa.gov.ph/system/files/scd/PSGC-2Q-2026-Publication-Datafile.xlsx>
- Official release: <https://psa.gov.ph/content/second-quarter-2026-psgc-updates-renaming-one-municipality-and-one-barangay-and-correction>
- Original filename: `PSGC-2Q-2026-Publication-Datafile.xlsx`.
- Original size: **3,250,889 bytes**.
- Original SHA256: `31892bc2bdde3ea0682562d9412b5bab4d45a0be5e5a5b4f6c9d7714b94bca5d`.
- Workbook Metadata rows7–8: no access constraints; use requires acknowledgement
  of PSA as source. The official release page footer states CC BY4.0 unless
  otherwise stated. Retain this attribution with the derived package.

Derived from PSA. Transformation maps the accepted four reference levels into
BalhinBalay's existing migration004 schema, generates internal UUIDv5 identities
and collapses Manila's non-municipality routing districts into their official
City parent. It excludes all population, correspondence/old-name/status,
income-classification, urban/rural and other unrelated workbook fields.
No polygons, postcodes, coordinates, centres or inferred map positions exist in
the reference package.

The original workbook is retained in the Work evidence bundle rather than Git:
it is a binary publication containing several unused summary/classification
sheets. The reviewable transformed JSON, exact source hash and standard-library
transformer are committed. Reproduction uses this **exact URL and hash**, never
a mirror, live API or a “latest” link. Downloading is only a source-acquisition
or independent reproduction step, never an application/runtime or production
maintenance-window prerequisite.

## Deterministic transformation and hierarchy

From a checkout containing the reviewed WRK0044 scripts and a locally retained
original workbook, run:

```sh
python3 account-service/scripts/build-psgc.py PSGC-2Q-2026-Publication-Datafile.xlsx psgc-rebuild
node account-service/scripts/provision-psgc.js files --source PSGC-2Q-2026-Publication-Datafile.xlsx
```

The builder first requires the exact original size/hash, metadata date/origin
and source level counts. It does not download. JSON uses sorted object keys,
UTF-8, fixed indentation/newlines and PSGC-code ordering. UUIDs use:
`UUIDv5(NAMESPACE_URL, "https://balhinbalay.com/reference/psgc/" + code)`.
They are generated for missing rows only; correct existing internal UUIDs are
retained and new child rows resolve parents by stored official code.

Authoritative names retain **exact Unicode and whitespace** from the PSGC
worksheet, including original trailing spaces; no normalisation, spelling
change, accent removal or case conversion is performed. Numeric Excel cells
are read as their exact ten-digit decimal strings. Old nine-digit correspondence
codes are never substituted. Source metadata and the current PSGC worksheet are
authoritative; the workbook's `Prov Sum` worksheet carries an older2020 heading
and is deliberately unused.

Region comes from the two-digit Region segment. Province is used only when the
five-digit Province identity exists as a genuine `Prov` row in this publication.
PSA's coded statistical Province relationship is retained for ICC rows where
the publication supplies one; this package does not reinterpret political
governance or the obsolete correspondence code.

There are **43 province-null localities**:33 HUCs, Pateros, Isabela City in RegionIX
and eight BARMM Special Geographic Area municipalities. `0990100000` (“City of
Isabela (Not a Province)”) and `1999900000` (“Special Geographic Area”) are routing
containers, not imported Provinces. PSA NotesA.1 confirms Manila's14 SubMun rows
are not officially recognised municipalities; their897 Barangays map to the
official City of Manila `1380600000`. All16 excluded routing rows are documented
in `hierarchy.json`. No synthetic Province is invented.

Expected reference counts:

| Table | Rows |
|---|---:|
| regions |18|
| provinces |82|
| cities |1,642 (149 CITY +1,493 MUNICIPALITY)|
| barangays |42,010|

## Exact offline production package

All data files live in `account-service/reference/psgc-2q2026/`:
`regions.json`, `provinces.json`, `cities.json`, `barangays.json`,
`hierarchy.json`, `manifest.json`. `manifest.json` records **each exact data-file
size and SHA256**, and the original source size/hash/provenance.
The importer independently pins manifest SHA256
`8899a5601d98a355ff1e7651e79f35a4c5bbcfcfc0f77a62ea34073a216a8c63`.
Changing data and rewriting its manifest cannot bypass that pin.

| File | SHA256 |
|---|---|
| `barangays.json` | `beab9ee0891471b9de0c4b28573b15ca19d45a422ab359f9f0992035aa1f399b` |
| `cities.json` | `40ed5e5046ae0244e8388f688fba3d44bafe6af28a87f4c8d27fe1f501dc12c1` |
| `hierarchy.json` | `6c4e9db6f723fb0e5f5f1de5ebb1cf44c2bc7d2f75f5fd491d8c1e37b7356d10` |
| `provinces.json` | `74f5d26e89c89a7afe487d08546cb7abc8b8b7bc1ec47b1ede6a7cd93a791167` |
| `regions.json` | `dcf4b7580083f826da285eb57ce516b7237afc63f5f430fbd4f3af3d74adc313` |
| `manifest.json` | `8899a5601d98a355ff1e7651e79f35a4c5bbcfcfc0f77a62ea34073a216a8c63` |

Use `node account-service/scripts/provision-psgc.js files` to print the exact
reviewed data checksums and sizes without a database connection. Keep that
output with WRK0043's private deployment evidence. The final Work report lists
the same filenames, checksums, exact source commit/tree and independent CI.

Prerequisites: the exact reviewed migrations001–006/checksums, PostGIS installed,
complete principal backfill, and ledger names:

1. `001_accounts.sql`
2. `002_session_purpose.sql`
3. `003_marketplace_identity.sql`
4. `004_property_listing_foundation.sql`
5. `005_marketplace_messaging.sql`
6. `006_listing_moderation.sql`

No007 migration or persistent import-ledger table is added. The immutable source
commit and pinned checksums are the package identity; WRK0043 retains its actual
apply/verify output. Geography import never invokes the migration runner.

## Later WRK0043 apply sequence

Follow the independently reviewed WRK0042 maintenance/backup/recovery runbook
first. Verify the final reviewed source commit/tree and protected machine-local
configuration, stop Site/account runtime, create and prove the final quiescent
backup usable, then manually apply only reviewed migrations003–006. Verify the
ledger/schema/original account identities **before** geography import. Do not
download any data during this window. Supply the already reviewed local package.

From the canonical stopped live checkout, with the existing private loopback
`DATABASE_URL` available to this process (never echo credentials), run:

```powershell
node account-service/scripts/verify-marketplace-release.js files
if ($LASTEXITCODE -ne 0) { throw "Migration catalogue verification failed" }
node account-service/scripts/provision-psgc.js files
if ($LASTEXITCODE -ne 0) { throw "Geography package checksum verification failed" }
node account-service/scripts/provision-psgc.js apply --runtime-stopped
if ($LASTEXITCODE -ne 0) { throw "Geography import failed; keep runtime stopped" }
node account-service/scripts/provision-psgc.js verify
if ($LASTEXITCODE -ne 0) { throw "Read-only geography verification failed" }
psql -X --set=ON_ERROR_STOP=1 --file=account-service/scripts/verify-psgc.sql
if ($LASTEXITCODE -ne 0) { throw "Geography SQL integrity gate failed" }
```

The `--runtime-stopped` switch is an explicit operator acknowledgement, not a
process-manager inspection or authorisation. WRK0043 must establish that the
runtime really is stopped. The existing WRK0042 process-only loader can provide
the private `DATABASE_URL`/libpq `PG*` settings; do not modify `production.env`,
PM2, Cloudflare or feature flags in WRK0044.

The importer locks only the four geography tables, compares level/name/type/
parents by authoritative codes, then inserts missing rows in dependency order
inside **one transaction**. Any failure rolls back that transaction. Reapplying
the same complete package inserts zero rows and performs no UPDATE/DELETE.
An existing correct UUID is preserved. No existing row is silently renamed,
reparented, replaced or merged. Extra codes not in the package are retained and
reported; the exact-count SQL gate fails until they receive a separate review.
Never delete such rows or reinterpret them merely to force a passing gate.

Successful initial state:exact counts above, all expected names/type/parents
match the package, all missing/extra lists empty, global codes unique,
43 province-null localities,897 Manila Barangays and no parent orphans.
Read-only Node verification compares every expected reference. The additional
SQL script shows counts, administrative exceptions and relationship integrity.

Both commands can be repeated without any DML by a role with SELECT permission:

```powershell
node account-service/scripts/provision-psgc.js verify
if ($LASTEXITCODE -ne 0) { throw "Read-only geography verification failed" }
psql -X --set=ON_ERROR_STOP=1 --file=account-service/scripts/verify-psgc.sql
if ($LASTEXITCODE -ne 0) { throw "Read-only integrity query failed" }
```

Stop every later mandatory gate on failure. Pre-import conflict or failed import
leaves geography unchanged; migrations committed beforehand remain committed.
Successful geography import followed by another failed gate must keep runtime
stopped for reviewed recovery. There is no automatic delete/down-migration,
source-only-after-schema rollback or destructive restore claimed safe here.
After runtime writes, the WRK0042 recovery/data-loss approval boundaries apply.
Future releases and geography changes require separate reviewed upgrade work.

## Verification and repository scope

`geography.test.js` uses isolated fresh and account-only-upgrade PostgreSQL/PostGIS
databases, official reference rows and controlled test accounts/listings. It
checks exact hierarchy/counts, repeat/concurrent apply, stored and input code/
name/type/parent conflicts, late atomic failure, retained existing UUIDs,
account/session/action and marketplace-history preservation, SELECT-only
verification and real-reference draft→submit→moderate→Activate→detail→contact.
It inserts no fake administrative geography as a successful test fixture.

The official workbook was acquired directly and two independent local rebuilds
were compared byte-for-byte with each other and the committed package. This
source, acquisition headers and reproduction evidence are retained with the
Work report. The initial hosted CI source-download attempt received PSA HTTP403;
no mirror or replacement source was used.

The narrowly scoped `wrk0044-geography.yml` verifies the exact branch and pinned
offline package checksums, including tamper rejection in unit tests, and runs all
reviewed marketplace/release tests plus full Site/account regressions, frozen
installs, lint, build, audits and clean/diff checks. The WRK0042 verifier remains
byte-identical, scoped to its original branch. Production deployment workflow,
runtime modules, application/UI, dependencies and migrations remain unchanged.
No new marketplace product behaviour is added. WRK0043 remains DRAFT.
