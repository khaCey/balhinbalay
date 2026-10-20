# WRK0069 investigation / WRK0070 correction

20 October 2026 JST. Source-only candidate stacked on reporting PR8 at cda46df246379bdfc6f0220c68edd1d217a1b214. No merge, deployment, migration, dependency or production-data change.

## Cause

The accepted available_from PostgreSQL DATE is an optional calendar date. The default pg text parser creates a JavaScript Date at local midnight. snapshot() retains that object, so JSON serialisation creates a timezone-dependent instant. publicationContent accepts date strings and historical midnight-UTC ISO values; it correctly rejects unrelated instants.

Native PostgreSQL18.2/PostGIS3.6.2 probe, SQL DATE2026-11-01:

| Process timezone | Existing frozen value | Existing publication |
| --- | --- | --- |
| UTC | 2026-11-01T00:00:00.000Z | passes |
| Asia/Tokyo | 2026-10-31T15:00:00.000Z | rejects with422 |
| America/New_York | 2026-11-01T04:00:00.000Z | rejects with422 |

No production records or runtime were inspected, so production impact/count is unknown. The probe queried synthetic literals on the isolated loopback55433 cluster; it did not modify any real listing.

## Correction

createAccountPool in account-service/src/database.js gives this pool a textDATE/OID1082 passthrough parser. Production server and reporting/publication integration fixtures use that factory. Future database calendar reads and immutable snapshots retain YYYY-MM-DD in every tested process timezone. Global pg parsers are untouched; timestamp/timestamptz, binaryDATE and other type parsers remain the existing defaults. No process-wide timezone change is required.

Existing midnight-UTC snapshots remain accepted. Ambiguous historical non-midnightISO submissions remain rejected; inferring their original calendar date without trusted originating timezone could be wrong. This candidate does not edit immutable history, auto-repair historical data, loosen publication validation or claim such records have been recovered. Any needed historical reconciliation requires a separate provenance-based review.

## Verification

- Native PostgreSQL18.2/PostGIS3.6.2 calendar-date + publication + reporting suites:20/20 in UTC,20/20 in Asia/Tokyo and20/20 in America/New_York. This includes the formerly failing publication/reporting fixtures, date/null/leap reads, frozen JSON, legacy acceptance/rejection and unchanged timestamp instants.
- Site79/79; account46/46; lint0 errors/two existing warnings; production build/diff check PASS.
- Production server imports the same tested pool factory. No browser-facing source changed; preceding PR8 Chromium control verification remains historical and was not repeated for this backend parser correction.
- Native evidence: owner-private wrk0070-{UTC,Asia-Tokyo,America-New_York}-integration.log. Separate Windows development worktree C:\GitHub\BalhinBalay-wrk0070-calendar-dates; existing pinned dependency trees reused through development-only junctions, without manifest/lock changes.

Work submits REVIEW. PR targets the reporting feature branch to keep this correction separate from its unmerged parent. Authorised deployment must select a reviewed integrated source and verify migrations/runtime independently. The parked six-migration release runbook is not extended or bypassed here.
