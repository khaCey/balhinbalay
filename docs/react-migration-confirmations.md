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
Implementation: in progress on PR #1.

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
- exact slider bounds/step should be kept consistent across Search, Results and Map Search once implemented.

Idea: IDE0071
Implementation: NOT STARTED.

## 4. Rental move-in costs

Area: Property costs and owner fee entry.

Decision: Show owner-supplied rental fees individually and do **not** calculate or display a move-in total.

Current implementation rule:
- keep the structured fee fields;
- show individual amounts such as deposit, advance payment, key money, broker fee, association fee and reservation fee;
- do not infer missing values, recurring terms, credits or refund rules.

Idea: IDE0074
Implementation: in progress on PR #1.

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

Area: Settings, filters and amenities.

Decision: Hide controls that do not actually work or persist.

Current migration rule:
- working controls remain visible;
- unsupported amenity filters and notification preferences remain hidden;
- keyword suggestions may remain where they feed the real keyword query;
- add controls only when the underlying data/API behaviour exists.

Idea: IDE0075
Implementation: PARTIAL; audit remains.

## 7. Public property location privacy

Area: Maps and listing detail.

Decision: Exact dropped pins are private by default. Public listing/map views use an approximate location unless the Lister explicitly chooses to reveal the exact location for that listing.

Current migration rule:
- do not introduce a frontend-only promise of privacy if the API still exposes exact coordinates;
- public-location derivation and owner reveal control require real API/data support;
- do not mark this implemented until exact coordinates are protected server-side.

Idea: IDE0068
Implementation: NOT STARTED.

## 8. Privacy Choices banner

Area: Privacy/compliance UI.

Decision: Keep the existing Privacy Choices banner visible in the React product.

Current migration rule:
- retain the banner;
- final mobile/desktop placement must be checked so it does not obstruct the primary viewport.

Idea: IDE0070
Implementation: PARTIAL.
