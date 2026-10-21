# Listing photos and rich sharing — WRK0062 / WRK0050

Source candidate: [PR #9](https://github.com/khaCey/balhinbalay/pull/9), targeting `server` at `1eb5ab70def2939eafce7ae1ab0d5ceaf9a73d6f`.

This is source implementation and verification. Opening the PR does not authorise merging, creating a live volume, applying migration008, restarting containers or changing public ingress. Check the live Work Queue and accepted decisions before any release.

## Behaviour

- Photos are optional. Existing listings and submissions without photos remain valid.
- An active Lister can upload, remove and order photos on an owned private draft/rejected listing with active property authority. The first ordered photo is the cover. Pending and approved content remains read-only.
- Upload progress, processing, actionable errors and retry/reload are visible in the editor. A photo mutation changes the listing version while preserving unsaved text fields in the editor.
- Each submission freezes the ordered photo references alongside the unchanged `marketplace_submission_v1` payload. The separate admin reviewer sees those exact submitted photos.
- Publication, collection cards, detail galleries and public photo delivery use the current approved submission. Guessing a URL does not expose a draft, a removed draft photo, another listing's photo or an unlisted/ineligible listing.
- Revoking the Lister capability, account eligibility or property authority withdraws public photo access through the same publication eligibility rules. Photos are never mounted as a public static directory.
- Facebook, Twitter, LinkedIn and WhatsApp crawler responses contain the canonical URL, public title/summary and large-image metadata in the initial HTML head. Normal browser responses may stream metadata in the initial HTML body, following Vinext's existing behaviour.
- Sharing uses the approved cover's separately processed 1200×630 JPEG. The server verifies that this derivative is currently readable through the public eligibility route. A missing, corrupt or unavailable cover uses the static BalhinBalay fallback. The gallery's composition is separate from the sharing crop.
- Ineligible/missing listings return 404 without their content; an upstream outage returns generic no-index metadata. Unrelated pages retain their generic metadata.

## Storage and limits

`LISTING_MEDIA_ROOT` enables media only when `MARKETPLACE_ENABLED=true`. It must be an absolute private directory outside application source, build and public directories, with mode 0700 and ownership matching the account-service process. It is deliberately unset by default. Startup verifies migration008 and the private root; it never runs migrations.

The approved architecture is a dedicated persistent Akamaru filesystem volume, with metadata in PostgreSQL. No cloud storage provider is introduced. Example container target: `/var/lib/balhinbalay/listing-photos`; a future release must verify the actual Compose service, host path, UID/GID and writable capacity before adding the mount.

| Limit | Behaviour |
| --- | --- |
| Formats | Actual JPEG, PNG or WebP only; no SVG, GIF, HEIC, URL imports or original-file delivery |
| Upload | 8 MiB maximum, streamed limit checked even without Content-Length |
| Decode | Single image, up to 36 megapixels; decode/re-encode, automatic orientation, EXIF/GPS/ICC removed |
| Active photos | Up to 20 per listing; first is the cover |
| Stored history | Up to 100 uploaded assets per listing, including removed photos; no automatic destructive purge |
| Rate | Up to 30 upload attempts per account per hour, using an HMAC account bucket |
| Concurrency | At most 2 active uploads per Site/account-service process and at most2 image decodes |
| Gallery | WebP, bounded by 1600×1600, original composition retained |
| Thumbnail | WebP, 480×360 crop |
| Sharing | JPEG, 1200×630 crop |

Files use server-generated UUID directories, fixed derivative names and 0700/0600 permissions. Processing writes a private temporary directory, syncs files, then atomically renames before committing immutable metadata. A known database rollback removes newly uncommitted bytes. An ambiguous commit outcome retains private bytes for reviewed reconciliation; it never deletes possibly committed media. Disk-full/permission errors cannot publish a half-complete asset. Restarting against the same volume reopens existing files and verifies size/checksum before delivery.

Removed and historical assets are retained privately because immutable reviews may reference them. Volume persistence is not an off-host backup. Do not silently introduce a purge or backup provider: the accepted deferred backup decisions remain separate.

## Database changes

New `008_listing_media.sql` adds:

- `media_assets`: immutable generic IMAGE identity, owner principal, creator and timestamp.
- `media_variants`: immutable gallery/thumb/share MIME, dimensions, byte length and SHA256.
- `listing_media`: ordered active attachment with retained removed rows; an asset belongs to one listing with matching ownership. Only private draft/rejected associations can change.
- `listing_submission_media`: immutable ordered references to the exact unreviewed current submission. Database guards reject attaching unrelated or incomplete variants to a submission.

Migrations001–006 are byte-unchanged. Migration007 belongs to the independent, unmerged reporting PR #8 and is not included here. The media migration has no dependency on007. Before combining candidates, review both migrations and reconcile their release ledger explicitly; do not silently infer that the other PR is deployed.

The historical `verify-marketplace-release.js` and `provision-psgc.js` remain byte-unchanged. Their exact six-migration gate deliberately refuses this new source. Historical regression tests run byte-identical copies with their original six migrations; this is a test fixture, never a deployment bypass.

PostgreSQL 18 integration exposed an existing account-deletion response bug: explicit RESTRICT constraints can report SQLSTATE 23001. `guardedDeleteAccount` now treats 23001 and 23503 as retained-history conflicts. It still refuses deletion and preserves the transactional guard.

## API boundaries

| Purpose | Routes |
| --- | --- |
| Owner | GET/POST/PATCH `/api/marketplace/listings/:id/media`; GET `.../:asset/:variant` |
| Reviewer | GET `/api/admin/marketplace/listings/:id/submissions/:submission/media/:asset/:variant` |
| Public | GET `/api/marketplace/public/listings/:id/media/:asset/:variant` |

Variants are exactly `gallery`, `thumb`, `share`. No original, arbitrary path or arbitrary upstream URL is accepted. All service routes retain the private proxy-key boundary. Owner operations use only the ordinary cookie; reviewer operations use only the dedicated current allowlisted admin session; public requests drop both cookies. Mutations retain Origin/version checks. The Site verifies the actual owner before buffering an upload; the account service rechecks session/capability/authority/version after decoding and inside its write transaction. Revocation during a streamed upload cannot attach a photo.

Photo responses are no-store, nosniff and inline, with same-origin resource policy. Public delivery holds shared locks on eligibility rows and reads bytes before releasing the transaction. Responses are sent after commit, so a failed transaction is not reported as a successful image response. Browser components use direct image URLs so framework image optimisation does not cache protected photos.

## Release preparation and rollback

These are requirements for a separately approved release, not instructions to execute now:

1. Review the final PR, resolve every release security gate, record the exact reviewed commit/tree and008 checksum, and inspect actual running source, persistent DB and Compose configuration. A merged branch is not deployment evidence.
2. Define a new reviewed migration/release catalogue for001–006+008 (or the explicitly integrated007+008 candidate). Do not reuse, bypass or disable the historical six-migration verifier.
3. Prepare the dedicated persistent mount outside the checkout. Check the account-service UID/GID,0700/0600 access, capacity and restore path. Never publish this directory through nginx/Cloudflare/static Site assets.
4. Preserve the current database, accounts, sessions and volume. Take a consistent database+media backup with writers quiesced, and verify a separate disposable restore. If media is first enabled on an empty root, record that state explicitly. Existing off-host backup work remains deferred.
5. Install frozen dependencies and build the exact reviewed source. Apply the reviewed forward migrations manually using `npm run migrate` in `account-service`, only against the separately approved target/configuration. Do not import geography again or auto-run migrations at container boot.
6. Set `LISTING_MEDIA_ROOT` to the mounted container directory and verify the existing marketplace/moderation/publication flags. Start only the approved app release, preserving private HTTPS, proxy keys, cookies and network restrictions.
7. Complete supervised upload → save → submit → review → activate → share → unlist checks, including direct image URLs after withdrawal, a container replacement with the same mount, and an actual Facebook rescrape. Check old no-photo listings and existing account/login/messaging behaviour.

For source rollback, disable media and return to the separately verified previous app image while preserving the database and media volume. Do not drop008 tables, delete files, restore an older database or reset accounts as part of an app rollback. Earlier source ignores media and shows the existing no-photo fallback. Re-enabling the candidate must use the same retained volume. Any destructive database rollback requires independent reconciliation and approval.

Public platforms may retain copies they previously fetched. Origin withdrawal and no-store prevent new authorised delivery; they cannot erase Facebook's external cache. A real rescrape is required after an approved public release.

## Verification

Verified code candidate `e5f8971ff49ff904b8668ba93272e933f8195a2c`: [CI run 39386019096](https://github.com/khaCey/balhinbalay/actions/runs/39386019096) passes 45/45 account tests, 91/91 Site tests and 110/110 real PostgreSQL/PostGIS tests. Full lint passes with 0 errors/two existing warnings; production build, initial crawler/browser HTML and the Chromium mobile/desktop flows pass. Four synthetic screenshots are retained in the workflow artifact. This is 246 passing automated tests plus the HTTP/browser procedures, not an overall green CI claim.

The Site production audit still fails with 1 HIGH Next.js finding on the unchanged 16.3.6 pin (GHSA-cjq9-62q9-8jv4), 5 moderate and 2 low findings. The exact account manifest/lock separately audits with 0 vulnerabilities. No remote image patterns are configured and no current exploit is asserted. The audit gate is not suppressed. IDE0197 / WRK0068 captures the proposed minimum 16.3.8 Next/ESLint patch, awaiting Owner approval under the preceding IDE0167 scope. PR #9 remains Draft; no merge/deployment is approved. See the [source handoff](wrk0062/HANDOFF.md).

`node --test tests/*.test.mjs`, account `npm test`, full disposable PostgreSQL/PostGIS integration, `pnpm lint`, `pnpm build`, `node scripts/verify-listing-sharing.mjs` and the isolated Chromium `--browser` profile exercise the source. The CI workflow keeps production dependency audits as a failing release gate when advisories remain; it does not suppress findings or deploy anything.

The browser tool is pinned to Playwright 1.62.1 (published 30 July 2026) in a runner-temporary installation. Site/account manifests and runtime dependency policy are not changed for this test tool. Screenshots are retained as the `listing-media-browser` workflow artifact. Live Akamaru volume/restart behaviour and Facebook's public unfurl are separate acceptance checks after release approval.
