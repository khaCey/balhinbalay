# BalhinBalay React migration handoff

Checkpoint: 12 September 2026. Implementation is ready for code review; browser visual acceptance and live service checks remain pending.

## Continuity and location

The work continues the existing React application from `dev` commit `b0ffe745ca1171bd13bcb576a446180877699324`. It does not create a replacement application or change the build stack. The approved static Site at prototype commit `6e6311da0303ea22f5b5647db70ecbd3c98fc044` remains the visual reference and has not been changed or deployed by this migration.

- Repository: https://github.com/khaCey/balhinbalay
- Working branch: `feature/react-prototype-ui`, based on `dev`.
- Working directory: `/workspace/balhinbalay-react`.
- Implementation commits: `197ae02` (foundations/navigation/search), `588be81` (property/saved/map/owner/chat); `399c7e3` contains the first test/handoff checkpoint; the subsequent account/owner commit continues it.
- Production output generated locally in `build/`; generated dependencies/build output are not committed.
- No merge or production deployment has been performed.

## Completed frontend implementation

| Area | Implemented scope |
| --- | --- |
| Shared foundations | Local DM Sans fonts, approved colours/surfaces/gutters, document scrolling, responsive header and four-item mobile navigation, controls, native sheets, property tiles, gallery, costs and comparison components. |
| Home | Compact city-first hero/search, city picker and rails, real listing/recent rails, resume search and owner call to action. Neutral listing heading avoids claiming an unavailable popularity ranking. |
| Search and results | Existing city, keyword, school and map methods connected to the new UI; advanced criteria retained; results filter sheet, card presentation and supported saved-search action. |
| Property detail | Gallery, property facts, description, listed fee total, map and responsive contact actions. Existing favourite, chat, report, share and owner callbacks retained. |
| Saved | Properties, Searches and Recently viewed tabs using existing contexts and resume/delete behaviour. |
| Maps | Shared filter request adapter, genuine empty results, React property preview, context-backed viewport/selection restoration and existing Leaflet infrastructure. |
| Comparison | Up to three real listings in a shared sheet; session state only, cleared on account change. |
| Owner entry/edit | Six-step form retaining existing fields, image handling and API payload; step validation and an edit-loading/ownership guard. Success returns to My properties. |
| Account and messaging | Account menu/navigation, thread previews, property-linked conversation strip and composer using existing send/error behaviour. Profile photo/name/email form, labelled password-reset flow, Settings action rows and password-verified account deletion sheet. |
| My properties | Compact owner cards with actual status, Edit/Availability/Unlist actions, an Add shortcut, and retryable unlist confirmation using the existing service. Availability opens the existing edit wizard at its costs/availability step. |

## Partially completed and pending work

- Profile, Settings and My properties now have explicit approved-layout React implementations. Their browser visual parity remains unverified. Account operations retain the existing handlers and security requirements; they have not been exercised against live accounts.
- Existing authentication, account security/deletion, My properties status/availability actions and administrator functionality remain in place. Their full end-to-end behaviour has not been verified against live services in this environment.
- Visual preservation is implemented through shared design tokens and responsive rules, but is **not visually accepted**: browser navigation to the local preview was blocked with `net::ERR_BLOCKED_BY_CLIENT`.
- The requested 320, 375, 390, 1280, 1440 and 1920 px checks remain pending. No React screenshots were produced. Check rail padding, horizontal overflow, navigation/contact bars, dialogs, map preview and keyboard behaviour at these widths.
- Real browser focus trapping, touch/swipe, map tiles/gestures, camera/upload behaviour and keyboard resize still need browser/device checks. Test dialog polyfills do not validate browser focus behaviour.
- Account-backed persistence, authentication and real chat delivery need staging checks with authorised test accounts. Automated tests use controlled data and mocked HTTP responses.

## Product/backend confirmations

The full options, recommendations, affected files and impact are recorded in [react-migration-confirmations.md](react-migration-confirmations.md). These sections retain existing behaviour or remain pending while independent frontend work is implemented:

1. Popularity/personalised ranking policy and data.
2. Backwards-compatible saved-search storage for complete criteria. The current UI only offers saving combinations the existing storage can preserve.
3. School radius and combined keyword/location semantics. Existing 10 km school search is retained.
4. Structured fee units, recurrence, credits and refund rules for a complete move-in estimate. Current UI shows the existing listed fee sum.
5. Structured viewing requests and delivery/confirmation. Current action opens property-linked chat.
6. Real notification preferences and structured amenity fields. No simulated services or unsupported filters have been introduced.

No backend, schema, API contract or dependency-lock changes were made.

## Verification

- `npm ci --ignore-scripts --no-audit --no-fund`: completed using the existing lockfile.
- `npm run build`: passed, with nine remaining warnings in legacy `src/App.js` (three hook dependency warnings and six unused handlers/values). No new component warnings remain in the final build log.
- `CI=true npm test -- --watchAll=false --runInBand`: **3 suites, 18 tests passed**.
- Coverage includes city selection/cancellation, preserving advanced criteria, independent keyword/school searches, saved tab/resume behaviour, numeric fee totals, comparison limit, map filter/empty results, owner form progression/payload/required validation, chat draft retention on failure, and an actual App provider/router flow from Home to results to favourites to Saved using mocked HTTP.
- Five additional checks cover profile save failure/success, the email-code password reset, deletion cancellation and failure, and owner availability routing/unlist retry. No real accounts or listings were deleted by these tests.
- `package.json` adds Jest resolution mappings for the installed Router 7 exports because CRA's Jest resolver cannot resolve them automatically. No dependency or production build-stack change is involved.

## Next continuation

1. Check out this branch and inspect this handoff, the audit and confirmation queue before editing. Preserve the completed React components; do not regenerate the project from the static export.
2. Run the build and tests above after any functional changes.
3. Use an authorised staging/browser environment for all six requested viewport checks and the pending live workflows. Correct evidenced visual issues against the unchanged approved Site.
4. Resolve individual confirmation items before modifying their business rules or backend contracts; independent work can continue.
5. Update the handoff and development changelog, then review the feature branch before any merge or deployment.

## 12 September continuation context

The latest user request explicitly resumed React conversion. Project Instructions, the supplied Agent Rules, dbdesign.md and the relevant Idea Register rows were inspected before further implementation. The register still records the earlier React deferral (IDE0037), while the current user request explicitly resumes this branch. The user then instructed this task to skip the register; no Idea Register changes or new IDs were made.

The newer database design describes future Seeker/Lister onboarding, a Building/Unit/Listing hierarchy, structured amenities and expanded property types. This migration does not claim to implement that future data model. Existing application contracts remain authoritative for this branch; database/API design and implementation remain separate work. In particular, the owner form deliberately retains the existing fields rather than presenting unsupported new storage fields.

Continued work in this pass: completed the previously partial Profile/Settings UI and owner listing cards; preserved the existing two implementation commits; saved the outstanding test checkpoint; added account/owner behavioural checks. The six product/backend-dependent sections in the confirmation queue remain pending. Visual acceptance is still required before marking the full migration complete.
