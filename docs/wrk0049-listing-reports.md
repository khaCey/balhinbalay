# WRK0049 — Real listing reports

Owner accepted IDE0181 on 13 October 2026 JST. Source base: server 1eb5ab70def2939eafce7ae1ab0d5ceaf9a73d6f. No production deployment or migration is authorised by this assignment.

## Contract

Only an active, email-verified ordinary account session may submit a report for a currently eligible public real listing. The shared public-detail eligibility function checks approved immutable content, active listing/publication, current review, Lister/account/property/authority eligibility and public-safe projection. Transactional share locks prevent concurrent unlisting or eligibility changes from racing report insertion.

POST /api/marketplace/listings/:id/reports accepts reason and optional details (2,000 characters). The reporter is derived exclusively from the verified session. Reasons: SUSPECTED_SCAM, INACCURATE_INFORMATION, UNAVAILABLE_PROPERTY, INAPPROPRIATE_CONTENT, OTHER. One open NEW/UNDER_REVIEW report per account/listing is enforced by a partial unique index. Duplicate submissions return the existing own report ID/status and do not rewrite submitted content. A transactional HMAC account bucket limits attempts to 20/hour, including successful duplicate requests. No report creates a publication action.

Dedicated admin sessions with current allowlist membership may GET /api/admin/marketplace/listing-reports (before/limit/status), GET /listing-reports/:id, or POST /listing-reports/:id/review. Queue limits are 1–100 (default 20), with descending UUIDv7 cursors. Admins see reporter ID/email; public consumers and Listers have no report read/list/history route. Ordinary/admin proxy cookie separation and origin checks remain mandatory.

Statuses: NEW → UNDER_REVIEW → RESOLVED or DISMISSED. Closed reports cannot reopen; a later eligible report can create a new record. Review accepts expected_version and optional note (2,000 characters), records an immutable review event and audit event atomically, and rejects stale/invalid transitions. Resolution is a report workflow outcome, not automatic listing removal.

## Schema and release

007_listing_reports.sql adds listing_reports and listing_report_reviews. Submitted identity/content/timestamp and review history are immutable; deletion is rejected. Foreign keys restrict destructive account/listing removal to preserve reporting history. Report state has optimistic versions, timestamps and an enforced open-report uniqueness boundary.

Migration is manual through the existing reviewed migration workflow. Production must not deploy this source before migration 007 is separately reviewed and applied in an authorised maintenance release. No new environment flags; reporting follows publicationEnabled, with admin review additionally requiring moderationEnabled.

Existing migrations 001–006, lockfiles, dependencies, protected configuration and production checkout are untouched. Isolated sample-property reporting remains explicitly demo-only/mailto; it is not connected to real reporting.

## Verification

See account-service/test/integration/reporting.test.js for disposable PostgreSQL/PostGIS authentication, duplicate races, immutable content/history, review transitions/version conflicts, pagination/privacy, ineligible listing rejection, atomic audit rollback and account rate limiting. Existing publication integration protects compatibility of the shared eligiblePublicListing helper. Unit/proxy tests cover strict input, paths, queries, origin and cookie separation.

Runtime/browser production verification remains pending a separately authorised deployment. Work ends REVIEW; Coordinator must independently assess the diff and evidence.

The historical WRK0042/43 release verifier deliberately remains pinned to migrations001–006 and rejects this seven-migration source. Its tests prove the historical six-file catalogue/checksums still work on their isolated fixture, and explicitly prove reporting source is refused. A separate reviewed reporting deployment release must establish migration007/checksum and new ledger gates; this assignment does not extend or bypass the parked deployment runbook.
Migration007 SHA256: eedc73aca2d62d19d86a2c521b91643dc98ddbc7f09b11e4c14595daba1d2eab.

## Review corrections — 20 October 2026 JST

The report queue now permits Refresh after its initial request fails; loading still disables the action. Account deletion recognises both foreign-key violation 23503 and restrict violation 23001 as retained history, returning the existing conflict result after rollback rather than propagating a database error. This also matches the corresponding compatibility correction in the separate media candidate. No migration, reporting policy or dependency changed.

Verification: 79/79 Site tests, 45/45 account tests (including three new deletion error/rollback regressions), lint with zero errors/two existing warnings, production build and diff check pass. An isolated React component check used the actual component with a synthetic first-request 503, confirmed Refresh enabled, confirmed one pending retry with Refresh disabled, then confirmed successful queue recovery. Its temporary React renderer dependencies were outside the repository; no manifest/lockfile change occurred. The initial SQLSTATE reproducer injected 23001; it was not a native PostgreSQL18 run.

Native PostgreSQL/PostGIS integration was not rerun in this environment. Chromium could not be installed because the browser download returned an invalid archive; no browser pass is claimed. Existing PostgreSQL18/PostGIS integration results above remain historical. Return WRK0049 to REVIEW for independent acceptance; do not merge or deploy from this correction run.
