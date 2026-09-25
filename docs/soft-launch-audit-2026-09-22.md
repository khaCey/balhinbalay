# BalhinBalay soft-launch audit — 22 September 2026

Target: Saturday, 26 September 2026.

## Current launch-candidate scope

The React Sites app is a working browser-only discovery preview. Home, Search, Results, Map and Property Detail work with illustrative fixture data. There is no production API, persistent authentication, Lister permission service, Admin Account Management, analytics collector or support/reporting service.

The build now identifies itself throughout as a beta preview with sample listings. Device-local favourites, saved searches, comparisons, messages, viewing requests, reports, profile changes and listing-editor changes are described as local demo behaviour. Unsupported notification and password controls are no longer presented as working actions. The internal design-system route is no longer exposed.

## Inventory audit

- 12 discovery fixtures and six local owner/editor fixtures.
- Three illustrative photos are reused across the fixtures.
- No fixture has verified real-world availability, image rights or Lister attribution.
- Current fixture types: Condo, Apartment, House, Studio and Boarding house.
- No launch-ready Townhouse or Land record exists.
- The accepted Room / Bedspace type is not yet mapped from the current Boarding house fixture.
- Coordinates are illustrative public fixture data. They do not demonstrate the accepted private-coordinate/public-approximation architecture.

## Verification completed

- Automated: 16 tests passed covering City rank-v1, all canonical filters and manual sorts, missing values, safe browser-state restoration, direct-route parsing and supplied rental costs.
- Build: production build passed.
- Lint: no errors; 11 warnings remain (image optimisation and two existing component warnings).
- Desktop browser at 1363 × 936: no horizontal overflow.
- Browser journeys: Rent City search, Sale City search, Results → Property, Property → Map → Property, manual low-to-high sorting, filter-driven empty results, gallery, truthful demo enquiry and report flows.
- Navigation: Back, Forward, refresh, valid direct Property URL, invalid direct Property URL and device-local demo state persistence.

## Not yet verified

- 360–430 px mobile, tablet, Chrome Android and Safari/iOS-equivalent behaviour.
- Slow-network and map-tile failure behaviour.
- Real inventory, private-location enforcement, support/report delivery, analytics and error monitoring.
- Final public audience, final domain/DNS and Saturday smoke tests.

## Blocking decisions and inputs

- IDE0147 resolved on 2026-09-23: Saturday is a public browse/search beta. Production accounts, API/auth, Lister permissions and Admin Account Management remain deferred.
- Approved real listing records, images/rights, availability and Lister attribution.
- Production support/contact destination, Privacy Policy and Terms/site-use text.
- Accepted production telemetry architecture compatible with IDE0077.
- Final placement for “Add your own listings”.

Do not make the Site public until the chosen launch scope, real inventory and essential public information are resolved and verified.

## 23 September RC v7 public-information follow-up

- IDE0149 permits clearly identified sample listings for Saturday. Real inventory is post-launch, after registration and pre-approved Lister accounts; the older real-inventory blocker above is historical.
- Owner approved `support@balhinbalay.com` as public contact and reporting address. Contact, Privacy and Terms now have dedicated hash routes and footer links.
- The listing report control now prepares an email to that address with sample listing ID/title, issue and optional details. It does not store a report or claim a ticket was created; sending remains the visitor's action in their email client.
- The privacy page reflects current `localStorage` demo data, browser history state, OpenStreetMap tile requests and externally requested Google font files. Source inspection found no app analytics collector or app-written cookies. Hosting-level logs/cookies were not independently audited.
- Browser/device, final release and tracker verification are recorded separately; this note does not itself certify those checks.

## 23 September follow-up

- Removed invented property descriptions from detail pages when the fixture has no description; the missing information is now stated plainly.
- Map tile failures now trigger the offline notice after three consecutive failures, including failures after an earlier successful tile; a successful tile clears the notice.
- Source audit found no external navigation links in the browse/search components. The only external map request is for OpenStreetMap tiles; local images, favicon and Leaflet assets are present in `public/`.
- Automated checks: 16/16 passed; production build passed. These checks do not certify responsive layout, actual map tile outages or device/browser behaviour.
- The owner-private deployed Site redirects this browser to ChatGPT sign-in. Mobile widths (360/390/430), tablet, laptop, Chrome Android, Safari/iOS, slow network and complete click-through remain unverified. Do not mark their tracker rows complete on source inspection alone.

## 23 September continuation

- Opened the exact RC v5 source commit locally and verified desktop Home → City Search → Results → Map pin → property preview → Property Detail. Matching sample listing and price appeared on the map preview and detail page. About navigation was also checked with Back, Forward and refresh.
- Added a small About page limited to established product and beta facts, with a footer entry and direct `#about` route. It states plainly that current listings and photos are illustrative and real accounts/messages/listing submissions are unavailable.
- The available browser viewport remained 1363×936. Its controls could not establish 360/390/430 px, tablet or laptop viewport sizes, so those responsive tasks remain unverified. No Chrome Android, iOS/Safari equivalent or network throttling was available. The actual map outage/recovery path also remains unverified.
- Automated regression: 16/16 tests pass. Production build passes. No public audience change or real inventory was made.
