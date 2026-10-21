# WRK0071 integrated MVP source candidate

Updated 22 October 2026 JST. Source-only review; no server merge or deployment.

PR: https://github.com/khaCey/balhinbalay/pull/12

## Candidate and scope

The candidate combines reporting PR8 and its calendar-date correction PR10 with photos/sharing PR9 and its exact Next/ESLint security patch PR11. The merge commit a6904629496ab7456ecc05999b3ee430eda5ccb3 has reviewed parents 41f606c42e1cde3270ce651c6a775e18880ba282 and aa4c086b08f5254f52e0d284c7917ae6074f454c. Server base remains 1eb5ab70def2939eafce7ae1ab0d5ceaf9a73d6f.

Verification candidate: 860f6ecd15983f0b247db3c46a7ab5a5b1fdd176 / tree 5a691c0e3e660611af6d9999eb7b484ab2d42526. Later documentation updates must preserve its application, test, workflow, dependency and migration bytes.

Five merge conflicts were reconciled:

- Retain PostgreSQL RESTRICT 23001 and 23503 account-history handling.
- Share locked publication eligibility across reporting, public detail and media. Retain UUID validation and the media helper's approved-submission context; expose only the existing safe public projection.
- Mount both admin report and photo routes under their existing feature/session gates.
- Preserve the historical six-migration verifier's rejection of this catalogue; exercise its original fixture by excluding both007 and008 only inside the test fixture.
- Retain initial listing data, gallery, contact and report control on public detail.

The production server retains both the pool-local calendar-date parser and media startup validation. Proxy routes retain reporting and binary photo boundaries. Dependencies are byte-identical to PR11. Historical ambiguous non-midnight ISO snapshots remain untouched and fail closed.

## Migration compatibility catalogue

These are compatibility-review pins, not a production deployment verifier or permission to run migrations. Existing WRK0042/43 release and PSGC tools are byte-unchanged and deliberately reject this eight-file source. A separate runtime release must review its catalogue, ledger, database/volume backup and restore, UID/mount/capacity, startup configuration and rollback before deployment.

| Migration | SHA256 |
| --- | --- |
| 001_accounts.sql | 941a93460f29cbbaee3333db80df85b55f298634e6c1282127ab162dfe7afbc1 |
| 002_session_purpose.sql | 7b744abfb719f4a568b8d75e0b52bb54f24a29bcf3b13bc9e40429919b575510 |
| 003_marketplace_identity.sql | dd5f6c209b8df97c0fabbfc24cb51f0864fa85608f8e617be4dd72623fd71d2f |
| 004_property_listing_foundation.sql | 8bb58e2cd5a0bac2294047a0bcfc95f050c46abc323e4d17a5f6c552f988c470 |
| 005_marketplace_messaging.sql | d16584e0bda332b9fb39486a2323ee0d5d066083fc23db7549649cad775acbbf |
| 006_listing_moderation.sql | 71dcb5f7cd02b98a6f2d28ce58b3c3a51de74a772e7a7d0173243fe3cda4859c |
| 007_listing_reports.sql | eedc73aca2d62d19d86a2c521b91643dc98ddbc7f09b11e4c14595daba1d2eab |
| 008_listing_media.sql | e5a71a712af48ebea782bc6f8ab40875c34ae8024b231b59b4edc618d24cc2dc |

All migration bytes match their reviewed parent source. New native tests exercise fresh001–008, historical001–006→007+008, reporting-first and media-first catalogues, repeated migrations, exact ledger names and original-account preservation. Existing native tests continue exercising immutable review/report/media history, auth/authority, failure and race boundaries.

## Verification

Local frozen installs pass. Account51/51 and Site93/93 pass. Lint has zero errors and two existing warnings; production build and built initial HTML checks pass. Production audits: Site zero HIGH/CRITICAL with one moderate and one low; account zero vulnerabilities.

Hosted CI https://github.com/khaCey/balhinbalay/actions/runs/39623703721 is SUCCESS on exact code860f6ecd15983f0b247db3c46a7ab5a5b1fdd176. Job119303505594 records actual PostgreSQL18.6/PostGIS3.6.4, account51/51, Site93/93 and full native125/125. Combined calendar/publication/reporting/media33/33 passes separately under UTC, Asia/Tokyo and America/New_York. These repeated timezone runs are not additional distinct tests.

Frozen installs, lint/build, initial HTTP crawler/browser metadata, readable-cover/no-photo/withdrawal/outage fallback and source integrity pass. Actual Chromium verifies report submission alongside a retained gallery, mobile375/desktop1280 layouts, sequential uploads, unsaved-field preservation, cover/reorder/remove, stale-version recovery and approved read-only photos. Artifact wrk0071-listing-media-browser (id12356745156) contains synthetic browser screenshots. Production audits pass: Site0 HIGH/CRITICAL (1 moderate/1 low remain), account0 vulnerabilities.

Earlier failed candidate runs found two new test issues: a photo ID lost when the fixture reloaded a listing, then an overly exact dropdown label selector. Both were corrected in tests; application code and accepted behaviour did not change. Those failed runs are retained in CI history and are not acceptance evidence. The successful final run includes both corrected tests with every gate enabled.

## Remaining release boundary

Work submits REVIEW, not COMPLETE. Final hosted evidence is recorded; independent acceptance and Owner merge permission remain required. No server merge, deployment, live migration, volume/container, SMTP, Cloudflare/public routing, production credential/data inspection or parked WRK0043 action occurred. Live deployment/version/health is unknown to this source-only run.

After source acceptance, request Owner permission for the concrete PR12 merge into server. Deployment remains a separate release: private SMTP application verification, accepted ingress topology/cutover, real runtime configuration, coherent media/database backup and rollback, and live sharing acceptance remain governed by their existing queue items and decisions. Do not infer those are complete from this source candidate.
