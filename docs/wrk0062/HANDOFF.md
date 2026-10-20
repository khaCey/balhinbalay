# BalhinBalay media/sharing source handoff — 20 October 2026 JST

Role: Work. Assignments: WRK0062 and WRK0050. Accepted scope: IDE0099, IDE0195, IDE0182 and IDE0183. This source handoff supplements the current Akamaru operational handoff; it does not replace the live Work Queue or deployment evidence.

## Source

- Repository: `khaCey/balhinbalay`; target `server`.
- Verified base: `1eb5ab70def2939eafce7ae1ab0d5ceaf9a73d6f`, tree `4fca8f7f73ad9d0f9e80bfc161e30b38563ce71b`.
- Branch: `codex/wrk0062-media-sharing`; [PR #9](https://github.com/khaCey/balhinbalay/pull/9).
- Verified code candidate: `e5f8971ff49ff904b8668ba93272e933f8195a2c`, tree `a00031fe0e6f9d41fb6d9eaf4a8041532812a5d9`. Subsequent handoff/evidence changes are documentation only.
- Reporting PR #8 / migration007 remains separate. Media adds008 without modifying001–006. Its SHA256 is `e5a71a712af48ebea782bc6f8ab40875c34ae8024b231b59b4edc618d24cc2dc`.

## Implemented source

Optional private listing photos, bounded raster processing, private persistent storage, cover/order/remove controls, immutable submission photos, reviewer previews, public approved gallery/card images and eligibility-checked delivery. Uploads recheck session/capability/authority/version; direct URLs do not publish private/unlisted media. Existing saved fields and zero-photo submissions are retained.

Real listing URLs emit initial HTML metadata for social crawlers, public-only summaries and canonical URLs. Sharing uses a readable approved cover derivative or the static branded fallback. Missing/ineligible listings and outages expose no listing-specific metadata. Public file corruption/missing bytes use the sharing fallback.

Browser testing found and fixed the native file input's intrinsic width expanding its mobile grid column. Thumbnail proportions and 44-pixel photo targets are now checked. PostgreSQL 18 testing found and fixed an existing retained-history deletion error mapping: SQLSTATE 23001 now receives the same safe conflict handling as 23503.

## Verified evidence

[CI run 39386019096](https://github.com/khaCey/balhinbalay/actions/runs/39386019096) on the code candidate:

| Check | Result |
| --- | --- |
| Account unit/regression, including image storage | 45/45 PASS |
| Site unit/regression | 91/91 PASS |
| Full real PostgreSQL 18 / PostGIS 3.6 integration and historical backup regression | 110/110 PASS |
| Full lint |PASS ; 0 errors, 2 existing warnings |
| Production build |PASS |
| Initial HTTP HTML: Facebook, Twitter, LinkedIn, WhatsApp and normal browser |PASS |
| Canonical/cover/zero-photo/missing-cover/withdrawal/outage metadata |PASS |
| Chromium 375px and 1280px galleries and editor |PASS |
| Two uploads, progress/version use, unsaved fields, cover/reorder/remove, stale recovery, approved read-only and failed-image fallback |PASS |
| Frozen installs, source integrity, unchanged old migration bytes |PASS |
| Account production dependency audit, local exact manifest/lock |PASS ; 0 vulnerabilities |
| Site production dependency audit |FAIL ; 1 HIGH, 5 moderate, 2 low |

[Browser artifact](https://github.com/khaCey/balhinbalay/actions/runs/39386019096/artifacts/12247052433): four synthetic screenshots. No real listing photos, credentials or production data were used. The overall workflow is not green: its production audit step fails as recorded below.

## Release blocker and remaining acceptance

The current next 16.3.6 pin is reported under GHSA-cjq9-62q9-8jv4. Maintainer advisory identifies 16.3.8 as the minimum patched 16.x release; no current exploit is asserted because this Site has no configured remote image patterns. The dependency audit remains a hard failing gate, with no waiver or policy relaxation. Existing IDE0167 limited the preceding authorised patch to 16.3.6. New IDE0197 / WRK0068 records the proposed 16.3.8 Next/ESLint remedy as PROPOSED / DRAFT; Work has not executed it.

No production volume, migration, image promotion, public route, container restart, merge, certificate/pairing or live account data was changed by this media/sharing run. This is not a production completion claim.

After a separately approved release, verify actual Akamaru configuration/UID/mount and backup/restore, container replacement with the same volume, old account/login/messaging and no-photo listings, upload→submit→review→activate, direct photo withdrawal and a real Facebook rescrape. The historical six-migration release verifier and geography provisioning tool deliberately reject the new catalogue; a new reviewed 008 release gate is required.

Detailed contract, configuration and non-destructive rollback requirements: [listing-media-and-sharing.md](../wrk0062-listing-media-and-sharing.md).

Next independent task: obtain the Owner decision on IDE0197; Coordinator may then release WRK0068 READY for the minimum dependency patch. Do not execute the DRAFT or deploy PR #9 by implication. Work submits the two feature assignments for separate review and never self-marks COMPLETE.
