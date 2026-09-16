# React migration confirmation queue

The confirmation queue is now mostly resolved. Independent frontend work should continue while backend-dependent items remain deferred rather than simulated.

The approved static prototype remains the visual reference, but the accepted Idea Register decisions below override prototype-only behaviour where the product direction has changed.

## 1. Home popularity wording

Area: Home and search ordering.

Decision: Use **“Popular right now”** as the Home property-section heading even before the full ranking service exists.

Current implementation rule:
- keep the existing real API ordering until the recommendation system is implemented;
- do not invent popularity scores in the frontend;
- the heading may still use the approved wording.

Idea: IDE0069
Implementation: IMPLEMENTED in PR #1. The ranking service itself remains a separate recommendation task.

## 2. Saved-search fidelity

Area: Saved searches.

Decision: If saved searches remain in the product, a saved search should reproduce the full criteria rather than silently dropping unsupported fields.

Priority: low. This work is intentionally deferred and the saved-search feature may later be removed.

Current migration rule:
- do not expand the backend during the current visual migration;
- do not pretend unsupported criteria were persisted;
- revisit only if saved searches remain in product scope.

Idea: IDE0072
Implementation: DEFERRED.

## 3. School radius

Area: Alternative search methods.

Decision: Replace the fixed 10 km school-search radius with a continuous distance slider.

Current implementation state:
- the current React search still uses the fixed 10 km client-side radius;
- slider state/filtering still needs implementation;
- the slider minimum, maximum and step are not yet specified, so those values must not be invented during the migration;
- once specified, the same radius must be used by Search, Results and Map Search.

Idea: IDE0071
Implementation: BLOCKED pending IDE0076, which defines the remaining slider range/step decision.

## 4. Rental move-in costs

Area: Property costs and owner fee entry.

Decision: Show owner-supplied rental fees individually and do **not** calculate or display a move-in total.

Current implementation rule:
- keep the structured fee fields;
- show individual amounts such as deposit, advance payment, key money, broker fee, association fee and reservation fee;
- do not infer missing values, recurring terms, credits or refund rules.

Idea: IDE0074
Implementation: IMPLEMENTED in PR #1 for Property Detail and comparison presentation.

## 5. Structured viewing requests

Area: Property contact actions.

Decision: Viewing requests should eventually be structured records with date/time options and status handling.

Priority: deferred until the API/data model implementation exists.

Current migration rule:
- do not fake a structured request in local frontend state;
- the existing property-linked chat remains the functional contact path during this migration.

Idea: IDE0073
Implementation: DEFERRED.

## 6. Unsupported filters and settings

Area: Settings, filters, amenities and owner-form controls.

Decision: Hide controls that do not actually work or persist.

Current migration rule:
- working controls remain visible;
- unsupported amenity filters and notification preferences remain hidden;
- keyword suggestions may remain where they feed the real keyword query;
- the owner exact-map-pin control remains hidden while exact/public coordinate privacy is not enforced by the backend;
- add controls only when the underlying data/API behaviour exists.

Idea: IDE0075
Implementation: IMPLEMENTED in PR #1. The final Search/Settings audit found only controls backed by current search/account behaviour, and the owner form no longer exposes the deliberately disabled exact-map control.

## 7. Public property location privacy

Area: Maps, listing detail and owner listing creation.

Decision: Exact dropped pins are private by default. Public listing/map views use an approximate location unless the Lister explicitly chooses to reveal the exact location for that listing.

Current migration rule:
- the public Property Detail UI no longer renders the stored exact-coordinate map and instead describes the approximate neighbourhood;
- the owner form does not expose an exact-map-pin control while server-side privacy separation is unavailable;
- existing edited listings may still carry legacy exact coordinates internally, and Map Search still consumes the legacy `coordinates` field;
- owner exact-location reveal control requires real API/data support;
- do not mark the privacy model implemented until exact coordinates are protected server-side and Map Search consumes only public-safe location data.

Idea: IDE0068
Implementation: PARTIAL in PR #1; frontend exposure has been reduced, but API/data enforcement, safe public map coordinates and owner reveal remain pending.

## 8. Privacy Choices banner

Area: Privacy/compliance UI.

Decision: Keep the existing Privacy Choices banner visible in the React product.

Current implementation rule:
- retain the banner;
- keep it compact and above mobile navigation so the primary search control remains usable;
- verify placement across the standard visual-QA viewport set.

Idea: IDE0070
Implementation: IMPLEMENTED in PR #1. Dedicated consent-state screenshots pass at 320 / 375 / 390 / 1280 / 1440 / 1920, and the compact banner no longer covers the primary search button.

## 9. Owner Add/Edit visual acceptance

Area: Lister property creation and editing.

Current migration state:
- all six owner-form steps have dedicated 390 px and 1440 px visual QA;
- photo-empty and photo-uploaded states are exercised;
- edit-existing and direct availability-edit states are exercised;
- new listings now default consistently to Region VII / Cebu / Cebu City instead of mixing a Cebu City ID with another province;
- the unsupported exact-map button is asserted absent until IDE0068 can be completed safely.

Implementation: CODE/QA complete for the current frontend-backed states in PR #1. Backend exact-location privacy remains separately PARTIAL under IDE0068.