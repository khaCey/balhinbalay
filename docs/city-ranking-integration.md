# City ranking demo integration — 2026-09-21

Scope: the existing BalhinBalay React Site, project `appgprj_6aacc98f8eb88191885c041bb731230c`. The original HTML Site, GitHub migration and deferred API remain separate.

## Behaviour

City + Recommended now runs `0.70 * popularity + 0.15 * freshness + 0.15 * quality` after the canonical eligibility pipeline. City eligibility honours Rent/Buy, selected cities, price, type, bedrooms, bathrooms, size, tags and explicit lifecycle/availability fields. Results keep the original card fields and add `scores` metadata, which the normal UI does not display.

The source baseline was not merely newest-first: it used preset `pop`/`quality`, linear freshness and a browsing-signal bonus. That path remains for Keyword/School/Map only. City has no behavioural/profile term. No new profile, identity, telemetry, backend contract or API integration was introduced. Home retains its existing demo behaviour.

All five manual sorts bypass recommendation scoring. City Newest uses publication/creation timestamps when available, otherwise the existing stable demo `age` field. Ordinary edits never reset freshness. Returning from a property or saving it does not reorder City results. Diversity/exploration is disabled and its unaccepted implementation is not ported.

## Files

- `components/balhinbalay/searchListings.js`: existing canonical filtering moved out of React state code, with City routing and independent manual sorts.
- `components/balhinbalay/ranking/cityRanking.js`: pure simulator-derived freshness, quality, Bayesian popularity and weighted City scoring.
- `components/balhinbalay/ranking/rankingConfig.js`: accepted weights/half-life separated from proposed popularity tuning, description cap and disabled diversity.
- `components/balhinbalay/ranking/rankingAdapter.js`: maps Buy to sale, area/size/age and genuine supplied facts; maps the existing Boarding house accommodation fixture to room-specific quality checks.
- `components/balhinbalay/ranking/demoRankingMetrics.js`: fixed synthetic counts for all 12 sample listing IDs. No live updates or real user activity.
- `components/balhinbalay/model.js`: re-exports the canonical search function and fixes the saved-state hydration defect found during QA.
- `tests/city-ranking.test.mjs`: Node built-in test runner; no dependencies added.

The saved-state fix gives server and initial client render the same initial demo state, then restores local storage after hydration before persistence is enabled. Existing saved items, owner records, conversations and preferences are retained.

## Source review and constraints

Read the attached Agent Rules, integration handoff, ranking design and exact function reference; inspected the live Idea Register IDE0077/IDE0079/IDE0080–IDE0086 and the Drive `dbdesign.md` Draft v0.2, especially section 10. The supplied ZIP contains the older project, not this registered Site checkout. The live Site source was recovered without restarting it.

The 2026-09-13 database draft describes future profiles and telemetry; the later register decisions govern the current release: API integration and profile work are deferred. This task does not change database design or implement those future tables.

IDE0080/IDE0081/IDE0084 are accepted. IDE0085 remains PROPOSED; its simulator parameters are demo-only. IDE0086 remains PROPOSED and off. IDE0077, IDE0082 and IDE0083 remain DEFERRED. Overall ranking implementation is PARTIAL because only this frontend demo is complete; backend/production ranking has not started. No material new product decision is introduced.

## Adapter/reference details

- Existing stable `age` values are explicit demo publication ages, not wall-clock dates.
- Three actual sample gallery images earn three-photo credit; no five-photo claim is fabricated.
- Generated description prose, inferred unfurnished labels and default cost displays earn no completeness credit. Missing deposit, lease, availability and sale facts remain missing.
- Numeric zero bedrooms/bathrooms are valid supplied values. Null/empty values are not: an input-coercion guard corrects the simulator's `Number(null) === 0` edge case without changing component weights.
- Current integration computes its popularity prior from the eligible result pool only, in accordance with the handoff's eligible-only ranker boundary. The reference broader-market helper is retained/tested, but this UI does not supply outside-city candidates or a Region/national hierarchy. Its fallback policy remains proposed, not production-complete.
- Popularity uses the supplied event weights 1/2/5/6/10, 14-day decay, 50-impression smoothing and ratio-to-market transform. Fixtures use a current demo bucket; bucket decay is tested separately.

## Verification

- `node --test tests/city-ranking.test.mjs`: 10 tests pass. Covers hard-filter exclusion before scoring (including extreme popularity), sale/rent isolation, exact freshness, type-aware quality, missing facts, numeric manual sorts with scorer traps, exact weights, signal independence, immutable deterministic ordering, metric decay, cold starts and market fallback helper.
- `npm run lint`: zero errors, 12 existing warnings in unchanged UI files (image optimisation, unused variables and Map effect dependency).
- Sites production build: passed. Existing Leaflet CSS asset warnings remain; map implementation was not changed.
- Browser at 1363px: Search → City/Cebu → Results, Recommended, Newest, price ascending, maximum ₱20,000 exclusion, property/save/back with stable order.
- Responsive browser iframe at 390 × 844: Search → City/Cebu → Results, price descending, Recommended, visual inspection with no page horizontal overflow. This is viewport QA, not physical-device testing.
- QA found the pre-existing saved-local-storage hydration mismatch. After the fix, reloading restored saved/recent/search state without the error overlay. Mobile search/navigation still worked.
- JSX card/control markup, styles, fonts, assets and responsive rules are unchanged. No debug panel was added.

## Reproduce

Run `node --test tests/city-ranking.test.mjs` and `npm run lint` from the project root. In the app choose Search → City → Cebu → Find a place. Recommended currently yields IDs 4, 1, 9, 3, 12; Newest yields 9, 3, 4, 12, 1. These orders reflect synthetic fixtures, not market demand.

The live Idea Register carries the final commit/deployment evidence and append-only status transitions.
