# First listing publication slice — WRK0040

WRK0041 extends this reviewed source with real in-app contact using the existing
messaging router and the same publication validator. The historical WRK0040
scope below remains unchanged; see ../docs/wrk0041-real-listing-contact.md for
the new initiation boundary. No deployment or runtime configuration changed.

Built on the reviewed WRK0039 source. Existing migrations 001–006 suffice;
007 was verified unused and no migration is added or applied to production.

`MARKETPLACE_PUBLICATION_ENABLED=true` is opt-in and also requires
`MARKETPLACE_ENABLED=true`. Startup checks migration 006. Configuration and
deployment remain separate reviewed operations; this assignment changes neither.

The same-origin consumer proxy allows only:

- `POST /api/marketplace/listings/:uuid/activate`
- `POST /api/marketplace/listings/:uuid/unlist`
- `GET /api/marketplace/public/listings/:uuid`

Mutations accept only `expected_version`, use ordinary verified user sessions,
and require ownership, active Lister capability and exact active verified
property authority. Activation locks the eligibility and aggregate rows, checks
the latest matching immutable approved submission and its immutable approved
review, and applies `marketplace_publication_v1`. Approval, publication, version,
status history and audit rules remain server-authoritative. Unlisting does not
require validating content again. The first publication timestamp is retained
across unlisting/reactivation. Approved content cannot be edited.

Public reads require current eligibility and approved/active/non-archived state.
All non-public or ineligible listing UUIDs return the same 404. Only explicitly
allowlisted approved snapshot fields are projected; current draft fields,
private addresses/unit/room identifiers/coordinates, account contacts, identity
references and secrets are absent. City/Barangay labels resolve from the
snapshot's reference IDs. Zero photos and no map point are valid.

An optional map point uses only the separately server-managed public field and
its explicit per-listing confirmation. This slice discloses points only for
the accepted known shared residential building context (Condo/Apartment/Room
with Condominium/Apartment building/Boarding house context). No point is inferred
from private location. The unresolved standalone-property pin policy is not
implemented: those points are omitted, without blocking coordinate-free
publication. No location-confirmation editing API/UI is added.

The Owner screen offers Activate/Unlist and version-conflict feedback. The public
detail route is `/listing/:uuid`, separate from numeric sample `/property/:id`.
Sample search/ranking is unchanged. No real inventory collection/search API,
media, approved-content editing, production conversation initiation or delivery
operation is added.

Verification uses `.github/workflows/wrk0040-publication.yml` exclusively on the
non-server work branch, GitHub-hosted Ubuntu, disposable PostGIS 16/3.4 and
synthetic data. All earlier migration/listing/messaging/moderation/auth tests
remain included alongside the publication suite.
