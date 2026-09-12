# React migration confirmation queue

Each item is isolated. All independent frontend work continues. No backend or schema changes have been made.

## 1. Popularity and personalised ranking

Area: Home and search ordering.
Current behaviour: API ordering uses newest/price/size; the existing “recommended” value falls back to newest. There are no prototype popularity/quality/behaviour scores in the listing contract.
Prototype behaviour: Popularity-first recommendations with a bounded preference boost.
Why this cannot be safely converted automatically: Introducing a ranking policy or inventing scores changes a core product rule.
Options:
1. Keep real API order and a neutral “Places to explore” home heading until the recommendation task.
2. Specify and implement a ranking service and its data collection separately.
Recommended option: 1 for this migration; plan 2 as the ranking task.
Impact of each option: 1 preserves existing results with accurate labels; 2 changes ranking and needs backend/product work.
Files/components affected: HomePage, AppContent, SortBar, server/routes/listings.js.
Can implementation continue elsewhere?: Yes
Status: Awaiting user confirmation

## 2. Saving complete search criteria

Area: Saved searches.
Current behaviour: The saved-search backend retains one city, property type, price-range index, keyword, beds/baths, size and sort. It does not retain multiple city IDs, school/method, exact price limits or furnishing. Guest serialization also omits multiple cities and school.
Prototype behaviour: Resumes the entire search exactly.
Why this cannot be safely converted automatically: Full fidelity requires API/schema changes. Saving these combinations through the current endpoint would silently lose criteria.
Options:
1. Retain current storage and allow the new Save search control only for combinations it can preserve; keep unsupported combinations open but unsaved.
2. Extend saved-search storage to include all search fields, with backwards-compatible migration and validation.
Recommended option: 2 as a separate approved backend change. Option 1 is used in this branch.
Impact of each option: 1 limits saving some searches without altering existing saved records; 2 enables faithful cross-device resume but changes contracts/schema.
Files/components affected: SavedSearchesContext, SaveSearchButton, SavedPage, server/routes/savedSearches.js, database migration.
Can implementation continue elsewhere?: Yes
Status: Awaiting user confirmation

## 3. School radius and keyword/location semantics

Area: Alternative search methods.
Current behaviour: School results use a fixed 10 km straight-line radius and distance ordering. Keyword mode searches the existing backend fields across cities.
Prototype behaviour: School radius choices of 1–5 km; keyword search can combine selected cities and multiple words/tags.
Why this cannot be safely converted automatically: These change the meaning and scope of a search, not just presentation.
Options:
1. Keep the existing 10 km rule and keyword search semantics, displaying the radius clearly.
2. Approve configurable radius and combined keyword/location rules, including saved-search representation.
Recommended option: 1 for migration, then explicitly specify 2.
Impact of each option: 1 preserves existing results; 2 changes filtering and needs regression tests and the saved-search decision.
Files/components affected: SearchModule, AppContent, SearchMapPage, SearchContext, saved-search contract.
Can implementation continue elsewhere?: Yes
Status: Awaiting user confirmation

## 4. Rental move-in estimate semantics

Area: Property costs and owner fee entry.
Current behaviour: Fees are stored as currency amounts. The existing total sums key money, deposit, advance payment, broker, association and reservation fees. Other fees are free text. There is no contract identifying refundable, recurring or credited fees.
Prototype behaviour: Presents a complete estimated amount due and distinguishes recurring costs and reservation credits.
Why this cannot be safely converted automatically: Adding first-month rent or applying reservation credits can double-count amounts; converting free text to money is unsafe.
Options:
1. Preserve the existing numeric sum, label it “Listed fee total”, and show unspecified amounts explicitly.
2. Define a structured cost model with units, billing periods, credits and refund rules.
Recommended option: 1 now; 2 after agreeing the fee model.
Impact of each option: 1 avoids misleading totals and keeps all listing data; 2 enables a stronger move-in estimate but requires schema/form changes.
Files/components affected: PropertyCosts, Comparison, AddPropertyForm, listing API/schema.
Can implementation continue elsewhere?: Yes
Status: Awaiting user confirmation

## 5. Structured viewing requests

Area: Property contact actions.
Current behaviour: “Request a viewing” opens the existing property-linked chat, with authentication required.
Prototype behaviour: A date/time/note sheet submits a viewing request.
Why this cannot be safely converted automatically: No viewing-request contract exists; the app does not define scheduling status, delivery or owner confirmation.
Options:
1. Retain the existing chat action and explain that viewing details are arranged there.
2. Specify structured requests, or approve a date/time form that sends an ordinary chat message.
Recommended option: 1 now; confirm the intended delivery model before 2.
Impact of each option: 1 preserves working contact behaviour; 2 adds a new product flow and may need backend work.
Files/components affected: PropertyDetailContent, ChatContext, chat/viewing endpoints.
Can implementation continue elsewhere?: Yes
Status: Awaiting user confirmation

## 6. Notification preferences and amenities

Area: Settings and must-have filters.
Current behaviour: Web push is explicitly unavailable; there are no separate saved-search/product-update delivery preferences. Listings have furnishing and free-text description, but no structured pet/parking/garden/pool flags.
Prototype behaviour: Independent notification toggles and amenity chips backed by demonstration state.
Why this cannot be safely converted automatically: Functional toggles/filters would require persisted fields and actual delivery/query behaviour. Local switches would falsely imply working services.
Options:
1. Preserve current settings and filters; keep keyword suggestions connected to the real keyword query.
2. Specify notification delivery and structured amenities, then add validated storage and endpoints.
Recommended option: 1 for this branch; scope 2 separately.
Impact of each option: 1 avoids fake behaviour; 2 expands backend capabilities and needs product decisions.
Files/components affected: SettingsPage, PushContext, SearchModule, listing/user contracts.
Can implementation continue elsewhere?: Yes
Status: Awaiting user confirmation
