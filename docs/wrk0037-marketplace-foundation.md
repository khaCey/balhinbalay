# WRK0037 persistent listing foundation

This is an isolated-development implementation of dbdesign Draft v0.9 §18 and accepted IDE0171/172. No production migration, runtime change or publication is performed. Messaging remains WRK0038. Guest search and sample property pages continue using sample data.

## Migration and enablement boundary

Base: server `c1f84c9366d421ca5eadc090f95c5b65d237b8c7`, tree `2ac64802879bf84a7132d577e9a0ee92adfe7e71`. Existing 001/002 are unchanged. 003 adds lifecycle placeholders, currencies, inactive organisation structures, USER principals and additive Lister requests. The existing runner backfills each account's principal with the service's UUIDv7 generator inside 003's transaction. 004 adds recognised geography, developments, physical properties/type extensions/private locations, authorities/aliases/merge history/features, listings/terms/submissions/status and price histories/audit events, PostGIS and integrity triggers. No demo records, active grants, public listings or organisation permissions are seeded. PHP is the initial supported currency; decimals are strings, exact numeric(18,4), areas numeric(14,4).

Run the existing migration runner only against an explicitly authorised development database. Future production installation requires separate Coordinator/Owner approval and a stopped-runtime maintenance window covering backfill and source transition. The runner serialises migration writers with an advisory lock and applies SQL, backfill and ledger atomically. It never runs at service startup. `MARKETPLACE_ENABLED=true` mounts the API and requires both migrations; unset/false preserves account-only startup. All existing public/admin account-creation paths atomically create a principal when 003 is installed. Auth cookies/purposes, user IDs/statuses and token/action behaviour remain unchanged.

Recognised geography must be supplied by an independently reviewed authoritative data import before real submission can use it. This assignment seeds geography only in disposable synthetic integration fixtures. No city-centre point is invented. Private exact-location storage is not an editable/public API point in this slice.

## Access and lifecycle

An active, email-verified ordinary session can request capability (pending, idempotent). Only an active verified, allowlisted admin-purpose session can approve/suspend/revoke, with expected version and actual actor audit. Ordinary users cannot grant access. Active Listers can declare a relationship and save incomplete private drafts; the exact active authority must be manually approved before first submission. Changing the relationship invalidates its approval. Capability inactivity denies writes while eligible owners can read their own retained drafts.

All principal/creator/responsible Lister/state/approval fields are derived by the server. Ownership is the exact authority/property/principal composite relationship. Foreign owned resources return 404. Existing-property creation requires an already-held active exact authority; it cannot mint access from a foreign UUID. Organisation routes/delegation, transfer and merging are absent.

PATCH is draft/unlisted only and requires `expected_version` and `expected_property_version`; relationship changes also require `expected_authority_version`. Versions, capability/authority checks and writes are transactional. First submission requires the same listing/property versions and `marketplace_submission_v1`: title, description, supported physical type/RENT or SALE, recognised city/barangay, positive amount/supported currency, approved authority, accepted physical parent/building matrix, RENT pricing period, ROOM rental mode/capacity/bathroom access/current occupants, LAND positive lot area. Applicable common fields, availability (AVAILABLE/OCCUPIED), available date, individual fees and sale notes are optional. Photo minimum is zero.

Submission creates a unique immutable snapshot with policy and source versions, transitions draft → pending/unlisted and records status/audit history. Snapshots exclude private locations and account contacts. No submitted editing, moderation approval, public activation, public real-listing search, media or payments exist. Derived available spaces are capacity minus current occupants; NULL and supplied zero remain distinct, fees have no invented total.

## API contract

Same-origin Site proxies allow only exact paths/methods below. Mutations require the configured canonical origin and JSON ≤8 KiB. Only the appropriate ordinary/admin cookie is forwarded with the server-only proxy key; redirects and upstream Set-Cookie are rejected, responses are no-store. Account-service independently rechecks session purpose, expiry/revocation, base account state, capability, authority and ownership. Lists are bounded with UUID cursors; recognised city search is bounded.

| Resource | Methods |
|---|---|
| `/api/marketplace/me/lister-access` | GET; POST `{}` request |
| `/api/marketplace/me/listings` | GET `before`, `limit` |
| `/api/marketplace/reference-data` | GET `city_id`, `city_query`; own building/parent contexts |
| `/api/marketplace/listings` | POST draft, declared `relationship`; optional allowlisted aggregate fields |
| `/api/marketplace/listings/:uuid` | GET own aggregate; PATCH versioned draft |
| `/api/marketplace/listings/:uuid/submissions` | POST first submission with listing/property expected versions |
| `/api/admin/marketplace/lister-access` | GET bounded capability queue |
| `/api/admin/marketplace/lister-access/:user_uuid/approve`, `/suspend`, `/revoke` | POST `{expected_version}` |
| `/api/admin/marketplace/property-authorities` | GET declared/pending authority queue |
| `/api/admin/marketplace/property-authorities/:uuid/approve` | POST `{expected_version}` |

Draft groups: `listing`, `property`, applicable `details`, `rental_terms` or `sale_terms`, `private_location`, `relationship`; optionally `development` for an own new typed building context. Reference-data UUIDs are selected from recognised/authorised records. Read responses include current aggregate versions. Invalid/unknown editable fields return 422; stale versions 409; authentication 401; inactive capability 403. Owner/Editor use these APIs and real UUID paths; transient unsaved React state is not demo/browser-local persistence. Manual admin controls use the separate admin proxy/session.

## History safety and verification

Both existing administrative hard-delete paths now use a guarded transaction: an otherwise-unreferenced USER principal may be removed for a disposable account; any independent marketplace/capability/history/audit FK reference returns 409 ACCOUNT_HAS_MARKETPLACE_HISTORY. References and retained history are never cascade-deleted. Lifecycle columns are placeholders, not a self-service deletion/anonymisation operation or retention policy.

The branch-only workflow `.github/workflows/wrk0037-marketplace.yml` uses a non-root GitHub-hosted Ubuntu runner and disposable `postgis/postgis:16-3.4` service, synthetic fixtures only, separate empty and account-only-upgrade databases. It tests migration idempotence/atomic failure/concurrent writers, original auth-row preservation, spatial/deferred integrity, all six Rent/Sale types, purpose/IDOR/mass-assignment denial, manual capability/authority gates, stale/concurrent writes/submission, private-data exclusion and history deletion refusal, then full account/Site regressions, lint, production build and production audits. This workflow is review-only infrastructure on the Work branch; do not merge it into server without Coordinator review. No deployment workflow is changed.

WRK0038 remains DRAFT: migration005 plus private two-participant conversations/text messages, exact participant access, immutable recipient/context, idempotency and original-Lister suspended/revoked send freeze under IDE0173. Approved/public-active listing creation remains a separate prerequisite for real new conversations; this foundation supplies no activation bypass. No new material product decisions were introduced.
