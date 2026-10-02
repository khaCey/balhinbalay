# WRK0041 real-listing conversation initiation

Extends the exact Coordinator-reviewed WRK0040 candidate26ae63844224bdd0408233736214dce72e7eae0d/tree07a84da26e245f417ab3ec0346a36fb24e9b5948. No new migration:005 already supplies immutable two-party context, unique listing/initiator/recipient, deferred participant checks and message idempotency.001–006 remain unchanged;007 was unused before implementation.

## Production-safe source integration

Existing MARKETPLACE_ENABLED and MARKETPLACE_MESSAGING_ENABLED still opt in to
the messaging router. Starting additionally requires MARKETPLACE_PUBLICATION_ENABLED.
Auth-only installations remain valid. The old NODE_ENV/test-only fixture gate
and BB_MESSAGING_SYNTHETIC_START configuration are removed; no fixture bypass
or automatic runtime/database enablement is added. This is reviewed source
preparation, with no deployment or production configuration change.

POST /api/marketplace/conversations still accepts only listing_id,
first_message and client_request_id. An active verified ordinary user session
chooses the sender; the listing chooses the responsible individual Lister.
That recipient must be active/verified with active Lister capability and an
exact active verified authority bound to the USER owner principal. Organisation
routing, self-contact and arbitrary identity/participant assignment are denied.

New writes require current approved+active/non-archived publication state,
published time and the latest matching immutable approved submission/review.
They reuse WRK0040's unchanged publication validator, not a second publication
policy. The retained context takes only the listing UUID/title/physical type/
transaction from approved content, never divergent mutable draft/private values.

Initiation follows capability→authority→property→listing→conversation lock
order, compatible with Activate/Unlist and existing send/capability transitions.
The existing unique triple and participant/message constraints handle races;
first message and two original participants commit atomically. Committed retries
resolve their original recipient even after unlisting or responsibility changes,
perform no new write and reject changed text under an already-used key.

## Existing threads and public UI

Inbox/thread/send behaviour is unchanged: participant-only access; ordinary
unlisting does not prevent reads/replies; suspension/revocation of the original
recipient's Lister capability freezes new messages from both sides, preserves
readable history, and active restoration resumes sending. Ownership/responsibility
changes never update the original participants or retained context.

Only real /listing/:uuid detail mounts the in-app composer. It checks the existing
ordinary account state, displays checking/sign-in/sending/error states, requires
nonempty text, retains a transient request key for retries and navigates to the
returned real UUID /chat thread after success. Sample detail/cards have no real
initiation action. Phone/email/private account data is neither required nor
disclosed. Existing same-origin conversation proxy allowlist is sufficient and
unchanged.

## Isolated verification boundary

wrk0041-contact.yml runs only on the non-server Work branch, hosted Ubuntu,
disposable PostGIS16-3.4 and synthetic data. Messaging regression fixtures now
create/submit/review/activate through the actual reviewed APIs. New focused tests
exercise genuine first contact, failed eligibility/approval, duplicate/concurrent
start, real Unlist, freeze/restoration, replacement ownership, lock races and the
same-origin public-detail/contact/UUID-chat transport. Earlier migration/auth/
listing/messaging/moderation/publication suites remain included.

No attachments/notifications/read receipts/presence/blocking/organisation inbox,
reassignment, approved edits/re-review, media, broader real search, deployment,
production migration, Owner-PC runtime/PM2/Cloudflare, WRK0019 or WRK0042/43 work.
