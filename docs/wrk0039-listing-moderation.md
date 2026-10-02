# WRK0039 — first listing moderation

Implementation base: Coordinator-reviewed WRK0038 `f70d46d4aacbb81b7853bc9cb6638c2d300b9c3c`, tree `329859de064dc4e5bd0545678ccfcd3be7736cea`. Work branch: `wrk0039-listing-moderation`. IDE0174 governs this slice; IDE0123 future permissions remain unimplemented.

## Schema and runtime boundary

Apply reviewed migrations001–006 manually in filename order on an authorised isolated development database. `006_listing_moderation.sql` adds `listing_submission_reviews` with application UUIDv7 PK, unique submission FK, composite submission/listing FK, reviewer-user RESTRICT FK, outcome, bounded mandatory rejection reason, pre-decision listing version and server timestamp. Decisions are immutable under the existing history trigger. Existing001–005 files, submission payloads/triggers and reserved submission reviewer columns remain unchanged.

`MARKETPLACE_ENABLED=true` and `MARKETPLACE_MODERATION_ENABLED=true` explicitly enable review; startup requires migration006. Nothing auto-migrates at startup. Production configuration, deployment and migrations are outside WRK0039.

## Exact API boundary

All reviewer resources are under `/api/admin/marketplace`, with the existing dedicated admin-purpose cookie/proxy/canonical mutation Origin gate. Every request requires active verified account, unexpired non-revoked purpose=admin session and current `ADMIN_EMAILS` membership. Write transactions recheck authority and lock session/account rows. Ordinary user cookies are never forwarded to this boundary.

| Resource | Method | Contract |
|---|---|---|
| `/listing-submissions` | GET | Pending/unlisted queue, UUID `before` cursor, at most100 rows; summary only |
| `/listings/:listingId/submissions/:submissionId` | GET | Matching pending snapshot, explicitly separate current authority/capability context and prior decision history |
| `/listings/:listingId/submissions/:submissionId/approve` | POST | `{expected_version}`; rejects self-approval |
| `/listings/:listingId/submissions/:submissionId/reject` | POST | `{expected_version,reason}`; trimmed reason1–2000 characters |

Review resources reject unknown keys/queries and non-UUID identities. No public review projection or private exact-address/contact disclosure is added. The immutable payload already contains the accepted submission-safe content; current mutable content is never substituted for it.

The transaction locks the listing, checks expected current version, pending/unlisted state, matching listing/submission identity and `submission.listing_version + 1 = listing.version`. This identifies the exact current pending submission because every submit increments the listing version and pending content is read-only. One review per submission is additionally enforced by the unique constraint. Approve/reject, immutable decision, status history and audit are committed together; concurrent/stale decisions fail409. Approval sets only the matched submission and keeps market state unlisted; rejection clears approved submission and also remains unlisted. An allowlisted admin may not approve a listing they own, submitted or are responsible for.

## Rejection and frontend

The same eligible ordinary Lister may save an owned rejected listing through the existing versioned PATCH. Active capability and active declared property authority are still mandatory. A successful save atomically reopens it as a private draft, records the status/audit transition and increments listing/property versions. Failed saves roll back reopening. Submission then uses unchanged `marketplace_submission_v1` validation and fresh authority approval; it inserts a new immutable UUID snapshot. Earlier submissions/decisions remain intact. No pending or approved content editing is permitted.

Owner labels reflect pending/approved/rejected states. Editor shows own review outcomes/reasons, allows rejected saves and resubmission, and renders pending/approved content read-only. The separate Admin Portal contains a minimal pending queue/detail, frozen content/current-context separation, history, required reason and approve/reject controls with loading/empty/error/conflict feedback. Reviewer IDs exist in protected admin history; ordinary own-history response omits reviewer identity/contact details.

## Verification and exclusions

Non-server workflow `wrk0039-moderation.yml` uses GitHub-hosted Ubuntu, Node22.14 and disposable `postgis/postgis:16-3.4`. Existing fresh/account-only-upgrade tests now migrate through006; account data preservation, idempotency and concurrent runner/rollback remain checked. Moderation fixtures use synthetic data only. Focused tests cover wrong-purpose/current allowlist/IDOR/mass assignment, stale/self/concurrent review, rejection validation, immutable history, reject/save/resubmit/correct approval, transactional audit failure, account/history retention and session ineligibility. Existing listing/messaging/auth/Site suites, frozen installs/lint/build/production audits remain mandatory.

No approval publishes a listing. No Activate/Unlist, public projection, production conversation initiation, approved edits/material re-review, pending withdrawal, media, notifications, broader RBAC, organisation moderation, deployment, production migrations, runtime/Cloudflare changes or WRK0019 work is included. WRK0040/0041 remain separately gated. Interactive/deployed browser verification is not claimed by these automated tests.
