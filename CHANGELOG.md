# Changelog

## v.1.0.00.547 — Development
Date: 2026-09-12
Type: Dev Change

### Summary
- Continue the existing React checkpoint with approved account forms and owner listing management.

### Changes (detailed)

#### Changed
- src/pages/ProfilePage.js
  - ProfilePage(), handleSaveProfile()
    - From: Separate inline pencil editors with hidden email errors and a password completion message that disappeared.
    - To: Shared photo/name/email form using the same updateProfile contract, visible failure/completion feedback, labelled reset fields and keyboard-accessible password controls.
- src/pages/SettingsPage.js
  - SettingsPage(), handleDelete(), closeDelete()
    - From: Inline destructive form and obsolete directions to the mobile app.
    - To: Approved account action rows and dismissible delete sheet retaining password verification/API payload, clearing the draft on cancel, and accurate web notification availability.
- src/App.js, src/pages/AddPropertyPage.js, src/components/AddPropertyForm.js
  - AppContent(), AddPropertyPage(), AddPropertyForm()
    - From: General search cards for owned listings and no direct availability-step entry.
    - To: Owner cards, Add action and availability link opening the existing edit wizard at Costs & availability. Preserve listing handlers, fields and final submission.

#### Added
- src/components/ui/OwnerListing.js, src/components/ui/Controls.js, src/styles/approved-ui.css
  - OwnerListing(), Icon()
    - Added: Compact owner summary/status/actions, native unlist confirmation with retry, and shared account/owner styles.
- src/__tests__/account-owner-migration.test.js
  - Account and owner behaviour tests
    - Added: Five checks for profile save failure/success, password reset, deletion cancel/failure and owner availability/unlist retry.

## v.1.0.00.546 — Development
Date: 2026-09-11
Type: Dev Change

### Summary
- Verify the React migration and record a resumable implementation and review checkpoint.

### Changes (detailed)

#### Added
- src/__tests__/{migration,app-migration}.test.js, src/setupTests.js
  - Component and App integration tests
    - Added: Thirteen checks covering search state, saved flows, fees, comparison, map filtering, owner validation/submission and chat failure handling using controlled data.
- docs/react-migration-handoff.md
  - Migration checkpoint
    - Added: Completed scope, partial work, six confirmation topics, verification evidence and outstanding browser/live-service checks.

#### Changed
- package.json
  - jest.moduleNameMapper
    - From: CRA Jest resolution cannot resolve the installed Router 7 package exports.
    - To: Explicit test-only mappings to the installed router modules; retain production tooling and dependencies.

## v.1.0.00.545 — Development
Date: 2026-09-11
Type: Dev Change

### Summary
- Connect the remaining approved UI to real property, saved, map, owner and messaging functionality.

### Changes (detailed)

#### Changed
- src/components/PropertyDetailContent.js
  - PropertyDetailContent(), share(), report()
    - From: Legacy detail sections and duplicated action stacks.
    - To: Shared gallery, property facts, explicit fee disclosure, responsive owner contact and native report sheet; retain real chat/report/share callbacks.
- src/pages/{SavedPage,MenuPage,MessagesPage,ChatPage}.js
  - SavedPage(), MenuPage(), MessagesPage(), ChatPage()
    - From: Favourites-only Saved, saved-search links pointing at results, chat without a property preview.
    - To: Three saved tabs, real resume/delete handlers, account menu links and property-linked chat with the existing send/error behaviour.
- src/components/AddPropertyForm.js, src/pages/AddPropertyPage.js
  - AddPropertyForm(), nextStep(), handleSubmit(), AddPropertyPage()
    - From: One long form and potential add-form fallback when an edit listing had not loaded.
    - To: Six steps retaining existing fields/validation/upload and API payload; prevent unavailable edit routes from creating a new listing; return to My properties after success.

#### Fixed
- src/pages/SearchMapPage.js, src/components/MapView.js, src/components/map/MapPropertyPreview.js, src/context/SearchContext.js
  - SearchMapPage(), MapView(), MapPropertyPreview(), SearchProvider()
    - From: Map ignored several active filters, fell back to unrelated listings for empty results, lost viewport state, and used a global HTML popup callback.
    - To: Use matching filter requests and true empty results; retain viewport and selected ID in React context; select real listings through Leaflet callbacks and a compact React preview.

#### Added
- src/utils/searchRequest.js, docs/react-migration-confirmations.md
  - searchRequest(state, listingType)
    - Added: Map API query adapter and consolidated decisions for functionality requiring product/backend approval.

## v.1.0.00.544 — Development
Date: 2026-09-11
Type: Dev Change

### Summary
- Resume the approved prototype migration inside the existing dev-based React application.

### Changes (detailed)

#### Added
- src/components/ui/{AppNavigation,BottomSheet,CitySelector,Controls,PropertyTile,Comparison,PropertyGallery,PropertyCosts,PropertyFormStep,SaveSearchButton}.js
  - AppNavigation(), BottomSheet(), CitySelector(), SegmentedControl(), PropertyTile(), ComparisonProvider(), PropertyGallery(), PropertyCosts(), PropertyFormStep(), SaveSearchButton()
    - Added: Reusable declarative UI foundations for the approved prototype, native modal focus containment and three-listing comparison.
- src/styles/approved-ui.css, public/fonts/*, docs/react-migration-audit.md
  - Design foundations and migration audit
    - Added: Approved colours, locally served DM Sans fonts, 20px gutters, responsive rails and shared surface/field styles.

#### Changed
- public/index.html, src/App.js, src/components/MainLayout.js
  - AppContent(), MainLayout()
    - From: Sidebar/mobile five-item navigation, full-viewport scroll lock and legacy filter overlay.
    - To: Approved desktop header/four-item bottom navigation and native filter sheet while retaining routes, SEO, contexts and filters.
- src/pages/{HomePage,SearchPage}.js, src/components/SearchModule.js
  - HomePage(), SearchPage(), SearchModule()
    - From: Large inline city browser and essential-filter panel on Home.
    - To: Compact city-first search with a separate picker, real listing rails and preserved search payloads.
- src/components/{PropertyCard,FavoritesButton}.js, src/components/minimal/MinimalPropertyCard.js
  - PropertyCard(), FavoritesButton(), MinimalPropertyCard()
    - From: Multiple card hierarchies and generic heart markup.
    - To: Shared approved property tile and accessible pressed-state favourite control.

## v.1.0.00.543 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Consolidated Home / Search into one suggestion-driven SearchModule (city/school/keyword/map inferred internally); persist search state; fix keyword view, back/edit, and cold `/rent`|`/sale` empty results.

### Changes (detailed)

#### Added
- src/components/SearchModule.js
  - SearchModule({ variant, initialListingType, initialState, autoFocus, defaultSuggestionsOpen })
  - Added: Shared Rent|Buy control, “Where or what…” field with Cities/Schools/Keywords suggestions, Price/Type chips, 44px Search, Map secondary action; mode set from suggestion type.
- src/components/SearchModule.css
  - Added: Module layout/tokens (`#246BFF` / `#F4F7FB` / `#FFFFFF` / `#1B2D4A` / `#D7E0EC`).

#### Changed
- src/pages/HomePage.js
  - HomePage()
  - From: Landing search bar + Explore areas → `/search`; Recommended homes list; one-screen-oriented layout.
  - To: Uses SearchModule; scrollable Continue your search / Popular in Cebu / Recently viewed; area cards submit city search.
- src/pages/SearchPage.js
  - SearchPage()
  - From: Rent/Buy + four category cards (City/Map/Keyword/School).
  - To: Expanded same SearchModule with suggestions open; `edit=1` prefills last search.
- src/context/SearchContext.js
  - SearchProvider / submitSearch / loadPersisted
  - From: In-memory only; default `sortBy: 'newest'`.
  - To: Persist `lastSearchState` + `hasSearched` in `sessionStorage`; default `sortBy: 'recommended'`.
- src/App.js
  - AppContent / LegacySearchRedirect / criteriaProvinceCity / results back handlers
  - From: Back → `step=categories`; `view === 'search'` only; cold `/sale` reload-only redirect; empty “Search now”.
  - To: Back/Edit → `/search?edit=1`; accept `view === 'keyword'`; cold `/rent`|`/sale` → search module; legacy `/search/city|keyword|school` redirect into module; recommended sort default + option.
- src/pages/SearchMapPage.js
  - defaultSearchState
  - From: `sortBy: 'newest'`
  - To: `sortBy: 'recommended'`
- src/styles/prototype-palette.css
  - scrollable home/search rules; surface/border tokens; `.bb-home-continue`
  - From: One-screen `overflow: hidden` lock for Search landing; cooler blue surface `#e6f2ff` / border `#a9c9f0`.
  - To: Scrollable home/search shells; surface `#f4f7fb` / border `#d7e0ec`; Continue row styles.
- src/App.css
  - `.home-page.home-page-scrollable`, `.search-page.search-page-scrollable`
  - From: `.home-page` always `overflow: hidden` + centered flex (one-screen lock).
  - To: Scrollable variants allow vertical scroll and top-aligned content.
- src/index.css
  - button min-height exception
  - From: Only `.search-panel button` unset.
  - To: Also `.bb-search-module button` so 32px/36px/44px module controls are not forced to 44px globally.

## v.1.0.00.542 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Made Explore areas / Search options cards smaller (matched shells) with tighter padding and type.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `--bb-home-option-card-height`, gap/radius/padding tokens; Search option icon/title/desc; Explore city titles (base + short/mid/tall)
 - From: Mid card height ~118px with larger icons/titles, so Search options felt oversized.
 - To: Mid 88px (base 96, short 80, tall 92); smaller padding/gap; Search titles ~0.95rem; Explore cities ~17px. Shells stay matched on Home and Search.

## v.1.0.00.541 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Made the Home/Search hero title bold (DM Sans 700).

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-hero-title`
 - From: No font-weight set; inherited body 400 (regular), so the hero looked thin.
 - To: font-weight 700 while keeping DM Sans.

## v.1.0.00.540 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Fixed search panel heights not applying: global button min-height 44px was overriding Rent/Buy and Search properties tokens.

### Changes (detailed)

#### Changed
- src/index.css
 - Global button tap-target rule; .search-panel button override
 - From: \utton:not(...)\ forced min-height 44px on panel buttons (higher specificity than panel height tokens), so CTA/mode stayed ~44px and the location bar did not look larger.
 - To: Exclude \.search-action\ / \.search-input-go\; unset min-height on \.search-panel button\ with !important so panel tokens win.

- src/styles/prototype-palette.css
 - \.search-panel .mode-switch button\, \.search-panel .search-action\ heights
 - From: Height tokens lost to the global 44px floor (min > max collapsed to 44).
 - To: Height/min/max use !important with the panel tokens (mid input 52 / mode 32 / action 36).

## v.1.0.00.539 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Fixed local Home/Search panel sizing: scoped panel control CSS so App.css `.search-input` no longer fights the taller location bar.

### Changes (detailed)

#### Changed
- src/App.css
 - `.search-panel .search-input` override
 - From: Global `.search-input` applied `min-height: 48px` and field padding to the landing panel flex shell.
 - To: Inside `.search-panel`, reset those field styles so prototype height tokens can apply.

- src/styles/prototype-palette.css
 - `.search-panel .mode-switch`, `.search-panel .search-input`, `.search-panel .search-action` (and related)
 - From: Unscoped rules competed with App.css / default button padding.
 - To: Panel-scoped heights with `padding: 0`, `max-height`, and `box-sizing: border-box` so mid hierarchy (input 52 / mode 32 / action 36) actually shows on `npm start`.

## v.1.0.00.538 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Made the location search bar clearly dominant over Rent/Buy and Search properties (stronger height gap + lighter CTA shadow).

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `--bb-search-input-height`, `--bb-mode-switch-height`, `--bb-search-action-height`, `--bb-search-icon-box`, `--mode-switch-pad`, `.search-action` box-shadow
 - From: Mid ~44 / 34 / 36 with only a few px difference, so the coral CTA still felt larger than the search bar.
 - To: Mid input **52**, mode **32**, action **36** (short 48/30/34; tall 54/32/36); tighter mode-switch pad; softer Search properties shadow so the bar reads as primary.

## v.1.0.00.537 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Made the location search bar taller than Rent/Buy and Search properties so it is the dominant panel control.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `--bb-search-input-height`, `--bb-search-action-height`, `--bb-mode-switch-height`, `--bb-search-icon-box` (base + short/mid/tall)
 - From: Mid heights ~34 / 38 / 40 so Search properties was taller than the location field.
 - To: Hierarchy input > action >= mode (mid 34 / 44 / 36; short 32 / 40 / 34; tall 36 / 46 / 38); icon box nudged to fit the taller input.

## v.1.0.00.536 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Compacted Home/Search panel control heights (Rent/Buy, location field, Search properties) while keeping the larger fonts.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `--bb-mode-switch-height`, `--bb-search-input-height`, `--bb-search-action-height` (base + short/mid/tall bands)
 - From: Oversized control heights (~40-46px mid, up to 48px tall) left chunky padding around the text.
 - To: Tighter heights (base/mid 34/38/40; short 32/36/36; tall 36/40/40); font tokens unchanged.

## v.1.0.00.535 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Reverted Explore areas / Search options to fixed matched shell heights (no stretch-to-fill); leftover space left open for later content.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - Mobile landing `.home-search-cards` / `.area-grid`, option card height rules, tall band
 - From: Option grids flex-grew and unlocked max-height, stretching Search option cards into oversized sparse tiles that no longer matched Home Explore.
 - To: Both grids `flex: 0 0 auto` again; cards use shared fixed `--bb-home-option-card-height`; tall band only bumps type, not shell stretch. Empty leftover viewport is intentional for now.

## v.1.0.00.534 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Enlarged Home/Search panel and option-card type, and replaced tiny height nudges with short/mid/tall bands so tall phones fill leftover space.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `:root` search/panel tokens, `.search-input-field`, mobile mid defaults, area-card headers, Search option title/desc
 - From: Panel fonts ~10-12px; Search option titles ~0.9rem; Explore city ~18px; many small max-height steps that barely changed scale.
 - To: Panel fonts 14-15px (16px tall) with matching control heights; Search titles 1.125rem (1.25rem tall); Explore city 22px (26px tall); coarse short (max-height 700) / mid / tall (min-height 800) bands.

- src/styles/prototype-palette.css
 - Tall band `@media (max-width: 767px) and (min-height: 800px)` option grids
 - From: Fixed card height left empty blue space under Search options on tall phones.
 - To: Unlock card max-height; `.home-search-cards` and `.area-grid` flex-grow to fill first-screen leftover.

## v.1.0.00.533 — Development
Date: 2026-07-23
Type: Dev Change

### Summary
- Restored a larger Home/Search hero title and spacing (back near the original 40px look on mobile).

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - .prototype-home-intro, .prototype-home-small, .minimal-hero-title (base + mobile + short-height steps)
 - From: Hero still compressed on mobile (24px down to 18px) with tight margins.
 - To: Base title 40px / intro 22px 0 18px; mobile title 34→32→30→28px with comfortable spacing above the search panel.

## v.1.0.00.532 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Restored the Home/Search hero title line break and spacing above the search panel (undid unintended hero compression).

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
- src/pages/SearchPage.js
 - hero title
 - From: Single-line Where do you want to live? with tight intro margins.
 - To: Restored two-line title (Where do you / want to live?) and comfortable spacing before the search card.

- src/styles/prototype-palette.css
 - .prototype-home-intro, .minimal-hero-title (mobile + short-height steps)
 - From: Over-compressed margins (as low as 2px) and reduced title size that glued the heading to the search panel.
 - To: Intro margin bottom 8-12px and restored title sizes (24/22/20/18) so the hero is not crushed into the card.

## v.1.0.00.531 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Polished Home/Search mobile landing: readable Search option copy, full Messages nav label, tighter hero, and cleaner Explore area cards.

### Changes (detailed)

#### Changed
- src/App.css
 - .app-bottom-nav-label
 - From: overflow hidden + text-overflow ellipsis clipped Messages into dashes.
 - To: overflow visible + text-overflow clip so the full label shows.

- src/styles/prototype-palette.css
 - Bottom nav items/labels, area-card layout, mobile option/nav tokens, Search desc, hero sizing
 - From: Narrow nav flex + ellipsis; oversized area titles; 2-line clamped long copy; card floor could drop to 80px.
 - To: Slightly wider Messages tab; centered Explore content with 20px titles; single-line short Search descs; card floor 88px; hero single-line and smaller on mobile.

- src/pages/SearchPage.js
 - CARDS, hero title
 - From: Longer descriptions and a two-line hero break that ate vertical space.
 - To: One-line copy (Choose a city, Browse the map, House or condo, Near a school) and a single-line hero.

- src/pages/HomePage.js
 - Explore areas cards, hero title
 - From: Filler Popular search area line and two-line hero.
 - To: Count + city only; single-line hero.

#### Removed
- src/pages/HomePage.js
 - Explore area card subtitle
 - Removed: Popular search area under each city name.

## v.1.0.00.530 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Rebalanced mobile Home/Search: taller matched option cards (104px), readable Search descriptions, and a taller bottom nav so labels are not crushed.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - Mobile `:root` option/nav tokens, Search card desc clamp, hero sizing
 - From: Over-compressed 80px (and lower) cards truncated Search option copy; nav height crushed Messages label.
 - To: Shared card height 104→96→88→80; nav stays ≥70px; Search desc uses 2-line clamp; hero compressed instead of destroying card content.

- src/pages/SearchPage.js
 - `CARDS`
 - From: Longer descriptions that wrapped poorly in compact shells.
 - To: Shorter copy that fits two lines cleanly (`Search on the map`, `House, condo, furnished`, `Near a school or university`).

- src/pages/HomePage.js
 - Explore areas count label
 - From: Always `listings` (e.g. `1 listings`).
 - To: Singular `listing` when count is 1.

## v.1.0.00.529 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Mobile Home/Search now use compact matched option-card shells by default (80px) and `svh` one-screen budgeting so Explore areas and Search options fit with the URL bar open.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `@media (max-width: 767px)` mobile defaults, Search/Home one-screen height, short-height token steps
 - From: Desktop-sized 124px option cards until max-height breakpoints; `100dvh` budgeting; ≤780 step raised cards to 96px (taller than needed).
 - To: All phones get shared 80px cards + compact search/nav/hero; one-screen height uses `100svh`; short steps go 72→64→56 so both grids stay matched and fully visible.

## v.1.0.00.528 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Fixed the search panel never shrinking: cleared App.css `min-height: 48px` on the location field and lowered default Rent/Buy, input, and Search properties heights.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-input`, `.search-action`, `.mode-switch button`, `:root` search chrome tokens
 - From: `.search-input` kept App.css `min-height: 48px`, so the field stayed ~48px even when tokens were smaller; defaults were 30/46/42.
 - To: `min-height`/`max-height` tied to `--bb-search-input-height` / action / mode tokens; defaults 26/38/36 with stronger short-viewport steps.

## v.1.0.00.527 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Restored matched Explore areas / Search options outer shells (same height, gap, radius, padding) on Home and Search; removed divergent flex-fill card heights.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.area-card`, `.search-page.search-page-landing .home-search-card`, mobile landing flex rules
 - From: Search and Home option cards used `height: auto` / leftover flex fill, so shells diverged by page and leftover space.
 - To: Both grids again use shared `--bb-home-option-card-height` (plus gap/radius/padding tokens); grids are `flex: 0 0 auto`; one-screen fit relies on shared chrome compression + stepped height tokens, not per-page card stretching.

## v.1.0.00.526 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Fixed Search/Home one-screen clipping: corrected min-height vs safe-area conflict, synced bottom nav with safe-area, and let Search options + Home Explore grids fill leftover viewport height.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-page.search-page-landing`, `.home-search-card`, `.app-bottom-nav` / `.minimal-bottom-nav`, `.home-page.home-page-landing` Explore layout, short-height hero rules
 - From: `.app-main > *` min-height ignored safe-area so Search grew past its locked height and clipped; Search cards still had fixed token height; nav height excluded safe-area; Home Explore used fixed card heights.
 - To: Search landing uses matching height/min-height/max-height with `min-height: 0`; Search cards are fluid on mobile; nav height/padding include safe-area; Home Explore `area-grid` flex-fills first-screen leftover; stronger hero compression at ≤780/700/640.

## v.1.0.00.525 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Search landing option cards now fill leftover viewport height so all four Search options stay on one screen when the browser URL bar is open.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-page.search-page-landing .minimal-home-wrap`, `.home-search-cards`, `.home-search-card`
 - From: Fixed option-card height (`--bb-home-option-card-height`) with `flex: 0 0 auto` and `1rem` wrap padding; Keyword/School clipped under `overflow: hidden` on short viewports.
 - To: Options grid uses `flex: 1` with `height: auto` / `min-height: 0` cards sharing leftover space; wrap bottom padding reduced to `0.5rem + safe-area`. Home Explore areas keep fixed token height.

## v.1.0.00.524 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Search panel controls and the bottom nav now scale together with viewport height on Home and Search via shared CSS tokens.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `:root` chrome tokens, `.search-panel` controls, `.app-bottom-nav` / `.minimal-bottom-nav`, mobile layout calcs, short-height media queries
 - From: Fixed search control heights and hardcoded `84px` bottom nav / page clearance; short screens only overrode some Home/Search panel heights.
 - To: Shared tokens (`--bb-bottom-nav-height`, `--bb-mode-switch-height`, `--bb-search-input-height`, `--bb-search-action-height`, etc.) wired into nav + search panel; layout uses `var(--bb-bottom-nav-height)`; breakpoints ≤780/700/640 step nav and search chrome together for both pages.

## v.1.0.00.523 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Fixed search panel nested border radii so Rent/Buy, the location field, and Search properties sit concentrically inside the card.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-panel`, `.mode-switch`, `.mode-switch button`, `.search-input`, `.search-action`
 - From: Outer card used 22px radius while children used mismatched 12px/10px/13px radii, leaving corner gaps around Buy and Search properties.
 - To: Inner radii derived as `outer âˆ’ padding` via `--search-inner-radius` (and mode-switch button as inner âˆ’ mode pad), including when short-height padding drops to 5px.

## v.1.0.00.522 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Unified Explore areas (Home) and Search options (Search) card shells so both grids share the same size, gap, radius, and short-viewport compression.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `:root` tokens, `.home-search-cards` / `.area-grid`, `.search-page.search-page-landing .home-search-card` / `.area-card`, short-height media queries
 - From: Search options flexed to fill leftover viewport height with Search-only padding overrides; Explore areas used a fixed height but different gap/padding behavior on short screens.
 - To: Shared shell tokens (`--bb-home-option-card-height`, `--bb-option-grid-gap`, `--bb-option-card-radius`, `--bb-option-card-padding`, `--bb-option-card-shadow`); both grids use fixed identical card shells; short-height breakpoints update shared tokens for Home and Search together; Search landing no longer stretches option cards.

## v.1.0.00.521 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- On short mobile viewports, the search landing page now compresses by device height so all four Search options cards fit without scrolling.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-page.search-page-landing .minimal-home-wrap`, `.home-search-cards`, `.home-search-card`
 - From: Fixed-height option cards (124px) inside a locked viewport; Keyword/School often clipped on shorter phones.
 - To: Flex column layout with cards filling remaining height; `@media (max-height: 780px|700px|640px)` steps shrink hero, Rent/Buy, search CTA, icons, and card padding so the 2Ã—2 options grid fits.

## v.1.0.00.520 — Development
Date: 2026-07-22
Type: Dev Change

### Summary
- Compacted the home search panel vertically, especially the Rent/Buy toggle and surrounding spacing.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.mode-switch`, `.mode-switch button`, `.search-panel`, `.search-input`, `.search-action`, `.prototype-home-intro`, `.minimal-hero-title`
 - From: Tall Rent/Buy control (39px), large search input (54px) / CTA (48px), and generous intro/panel padding that pushed Explore areas far down.
 - To: Shorter Rent/Buy control (30px), tighter search input (46px) / CTA (42px), and reduced intro/panel spacing so the search block takes less vertical height.

## v.1.0.00.519 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Removed the map search back arrow and replaced the broken search glyph with a proper Font Awesome search icon.

### Changes (detailed)

#### Changed
- src/components/map/MapSearchHeader.js
 - `MapSearchHeader({ title, onFilter })`
 - From: Header included a back button (`â†`) and a `âŒ•` text glyph for search.
 - To: Back control removed; search uses `fas fa-search`.

- src/pages/SearchMapPage.js
 - `SearchMapPage` `MapSearchHeader` usage
 - From: Passed `onBack={() => navigate(-1)}`.
 - To: No longer passes `onBack`.

- src/styles/map-search-page.css
 - `.map-search-search-glyph`, `.map-search-back-btn`
 - From: Teal `âŒ•` glyph sizing plus dedicated back-button styles.
 - To: Muted FA search icon alignment; unused back-button styles removed.

## v.1.0.00.518 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added a debug-only admin auto-login path so local development can start already signed in as admin.

### Changes (detailed)

#### Added
- server/routes/auth.js
 - `POST /api/auth/debug-login`
 - Added: When `DEBUG_AUTH=1`, promotes/creates an admin user (prefers `DEBUG_AUTH_EMAIL`, else email matching `khacey`, else `debug-admin@balhinbalay.local`) and returns a JWT session.

- .env.example
 - Documented `DEBUG_AUTH`, `DEBUG_AUTH_EMAIL`, and client `REACT_APP_DEBUG_AUTH` for local debug admin login.

#### Changed
- src/context/AuthContext.js
 - `AuthProvider` boot `useEffect`
 - From: On mount, only validated an existing stored token via `/api/auth/me`.
 - To: When `REACT_APP_DEBUG_AUTH=1`, calls `/api/auth/debug-login` first and sets the returned admin session; otherwise keeps stored-session validation.

## v.1.0.00.517 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Stripped trailing œCity from Explore areas labels (e.g. œCebu City → œCebu).

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
 - `topAreas` (`useMemo`)
 - From: Area cards used the full city display name, including a trailing œCity.
 - To: Trailing ` City` is removed before counting/display so labels read as place names only.

## v.1.0.00.516 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Increased Explore areas city titles further for stronger hierarchy.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.area-card h4`
 - From: Area titles were `18px` bold.
 - To: Area titles are `26px` bold with tighter letter-spacing.

## v.1.0.00.515 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Made Explore areas city names larger and bold.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.area-card h4`
 - From: Area titles were `14px` with default weight.
 - To: Area titles are `18px` and `font-weight: 700`.

## v.1.0.00.514 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Enlarged the Home/Search hero title.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-hero-title`
 - From: Title was `34px` with `max-width: 330px`.
 - To: Title is `40px` with `max-width: 360px` so the larger type still fits the two-line break.

## v.1.0.00.513 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Broke the Home/Search hero title so œwant to live? sits on its own line under œWhere do you.

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
 - `HomePage` hero title markup
 - From: `Where do you want to live?` wrapped naturally (often as œWhere do you want to / œlive?).
 - To: Explicit line break after œWhere do you so the second line is œwant to live?.

- src/pages/SearchPage.js
 - `SearchPage` hero title markup
 - From: Same natural wrap as Home.
 - To: Same explicit break: œWhere do you / œwant to live?.

## v.1.0.00.512 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Matched property-card arrows to Search options by using the same muted Font Awesome chevron instead of the blue `º` pill.

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - From: Home and results cards used a blue `.arrow` span with a `º` glyph.
 - To: Both variants use `fas fa-chevron-right` with `home-search-card-chevron`, matching Search options cards.

- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .arrow--home-floating`
 - From: Positioning only, still relying on the blue `.arrow` box styles.
 - To: Keeps absolute centering and disables pointer events for the muted chevron.

## v.1.0.00.511 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added Font Awesome icons to minimal property feature pills (beds, baths, size, furnished).

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyFacts.js
 - `MinimalPropertyFacts({ beds, baths, size, type, className })`
 - From: Feature pills rendered plain text labels only.
 - To: Each pill includes a matching icon (`fa-bed`, `fa-bath`, `fa-ruler-combined`, `fa-couch`) beside the label.

- src/styles/prototype-palette.css
 - `.minimal-fact`, `.minimal-fact-icon`
 - From: Fact pills were text-only with no icon layout rules.
 - To: Pills use inline-flex alignment and a compact icon size so icons sit flush with the label.

## v.1.0.00.510 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Reverted the extra bottom padding on Recommended homes cards and squared off the bottom corners instead.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-hit`
 - From: Bottom padding was `18px` to clear the 18px corner radius through the price row.
 - To: Padding is back to uniform `7px`; bottom corners use `border-radius: 0` (`18px 18px 0 0`) so the left edge stays straight beside the price.

## v.1.0.00.509 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Gave Recommended homes cards enough bottom padding so the corner radius begins below the price instead of cutting through it.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-hit`
 - From: Uniform `7px` padding left the 18px corner radius overlapping the price row.
 - To: Bottom padding is `18px` (matching the card radius) so the left edge stays straight through the price and the curve starts under it.

## v.1.0.00.508 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Moved Recommended homes price under the photo in the left media column instead of anchoring it at the bottom of the right-side body.

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - From: Home cards rendered price inside `.property-bottom` in the right body column.
 - To: Home cards wrap image + price in `.minimal-property-media`; non-home cards keep price in `.property-bottom`.

- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-media`, `.minimal-property-body`, `.minimal-facts`, `.minimal-property-price`
 - From: Body was fixed to the image height so price could sit on the image baseline in the right column.
 - To: Left column stacks image then price; body height is content-driven and no longer hosts the home price row.

## v.1.0.00.507 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Halved Recommended homes card padding and retuned the image corner radius to stay concentric with the card border.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-hit`, `.minimal-property-card.minimal-property-card--home .minimal-property-image`
 - From: Card hit padding was `14px` with image radius `4px` (`18 âˆ’ 14`).
 - To: Card hit padding is `7px` with image radius `11px` (`18 âˆ’ 7`) so the nested corners still match.

## v.1.0.00.506 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Matched Recommended homes image corner radius to the card border so nested corners stay concentric with the card padding.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-image`
 - From: Image used `border-radius: 12px` while the card hit used `18px` with `14px` padding, so the white gap widened at the corner.
 - To: Image uses `border-radius: 4px` (`18px âˆ’ 14px`) so the image curve follows the card curve.

## v.1.0.00.505 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Tightened the Recommended homes heart favorite button so the circular border sits closer around the icon.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-fav .btn-favorite`
 - From: Heart control used the global 48px tap target (`--bb-tap`), leaving a large ring around the icon.
 - To: Home-card heart is 28px with a 12px icon, so the circular border hugs the heart more tightly.

## v.1.0.00.504 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Moved the Home-card divider to sit above the address section by anchoring it to the address row instead of the title block.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-title`, `.minimal-property-card.minimal-property-card--home .minimal-property-location`
 - From: Divider was attached to the bottom of the title block.
 - To: Divider now renders at the top of the address block (`border-top` + `padding-top`), placing the separator explicitly above the address section.

## v.1.0.00.503 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added extra spacing around the Home-card title/divider block to improve readability and reduce crowding before the title line separator.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-title`
 - From: Title block started flush at the top with tighter divider spacing (`margin-top: 0`, smaller bottom padding).
 - To: Added top spacing before the title block and increased bottom padding before the divider line, giving the title/line section more breathing room.

## v.1.0.00.502 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Moved the Home recommended-card divider from the price row to directly below the title.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-title`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Divider line was attached to the price row (`property-bottom`) above the price.
 - To: Divider line now sits at the bottom of the title block, with title bottom padding for separation; removed price-row divider and reset its top padding.

## v.1.0.00.501 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Tightened Home recommended-card feature pills by reducing pill size and spacing for a denser bottom cluster.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .minimal-fact`
 - From: Feature pills used default pill sizing and spacing, appearing too loose for the compact Home card variant.
 - To: Reduced inter-pill gap and pill dimensions (`padding`, `radius`, `font-size`, `line-height`) to create a tighter, cleaner pill row.

## v.1.0.00.500 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Increased Home recommended-card media/content track size to provide more vertical room and reduce content crowding while preserving layout alignment.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-main`, `.minimal-property-card.minimal-property-card--home .minimal-property-image`, `.minimal-property-card.minimal-property-card--home .minimal-property-body`
 - From: Home card used a 124px image/content track, which could feel cramped with two-line titles and pill stacks.
 - To: Expanded shared track to 136px (image width/height and matching body height) to improve readability and spacing without changing content order.

## v.1.0.00.499 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Rebalanced Home recommended-card vertical layout to restore title/image top alignment and reduce cramped stacking after inline type-pill insertion.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-main`, `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-property-title`, `.minimal-property-card.minimal-property-card--home .minimal-property-location`, `.minimal-property-card.minimal-property-card--home .property-type-row--home-inline`, `.minimal-property-card.minimal-property-card--home .minimal-facts`
 - From: Right-column content could look cramped and title top edge drifted from image top after multiple spacing/order adjustments.
 - To: Restored top alignment by using start-aligned row tracks with matched 124px body height, added controlled vertical rhythm between title/location/type row, and kept feature pills close to the anchored bottom cluster.

## v.1.0.00.498 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Reordered Home recommended-card content so type pills render below the address and above the feature pills.

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - From: Type pills (`Condo` / `Rent`) rendered in the top header row before the title block.
 - To: For Home cards only (`minimal-property-card--home`), type pills now render inline within the body stack directly after address and before feature pills.
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .property-type-row--home-inline`, `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Home ordering treated feature pills as the third block and price row as the fourth block.
 - To: Home ordering now uses: title (1), address (2), type pills (3), feature pills (4), price row (5), preserving anchored price behavior.

## v.1.0.00.497 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added a moderate divider-to-price gap in Home recommended cards to avoid the line feeling too tight against the price text.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Divider row top padding was too small (`1px`), making the line feel too close to price.
 - To: Increased divider row top padding to `3px` for a balanced visual separation.

## v.1.0.00.496 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed Home recommended-card divider/price gap by removing the forced bottom-row height that was pushing price text away from the divider line.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Bottom row used `min-height: 33px`, which held extra vertical space between divider and price even after padding adjustments.
 - To: Set `min-height: 0` so the row collapses to content height, keeping the divider immediately above the price while preserving bottom anchoring via `margin-top: auto`.

## v.1.0.00.495 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Moved the Home recommended-card divider line closer to the price by tightening divider row top padding.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Divider row used `padding-top: 4px`, leaving a larger visual gap between line and price.
 - To: Reduced divider row top padding to `1px` so the line sits closer to the price text.

## v.1.0.00.494 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Separated the Home recommended-card arrow action from the price row and repositioned it as an independent right-side centered control.

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - From: Home card arrow shared the same bottom row as price, visually tying the CTA to the price line.
 - To: Home variant now removes the arrow from the price row and renders a separate floating arrow element.
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .property-bottom`, `.minimal-property-card.minimal-property-card--home .arrow--home-floating`
 - From: Price row used default `space-between` alignment with arrow in-row.
 - To: Home price row now aligns content to the left, while the arrow is absolutely positioned on the right and vertically centered.

## v.1.0.00.493 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Anchored the Home card price row with a divider above it and moved feature pills closer to the bottom cluster.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Feature pills sat slightly above the bottom cluster, and the price row had no explicit separator line.
 - To: Feature pills now sit lower (`margin: auto 0 0`) and the anchored price row now has a top divider (`border-top`) with compact top padding, making the bottom section visually locked and clearly separated.

## v.1.0.00.492 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Made Home-card price typography and bottom-row metrics explicit to stabilize image/price bottom alignment.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-price`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Home price used `font-size: 1.02rem` (~16.32px) with implicit `line-height: normal`, which could vary and shift perceived bottom alignment.
 - To: Set explicit price typography (`font-size: 16px`, `line-height: 1`) and fixed bottom-row metrics (`align-items: flex-end`, `min-height: 33px`) so the price line aligns predictably against the image bottom.

## v.1.0.00.491 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed remaining Home card image/price misalignment by removing inline-image baseline gap and forcing end alignment in the media/content row.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-image`
 - From: Image could still appear visually off relative to the price row due to inline image baseline behavior.
 - To: Set home-card image to `display: block` and `align-self: end` so it aligns cleanly with the content column bottom/price line.

## v.1.0.00.490 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Prioritized Home recommended-card baseline alignment by anchoring the image to the same bottom line as the text/price column.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-main`, `.minimal-property-card.minimal-property-card--home .minimal-property-body`
 - From: Home card used a fixed right-column height, which could make the price row appear visually misaligned against the image bottom.
 - To: Switched grid item alignment to bottom and removed fixed right-column height constraints so the content column defines row height and the image aligns to the same bottom baseline as the price row.

## v.1.0.00.489 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Restored stable price anchoring in Home recommended cards and moved only feature pills closer using flow-based spacing.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Feature-pill positioning used `top` offset, which visually shifted the stack and could make price alignment appear unstable.
 - To: Removed positional offset and switched to flow-based spacing (`minimal-facts` uses `margin: auto 0 2px`, `property-bottom` uses `margin-top: auto`) so price remains anchored while pills sit close above it.

## v.1.0.00.488 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Corrected Home card spacing change to target only feature pills (`beds/baths/area`) by moving that row closer to the price row while leaving type pills unchanged.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-facts`
 - From: Prior spacing adjustments could be interpreted as top-pill movement instead of clearly shifting the feature-pill row relative to price.
 - To: Applied a direct positional offset on the feature-pill row (`top: 6px`) with neutral margins so only the `1 bed / 1 bath / area` row moves closer to price.

## v.1.0.00.487 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Aligned Home recommended-card price row with the photo bottom edge and moved feature pills down closer to the price row.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-main`, `.minimal-property-card.minimal-property-card--home .minimal-property-image`, `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Home card right column could extend below the photo, leaving the price row lower than the image bottom and keeping pills higher in the stack.
 - To: Home card image/body now share a matched 124px vertical track; pills are auto-pushed toward the lower portion of the body and the price row sits directly beneath them, aligning the price line with the image bottom.

## v.1.0.00.486 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Tightened Home recommended-card feature-pill to price spacing so pills sit visibly closer to the price row.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Home card stack still left a noticeable gap between feature pills and the price row.
 - To: Reduced Home body stack gap, removed extra pill margin, and reduced price-row top margin to bring pills closer to price.

## v.1.0.00.485 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Corrected Home-card feature-pill positioning by reversing the overly aggressive upward offset and restoring a balanced spacing flow above price.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Feature pills were forced upward with strong negative offset and transform, which pushed them too high.
 - To: Removed upward transform/negative offset, restored slight top margin on pills, and adjusted price-row top spacing for a more natural vertical stack.

## v.1.0.00.484 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Applied a stronger, visually obvious Home-card feature-pill upward shift while preserving separation before the price row.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Prior pill offset was subtle and could appear unchanged in practice.
 - To: Increased pill upward movement using stronger negative margin + translate offset, and increased price-row top margin to keep the price position visually separate from the moved pills.

## v.1.0.00.483 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Adjusted Home recommended-card vertical spacing to move feature pills upward while restoring price-row spacing.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Previous compact pass tightened both pills and price row together, moving the price up along with the pills.
 - To: Increased body gap and restored price-row top spacing, while applying an upward offset only to the feature pills so pills move up without pulling price upward.

## v.1.0.00.482 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Compacted Home recommended-card text stack further so address, feature pills, and price sit tightly together with near-zero vertical spacing.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Stack spacing was reduced but still left noticeable gaps between location, pills, and price.
 - To: Applied aggressive compact spacing (`gap: 1px`, zero pill margin, zero price-row top margin) to keep the three blocks visually tight together.

## v.1.0.00.481 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Applied a stronger Home-card vertical compacting pass so feature pills and price sit noticeably closer together.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-property-location`, `.minimal-property-card.minimal-property-card--home .minimal-facts`, `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: Prior spacing reduction was minimal, and the location/pills/price stack still appeared visually separated.
 - To: Tightened stack spacing with explicit compact `gap`, removed location margin, reduced feature-pill margin, and reduced price-row top offset for a clearly denser layout.

## v.1.0.00.480 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Reduced excessive vertical gap between feature pills and price in Home recommended cards by replacing auto push spacing with a compact fixed offset.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .property-bottom`
 - From: `margin-top: auto` pinned the price row to the bottom and could create a large empty gap above price when content was short.
 - To: Changed to `margin-top: 6px` so price sits directly below the feature pills with tighter, consistent spacing.

## v.1.0.00.479 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Applied a staggered two-line Home-card title treatment where the first line is intentionally narrower and the second line is wider.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-title`
 - From: Home title used standard two-line clamped block with even line width behavior.
 - To: Home title now uses a staggered wrap effect by reserving space on the first line (`::before` float), producing a shorter first line and a wider second line while preserving two-line height constraints.

## v.1.0.00.478 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Standardized Home recommended-card content flow to `Title (2 lines) -> Address -> Feature pills -> Price`, with price pinned at the bottom.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - Home-scoped selectors for `.minimal-property-card--home` (`.minimal-property-body`, `.minimal-property-title`, `.minimal-property-location`, `.minimal-facts`, `.property-bottom`)
 - From: Title/address/features/price relied on natural flow and could appear inconsistent, with title not guaranteed to occupy a two-line layout.
 - To: Explicit ordering is enforced via `order`, title is constrained to a two-line block (`line-clamp: 2` + fixed minimum height), and price row remains bottom-pinned for consistent card structure.

## v.1.0.00.477 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Aligned Home recommended-card title with the image top row and adjusted heart button positioning to avoid competing with the image/title alignment.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home .minimal-property-body`, `.minimal-property-card.minimal-property-card--home .minimal-property-title`, `.minimal-property-card.minimal-property-card--home .minimal-property-fav`
 - From: Home card title inherited larger top margin, causing title text to sit lower than the image row; heart placement could visually compete with the new compact composition.
 - To: Removed home-body top offset, reset home-title top margin for top-row alignment with the image, and applied home-specific heart coordinates for cleaner layout balance.

## v.1.0.00.476 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Standardized minimal property card layout by pinning price/action to the bottom and replacing the old `for sale/per month` line with a `Buy/Rent` pill beside the property-type pill.

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - From: Card used a single property-type pill and a secondary text line (`for sale` / `per month`) beneath the price.
 - To: Card now shows two pills in the top row (`House/Condo/etc.` + `Buy/Rent`) and removes the old note line under the price.
- src/styles/prototype-palette.css
 - `.property-type-row`, `.property-type--mode`, `.minimal-property-body`, `.property-bottom`
 - From: Card body flow could leave price/actions floating above the bottom depending on content height, and no visual style existed for a listing-mode pill.
 - To: Card body now uses column flow with bottom-pinned `property-bottom` via `margin-top: auto`; added dedicated Buy/Rent pill styling (rent vs buy color treatment) aligned beside the property-type pill.

## v.1.0.00.475 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Reduced Recommended homes image dominance by switching Home cards to a compact left-image layout with title/price content on the right.

### Changes (detailed)

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - From: Card image and body were stacked vertically for all usages, causing very tall media presentation on Home recommended cards.
 - To: Introduced `minimal-property-main` wrapper to support layout variants, enabling Home cards to render image and content side-by-side.
- src/pages/HomePage.js
 - `HomePage()` recommended list card invocation
 - From: Home reused default `MinimalPropertyCard` layout.
 - To: Home passes `className="minimal-property-card--home"` so only recommended cards use the compact horizontal media layout.
- src/styles/prototype-palette.css
 - `.minimal-property-card.minimal-property-card--home` scoped selectors
 - From: No Home-specific card override for compact side-image layout.
 - To: Added Home-specific grid/size/spacing overrides so image sits on the left with text/price on the right while preserving the existing layout for other pages.

## v.1.0.00.474 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added property photos to Recommended homes cards by rendering each listing™s primary image with a fallback image when none exists.

### Changes (detailed)

#### Added
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - Added: `minimal-property-image` rendering in card markup using the listing primary image (`property.images[0]`) with `DEFAULT_OG_IMAGE_PATH` fallback.

#### Changed
- src/components/minimal/MinimalPropertyCard.js
 - `imageSrc` selection logic
 - From: Card showed no photo because no image element was rendered despite existing image styles.
 - To: Card now computes `imageSrc` safely and displays the photo consistently in Recommended homes and shared minimal list usage.

## v.1.0.00.473 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Refined Explore areas card internals (gap, padding, and shadow/border feel) to visually match Search options card styling more closely.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.area-grid`, `.area-card`, `.area-card h4`
 - From: Explore area cards had different inter-card gap, looser internal spacing, and flatter surface treatment, causing visible mismatch against Search options cards.
 - To: Increased Explore grid gap to match Search options rhythm, aligned card padding to the same compact structure, added matching soft card shadow, and tightened title top offset for consistent visual balance.

## v.1.0.00.472 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Enforced identical fixed heights for Search options cards and Explore areas cards so both sections render true size parity.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `:root`, `.search-page.search-page-landing .home-search-card`, `.area-card`
 - From: Both sections used similar but independently tuned card sizing with min-height behavior, which could still produce visible size mismatch.
 - To: Added shared height token (`--bb-home-option-card-height`) and applied exact fixed height + min-height to both card types for 1:1 sizing.

## v.1.0.00.471 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Matched Explore areas card sizing behavior to Search options by enforcing uniform grid row stretch and the same card height baseline.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.area-grid`, `.area-card`
 - From: Explore area cards used a smaller height baseline and content-driven row sizing, resulting in a different overall card size feel than Search options.
 - To: Explore area grid now uses row stretch consistency and cards use a `128px` minimum height with full-row fill, matching Search options sizing behavior.

## v.1.0.00.470 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Matched Search options section spacing to Explore areas by removing extra card-grid container padding.

### Changes (detailed)

#### Changed
- src/App.css
 - `.home-search-cards`
 - From: Search option grid applied additional container padding, producing different spacing compared with Explore areas.
 - To: Removed container padding (`padding: 0`) so Search options aligns with Explore areas spacing behavior.

## v.1.0.00.469 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed mobile side spacing mismatch by removing wrapper width caps on key pages, so horizontal margins now reflect the configured page gutter instead of extra centering offset.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - Mobile `@media (max-width: 767px)` overrides for `.minimal-home-wrap`, `.saved-page .page-content`, `.menu-page .menu-page-body`, `.profile-page .page-content`
 - From: `max-width` limits could center narrow content columns on wider mobile viewports/emulators, creating side spacing larger than the intended gutter.
 - To: Mobile wrappers now use full viewport width (`max-width: none; width: 100%`) so edge spacing is controlled by the shared gutter padding only.

## v.1.0.00.468 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Reduced and standardized the page-side gutter so Home/Search and related account pages share the same thinner edge spacing.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `:root`, `.minimal-home-wrap`, `.saved-page .page-content`, `.menu-page .menu-page-body`, `.profile-page .page-content`
 - From: Wrapper side padding relied on `1rem` (16px), which still made sections appear more inset than desired even after removing inner container padding.
 - To: Added a shared `--bb-page-gutter: 12px` and applied it to wrapper horizontal padding so all major page sections align with a thinner, consistent outer margin.

## v.1.0.00.467 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Applied consistent thin horizontal gutter behavior by removing remaining legacy side inset from shared search-card grid base styles.

### Changes (detailed)

#### Changed
- src/App.css
 - `.home-search-cards`
 - From: Shared base grid applied `padding: 16px 20px`, which kept extra left/right inset in sections that should align with wrapper-based page gutters.
 - To: Updated to `padding: 16px 0`, so horizontal spacing comes consistently from page wrappers instead of stacked container padding.

## v.1.0.00.466 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Standardized horizontal gutter usage so search option card sections no longer add extra side inset beyond the page wrapper spacing.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.home-search-cards`
 - From: Search option card grids applied additional horizontal padding from base styles, making side spacing look thicker than the search panel and other wrapper-aligned sections.
 - To: Search option card grids now use zero internal horizontal padding, inheriting consistent edge spacing from the shared page wrapper for thinner, uniform left/right margins.

## v.1.0.00.465 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Unified Home search controls with Search page search controls by switching Home to the same real input-form layout and direct submit behavior.

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
 - `HomePage()`, `handleHomeSearchSubmit(event)`
 - From: Home used a button-style search row with subtitle text and routed to `/search?...step=categories` instead of submitting typed input directly.
 - To: Home now uses the same semantic search form as Search page (`search-input-field` + submit chevron + submit CTA), submits through `submitSearch()` with keyword-or-city fallback, and opens `/rent` or `/sale` results directly.

## v.1.0.00.464 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Centered search-option card chevrons as independent action indicators instead of tying their vertical alignment to the top content row.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-page.search-page-landing .home-search-card`, `.home-search-card-top`, `.home-search-card-top .home-search-card-chevron`
 - From: Chevron sat in the top-row grid and aligned relative to header content, making it feel off-center.
 - To: Chevron is now absolutely positioned and vertically centered per card, independent of icon/title/description wrapping.

## v.1.0.00.463 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Adjusted Keyword search-card description order so line wrapping reads more naturally on mobile card widths.

### Changes (detailed)

#### Changed
- src/pages/SearchPage.js
 - `CARDS` constant (`keyword` entry description)
 - From: `House, condo, furnished, pet-friendly`
 - To: `House, condo, pet-friendly, furnished`

## v.1.0.00.462 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Redesigned Search landing option card internals so icon/title align at the top and the description sits as a full-width block at the bottom for better readability and visual balance.

### Changes (detailed)

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()` option-card markup in the `CARDS.map(...)` render block
 - From: Icon, title/description text, and chevron were arranged in one horizontal row, causing description wrapping to feel cramped beside the icon.
 - To: Cards now render a distinct top row (`icon + title + chevron`) and a separate bottom description block spanning the card width.
- src/styles/prototype-palette.css
 - `.search-page.search-page-landing .home-search-card`, `.home-search-card-top`, `.home-search-card-desc-block` and related top-row alignment selectors
 - From: Card internals used shared row-style layout with content-height imbalance and side-by-side description flow.
 - To: Search landing cards now use a column layout with top-aligned icon/header row and bottom description section, with adjusted spacing/height to keep cards visually consistent.

## v.1.0.00.461 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Standardized Search landing option card sizing so City, Map, Keyword, and School render with matching dimensions.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.search-page.search-page-landing .home-search-cards`, `.search-page.search-page-landing .home-search-card`, `.search-page.search-page-landing .home-search-card-text`
 - From: Search option cards sized by text content, causing uneven card heights between options.
 - To: Search landing card grid now stretches rows uniformly and applies a shared card height baseline, keeping all four option cards visually equal.

## v.1.0.00.460 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Converted the Search landing œSearch a location control into a real typeable search bar and fixed mobile fit issues so the control no longer clips or overflows on narrow screens.

### Changes (detailed)

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()`, `handleLandingSearchSubmit(event)`
 - From: œSearch a location was a button-like row that opened options, not a real text input, and the primary action only navigated to `/sale` or `/rent` without using typed keyword submission.
 - To: Replaced with a semantic form containing a real `<input type=\"search\">`; Enter or submit now calls `submitSearch()` with landing keyword state (`view: 'keyword'` when text is present, fallback `view: 'city'` when empty) and navigates to the corresponding results route.
- src/styles/prototype-palette.css
 - `.search-input`, `.search-landing-form`, `.search-input-field`, `.search-input-go`, narrow-screen `@media (max-width: 380px)`
 - From: Two-line button-style search row relied on label blocks and could feel cramped on narrow mobile widths.
 - To: Styled as an input-first search bar with explicit field/go-button layout, controlled icon behavior, and narrow-screen size reductions to prevent overlap/clipping.

## v.1.0.00.459 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Disabled vertical scrolling on the mobile search landing page so the route behaves as a fixed, non-scroll screen.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - Mobile `@media (max-width: 767px)` rules for `.search-page.search-page-landing` and `.search-page.search-page-landing .minimal-home-wrap`
 - From: Search landing inherited shared mobile page padding and normal page overflow behavior, allowing vertical scrolling.
 - To: Search landing now uses fixed viewport height with hidden overflow and route-specific bottom-padding override, preventing vertical page scroll on that landing screen.

## v.1.0.00.458 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Removed the œUse Search for direct results helper panel from the search landing page for a cleaner, more direct search options layout.

### Changes (detailed)

#### Removed
- src/pages/SearchPage.js
 - `SearchPage()`
 - Removed: `search-landing-banner` section (œUse Search for direct results) that displayed explanatory helper text between the search panel and search option cards.

## v.1.0.00.457 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Set Search navigation to open the search landing page by default, matching the expected Rent/Buy + Search options screen before results.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - `handleSearch()`
 - From: Search tab routed directly to listing results (`/sale` or `/rent`), skipping the search landing screen.
 - To: Search tab now routes to `/search?listingType=<rent|sale>`, so the search landing page is the default entry point while preserving the last selected listing type.

## v.1.0.00.456 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Made search option cards visible by default on the search landing screen so users can directly choose City/Map/Keyword/School without first opening an extra step.

### Changes (detailed)

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()`
 - From: Search option cards rendered only when URL state included `step=categories`, so the options stayed hidden on initial load.
 - To: Search option cards now always render on the landing flow, while `step=categories` is only used for back-button/SEO copy context; the guidance banner remains visible.

## v.1.0.00.455 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Reduced excessive top whitespace on the mobile results screen by tightening summary/meta spacing and ensuring the listing stack starts immediately below the controls.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.minimal-results-meta-row`, `.results-area.minimal-results-shell`, `.results-area.minimal-results-shell > .listing-grid`
 - From: Results meta row had larger vertical margin and listing flow could visually appear delayed, creating a noticeable empty block before cards.
 - To: Tightened meta-row margin, enforced top-aligned results flow, and added a small controlled top spacing for the listing stack so cards begin much closer to the filter/sort controls.

## v.1.0.00.454 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Replaced the bottom-nav Account slot with Messages and moved Account access to a dedicated icon in the Home header, preserving login gating and unread indicators.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - Bottom navigation button mapping in `MainLayout()`
 - From: Bottom nav ended with `Account`, navigating to `/menu` (or opening login), while messages access depended on separate entry points.
 - To: Bottom nav now ends with `Messages`, navigating to `/messages` when logged in (or opening login when logged out), with unread badge support using existing `unreadChatCount`.
- src/components/MainLayout.js
 - Bottom nav active-state binding for final tab
 - From: Final tab active state tracked account routes (`/menu`, `/profile`, `/settings`).
 - To: Final tab active state now tracks messages/chat routes (`/messages`, `/chat/*`) so highlight behavior matches the restored Messages placement.
- src/pages/HomePage.js
 - `HomePage()` top bar actions
 - From: Top bar rendered only the centered wordmark after prior cleanup.
 - To: Added a right-side Account icon (`user ? /menu : openLogin`) and a left spacer to keep the logo visually centered.
- src/styles/prototype-palette.css
 - `.prototype-home-topbar`, `.prototype-home-topbar-spacer`, `.prototype-home-account-btn`
 - From: Top bar styling assumed logo-only layout with centered justification.
 - To: Updated to balanced `space-between` layout with fixed spacer + interactive account icon styling, while preserving logo prominence.

## v.1.0.00.453 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed the login modal persisting across navigation by automatically dismissing it when the route changes.

### Changes (detailed)

#### Fixed
- src/context/LoginModalContext.js
 - `LoginModalProvider()` route-change close effect
 - From: Opening login from protected actions (e.g., Saved tab) could leave the modal visible even after navigating to another page.
 - To: Added a route-change watcher (`pathname/search/hash`) that closes the modal whenever navigation occurs, preventing stale overlays across pages.
- src/context/LoginModalContext.js
 - `LoginModalProvider()` route-change tracking (`lastRouteKeyRef`)
 - From: Initial route-close implementation depended only on location values and raised a hooks dependency warning risk.
 - To: Added explicit previous-route tracking via `useRef` and guarded close-on-change logic, so modal closes only on real route transitions and keeps hook dependencies complete.

## v.1.0.00.452 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Simplified the home header by removing the left/right utility buttons and enlarging the BalhinBalay wordmark for a cleaner, logo-focused top bar.

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
 - `HomePage()` top bar markup
 - From: Header rendered a left menu button and right saved button around the logo.
 - To: Header now renders only the centered BalhinBalay wordmark.
- src/styles/prototype-palette.css
 - `.prototype-home-topbar`, `.minimal-wordmark`
 - From: Top bar used split alignment (`space-between`) for side buttons and a smaller logo size.
 - To: Top bar uses centered alignment and a larger logo treatment (`font-size: 32px`, adjusted spacing/line-height) to emphasize brand text.

## v.1.0.00.451 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Refined bottom navigation active-state styling so the selected tab highlight looks cleaner and more balanced across icon and label.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - `.app-bottom-nav-item`, `.app-bottom-nav-item i`, `.app-bottom-nav-item.active`, `.app-bottom-nav-item.active i`, `.app-bottom-nav-item.active .app-bottom-nav-label`
 - From: Active state relied on a strong filled icon bubble, which could feel visually heavy and disconnected from the tab label.
 - To: Active state now uses a subtle tab-level blue tint background with blue icon/label emphasis and stronger label weight, creating a cleaner and more cohesive selected-tab highlight.

## v.1.0.00.450 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Adjusted the property CTA layout to a clean horizontal row so the favorite button and œRequest a viewing button align properly instead of stacking awkwardly.

### Changes (detailed)

#### Changed
- src/App.css
 - `.pd-cta-bar`, `.pd-cta-primary`, `.pd-cta-favorite-btn`
 - From: CTA container lacked explicit row alignment and the primary button used full-width behavior, which could force awkward stacking/spacing.
 - To: CTA now uses an explicit horizontal flex row with centered alignment; primary CTA is flexible (`flex: 1`) instead of forced full-width block; favorite button is fixed-size (`flex: 0 0 auto`).
- src/styles/minimal-marketplace.css
 - `.minimal-property-detail .pd-cta-bar`
 - From: Minimal override did not explicitly enforce row alignment for CTA content.
 - To: Added row-flex alignment in minimal theme so CTA layout remains consistent with the updated base structure.

## v.1.0.00.449 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Cleaned up the property details vertical spacing by removing duplicated bottom paddings that were creating a large empty area below the CTA.

### Changes (detailed)

#### Fixed
- src/App.css
 - `.property-page .page-content.property-detail-page-content`, `.app-has-bottom-nav .property-page .page-content.property-detail-page-content`
 - From: Property route content applied additional bottom padding on top of scroll spacer/nav clearance, causing excess whitespace after the CTA.
 - To: Removed route content bottom padding (`padding-bottom: 0`) so spacing is controlled by the dedicated scroll pad only.
- src/styles/prototype-palette.css
 - Mobile `@media (max-width: 767px)` page padding group
 - From: `.property-page` inherited shared page-level bottom padding used by other screens, adding another layer of empty space.
 - To: Excluded `.property-page` from the shared mobile bottom padding group to prevent double bottom spacing.

## v.1.0.00.448 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Prevented the property CTA from blocking details content by moving it into the normal scroll flow and increasing the bottom spacer to clear the fixed mobile navigation.

### Changes (detailed)

#### Changed
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent()` bottom CTA placement
 - From: `pd-cta-bar` rendered as a sibling section outside the main detail content flow, which could visually block property content in constrained/mobile layouts.
 - To: CTA now renders inside the scrollable details content block (just above the bottom spacer), so it behaves as part of normal content rather than a blocking layer.
- src/App.css
 - `.pd-scroll-pad`, `.property-detail-page-content .pd-shell:has(.pd-cta-bar) .pd-scroll-pad`, `.app-has-bottom-nav .property-detail-page-content .pd-shell:has(.pd-cta-bar) .pd-scroll-pad`, `.pd-cta-bar`
 - From: Small fixed spacer values could still leave content cramped against the mobile bottom nav.
 - To: Spacer now uses bottom-nav-based clearance (`var(--bb-bottom-nav-base)`), and CTA top margin is increased for clearer separation from details sections.

## v.1.0.00.447 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Applied a hard, route-scoped scroll override chain for property details to force reliable mobile vertical scrolling despite conflicting legacy layout rules.

### Changes (detailed)

#### Fixed
- src/App.css
 - `.property-page`, `.property-page .page-content.property-detail-page-content`, `.property-detail-page-content > .pd-shell`, `.property-page .property-detail-page-content .pd-scroll`
 - From: Multiple inherited and competing overflow/flex rules could still block or destabilize touch scroll on `/property/:id`.
 - To: Enforced a single constrained layout chain with fixed route height, hidden parent overflow, explicit `min-height: 0`, and `overflow-y: auto !important` on `.pd-scroll`, plus `touch-action: pan-y` through the route stack.

## v.1.0.00.446 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added a route-level scroll unlock for property details so scrolling works even when inherited layout/body overflow styles from other app flows conflict.

### Changes (detailed)

#### Fixed
- src/pages/PropertyPage.js
 - `PropertyPage()` route-mount scroll effect
 - From: Property route could inherit overflow locks from other views or wrapper containers, resulting in a non-scrollable details page.
 - To: On active property route mount, force body/html and `.app-main` to scrollable overflow, then restore previous values on unmount.
- src/App.css
 - `.property-page .property-detail-page-content .pd-scroll`
 - From: Scroll container handled overflow but touch gestures could still be unreliable in nested mobile layout contexts.
 - To: Added `touch-action: pan-y` to reinforce vertical touch scrolling behavior on the active property scroll surface.

## v.1.0.00.445 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed property-page scrolling when swiping over the embedded location map by making the disabled map preview fully passive to touch/gesture input.

### Changes (detailed)

#### Fixed
- src/components/PropertyMapPreview.js
 - `PropertyMapPreview({ coordinates, title })`
 - From: Embedded map preview and disabled overlay could still capture touch gestures, preventing vertical page scroll when users swiped on the map section.
 - To: Map preview now uses non-interactive touch behavior (`pointerEvents: none`, `touchAction: pan-y`) and applies a passive overlay class for route scrolling.
- src/App.css
 - `.bb-map-disabled-overlay--passive`
 - Added: Passive overlay variant that disables pointer capture and allows vertical scroll gestures to pass through.

## v.1.0.00.444 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed the remaining property-page no-scroll issue by forcing a single, dedicated scroll container for route-based property details.

### Changes (detailed)

#### Fixed
- src/App.css
 - `.property-page .page-content.property-detail-page-content`, `.property-page .property-detail-page-content .pd-scroll`
 - From: Property route could end up with competing scroll contexts (parent + child), while shared overrides also pushed `pd-scroll` toward visible overflow behavior.
 - To: Parent route content is now non-scrolling (`overflow: hidden`) and the inner `.pd-scroll` is the sole scroll surface (`overflow-y: auto`, touch momentum scrolling, contained overscroll) for stable mobile scrolling.

## v.1.0.00.443 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Restored scrolling on the property details route by overriding a conflicting `pd-scroll` overflow rule that was preventing vertical movement.

### Changes (detailed)

#### Fixed
- src/App.css
 - `.property-page .property-detail-page-content .pd-scroll`
 - From: Property route inherited `overflow: visible` from a shared `.property-detail-page-content .pd-scroll` override, so the inner details container did not behave as a scroll surface.
 - To: Added a route-specific override (`flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;`) so property details scroll correctly while preserving modal behavior.

## v.1.0.00.442 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed the property-details embedded map appearing above the mobile bottom navigation by restoring a higher navigation stacking order.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.app-bottom-nav`, `.minimal-bottom-nav`
 - From: Navigation used `z-index: 60`, which was lower than Leaflet/overlay layers, so map UI could overlap the fixed bottom nav.
 - To: Increased nav stacking context to `z-index: 1400` so bottom navigation consistently stays above map and map-overlay layers.

## v.1.0.00.441 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed the property details route layout so mobile bottom navigation stays visible and the property view no longer has overlapping/clipped sections from conflicting style layers.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - `MainLayout()` mobile nav visibility logic (`hideMobileBottomNav`)
 - From: `/property/:id` routes were treated as hide-nav routes, causing the bottom navigation to disappear on property view.
 - To: Property routes now keep the bottom navigation visible while preserving hidden-nav behavior for chat, add-property, and admin routes.
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent({ ..., isPropertyPageLayout })` and property-details chip rendering
 - From: Property-page rendering still built duplicated legacy sections (title/action/price blocks) and static chip markup, which competed with minimal-route presentation.
 - To: Added explicit property-page layout mode, suppressed duplicate legacy blocks for the property route, and switched to data-driven chip rendering with a minimal-route subset (beds/size/type) for cleaner hierarchy.
- src/pages/PropertyPage.js
 - `PropertyPage()` -> `PropertyDetailContent` invocation
 - From: Property page relied on implicit prop combinations to infer layout mode.
 - To: Passes `isPropertyPageLayout` explicitly so route-specific rendering stays stable and intentional.
- src/App.css
 - `.property-page .page-content.property-detail-page-content`, `.pd-scroll-pad`, and related property-route spacing selectors
 - From: Property content scroll/bottom spacing had limited buffering, which could feel cramped when bottom nav is visible.
 - To: Added mobile-friendly scroll containment and increased bottom spacing/pad values so content and CTA remain readable and not clipped.
- src/styles/minimal-marketplace.css
 - `.minimal-property-title-band*`
 - From: Title band used a negative pull-up overlay style (white text over image), which made header content look cramped/broken in current property flow.
 - To: Converted title band to a clean block below the hero with readable text colors and adjusted spacing/typography for stable mobile rendering.
- src/styles/prototype-palette.css
 - Mobile page padding group and minimal property detail border-radius overrides
 - From: Property page was not included in shared mobile bottom-nav spacing group, and later global property-detail rounding rules could override flat minimal section styling.
 - To: Added `.property-page` to mobile bottom-nav spacing list and enforced flat corners for minimal property detail sections/actions/chips to avoid visual conflicts.

## v.1.0.00.440 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Replaced the map property preview UI with the new polished sheet-style design (matching your provided mock) and wired its save/close/details actions into existing map, favourites, and property navigation flows.

### Changes (detailed)

#### Added
- src/components/map/MapPropertyPreview.css
 - `.map-property-preview*`
 - Added: New full visual system for the map preview card (handle, icon actions, pricing row, facts chips, CTA button, motion, and responsive desktop placement).

#### Changed
- src/components/map/MapPropertyPreview.js
 - `MapPropertyPreview({ property, onOpen, onClose })`
 - From: Compact legacy preview with old structure, basic close icon, and external `FavoritesButton` placement.
 - To: New structured card layout with inline SVG icons, close/save top actions, richer facts section, formatted PHP pricing, and details CTA while preserving existing open/close behavior.
- src/components/map/MapPropertyPreview.js
 - `MapPropertyPreview({ property, onOpen, onClose })` favorite handling
 - From: Save state was handled by a separate button component positioned outside the redesigned card structure.
 - To: Save state now uses `useFavorites()` directly so the heart action is embedded in the new top-right control and stays synchronized with existing favourites data.

#### Fixed
- src/styles/map-search-page.css
 - `.map-property-preview*` legacy selectors
 - From: Older preview styles in the page stylesheet could conflict with the new component-specific design.
 - To: Removed old preview styling block so the new dedicated `MapPropertyPreview.css` controls the component appearance consistently.

## v.1.0.00.439 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Added a dedicated close button on the floating map property preview so users can dismiss it without changing map position or opening listing details.

### Changes (detailed)

#### Added
- src/components/map/MapPropertyPreview.js
 - `MapPropertyPreview({ ..., onClose })`
 - Added: Close (`Ã—`) action button on the preview card with proper event stop propagation, and new `onClose` callback support.

#### Changed
- src/pages/SearchMapPage.js
 - `MapPropertyPreview` usage in `SearchMapPage()`
 - From: Preview card could only be dismissed indirectly (e.g., by changing state/selection flow).
 - To: Wires explicit close action to clear `selectedPropertyId`, immediately hiding preview while preserving current map viewport.
- src/styles/map-search-page.css
 - `.map-property-preview-close`, `.map-property-preview-body`
 - From: Preview layout had no dedicated close-control styling.
 - To: Added visual styling/positioning for close button and adjusted preview body padding to avoid control overlap.

## v.1.0.00.438 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Raised the floating map property preview card so it sits higher above the fixed bottom navigation, improving visibility and avoiding cramped placement near the nav bar.

### Changes (detailed)

#### Changed
- src/styles/map-search-page.css
 - `.map-property-preview`
 - From: Preview card anchored close to the bottom safe area, visually too low against the bottom navigation.
 - To: Increased bottom offset (`bottom: calc(6.2rem + env(safe-area-inset-bottom, 0px))`) so the preview card appears higher and clearer during map browsing.

## v.1.0.00.437 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed map interaction behavior so the preview appears only after explicit marker selection and dragging/touching map overlays no longer scrolls the whole document.

### Changes (detailed)

#### Changed
- src/pages/SearchMapPage.js
 - `selectedProperty` resolution, stale selection guard, map-page scroll lock effect
 - From: Preview card auto-opened from first result and map overlay interactions could propagate into document scrolling.
 - To: Preview now renders only for explicit marker selection; invalid selections are cleared on dataset changes; map route now locks body/html overflow and overscroll to keep top UI anchored during touch/drag.
- src/styles/map-search-page.css
 - `.map-search-page`, `.map-search-floating`, `.map-property-preview`, `.map-search-empty`
 - From: Map shell allowed page-level scrolling and overlays did not explicitly constrain touch behavior.
 - To: Map shell now uses fixed viewport height with hidden overflow/overscroll containment, and floating overlays use touch-manipulation behavior to prevent document drag side effects.

## v.1.0.00.436 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed the recurring Leaflet runtime crash (`Cannot read properties of undefined (reading '_leaflet_pos')`) during map UI/state transitions by hardening map lifecycle cleanup and disabling transition animations that race during re-initialization.

### Changes (detailed)

#### Fixed
- src/components/MapView.js
 - `initializeMap()`, map initialization options, effect cleanup in the map init `useEffect(...)`
 - From: Map re-initialization could occur while Leaflet/cluster zoom transitions were still active, leaving internal pane references invalid and causing `_leaflet_pos` errors during animation callbacks.
 - To: Added cancellation guard, full stop/off/remove teardown, cluster cleanup, and disabled map/cluster animations (`zoomAnimation`, `fadeAnimation`, `markerZoomAnimation`, cluster animate flags) to prevent transition races on re-init.

## v.1.0.00.435 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Updated map filter pills to equal-width button-style controls with less circular corners, matching the requested visual behavior.

### Changes (detailed)

#### Changed
- src/styles/map-search-page.css
 - `.map-filter-chips .minimal-chip`, `.map-filter-chips .minimal-chip.is-active`, `.map-filter-chips.minimal-filter-chips`
 - From: Chips were auto-width with fully rounded pill corners, making sizes inconsistent and too circular.
 - To: Converted chips into a fixed 5-column equal-width button row, reduced corner radius, centered labels, and updated active style to a solid blue button state.

## v.1.0.00.434 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Replaced the map view™s single Rent/Buy toggle-style chip with two explicit buttons (`Rent` and `Buy`) to improve clarity and make listing-type switching more intuitive.

### Changes (detailed)

#### Changed
- src/pages/SearchMapPage.js
 - `chips` config and `MapFilterChips` selection handling in `SearchMapPage()`
 - From: A single chip represented listing mode and toggled to the opposite type on click, which felt ambiguous.
 - To: Added separate `Rent` and `Buy` chips with direct navigation to each listing type (`/search/map?listingType=rent` or `sale`) and active-state highlight based on current mode.

## v.1.0.00.433 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed overlapping map controls by repositioning Leaflet™s default top-left controls below the custom prototype search/chip header area.

### Changes (detailed)

#### Fixed
- src/styles/map-search-page.css
 - `.map-search-page .leaflet-top.leaflet-left`
 - From: Leaflet™s built-in top-left controls overlapped the custom map top UI (search bar/chips), causing visible button collisions.
 - To: Offset the control stack downward on the map page so default map controls no longer overlap the prototype header controls.

## v.1.0.00.432 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Applied final map search-bar micro-tuning to close the remaining visual gap: removed inherited outer border influence and softened typography/button chrome to better match the reference.

### Changes (detailed)

#### Changed
- src/styles/map-search-page.css
 - `.map-search-page .map-search-header`, `.map-search`, `.map-search-searchbar input`, `.map-search-back-btn`, `.map-search-filter-btn`
 - From: Top bar still looked slightly heavier than the target because of inherited border precedence and stronger control weight.
 - To: Forced header border reset at map-page scope and tuned spacing, shadow, text size/colour, and filter-button styling for closer parity with the provided screenshot.

## v.1.0.00.431 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Performed a literal prototype-style copy pass for the map top search bar structure and styling so it matches the reference control pattern more directly.

### Changes (detailed)

#### Changed
- src/components/map/MapSearchHeader.js
 - `MapSearchHeader(...)`
 - From: Header used icon-font back/search composition and generalized button blocks that were only approximate to the reference.
 - To: Switched to a more literal prototype structure (`â†` back text glyph, `âŒ•` search glyph, readonly input title field, compact filter button) to mirror the provided map-bar markup pattern.
- src/styles/map-search-page.css
 - `.map-search`, `.map-search-searchbar`, `.map-search-searchbar input`, `.map-search-search-glyph`, `.map-search .icon-button`, `.map-search-back-btn`, `.map-search-filter-btn`
 - From: Styling still carried shared app button traits that made the top bar look heavier than the prototype.
 - To: Re-aligned spacing, shape, elevation, and button geometry to the prototype™s map control shell for closer visual parity.

## v.1.0.00.430 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Refined the map search bar styling to match the prototype™s softer top-control look (lighter shell, cleaner back icon, subtler filter button, and calmer elevation).

### Changes (detailed)

#### Changed
- src/styles/map-search-page.css
 - `.map-search`, `.map-search .search-bar`, `.map-search-bar-label`, `.map-search .icon-button.clear`, `.map-search .icon-button:not(.clear)`
 - From: Map search header had heavier elevation/border feel and button chrome that still looked stronger than the target reference.
 - To: Tuned container/background/shadow and icon-button treatments so the map top search control more closely matches the reference screenshot.

## v.1.0.00.429 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Corrected map page top UI composition to match the prototype pattern by removing the extra subtitle/action row and using a single compact search-header bar with prototype chip controls beneath.

### Changes (detailed)

#### Changed
- src/components/map/MapSearchHeader.js
 - `MapSearchHeader(...)`
 - From: Header rendered a second row with subtitle and `List/Saved` pills, which made the top UI denser and different from the provided target screenshot.
 - To: Simplified to the prototype-like single row (`Back`, `Search this area`, `Filter`) without the additional subtitle/action strip.
- src/pages/SearchMapPage.js
 - `SearchMapPage()`
 - From: Chips and header semantics used map-specific labels (`All homes`, `Sale map Â· Philippines`) and auxiliary list/saved controls.
 - To: Updated to prototype-style chip labels (`Rent/Buy`, `Price`, `Beds`, `More`) with simplified top bar title and direct list-navigation for refinement actions.

## v.1.0.00.428 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Aligned the `/sale` and `/rent` results screen behavior more closely with the prototype by removing duplicate mobile top header, forcing list-first results rendering, and changing quick chips to prototype labels.

### Changes (detailed)

#### Changed
- src/App.js
 - Results route rendering in `AppContent()`
 - From: Mobile results showed an extra top `PageHeader`, could render map view directly on `/sale` or `/rent` based on prior state, and used legacy quick-filter chip semantics (`1+ bed`, `House`, `Condo`, etc.) that differed from the prototype.
 - To: Mobile searched results now hide the extra top header, default to list-style rendering on `/sale` and `/rent`, and use prototype chip labels (`Rent/Buy`, `Price`, `Property type`, `Beds`, `More`) opening the filters dialog for refinement.

## v.1.0.00.427 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Redesigned the `/search` route itself to follow the same prototype UI system as Home, so direct visits no longer show the old chooser-style layout.

### Changes (detailed)

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()`
 - From: `/search` still used legacy landing/category shells (`search-landing-*` / `home-search-card` flow) that looked visually disconnected from the prototype home and fixed bottom tabs.
 - To: Reworked `/search` into a prototype-style screen with top bar, intro, Rent/Buy segmented panel, location prompt row, primary coral CTA, and in-page search-option cards for category mode while preserving existing route behavior (`city`, `keyword`, `school`, `map`) and search context wiring.

## v.1.0.00.426 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Updated the fixed bottom Search tab behavior to open the prototype-style results screen (`/sale` or `/rent`) instead of the legacy `/search` chooser flow.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - `handleSearch()`
 - From: Search tab navigated to `/search`, which still uses the old multi-step search chooser layout and did not match prototype bottom-nav behavior.
 - To: Search tab now navigates directly to listing results (`/rent` when the last search mode is rent, otherwise `/sale`) so the tab opens the prototype-like results experience.

## v.1.0.00.425 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Fixed the remaining stray search icon artifact on Home by neutralizing a legacy absolute-position search-icon rule collision with the new prototype search panel.

### Changes (detailed)

#### Fixed
- src/styles/prototype-palette.css
 - `.search-input .search-icon`
 - From: Prototype search icon inherited legacy global `.search-icon { position: absolute; left: ... }` behavior, causing the icon bubble to detach and appear as a stray floating button on the left side.
 - To: Explicitly reset icon positioning inside prototype search panels (`position: static`, `left/top: auto`, `transform: none`, `z-index/pointer-events reset`) so the icon stays correctly inside the search row.

## v.1.0.00.424 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Completed a strict prototype parity redo focused on mobile fit, fixed 5-tab navigation, and structural alignment for Home/Saved/Account while removing lingering non-prototype floating artifacts.

### Changes (detailed)

#### Changed
- src/styles/prototype-palette.css
 - Mobile shell and parity blocks (`html, body, #root`, `.app-main`, `.app-main > *`, `.saved-page .page-content`, `.account-card`, `.account-menu`, `.floating-messages-pill`, `.chat-in-app-toast`)
 - From: Mixed legacy shell behavior caused clipping/viewport fit issues and uneven page rhythm across prototype routes.
 - To: Enforced prototype-oriented mobile viewport behavior with consistent bottom-nav clearance and added Saved/Account prototype sections, while suppressing floating legacy overlays that conflicted with the target UI.
- src/components/MainLayout.js
 - Mobile bottom nav state and rendering logic
 - From: Nav tabs were auth/feature-driven (`Home`, `Saved`, `Messages`, `Search`, `Log in/Menu`) and did not match the prototype tab model.
 - To: Replaced with a fixed prototype tab set (`Home`, `Search`, `Map`, `Saved`, `Account`) always rendered, with destination gating handled by click behavior instead of tab replacement/removal.
- src/pages/HomePage.js
 - `HomePage()` search panel structure
 - From: Home used summary/chip composition that still diverged from the prototype™s explicit search panel block.
 - To: Aligned with prototype panel structure using Rent/Buy segmented control + location prompt + coral CTA while keeping real app routing/data.
- src/pages/SavedPage.js
 - `SavedPage()` layout composition
 - From: Saved page used legacy header/list card arrangement with image-heavy card internals.
 - To: Reworked to prototype-style topbar + saved header and simplified listing stack using shared minimal property cards.
- src/pages/MenuPage.js
 - `MenuPage()` account shell
 - From: Menu used drawer-style utility list blocks not matching prototype account presentation.
 - To: Rebuilt as prototype-style account page with top brand/settings row, account hero card, and clean account menu rows.

## v.1.0.00.423 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Corrected the home screen parity gap by matching the prototype™s top-bar + search-panel structure more literally (Rent/Buy switch, location prompt row, coral CTA) and removing the non-reference quick-chip row that made the page look off compared with the target.

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
 - `HomePage()`
 - From: Home used a summary-card component plus quick filter chips, which deviated from the prototype™s explicit search panel layout and made the composition visibly different.
 - To: Replaced the summary/chips block with a prototype-style search panel (Rent/Buy segmented control, location prompt row, and Search properties CTA), updated the top-right icon treatment, and kept area/recommended sections powered by real listing data.
- src/styles/prototype-palette.css
 - `.search-panel`, `.mode-switch`, `.search-input`, `.search-action` and related home-shell selectors
 - From: Styles primarily targeted summary-card/chip composition.
 - To: Added direct prototype-equivalent search panel styling and interaction-state visuals so home layout/spacing matches the supplied reference more closely.

## v.1.0.00.422 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Updated the React web app from palette-only matching to a closer structural match with the provided prototype (`balhinbalay-project-palette-prototype-v3`), including home composition, results header/search/sort treatment, map overlay controls, and card styling rhythm.

### Changes (detailed)

#### Changed
- src/pages/HomePage.js
 - `HomePage()`
 - From: Home used the prior minimal shell with heading + summary + chips, but without the prototype-like top bar and area exploration section.
 - To: Added prototype-style top bar actions, updated hero copy/intro composition, and introduced an area-grid section using real listing city counts while preserving existing navigation/data behavior.
- src/components/minimal/MinimalSearchSummary.js
 - `MinimalSearchSummary(...)`
 - From: Rendered as a plain summary card + small text action.
 - To: Reworked into a prototype-style search input row (icon/label/arrow) plus coral primary action button to mirror the reference home search panel.
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard(...)`
 - From: Card emphasized large image-first layout from the earlier minimal direction.
 - To: Converted to compact prototype-style information card with type pill, title/location/facts, price-note row, and arrow action while keeping live property data and favorites behavior.
- src/App.js
 - Results summary block in `AppContent()`
 - From: Results header used minimal summary component and separate strip sort module placement.
 - To: Replaced with prototype-like compact top line, inline search bar trigger, horizontal chips, and native select-based sort control within the results summary row.
- src/components/map/MapSearchHeader.js
 - `MapSearchHeader(...)`
 - From: Map header used title + separate List/Saved pill group only.
 - To: Added prototype-style floating map search row (back, search label, filter button) and retained List/Saved actions below for existing route flow.
- src/components/map/MapPropertyPreview.js
 - `MapPropertyPreview(...)`
 - From: Preview used image-led card composition.
 - To: Switched to prototype-style text-forward floating preview card with accent line, type pill, location/facts line, and arrow-price row.
- src/pages/SearchMapPage.js
 - `SearchMapPage()`
 - From: Header wiring only supported back/list/saved actions.
 - To: Added filter action wiring to align with the updated map search header control model.
- src/styles/prototype-palette.css
 - Global prototype override blocks (`.minimal-home-wrap`, `.prototype-home-topbar`, `.minimal-search-summary*`, `.area-grid`, `.minimal-property-*`, `.prototype-results-*`, `.app-bottom-nav*`)
 - From: Palette overrides were mostly token/color-level adjustments.
 - To: Added deeper structural style overrides for spacing, card anatomy, controls, and bottom-nav visual behavior to align the rendered UI more closely with the prototype.
- src/styles/map-search-page.css
 - Map overlay and preview styling blocks (`.map-search*`, `.map-pill-btn`, `.map-price-marker`, `.map-property-preview*`)
 - From: Map page followed earlier minimalized control geometry and preview layout.
 - To: Updated to prototype-like floating search/control shell and compact preview styling while preserving real Leaflet behavior and selection flow.

## v.1.0.00.421 — Development
Date: 2026-07-21
Type: Dev Change

### Summary
- Shifted the project back to a web-first React path by removing Android/Capacitor-specific runtime wiring and applying a new prototype-driven palette layer from `balhinbalay-project-palette-prototype-v3`.

### Changes (detailed)

#### Added
- src/styles/prototype-palette.css
 - `:root`, `body`, `.minimal-page`, `.map-search-page`, `.minimal-chip`, `.map-price-marker`, `.btn-primary`
 - Added: A prototype-aligned visual token and override layer (brand blue/cyan/coral accents, light-surface system, chip/button/map marker styling) for core web routes without changing data/search behavior.

#### Changed
- src/App.js
 - Top-level style imports
 - From: Web app loaded legacy/minimal style bundles only.
 - To: Added `prototype-palette.css` as the final style layer so the React UI follows the new prototype palette and component tone.
- src/context/AuthContext.js
 - `saveAuth(user, token)`, `AuthProvider(...)` initialization effects
 - From: Auth persistence included Capacitor/Preferences native branches and first-launch native reset logic.
 - To: Auth persistence is now web-only (`localStorage`) with native branches removed for a clean React web flow.
- src/context/PushContext.js
 - `loadPreference()`, `setPushEnabled(enabled)`, `saveToken(token)`, `getStoredToken()`, `clearStoredToken()`
 - From: Push preference/token storage depended on Capacitor Preferences dynamic imports.
 - To: Push preference/token storage now uses web storage only, removing native-plugin dependencies while preserving settings state behavior.
- src/components/PushTokenHandler.js
 - `PushTokenHandler()`
 - From: Mounted native push registration/revoke lifecycle with Capacitor PushNotifications listeners.
 - To: Converted to an intentional web no-op component so app boot no longer carries Android push plugin behavior.
- src/components/BackButtonHandler.js
 - `BackButtonHandler()`
 - From: Handled Android hardware back behavior via Capacitor `App` plugin and exit-app logic.
 - To: Converted to web no-op, removing Android-only back handling from the React runtime.
- src/pages/SettingsPage.js
 - `SettingsPage()` native detection branch
 - From: Native platform detection used Capacitor runtime checks.
 - To: Settings now uses web path consistently (`isNative = false`) for web-first behavior and messaging.
- package.json
 - Dependency and script blocks
 - From: Included Capacitor Android/iOS/core/app/preferences/push packages and cap/android utility scripts.
 - To: Removed Capacitor packages and Android-related scripts so project scripts/deps reflect a React web-only workflow.

#### Removed
- capacitor.config.ts
 - Configuration file
 - Removed: Capacitor runtime config no longer needed for web-first React target.
- CAPACITOR.md
 - Documentation file
 - Removed: Native wrapper setup guide removed from active project workflow.
- .env.android.device, .env.android.emulator, .env.android.device.example
 - Android environment presets
 - Removed: Android-specific environment files removed for the current web-only focus.

## v.1.0.00.420 — Development
Date: 2026-07-12
Type: Dev Change

### Summary
- Applied a stricter native UI copy pass so the Kotlin app™s Search/Results/Detail/Map presentation follows the prior approved minimal styling language more closely (chip surfaces, divider rhythm, neutral cards, and currency formatting).

### Changes (detailed)

#### Changed
- android/app/src/main/java/com/balhinbalay/app/AppUi.kt
 - `BalhinBalayApp(...)`, `HomeScreen(...)`, `SearchScreen(...)`, `ResultsScreen(...)`, `ListingsList(...)`, `ListingCard(...)`, `ListingDetailScreen(...)`, `MapScreen(...)`, `formatPhp(...)`
 - From: Native screens were only partially aligned, with remaining visual drift in chips/cards/dividers and inconsistent PHP formatting.
 - To: Unified chip/card treatment and section rhythm across core screens, added divider-based listing flow, normalized PHP formatting (`â‚±...` and rent `/month`), and aligned map preview shell to the same minimal style.

## v.1.0.00.419 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Kept the native Android rewrite but restyled core Compose screens to match the previously approved minimal UI language (off-white shell, compact chips, strong heading hierarchy, and bottom-nav framing) instead of introducing a different visual direction.

### Changes (detailed)

#### Changed
- android/app/src/main/java/com/balhinbalay/app/AppUi.kt
 - `BalhinBalayApp(...)`, `HomeScreen(...)`, back-icon usage in screen top bars
 - From: Native screens used a default Compose scaffold/look that did not closely reflect the prior in-app UI style you wanted to keep.
 - To: Updated navigation shell and Home visual hierarchy to match the previous minimal style direction and switched back icons to auto-mirrored variants for cleaner RTL-safe behavior.

## v.1.0.00.418 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Created a dedicated native Android rewrite branch and replaced the Capacitor WebView Android app implementation in-place with a Kotlin + Jetpack Compose core app flow (Home, Search, Results, Property Detail, Map), explicitly excluding admin surfaces.

### Changes (detailed)

#### Added
- android/app/src/main/java/com/balhinbalay/app/MainActivity.kt
 - `MainActivity.onCreate(savedInstanceState)`
 - Added: Native Android activity entry point with Compose `setContent { BalhinBalayApp() }` replacing Bridge/WebView startup.
- android/app/src/main/java/com/balhinbalay/app/AppModels.kt
 - `Coordinates`, `Listing`, `SearchFilters`, `UiState`
 - Added: Native data/state model layer for core listing flow and search criteria state.
- android/app/src/main/java/com/balhinbalay/app/AppApi.kt
 - `ListingsApi.getListings(...)`, `ApiFactory.listingsApi`, `ListingDto.toDomain()`
 - Added: Retrofit/Moshi network client targeting existing backend `GET /api/listings` contract and DTO-to-domain mapping.
- android/app/src/main/java/com/balhinbalay/app/AppViewModel.kt
 - `ListingsRepository.fetchListings(filters)`, `AppViewModel.search()`, `AppViewModel.refreshHome()`, filter update methods
 - Added: ViewModel + repository orchestration for loading home/search/results data and selected listing state.
- android/app/src/main/java/com/balhinbalay/app/AppUi.kt
 - `BalhinBalayApp()`, `HomeScreen(...)`, `SearchScreen(...)`, `ResultsScreen(...)`, `ListingDetailScreen(...)`, `MapScreen(...)`
 - Added: Native Compose navigation graph and core screens with marker selection + bottom preview map behavior.

#### Changed
- android/app/build.gradle
 - Android app plugin/dependency/build-feature configuration
 - From: Capacitor-focused Android module (`capacitor-android`, cordova plugin module, WebView asset packaging assumptions).
 - To: Native Compose Android module with Kotlin plugin, Compose UI stack, Retrofit/OkHttp/Moshi, Coil, and Google Maps dependencies plus API base URL build config.
- android/build.gradle
 - Buildscript dependencies
 - From: Included Google services plugin for Capacitor push/webview configuration path.
 - To: Uses Kotlin Gradle plugin for native Kotlin/Compose compilation path.
- android/settings.gradle
 - Included modules
 - From: Included Capacitor and cordova Android plugin modules.
 - To: Reduced to native `:app` module only for in-place native app replacement.
- android/app/src/main/AndroidManifest.xml
 - Application/activity configuration
 - From: Capacitor `BridgeActivity`-oriented manifest with WebView-centric flags/providers and push metadata.
 - To: Native activity/theme setup with core Internet permission and launcher intent only.
- android/app/src/main/res/values/styles.xml
 - `Theme.BalhinBalay`
 - From: AppCompat + splash launch theme set for WebView flow.
 - To: Native no-action-bar base theme for Compose UI host activity.
- android/gradle.properties
 - `org.gradle.java.home`
 - From: No explicit JDK home, causing AGP runtime JDK mismatch in this environment.
 - To: Pinned to Android Studio JBR path to satisfy AGP Java 17 requirement for native builds.

#### Removed
- android/app/src/main/java/com/balhinbalay/app/MainActivity.java
 - `MainActivity extends BridgeActivity`
 - Removed: Capacitor BridgeActivity implementation and WebView-specific mixed-content/notification channel wiring for the deprecated web-wrapper app path.

## v.1.0.00.417 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Applied a global minimal UI parity pass so search, account, saved/messages/chat, and map surfaces now follow the same off-white, flat, divider-first style language as the provided reference screenshot.

### Changes (detailed)

#### Changed
- src/styles/minimal-marketplace.css
 - Global minimal token/shell blocks and page-surface overrides (`:root` minimal tokens, `.page-with-header` families, `.page-header`, `.page-section`, search/category/filter, saved/messages/chat, profile/settings/menu/add-property selectors).
 - From: Several user pages still used mixed legacy elevated card patterns, stronger visual chrome, and inconsistent spacing/typography compared with the minimal home direction.
 - To: Unified minimal visual system across non-map pages with restrained surfaces, thin dividers, muted text hierarchy, flatter controls, and consistent mobile spacing.

#### Changed
- src/styles/map-search-page.css
 - Map header/control/marker/preview/popup styling blocks.
 - From: Map surface retained a greener, heavier visual treatment and divergent control tone from the new minimal direction.
 - To: Aligned map UI to minimal palette/controls (while keeping map behaviour), with stable overlay stacking and flatter popup/preview styling.

#### Changed
- src/pages/SearchPage.js, src/pages/SearchCityPage.js, src/pages/SearchKeywordPage.js, src/pages/SearchSchoolPage.js
 - Root page wrapper classNames
 - From: Search entry/filter screens did not explicitly opt into the shared minimal page shell.
 - To: Added `minimal-page` wrapper hook so search routes inherit the same baseline surface and spacing system.

#### Changed
- src/pages/SavedPage.js, src/pages/MessagesPage.js, src/pages/ChatPage.js, src/pages/ProfilePage.js, src/pages/SettingsPage.js, src/pages/MenuPage.js, src/pages/AddPropertyPage.js, src/pages/PropertyPage.js
 - Root page wrapper classNames
 - From: Account and communication pages used existing shells without explicit minimal-mode hook, leading to visible style drift from home/results.
 - To: Added `minimal-page` hook on these pages so global minimal shell styles apply consistently across all user-facing routes.

#### Changed
- src/components/MapView.js
 - Popup inline style values in marker popup template.
 - From: Popup action/price accents used non-minimal highlight tones.
 - To: Updated popup action and price styling to match the minimal accent system.

## v.1.0.00.416 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Fixed map-page UI flicker/disappearance during interaction by correcting floating-control stack order above Leaflet panes.

### Changes (detailed)

#### Changed
- src/styles/map-search-page.css
 - `.map-search-floating`, `.map-property-preview`, `.map-search-empty`
 - From: Floating map controls/preview used low `z-index` values that could drop behind active Leaflet layers during map interaction, appearing to disappear intermittently.
 - To: Raised map overlay stack levels so controls and preview remain consistently visible while panning/zooming/selecting markers.

## v.1.0.00.415 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Fixed map-page interaction freeze by preventing repeated map-mode state submission loops and by stopping full Leaflet re-initialization on every marker selection.

### Changes (detailed)

#### Changed
- src/pages/SearchMapPage.js
 - `SearchMapPage()`
 - From: Entering the map page could repeatedly re-submit map state and re-render aggressively, causing the screen to feel stuck/non-interactive.
 - To: Added a guard to skip re-submitting when already in map mode for the current listing type, and memoized selected-city mapping for a stable `MapView` input.

#### Changed
- src/components/MapView.js
 - `MapView({ properties, selectedCity, onPropertyClick, onSelectProperty, selectedPropertyId })`
 - From: The map initialization effect depended on changing callbacks/selection state, recreating the Leaflet map too often and interrupting interaction.
 - To: Stabilized callback/selection handling with refs, limited map initialization dependencies, and kept marker clicks for selection (preview sync) without forcing immediate route navigation.

## v.1.0.00.414 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Implemented the minimal mobile design direction across home, list results, and property details, while converting `/search/map` into a dedicated live Leaflet map-first page with selected-marker previews and list/map state continuity.

### Changes (detailed)

#### Added
- src/components/minimal/MinimalFilterChips.js
 - `MinimalFilterChips({ chips, onSelect, activeId, className, ariaLabel })`
 - Added: Reusable horizontal chip control used by minimal home/results and map active-filter strips.
- src/components/minimal/MinimalPropertyFacts.js
 - `MinimalPropertyFacts({ beds, baths, size, type, className })`
 - Added: Shared compact facts renderer for listing rows and map previews.
- src/components/minimal/MinimalSearchSummary.js
 - `MinimalSearchSummary({ heading, locationLabel, criteriaLabel, onOpenSearch, actionLabel, className })`
 - Added: Shared minimal search-summary module for current criteria presentation.
- src/components/minimal/MinimalPropertyCard.js
 - `MinimalPropertyCard({ property, onOpen, className, showDivider })`
 - Added: Minimal large-photo listing row with immediate price/location/facts visibility and favourite action.
- src/components/map/MapSearchHeader.js
 - `MapSearchHeader({ title, subtitle, onBack, onList, onSaved })`
 - Added: Floating map-first top control bar with dedicated List and Saved actions.
- src/components/map/MapFilterChips.js
 - `MapFilterChips({ chips, activeId, onSelect })`
 - Added: Map-specific filter-chip wrapper using shared minimal chip primitives.
- src/components/map/MapPropertyPreview.js
 - `MapPropertyPreview({ property, onOpen })`
 - Added: Floating selected-property preview card for marker-driven map interactions.
- src/components/map/MapPriceMarker.js
 - `getMapPriceLabel(property)`, `buildMapPriceMarkerHtml(property, isSelected)`
 - Added: Price-marker label and HTML helpers for custom Leaflet marker visuals.
- src/styles/minimal-marketplace.css
 - Minimal page/home/results/detail and simplified bottom-nav style system.
 - Added: Mobile-first minimal visual language (off-white background, divider-based results, restrained accents, flatter surfaces).
- src/styles/map-search-page.css
 - Map-first floating controls/preview/price-marker style system.
 - Added: Dedicated green map visual identity isolated to the map page.

#### Changed
- src/pages/HomePage.js
 - `HomePage()`
 - From: Hero CTA-only home with limited search context and no live listing curation.
 - To: Minimal home with wordmark, `Search less. Find better.`, current-search summary, quick chips, and curated live listing rows.
- src/components/PropertyListCard.js
 - `PropertyListCard({ property, onViewDetails, index })`
 - From: Legacy card/stack layout with nested decorative containers and mixed badge/tag density.
 - To: Delegates to `MinimalPropertyCard` for large-photo, divider-separated minimal rows while preserving click-through behaviour.
- src/App.js
 - `AppContent()` and route config in `App()`
 - From: Results summary/actions were portal-style controls without a dedicated map-page CTA, and only `/search/map` route existed.
 - To: Minimal sticky results header with explicit Map entry, chip-based quick filters, and added `/map` alias while preserving existing `/search/map`.
- src/pages/SearchPage.js
 - `handleCardClick(path)`
 - From: Map option redirected back into `/sale` or `/rent` map mode.
 - To: Map option now enters dedicated map page via `/search/map?listingType=...`.
- src/pages/SearchMapPage.js
 - `SearchMapPage()`
 - From: Redirect-only route that immediately forwarded to list pages.
 - To: Full map-first page reusing real listing/search state, floating controls/chips, selected marker preview, and list-return without losing criteria.
- src/components/MapView.js
 - `MapView({ properties, selectedCity, onPropertyClick, onSelectProperty, selectedPropertyId })`
 - From: Disabled overlay, default-style markers/popups, and no selected-marker visual state.
 - To: Live map view with custom price markers, selected-marker highlighting, marker-to-preview sync, and viewport fitting for mapped results.
- src/pages/PropertyPage.js
 - `PropertyPage()`
 - From: Property page shell did not opt into the new minimal-detail treatment.
 - To: Uses `minimal-property-detail` route class and back-over-hero flow to match minimal detail direction.
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(...)`
 - From: Primary controls and detail hierarchy were toolbar/card-led before the hero-focused minimal presentation.
 - To: Adds hero overlay controls and title band, and updates sticky bottom action to include favourite plus `Request a viewing`.
- src/components/MainLayout.js
 - `MainLayout()`
 - From: Bottom nav used existing styling only.
 - To: Adds `minimal-bottom-nav` class hook for simplified mobile nav visual treatment aligned to minimal pages.

## v.1.0.00.413 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Added a final high-specificity mobile results UI override so the rent/sale summary/actions/sort row visibly shift to a cleaner app-like layout even when previous cascading styles conflict.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767px)` forced overrides for `.results-area .results-portal-kicker`, `.results-criteria-bar*`, `.results-portal-actions .results-portal-btn*`, `.sort-bar.sort-bar-portal-strip`, `.results-count-portal*`, `.sort-select-shell--portal*`, and results empty-state text.
 - From: Prior mobile styling adjustments could be overridden by earlier/later cascade blocks, resulting in little-to-no visible change on the rendered screen.
 - To: Added high-specificity, `!important`-based, screen-targeted rules to guarantee balanced app-like typography, button sizing, and sort-row alignment on mobile results.

## v.1.0.00.412 — Development
Date: 2026-07-11
Type: Dev Change

### Summary
- Reworked the rent/sale results header and controls into a cleaner, app-like layout with balanced typography and spacing, while keeping the existing color palette unchanged.

### Changes (detailed)

#### Changed
- src/App.css
 - `.page-header-title`, `.sort-bar.sort-bar-portal-strip`, `.sort-bar.sort-bar-portal-strip .sort-bar-right`, `.sort-select-shell.sort-select-shell--portal`, `.sort-select-shell--portal .sort-select`, `.sort-select-shell--portal .sort-select-arrows`, mobile overrides for `.results-portal-kicker`, `.results-criteria-bar`, `.results-criteria-bar-location`, `.results-criteria-bar-price`, `.results-portal-actions`, `.results-portal-btn`, `.results-count-portal*`, and results empty-state text blocks.
 - From: Results header/actions/sort used oversized and inconsistent mobile typography with cramped alignment and truncated controls, causing a web-like, unbalanced presentation.
 - To: Shifted to a balanced app-style scale and structure: cleaner top title sizing, readable summary card text, single-line action pills, aligned sort card/dropdown, and proportional empty-state typography.

#### Changed
- src/App.css
 - `.results-count-portal-prefix`, `.results-count-portal-num`, `.results-count-portal-suffix`
 - From: Count parts could wrap awkwardly under narrow widths.
 - To: Added no-wrap behavior so count text remains visually stable in the toolbar.

## v.1.0.00.411 — Development
Date: 2026-07-10
Type: Dev Change

### Summary
- Applied an app-like UI polish pass (without changing colors) across shared shell/layout primitives, reusable interaction patterns, core flows, and remaining user pages for a more native mobile feel.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root`, `.page-header`, `.page-content`, `.app-has-bottom-nav .page-content`, `.menu-page .menu-page-body`, `.app-has-bottom-nav .menu-page .menu-page-body`
 - From: Layout spacing and shell behavior used mixed fixed values with inconsistent page rhythm and weaker app-like hierarchy.
 - To: Introduced spacing/motion tokens, tightened shared shell primitives, and unified safe-area/bottom-nav clearance formulas for consistent app-like structure.

#### Changed
- src/App.css
 - App-like override blocks (`.app-main`, `.page-section`, `.settings-card`, `.search-landing-hero-card`, `.messages-page .messages-panel-row`, `.chat-page .chat-panel-*`, `.app-bottom-nav*`, `.home-hero-quick-*`, `.listings-error-banner*`, `.confirm-modal*`, profile/settings/add-property refinements)
 - From: Shared interactive elements, cards, rows, and feedback surfaces were visually inconsistent or partially inline-styled across screens.
 - To: Added one consistent interaction language (radius/elevation/press states/readability) and reusable utility styling for cards, rows, chat/messages, empty/error blocks, and bottom-nav behavior.

#### Changed
- src/App.js
 - `AppContent(...)` inline error banner blocks
 - From: Results and my-properties error banners used duplicated inline styles, making them harder to keep consistent with the app shell.
 - To: Replaced inline styles with reusable class-based banner/button styling for consistent app-like error surfaces.

#### Changed
- src/pages/HomePage.js
 - `HomePage()`
 - From: Home hero provided a single primary CTA only.
 - To: Added app-like quick route actions (Rent/Buy) below the hero CTA for faster first-tap navigation and a more native launcher feel.

#### Changed
- src/pages/ProfilePage.js, src/pages/SettingsPage.js, src/pages/AddPropertyPage.js
 - `ProfilePage()`, `SettingsPage()`, `AddPropertyPage()`
 - From: These pages did not consistently use the shared `page-with-header` shell, leading to uneven layout behavior across user pages.
 - To: Migrated all branches to the same `page-with-header` wrapper pattern so header/scroll/spacing behavior matches the rest of the app.

#### Changed
- src/pages/SettingsPage.js
 - Settings logged-out gate card block
 - From: Gate card spacing used inline padding styles.
 - To: Replaced inline style usage with reusable class styling for shell consistency.

#### Changed
- src/components/ConfirmModal.js
 - `ConfirmModal(...)`
 - From: Confirm modal shared generic auth modal classes only, with no dedicated hook for consistent confirm-surface styling.
 - To: Added confirm-specific classes to enable dedicated app-like modal surface polish while preserving existing behavior.

## v.1.0.00.410 — Development
Date: 2026-07-10
Type: Dev Change

### Summary
- Increased mobile typography on the rent/sale results screen so the summary, action buttons, sort control, and empty-state copy are clearly readable.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-kicker`, `.results-criteria-bar`, `.results-criteria-bar-location`, `.results-criteria-bar-price`, `.results-portal-actions`, `.results-portal-btn`, `.results-count-portal`, `.results-count-portal-num`, `.sort-select-shell--portal .sort-select`, `.sort-select-arrows`, `.results-area > .text-center.py-4 h4/p`, `.results-area > .text-center.py-5 h4/p`
 - From: Mobile results header and controls used very compact font sizes/heights, making key text hard to read (`Properties for Rent`, criteria text, action pills, sort pill, and empty-state messaging).
 - To: Added a mobile-specific typography scale with larger text and taller controls for results summary, action/sort controls, and empty-state content while keeping desktop styles unchanged.

## v.1.0.00.409 — Development
Date: 2026-07-10
Type: Dev Change

### Summary
- Completed a release-candidate polish pass across chat correctness, Android navigation behavior, validation/error consistency, and modal/shell interaction patterns.

### Changes (detailed)

#### Added
- android/app/src/main/res/values/colors.xml
 - Android color resources (`colorPrimary`, `colorPrimaryDark`, `colorAccent`)
 - Added: Native Android theme color definitions aligned to app primary blue (`#246BFF`) for consistent system/chrome visuals.

#### Changed
- src/context/ChatContext.js
 - `fetchThreads()`, `fetchMessagesForThread(threadId)`, `sendMessageByThreadId(threadId, text, senderUser)`, `sendMessage(listingId, text, senderUser)`
 - From: Thread/message fetch failures cleared local chat state, and send flow picked threads by listing heuristics only, which could misroute owner replies.
 - To: Fetch failures preserve cache, direct thread-scoped send API returns structured `{ ok, error }`, and listing-based send delegates to explicit thread send to keep routing deterministic and recoverable.

#### Changed
- src/pages/ChatPage.js
 - `handleSubmit(e)` and composer state (`isSending`, `sendError`)
 - From: Composer cleared immediately without awaiting send result, so failed sends could lose user input silently.
 - To: Submit now awaits send completion, disables input/button while sending, only clears on success, and shows inline error feedback on failure.

#### Changed
- src/components/ChatModal.js
 - `handleSubmit(e)` and composer state (`isSending`, `sendError`)
 - From: Modal chat used fire-and-forget send with immediate input clear and no surfaced send failure.
 - To: Modal chat now awaits send result (thread-scoped when available), preserves input on failure, and shows inline send errors.

#### Changed
- src/components/MainLayout.js
 - `hideMobileBottomNav`, `showBottomNav`, `ConfirmModal` prop usage
 - From: Bottom nav was only hidden for `/chat/*`, and logout confirm used `open` prop mismatch for `ConfirmModal`.
 - To: Bottom nav is route-aware for immersive screens (`/chat/*`, `/property/*`, `/add-property*`, `/admin`), and logout confirm now uses `show` correctly.

#### Changed
- src/components/BackButtonHandler.js, src/context/LoginModalContext.js, src/App.js
 - `BackButtonHandler()`, `LoginModalProvider` context value, provider placement in `App`
 - From: Android hardware back always navigated/exit by route and could not close top overlays first.
 - To: Hardware back now dismisses property/login/auth modals first, then navigates, then exits only on root routes; handler is mounted inside required providers.

#### Changed
- src/components/ConsentBanner.js, src/App.css, src/App.js
 - `ConsentBanner({ hasBottomNav })`, chat-form shared styles, `AppContent` root class
 - From: Consent banner bottom offset ignored nav/safe-area context; bottom-nav spacing class was always forced in results view; chat form had no shared inline error affordance.
 - To: Consent banner now offsets relative to nav + safe area, results root only applies bottom-nav spacing on mobile, and chat UI has disabled/error styling for consistent interaction feedback.

#### Changed
- public/index.html, src/context/ThemeContext.js
 - theme-color meta initialization/update
 - From: Theme/status-bar color used teal (`#0d7377`) that diverged from current design tokens.
 - To: Theme/status-bar color now uses app primary blue (`#246bff`) for stronger visual continuity.

#### Changed
- src/components/AddPropertyForm.js, server/routes/listings.js
 - `handleSubmit(e)`, `estimateDataUrlBytes(dataUrl)`, `isValidCoordinates(value)`, create/update listing validations
 - From: Client allowed fallback title/price (`Untitled listing`, `0`), had no pre-submit image payload guard, and server accepted non-positive prices with weak location requirements.
 - To: Client requires explicit title + price > 0 + location-or-pin and blocks oversized payloads pre-submit; server enforces price > 0, validates coordinates, rejects empty title updates, and requires location or valid map coordinates on create/update.

#### Changed
- src/components/LoginModal.js, src/context/AuthContext.js
 - login/auth error handling catch paths
 - From: Some form/auth errors preferred raw `err.message`, creating inconsistent user-visible error wording.
 - To: Error handling now prioritizes mapped API `userMessage` across auth flows for consistent, user-friendly validation and network feedback.

#### Changed
- src/context/ChatModalContext.js, src/components/PropertyModal.js, src/components/MessagesModal.js
 - `openChat(...)`, `closeChat()`, property modal dialog attributes, messages modal header actions
 - From: Legacy chat modal context had no-op close semantics and modal surfaces had minor interaction/accessibility inconsistencies (including non-functional minimize action).
 - To: Chat modal context is route-aligned (`/messages`/`/chat/:threadId`), property modal includes explicit dialog semantics, and messages modal keeps only functional header actions.

## v.1.0.00.408 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed the `RecentlyViewedContext` update loop that caused `Maximum update depth exceeded` on property pages by stabilizing callbacks and preventing redundant state writes.

### Changes (detailed)

#### Changed
- src/context/RecentlyViewedContext.js
 - `addView(propertyId)`, `RecentlyViewedProvider({ children })`, `promoteRecentId(prev, propertyId)`
 - From: `addView` was recreated on each provider render and was used as a dependency in `PropertyPage` effects, repeatedly triggering `setRecentIds` and causing a render loop in some flows.
 - To: `addView` is now memoized with `useCallback`, context value is memoized with `useMemo`, and `promoteRecentId` returns the previous array when the top recent ID is unchanged to avoid redundant state updates.

## v.1.0.00.407 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Switched listing primary IDs from UUID to 8-character lowercase hex IDs, aligned listing-linked foreign keys, and reset existing listings/dependent data during migration as requested.

### Changes (detailed)

#### Added
- server/migrations/switch-listing-id-to-hex8.sql
 - `DO $$ ... $$` migration block
 - Added: Conditional UUID-to-hex8 migration that runs only while `listings.id` is UUID, truncates listing-linked data via `TRUNCATE listings CASCADE`, converts `listings.id` + linked `listing_id` columns to `CHAR(8)`, adds hex format check, and recreates foreign keys.

#### Changed
- server/run-migrations.js
 - `migrations` array
 - From: Migration runner did not include the new listing ID conversion script.
 - To: Added `switch-listing-id-to-hex8.sql` to the migration execution list.

#### Changed
- schema.sql
 - `listings.id`, `favorites.listing_id`, `recently_viewed.listing_id`, `chat_threads.listing_id`
 - From: Listing IDs and related foreign keys were UUID-based.
 - To: Listing IDs now use `CHAR(8)` with lowercase hex default generation and `listings_id_hex8_check`; related foreign keys now use `CHAR(8)` to match.

#### Changed
- server/routes/listings.js
 - `router.post('/:id/report', ...)`
 - From: Report endpoint parsed `req.params.id` with `parseInt`, assuming numeric IDs.
 - To: Report endpoint now treats listing IDs as trimmed strings, compatible with 8-char hex IDs.

## v.1.0.00.406 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Fixed the remaining stretched mobile-view carousel dots in property detail by excluding `pd-gallery-dot` from global touch-target sizing and hard-resetting dot geometry.

### Changes (detailed)

#### Changed
- src/index.css
 - global touch-target selector for `button` min-height
 - From: Global `min-height: 44px` still applied to `.pd-gallery-dot`, stretching photo-carousel dots into tall pills.
 - To: Excluded `.pd-gallery-dot` from the global button min-height selector.

#### Changed
- src/App.css
 - `.pd-gallery-dot`
 - From: Dot style relied on basic width/height while inheriting button defaults.
 - To: Added a style reset (`all: unset`) plus explicit fixed dimensions/min-max/line-height/margin resets to keep dots consistently circular.

## v.1.0.00.405 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Replaced admin modal indicator dots from `button` elements to keyboard-accessible `span` controls to fully eliminate inherited button sizing distortion.

### Changes (detailed)

#### Changed
- src/components/AdminListingDetailModal.js
 - `AdminListingDetailModal(...)` carousel indicator render
 - From: Indicators were rendered as `button` elements and remained susceptible to global/button-default sizing conflicts in some app runtimes.
 - To: Indicators now render as `span` elements with `role="button"`, `tabIndex`, and Enter/Space keyboard handlers, preserving behavior while avoiding button-specific styling side effects.

## v.1.0.00.404 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Added a full style reset for admin carousel indicator buttons so hidden browser/inherited button rules can no longer stretch them into vertical pills.

### Changes (detailed)

#### Changed
- src/App.css
 - `.carousel-indicators-bar .carousel-indicator-dot`
 - From: Indicators already had size overrides, but residual button defaults/inherited styles could still influence rendered shape in some contexts.
 - To: Applied `all: unset`, then rebuilt explicit dot geometry (`display`, `box-sizing`, fixed 8px dimensions, radius, and reset borders/padding) to guarantee circular indicators.

## v.1.0.00.403 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Applied a hard admin carousel indicator override so dots stay circular even when broader button styles leak into modal controls.

### Changes (detailed)

#### Changed
- src/App.css
 - `.carousel-indicators-bar .carousel-indicator-dot`, `.carousel-indicators-bar .carousel-indicator-dot.active`
 - From: Indicator styles relied on normal specificity and could still be visually stretched when inherited button rules won in some render paths.
 - To: Added high-specificity, `!important`-based size/reset rules (width/height/min/max, border reset, radius, appearance reset) to guarantee circular 8px dots.

#### Changed
- src/components/AdminListingDetailModal.js
 - `AdminListingDetailModal(...)` indicator button render
 - From: Dot geometry depended only on CSS rules.
 - To: Added inline size/radius safeguards on indicator buttons so geometry remains 8px circular even if external CSS ordering changes.

## v.1.0.00.402 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Removed leftover localhost debug telemetry calls from client-side chat/recently-viewed paths so production no longer triggers CORS-blocked console errors against `127.0.0.1:7511`.

### Changes (detailed)

#### Removed
- src/api/client.js
 - `request(method, path, body)`
 - Removed: Local debug ingest `fetch(...)` calls to `http://127.0.0.1:7511/...` that were firing on every API request and response.

#### Removed
- src/context/ChatContext.js
 - `ChatProvider(...)` SSE connect/read error flow
 - Removed: Local debug ingest calls around SSE connect attempt, SSE response, reader error, and fetch error paths.

#### Removed
- src/context/RecentlyViewedContext.js
 - `addView(propertyId)`
 - Removed: Local debug ingest calls on recently viewed add attempt and error handling.

## v.1.0.00.401 — Development
Date: 2026-04-13
Type: Dev Change

### Summary
- Fixed admin listing modal carousel indicators rendering as stretched ovals by preventing global touch-target sizing from affecting dot buttons and enforcing dot dimensions locally.

### Changes (detailed)

#### Changed
- src/index.css
 - global touch-target selector for `button` min-height
 - From: The global `min-height: 44px` button rule also matched carousel indicator buttons, forcing them taller than intended.
 - To: Excluded `.carousel-indicator-dot` from the global rule so indicator dots are no longer stretched by shared touch-target sizing.

#### Changed
- src/components/AdminListingDetailModal.js
 - `AdminListingDetailModal(...)` carousel indicator button render
 - From: Indicator buttons had only the active/inactive class, so they could not be safely excluded from global button sizing rules.
 - To: Added a dedicated `carousel-indicator-dot` class to indicator buttons for precise global-rule scoping without changing carousel control behavior.

#### Changed
- src/App.css
 - `.carousel-indicators-bar button`
 - From: Dot indicators only set `width`/`height`, allowing inherited minimum size constraints to distort their shape.
 - To: Enforced fixed dot geometry with explicit `min/max width/height`, `flex-basis`, and `line-height` so indicators stay circular.

## v.1.0.00.400 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Added GTM/GA4 analytics infrastructure with consent gating, SPA pageview tracking, and core listing/search engagement events.

### Changes (detailed)

#### Added
- src/utils/analytics.js
 - `initAnalytics()`, `getStoredConsent()`, `setAnalyticsConsent(analyticsAllowed)`, `trackPageView(...)`, `trackEvent(...)`
 - Added: Shared analytics utility for GTM-safe dataLayer pushes, consent storage, consent updates, and event payload sanitization.

#### Added
- src/components/ConsentBanner.js
 - `ConsentBanner({ open, onAccept, onReject })`
 - Added: Mobile-first consent banner UI to capture analytics allow/reject choices.

#### Changed
- public/index.html
 - GTM bootstrap script and noscript iframe
 - From: No GTM container initialization and no default consent signal for analytics tags.
 - To: Added env-driven GTM bootstrap with default-denied consent state and noscript iframe support.

#### Changed
- src/components/MainLayout.js
 - `MainLayout()`
 - From: Layout had no analytics consent initialization or in-app consent capture flow.
 - To: Layout now initializes analytics consent state on mount and renders consent banner actions that persist user consent choices.

#### Changed
- src/App.js
 - `AppContent()`
 - From: Route changes were not tracked as analytics pageview events in SPA navigation.
 - To: Added route-based pageview tracking that pushes normalized path/title/listing context on path/search changes.

#### Changed
- src/pages/SearchPage.js
 - `chooseListingType(type)`, `handleCardClick(path)`
 - From: Search mode/listing-type choices did not emit analytics funnel events.
 - To: Added `search_route_selected` and `search_submit` analytics events for listing-type and search-mode actions.

#### Changed
- src/pages/PropertyPage.js
 - `PropertyPage()` (`useEffect` on active property)
 - From: Property detail opens did not emit view analytics events.
 - To: Added `view_property` event with non-PII listing metadata.

#### Changed
- src/components/PropertyDetailContent.js
 - `handleChat()`, `handleShare()`, phone/email link click handlers
 - From: Share/contact actions had no analytics instrumentation.
 - To: Added `share_property` and `contact_agent` event tracking for chat, phone, email, and share interactions.

#### Changed
- src/components/FilterSidebar.js
 - `handleSaveCurrent()`, `handleApplySaved(id)`, `handleApplyFilters(event)`
 - From: Filter apply/save interactions were not tracked.
 - To: Added `filter_save` and `filter_apply` events for manual apply and saved-preset apply flows.

## v.1.0.00.399 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Simplified the My Properties strip by removing redundant status text and back action, leaving only the listing-type toggle for a cleaner control area.
- There are two AI agents working on this app.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent(...)` (`showMyPropertiesOnly` banner block)
 - From: My Properties banner rendered both `Showing only your properties` and a `Show all properties` button above the rent/sale toggle, duplicating intent in one strip.
 - To: Removed the top status/button row and kept only `ListingTypeToggle` (`For Rent` / `For Sale`) in the banner.

#### Changed
- src/App.css
 - `.my-properties-bar`
 - From: Spacing was tuned for a two-row layout (`gap: 10px; padding: 12px 14px;`).
 - To: Spacing is tightened for a single-control layout (`gap: 0; padding: 10px 14px;`).

#### Removed
- src/App.css
 - `.my-properties-bar-top`, `.my-properties-bar-text`, `.my-properties-bar-text .fa-house`, `.my-properties-bar-back`, `.my-properties-bar-back:hover`
 - Removed: Obsolete selectors for My Properties top-row text/button after JSX simplification.

## v.1.0.00.398 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Updated bedroom/bathroom filter labels for clarity and added matching icons in listing and search filter panels.

### Changes (detailed)

#### Changed
- src/components/AddPropertyForm.js
 - `AddPropertyForm(...)` (property details labels)
 - From: Property detail inputs were labeled `Beds` and `Baths` without icons.
 - To: Property detail inputs are now labeled `Bedrooms` and `Bathrooms`, with bed/bath icons, and the `Size (sqm)` label also includes a size icon for visual consistency.

#### Changed
- src/App.js
 - `AppContent(...)` (results advanced filter labels)
 - From: Advanced filter labels used `Min beds` and `Min baths` text only.
 - To: Advanced filter labels now use `Min bedrooms` and `Min bathrooms` with bed/bath icons.

## v.1.0.00.397 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Improved property-share image reliability by adding JPG-compatible OG image generation with caching and by generating JPG derivatives alongside existing WebP uploads.

### Changes (detailed)

#### Added
- server/index.js
 - `app.get('/og-image.jpg', ...)`
 - Added: New OG image conversion endpoint that accepts a source image URL/path, converts it to JPG, caches the result under `/uploads/og-cache`, and serves `image/jpeg` for crawler compatibility.

#### Changed
- server/index.js
 - `buildPropertyMeta(row, req)`, `pickPropertyShareImage(req, images)`, `inferJpgFromWebp(value)`, `buildOgImageProxyPath(src)`
 - From: Property metadata always used the first listing image as-is (often `.webp`) for `og:image` and `twitter:image`.
 - To: Metadata now prefers a local JPG derivative when available, uses original non-WebP images directly, and falls back to the runtime JPG endpoint for WebP sources before defaulting to `/logo.png`.

#### Changed
- server/lib/imageProcessor.js
 - `dataUrlToImageBuffers(dataUrl)`, `processImages(images)`, `processMulterFiles(files)`
 - From: Uploaded listing images were converted and stored only as `.webp`.
 - To: Uploaded listing images are now stored as both `.webp` (app rendering) and `.jpg` (sharing/crawler compatibility) using the same generated base filename.

## v.1.0.00.396 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Switched property opening to route-first detail pages and simplified back navigation to browser-history-first fallback, eliminating modal-dependent close/back behavior on listing flows.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent(...)` (`handleViewDetails`, `MapView onPropertyClick` handlers)
 - From: Property selection from list/map used modal context open action (`openProperty(...)`) and kept users on `/sale` or `/rent` URLs.
 - To: Property selection now navigates directly to `/property/:id` with lightweight `state.from`, making detail navigation route-first and URL-consistent.

#### Changed
- src/pages/SavedPage.js
 - `SavedPage(...)` (`handleSelectProperty`)
 - From: Saved-item selection opened the property modal and stayed on `/saved`.
 - To: Saved-item selection now navigates to `/property/:id` so detail view behavior matches sale/rent/map flows.

#### Changed
- src/pages/PropertyPage.js
 - `PropertyPage(...)` (`handleBack`)
 - From: Back/close depended on custom close-target resolution from `location.state.from` and fallback-retry logic.
 - To: Back now follows browser-history-first behavior (`navigate(-1)` when possible), with deterministic listing-type fallback (`/rent` or `/sale`) when no usable history entry exists.

## v.1.0.00.395 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Added server-rendered property-specific social metadata so shared property links can show personalized previews (including first property image), and aligned the share button URL to the canonical property route.

### Changes (detailed)

#### Changed
- server/index.js
 - `toAbsoluteUrl(req, value)`, `parseImages(imagesField)`, `buildPropertyMeta(row, req)`, `injectPropertyMetaHtml(html, meta)`
 - From: Property routes relied on SPA runtime meta updates, so crawlers often only saw generic default metadata from static `index.html`.
 - To: Added server-side property metadata generation/injection helpers that produce canonical property URL, title/description, first-image OG/Twitter tags, and robots directives before HTML response is sent.
 - `app.get('/property/:id', ...)`
 - From: Property URLs were handled by the generic SPA catch-all static `index.html` response.
 - To: Added dedicated pre-fallback property route that queries listing data and returns `index.html` with injected OG/Twitter/canonical metadata for reliable social previews; unavailable/missing listings now get safe fallback metadata with `noindex, follow`.

#### Changed
- src/components/PropertyDetailContent.js
 - `handleShare()`
 - From: Share/copy URL used `window.location.href`, which could point to non-property routes when detail opened via modal overlay.
 - To: Share/copy now always uses canonical property URL format (`/property/:id`) so external shares consistently target the property detail link.

## v.1.0.00.394 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Removed the visible incremental internal-linking/content UI blocks added in the recent SEO pass while preserving route-level metadata, structured data, sitemap logic, and app behavior.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: `/sale` and `/rent` showed a top category overview strip with helper text and quick-link buttons (`Search options`, `View for sale/rent`, `Search by city`).
 - To: Removed the category overview strip and related `Link` usage, keeping existing page behavior and technical SEO metadata/schema intact.

#### Changed
- src/pages/HomePage.js
 - `HomePage()`
 - From: Home hero included an extra descriptive paragraph and a visible quick-link button group under the main CTA.
 - To: Removed the added paragraph and quick-link group; core hero layout and SEO metadata/schema remain unchanged.

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()`
 - From: Search landing included an added descriptive paragraph and visible quick-link section.
 - To: Removed those added visible content/link blocks while keeping existing search flow and SEO metadata/schema behavior.

## v.1.0.00.393 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Refined sitemap architecture by switching to a sitemap index with dedicated static and property sitemap endpoints for clearer crawler ingestion and easier ongoing maintenance.

### Changes (detailed)

#### Changed
- server/index.js
 - `buildUrlSetXml(entries)`
 - From: URL-set XML generation logic was embedded inside one `/sitemap.xml` handler.
 - To: Added reusable URL-set XML builder helper for cleaner sitemap endpoint composition.
 - `buildSitemapIndexXml(entries)`
 - From: No sitemap-index builder existed; `/sitemap.xml` emitted a single combined urlset.
 - To: Added sitemap-index XML builder helper so `/sitemap.xml` now serves as a sitemap index entrypoint.
 - `app.get('/sitemap.xml', ...)`
 - From: Returned one combined sitemap containing both static and property URLs.
 - To: Returns a sitemap index referencing `/sitemaps/static.xml` and `/sitemaps/properties.xml`.
 - `app.get('/sitemaps/static.xml', ...)`
 - Added: Dedicated static URL sitemap endpoint for landing/search/category routes.
 - `app.get('/sitemaps/properties.xml', ...)`
 - Added: Dedicated property URL sitemap endpoint for approved and currently available listing detail pages.

## v.1.0.00.392 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Improved technical indexation quality by refining robots behavior for noindex pages, enhancing social image metadata, and tightening sitemap inclusion to currently available listings.

### Changes (detailed)

#### Changed
- src/components/Seo.js
 - `Seo({ ... })`
 - From: `noindex` pages used `noindex, nofollow` and social image tags lacked image-alt metadata.
 - To: Updated robots handling to `noindex, follow` for better crawl continuity on non-indexed routes, and added `og:image:alt` plus `twitter:image:alt` based on page title.

#### Changed
- src/App.js
 - `AppContent()`
 - From: `/sale` and `/rent` route metadata stayed indexable in all views, including map-mode result state variants.
 - To: Added conditional `noindex` for map-view result state while preserving canonical routes and standard indexation for list/grid result pages.

#### Changed
- server/index.js
 - `app.get('/sitemap.xml', ...)`
 - From: Sitemap property URLs excluded sold sale listings but could still include currently-rented rent listings.
 - To: Sitemap now includes only approved and currently available listings (`sold = false` for sale and `currently_rented = false` for rent) for cleaner search engine signals.

## v.1.0.00.391 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Strengthened search-entry and category-route SEO by adding WebPage/Breadcrumb structured data, reducing duplicate indexation for transient search step states, and improving crawlable internal linking on sale/rent pages.

### Changes (detailed)

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()`
 - From: Search page had metadata but no explicit WebPage/Breadcrumb schema and indexation remained permissive for step-based query variants.
 - To: Added WebPage + Breadcrumb JSON-LD and set `noindex` for category step variants while keeping canonical on `/search` for cleaner indexation.

#### Changed
- src/pages/SearchCityPage.js
 - `SearchCityPage()`
 - From: City search route had metadata but no route-level WebPage/Breadcrumb structured data.
 - To: Added WebPage + Breadcrumb JSON-LD for `/search/city` to improve semantic discoverability.

#### Changed
- src/pages/SearchKeywordPage.js
 - `SearchKeywordPage()`
 - From: Keyword search route had metadata but no route-level WebPage/Breadcrumb structured data.
 - To: Added WebPage + Breadcrumb JSON-LD for `/search/keyword` to improve semantic discoverability.

#### Changed
- src/pages/SearchSchoolPage.js
 - `SearchSchoolPage()`
 - From: School search route had metadata but no route-level WebPage/Breadcrumb structured data.
 - To: Added WebPage + Breadcrumb JSON-LD for `/search/school` to improve semantic discoverability.

#### Changed
- src/App.js
 - `AppContent()`
 - From: Sale/rent pages had structured metadata but limited visible crawlable category-support text/links near the top of the route.
 - To: Added concise category-context text and relevant internal links (`/search`, opposite category route, and city search) to strengthen internal linking and crawl understanding without altering behavior or route flow.

## v.1.0.00.390 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Enhanced `/sale` and `/rent` SEO with dynamic results metadata and listing-aware JSON-LD so category/result pages expose stronger crawl and discovery signals while preserving existing route behavior and UI flow.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: Sale/rent pages depended on broad layout-level metadata and did not expose listing-aware structured data for result sets.
 - To: Added route-aware dynamic SEO title/description/canonical/OG metadata for `/sale` and `/rent` plus structured data (`CollectionPage`, `BreadcrumbList`, and `ItemList` with listing URLs and offers) derived from current in-app results/filter context.

## v.1.0.00.389 — Development
Date: 2026-04-10
Type: Dev Change

### Summary
- Added route-level SEO metadata management, social sharing tags, structured data on key pages, and sitemap/robots support while keeping existing routing, UI flow, and listing behavior intact.

### Changes (detailed)

#### Added
- src/components/Seo.js
 - `Seo({ title, description, canonicalPath, ogTitle, ogDescription, ogImage, twitterCard, noindex, type, jsonLd, jsonLdId })`
 - Added: Reusable route-level SEO manager for title, description, canonical URL, Open Graph, Twitter tags, robots directives, and JSON-LD injection.

#### Added
- src/seo/siteSeo.js
 - `getSiteOrigin()`
 - Added: Centralized site URL resolution for SEO metadata and canonical/absolute URL generation.
 - `toAbsoluteUrl(pathOrUrl)`
 - Added: Safe absolute URL helper for canonical links, social images, and structured data item URLs.

#### Added
- public/robots.txt
 - `robots.txt` directives
 - Added: Baseline crawl rules that keep public pages indexable while discouraging indexing of account-only paths, with sitemap reference.

#### Changed
- public/index.html
 - `<head>` metadata defaults
 - From: Generic Cebu-focused description/title with no baseline Open Graph/Twitter defaults.
 - To: Philippines-wide default description/title plus baseline Open Graph, Twitter, and robots tags for stronger first-load/social fallback metadata.

#### Changed
- src/pages/HomePage.js
 - `HomePage()`
 - From: Landing screen had no route-specific SEO metadata or structured data, and limited crawlable internal links.
 - To: Added page-specific title/description/canonical/OG/Twitter metadata, Organization + WebSite JSON-LD, plus concise crawlable copy and internal links to key search/sale/rent routes.

#### Changed
- src/pages/SearchPage.js
 - `SearchPage()`
 - From: Search landing/category routes had no dedicated SEO metadata and minimal crawl-supporting copy/links.
 - To: Added route-level metadata for search landing/categories, stronger descriptive copy, and internal quick links for rent/sale/city/keyword discovery paths.

#### Changed
- src/pages/SearchCityPage.js
 - `SearchCityPage()`
 - From: City search route had no dedicated metadata.
 - To: Added route-specific title, description, canonical, and social metadata for city-based listing discovery.

#### Changed
- src/pages/SearchKeywordPage.js
 - `SearchKeywordPage()`
 - From: Keyword search route had no dedicated metadata.
 - To: Added route-specific title, description, canonical, and social metadata for keyword-based listing discovery.

#### Changed
- src/pages/SearchSchoolPage.js
 - `SearchSchoolPage()`
 - From: School search route had no dedicated metadata.
 - To: Added route-specific title, description, canonical, and social metadata for school-proximity discovery.

#### Changed
- src/pages/SearchMapPage.js
 - `SearchMapPage()`
 - From: Redirect-only route had no indexation directive.
 - To: Added explicit `noindex` metadata to reduce indexing of thin redirect-only search state.

#### Changed
- src/components/MainLayout.js
 - `MainLayout()`
 - From: `/sale` and `/rent` routes had no dedicated metadata, and private account paths had no explicit noindex strategy.
 - To: Added metadata for `/sale` and `/rent` (including breadcrumb JSON-LD) and `noindex` metadata for private/account routes to improve canonical indexation strategy.

#### Changed
- src/pages/PropertyPage.js
 - `PropertyPage()`
 - From: Property detail routes had no unique per-listing metadata or structured data.
 - To: Added unique per-property title/description/canonical/OG/Twitter metadata and JSON-LD (`RealEstateListing` + `BreadcrumbList`) based on real listing fields; missing listings now emit `noindex`.

#### Changed
- server/index.js
 - `app.get('/robots.txt', ...)`
 - From: Server did not provide host-aware robots output.
 - To: Added runtime robots endpoint with explicit public/private crawl directives and absolute sitemap URL.
 - `app.get('/sitemap.xml', ...)`
 - From: No sitemap endpoint was available.
 - To: Added dynamic sitemap XML generation covering key public landing/search routes and approved property detail URLs from the database when available.

## v.1.0.00.388 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Replaced the muted slate palette with a more vibrant œCoastal Pop color system so key UI surfaces, accents, prices, and section cues feel brighter and more energetic.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` color tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-price-rent`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Slate/Rose + emerald tuning with comparatively muted saturation.
 - To: Vibrant mapping (`#246bff`, `#00a7c4`, `#ff6f61`, `#ff4f7b`, `#14b57a`, `#d3365b`, `#e6f2ff`) for higher visual energy and clearer color separation.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(74, 93, 117, 0.2)`.
 - To: `rgba(36, 107, 255, 0.2)` aligned with new vibrant primary.

## v.1.0.00.387 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Harmonized background/support colors with the new emerald rent-price styling by shifting the palette toward slate+emerald neutrals so rent pricing feels integrated instead of isolated.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` tokens (`--bb-primary-soft`, `--bb-accent-light`, `--bb-surface`, `--bb-border`, `--bb-success`, `--bb-success-soft`, `--bb-section-2`, `--bb-section-3`)
 - From: Slate/Rose palette support tones (`--bb-surface: #e9f1f8`, `--bb-border: #bfd0df`, success family `#6b9d8b`) that did not fully harmonize with emerald rent price accents.
 - To: Rebalanced support tones (`--bb-surface: #e7f3f4`, `--bb-border: #b9d4d4`) and aligned success/section greens to emerald (`#2f9e74`) for better cohesion with rent price color.

## v.1.0.00.386 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Added a dedicated emerald rent-price treatment so listings with `listingType === 'rent'` now show price text in emerald while sale prices keep the rose price tone.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` `--bb-price-rent`, `.property-price.price-rent`, `.saved-page-card-price.price-rent`, `.favorites-modal-card-price.price-rent`, `.pd-price.price-rent`
 - From: All prices shared a single `--bb-price` color regardless of listing type.
 - To: Added `--bb-price-rent: #2f9e74` and rent-only class overrides so rent prices render in emerald across list/detail/saved/favorites contexts.

#### Changed
- src/components/PropertyListCard.js
 - `PropertyListCard(...)` price element className
 - From: `property-price` class only, same color for rent and sale.
 - To: Appends `price-rent` class when `property.listingType === 'rent'`.

#### Changed
- src/components/PropertyCard.js
 - `PropertyCard(...)` price element className
 - From: `property-price` class only, same color for rent and sale.
 - To: Appends `price-rent` class when `property.listingType === 'rent'`.

#### Changed
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(...)` summary price element className
 - From: `pd-price` class only, same color for rent and sale.
 - To: Appends `price-rent` class using existing `isRent` state for emerald rent pricing in detail modal/page.

#### Changed
- src/pages/SavedPage.js
 - `SavedPage(...)` saved card price element className
 - From: `saved-page-card-price` class only.
 - To: Appends `price-rent` class when saved property is rent.

#### Changed
- src/components/FavoritesModal.js
 - `FavoritesModal(...)` favorites card price element className
 - From: `favorites-modal-card-price` class only.
 - To: Appends `price-rent` class when favorite property is rent.

#### Changed
- src/components/AdminListingDetailModal.js
 - `AdminListingDetailModal(...)` listing price element className
 - From: `property-price` class only in admin detail modal.
 - To: Appends `price-rent` class when admin-opened listing is rent.

## v.1.0.00.385 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Switched the global theme to a Slate and Rose palette, replacing blue-orange accents with slate neutrals and rose highlights while keeping a blue-ish background tone.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` color tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Modern Ocean mapping with navy/aqua/orange emphasis.
 - To: Slate/Rose mapping (`#4a5d75`, `#667b96`, `#d46a8c`, `#c24f76`, `#6b9d8b`, `#a84666`, `#e9f1f8`) for a softer neutral base with rose accents.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(11, 61, 145, 0.2)`.
 - To: `rgba(74, 93, 117, 0.2)` to match the updated slate primary.

## v.1.0.00.384 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Replaced the previous palette with a bold Modern Ocean theme so color changes are clearly visible across the app while keeping the global background blue-toned.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` color tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Coastal Calm high-contrast palette with softer blue + amber tones.
 - To: Modern Ocean high-contrast palette (`#0b3d91`, `#007b8a`, `#ff7a59`, `#ff6b3d`, `#2f9e74`, `#c53030`, `#e6f4ff`) for stronger visual separation and unmistakable theming.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(15, 95, 148, 0.2)`.
 - To: `rgba(11, 61, 145, 0.2)` to match the new primary tone.

## v.1.0.00.383 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed missing visual impact of the palette overhaul by replacing hardcoded search/results UI colors with `--bb-*` tokens so the new theme appears clearly in sort controls, list cards, tags, and CTAs.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-block .results-portal-actions button.results-portal-btn--outline`, `.results-criteria-bar`, `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select`
 - From: Hardcoded neutral colors (`#fff`, `#1d1d1f`, fixed hover shades) made controls look unchanged despite token updates.
 - To: Mapped backgrounds, borders, and text to `--bb-surface-elevated`, `--bb-border`, `--bb-primary-muted`, `--bb-primary-soft`, and `--bb-text` for visible theme adoption.

#### Changed
- src/App.css
 - `.property-card-tag, .property-list-tag`, `.property-list-card .list-card-img`, `.property-list-spec-compact`, `.property-list-card .property-list-cta` (+ hover/focus), `.property-list-card .property-list-tag`, `.btn-chat:hover`
 - From: Multiple hardcoded color values (`#d9eaf5`, `#d6dee4`, `#f18d00`, `#dd8100`, `#f6fbfc`, `#e06d38`) overrode global palette intent.
 - To: Replaced with token-driven colors (`--bb-accent-light`, `--bb-border`, `--bb-accent`, `--bb-accent-hover`, `--bb-surface-elevated`) so list-card surfaces and CTAs now track the selected theme.

## v.1.0.00.382 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Applied a full Coastal Calm high-contrast color overhaul by remapping all core `--bb-*` theme tokens while keeping the global background in a blueish tone.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` color tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Previous polished coastal palette with softer contrast.
 - To: Coastal Calm high-contrast mapping (`#0f5f94`, `#1f7ea3`, `#e59a45`, `#c86f26`, `#4f9274`, `#a33f4a`, `#dff0fb`) for stronger readability and clearer visual hierarchy.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(29, 106, 157, 0.2)`.
 - To: `rgba(15, 95, 148, 0.2)` to match the updated primary token.

## v.1.0.00.381 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Continued the global palette refinement with a final polish pass to improve tonal harmony between primary, accent, price, success, and text/surface contrast tokens.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` color tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Prior fine-tuned coastal palette with slightly stronger warm highlights and deeper blue contrast edges.
 - To: Polished values (`#1d6a9d`, `#25868a`, `#df9b52`, `#be702f`, `#5b9a79`, `#a94750`, `#edf6fd`) for smoother visual rhythm and more consistent emphasis hierarchy.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(30, 115, 171, 0.2)`.
 - To: `rgba(29, 106, 157, 0.2)` to match the updated primary token.

## v.1.0.00.380 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fine-tuned all global theme colors for improved balance and readability by refining primary, accent, price, success, danger, surface, text, and section palette tokens.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` color tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Previous coastal pass with brighter warm accents and slightly flatter text/surface contrast.
 - To: Refined palette (`#1e73ab`, `#2b9096`, `#e39a4a`, `#c7742e`, `#5f9f7d`, `#ad4750`, `#eaf5fc`) for clearer contrast, cleaner emphasis hierarchy, and more cohesive color rhythm across components.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(31, 120, 180, 0.2)`.
 - To: `rgba(30, 115, 171, 0.2)` to align with the fine-tuned primary tone.

## v.1.0.00.379 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Applied a full sitewide color refresh by remapping the global `--bb-*` theme tokens to a cleaner coastal palette with improved contrast and more consistent emphasis colors.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` theme tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Previous Hawaii-derived token mapping with darker warm-danger and older blue/teal balance.
 - To: Refined coastal mapping (`#1f78b4`, `#2f9e9f`, `#f2a65a`, `#6fae8a`, `#b54750`, `#e6f3fb`) for calmer surfaces, clearer hierarchy, and unified accent/price emphasis.

#### Changed
- src/App.css
 - `html` `-webkit-tap-highlight-color`
 - From: `rgba(35, 150, 200, 0.2)`.
 - To: `rgba(31, 120, 180, 0.2)` to match the updated primary token.

## v.1.0.00.378 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Updated the global price color token to use `#db9c46` so all price-highlighted text follows the requested accent hue.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` `--bb-price`, `--bb-price-soft`
 - From: `--bb-price: #8b3724` with brown-tinted soft variant (`rgba(139, 55, 36, 0.14)`).
 - To: `--bb-price: #db9c46` with matching soft variant (`rgba(219, 156, 70, 0.14)`).

## v.1.0.00.377 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Disabled all map interactions across the app by adding a shared translucent blocker overlay with a `CURRENTLY DISABLED` label on every Leaflet map surface.

### Changes (detailed)

#### Changed
- src/components/MapView.js
 - `MapView(...)` render shell
 - From: Search/results map rendered only the map container and remained fully interactive.
 - To: Wrapped map in shared disabled shell and added overlay text layer to block pan/zoom/click while keeping map visible.

#### Changed
- src/components/PropertyMapPreview.js
 - `PropertyMapPreview(...)` render structure
 - From: Property detail map preview used a single map root element and remained interactive.
 - To: Split into wrapper + inner map root (ref preserved) and added shared disabled overlay text layer to block interaction in modal/page detail contexts.

#### Changed
- src/components/MapPicker.js
 - `MapPicker(...)` render structure
 - From: Map picker rendered a single interactive map root for click/drag location picking.
 - To: Split into wrapper + inner map root (ref preserved) and added shared disabled overlay text layer so map is visible but non-interactive.

#### Changed
- src/App.css
 - `.bb-map-disabled-shell`, `.bb-map-disabled-overlay`
 - From: No reusable map-disable overlay styles existed.
 - To: Added shared absolute overlay with 10% gray background, centered `CURRENTLY DISABLED` label, and interaction blocking (`pointer-events: auto`, `touch-action: none`) for all wrapped map instances.

## v.1.0.00.376 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Reduced typography size on the category search cards (City/Map/Keyword/School) so titles and descriptions fit better in compact mobile card widths.

### Changes (detailed)

#### Changed
- src/App.css
 - `.home-search-card-title`, `.home-search-card-desc`
 - From: Card title/description text used larger default scale, causing dense wrapping and crowded text blocks in small card layouts.
 - To: Applied smaller title and description font sizes with tighter description line-height for cleaner multi-line fit.

## v.1.0.00.375 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Removed the `Free` badges from property detail inquiry CTAs and centered the remaining action labels for a cleaner single-message button layout.

### Changes (detailed)

#### Changed
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(...)` CTA action stack JSX
 - From: Primary and secondary inquiry buttons rendered a left-side `Free` badge block, introducing extra visual noise and split alignment.
 - To: Removed `Free` badge elements from CTA buttons so only the action labels/icons remain.

#### Changed
- src/App.css
 - `.pd-action-main`, `.pd-action-secondary-text`
 - From: CTA text containers relied on badge-adjacent layout and could appear offset once badge blocks were removed.
 - To: Enforced full-width text containers (`width: 100%`) with center alignment so labels stay centered after badge removal.

## v.1.0.00.374 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Removed the remaining heart-button drop shadow in the property detail toolbar so favorites icon styling matches the flat top-nav action style.

### Changes (detailed)

#### Changed
- src/App.css
 - `.pd-toolbar .btn-favorite.pd-toolbar-icon`, `.pd-toolbar .btn-favorite.pd-toolbar-icon:hover`, `.pd-toolbar .btn-favorite.pd-toolbar-icon:focus`
 - From: Toolbar favorite button still inherited global `.btn-favorite` elevation/hover transform, which rendered a visible drop shadow inside the nav action box.
 - To: Toolbar-specific favorite action now forces flat styling (`box-shadow: none`, `transform: none`, transparent background, square corners) across default/hover/focus states.

## v.1.0.00.373 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Applied a targeted cleanup for remaining property detail modal mobile issues by improving title fit in the toolbar and preventing CTA badge/text clipping in secondary action buttons.

### Changes (detailed)

#### Changed
- src/App.css
 - `.pd-toolbar`, `.pd-toolbar-start`, `.pd-toolbar-actions`, `.pd-toolbar-title`, `.pd-toolbar-circle`, `.pd-toolbar-icon`, `.pd-toolbar .btn-favorite.pd-toolbar-icon`
 - From: Toolbar controls consumed too much horizontal space, forcing title truncation in common mobile widths.
 - To: Reduced icon tap box size and action gaps, rebalanced toolbar column widths, and tightened title typography/padding so the header title fits more reliably.

#### Changed
- src/App.css
 - `.pd-action-stack`, `.pd-action-row`, `.pd-action-secondary`, `.pd-action-badge--soft`, `.pd-action-secondary-text`
 - From: Secondary action badge/text area could clip or feel cut on narrow viewports due tight width constraints.
 - To: Added explicit min-width safeguards, fixed badge flex-basis, ensured button width constraints, and enabled robust text wrapping behavior to avoid clipping.

## v.1.0.00.372 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed the remaining top-toolbar title overlap in property detail modal and refined small-screen CTA row behavior for clearer, non-cramped mobile layout.

### Changes (detailed)

#### Changed
- src/App.css
 - `.pd-toolbar`, `.pd-toolbar-title`
 - From: Toolbar used absolute title positioning with reserved side padding, which still allowed overlap with right-side icons in some mobile widths.
 - To: Toolbar now uses a three-column grid (`start | centered title | actions`) with a static center title so action icons no longer collide with title text.

#### Changed
- src/App.css
 - `@media (max-width: 420px) .pd-action-row`, `@media (max-width: 420px) .pd-inline-cta`, `@media (max-width: 360px) .pd-action-row`, `@media (max-width: 360px) .pd-inline-cta`
 - From: Secondary CTA buttons stacked too early on common mobile widths, reducing visual balance.
 - To: Secondary actions stay two-column for regular mobile widths and only collapse to one column on very narrow screens (`<=360px`), with inline CTA width behavior matching each layout.

## v.1.0.00.371 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Performed a final pixel-tuning pass on the property detail modal header and CTA summary controls to improve alignment, visual balance, and small-screen readability.

### Changes (detailed)

#### Changed
- src/App.css
 - `.pd-toolbar-start`, `.pd-toolbar-actions`, `.pd-toolbar-title`
 - From: Header title and action clusters had inconsistent reserved width, so centering could feel visually off on certain button combinations.
 - To: Added explicit left/right action widths and balanced title safe space to keep `Property details` centered and unobstructed.

#### Changed
- src/App.css
 - `.pd-action-stack`, `.pd-action-primary`, `.pd-action-badge`, `.pd-action-main`, `.pd-action-row`, `.pd-action-secondary`, `.pd-action-badge--soft`, `.pd-action-secondary-text`
 - From: CTA hierarchy felt cramped and uneven, with secondary chips appearing too tight relative to primary CTA.
 - To: Adjusted heights, spacing, badge widths, and type scale for a cleaner hierarchy and more consistent touch-target rhythm.

#### Changed
- src/App.css
 - `.pd-price-summary`, `.pd-inline-cta`, `@media (max-width: 420px) .pd-action-row`, `@media (max-width: 420px) .pd-inline-cta`
 - From: Price summary and inline fee CTA felt crowded on narrow devices.
 - To: Increased summary spacing and tuned inline CTA dimensions; small-screen behavior now improves readability with clearer vertical rhythm.

## v.1.0.00.370 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed remaining property detail modal UI regressions by preventing toolbar title overlap, relaxing cramped CTA/summary density on small screens, and replacing misleading `â‚±0 / â‚±0` deposit output with clearer fallback labels.

### Changes (detailed)

#### Changed
- src/App.css
 - `.pd-toolbar-title`
 - From: Title used symmetric side padding that did not reserve enough room for the right-side action cluster, causing visible overlap with toolbar icons.
 - To: Rebalanced title safe area (`padding-left`/`padding-right`) so centered text remains readable and unobstructed on mobile.

#### Changed
- src/App.css
 - `.pd-action-primary`, `.pd-action-badge`, `.pd-action-main`, `.pd-action-secondary`, `.pd-action-badge--soft`, `.pd-action-secondary-text`, `.pd-price-summary-top`, `.pd-inline-cta`, `.pd-mini-stat`, `.pd-mini-value`, `@media (max-width: 420px) .pd-action-row`, `@media (max-width: 420px) .pd-inline-cta`
 - From: CTA/summary controls were too tight on narrow screens (cramped labels, uneven hierarchy, and crowded top-row balance in summary cards).
 - To: Tuned sizing/typography and responsive behavior for clearer tap targets, better text legibility, and balanced summary row layout; stacked secondary actions and full-width inline CTA on very small screens.

#### Changed
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(...)` key deposit summary computation
 - From: Rent listings with missing fee values displayed a literal `â‚±0 / â‚±0`, which appeared broken or misleading.
 - To: Deposit label now shows formatted peso values only when data exists; otherwise uses `Not specified` for rent and `Not applicable` for non-rent listings.

## v.1.0.00.369 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed property detail modal viewport sizing/scroll regressions so the sheet fills full height, avoids nested scrolling, keeps the title readable, and preserves bottom chat CTA visibility.

### Changes (detailed)

#### Changed
- src/components/PropertyModal.js
 - `PropertyModal(...)` modal dialog class
 - From: Used Bootstrap `modal-dialog-scrollable` while detail content already had its own scroll container (`.pd-scroll`), creating nested/extra scroll behavior.
 - To: Removed `modal-dialog-scrollable` so only the intended detail scroll region controls scrolling.

#### Changed
- src/App.css
 - `.modal.property-detail-overlay-modal.fade.show:not(.property-modal-as-page)`, `.property-detail-overlay-modal:not(.property-modal-as-page) .modal-dialog`, `.property-detail-overlay-modal:not(.property-modal-as-page) .modal-content`
 - From: Overlay/dialog/content sizing allowed non-full-height states (`min-height: 0` / bounded max-height), which could leave top gap space and clip lower actions.
 - To: Forced full viewport sizing (`height/min-height/max-height: 100dvh`) and hidden outer overflow so modal fills screen and prevents parent-level extra scrolling.

#### Changed
- src/App.css
 - `.pd-toolbar-title`, `.property-detail-overlay-modal:not(.property-modal-as-page) .pd-scroll-pad`, `.pd-cta-bar`, `.property-detail-page-content .pd-cta-bar`
 - From: Center title could be visually blocked by toolbar action buttons; bottom spacing was too tight for safe-area + CTA visibility.
 - To: Title now reserves side space via left/right padding and centered text; scroll pad and CTA bottom padding increased with safe-area offsets so the chat button is not cut off.

## v.1.0.00.368 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed broken property-detail modal visuals by removing sheet-style rounded container corners, aligning the header to the app™s standard top-nav style, and normalizing CTA/button presentation.

### Changes (detailed)

#### Changed
- src/App.css
 - `.property-detail-overlay-modal:not(.property-modal-as-page) .modal-content` (base + desktop media query)
 - From: Mobile/desktop modal content used rounded sheet/card corners for the detail container.
 - To: Modal content now uses a flat edge (`border-radius: 0`) so the top behaves like the rest of the app navigation pattern.

#### Changed
- src/App.css
 - `.pd-toolbar`, `.pd-toolbar-title`, `.pd-toolbar-circle`, `.pd-toolbar-icon` (+ hover states)
 - From: Header used tinted background with circular icon-chip controls, creating a floating/rounded visual treatment.
 - To: Header now uses standard elevated surface + border styling with plain icon buttons and primary icon color to match existing app top-nav behavior.

#### Changed
- src/App.css
 - `.pd-cta-bar`, `.pd-cta-primary`, `.pd-action-primary`, `.pd-action-badge`, `.pd-action-secondary`, `.pd-action-secondary-text`, `.pd-inline-cta`
 - From: CTA blocks were overly rounded and used mixed accent/success emphasis that looked inconsistent with the current detail flow.
 - To: CTA blocks now use tighter radius, primary-color emphasis, and compact secondary button typography to remove broken wrapping/weight imbalance.

## v.1.0.00.367 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Refreshed the property detail modal/page layout to match the new reference flow with a themed toolbar + hint strip, denser hero/action/summary composition, and preserved listing interactions.

### Changes (detailed)

#### Changed
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(...)`
 - From: Content started directly with hero then title/price card/chips, and exposed only a single fixed chat CTA at the bottom.
 - To: Reordered into toolbar + dismissible hint strip + hero + inquiry action stack + compact price summary before detailed sections, while preserving share/favorite/report/gallery and chat handlers.

#### Changed
- src/App.css
 - `.pd-toolbar`, `.pd-toolbar-title`, `.pd-hint-strip`, `.pd-hint-*`, `.pd-hero`, `.pd-gallery`, `.pd-gallery-img`, `.pd-action-*`, `.pd-price-summary*`, `.pd-mini-*`, `.pd-card`, `.pd-chips`, `.pd-chip`, `.pd-cta-primary`
 - From: Previous modal styling used a simpler top bar and standard card spacing with less hierarchy between inquiry actions and summary details.
 - To: Applied token-driven, reference-inspired hierarchy with stronger header treatment, compact notice row, tighter hero density, stacked CTA presentation, and denser summary/detail surfaces while keeping mobile-first spacing and sticky conversion CTA behavior.

## v.1.0.00.366 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Centered list-view card images properly by constraining the media frame height and centering the contained image, removing the top-heavy empty space.

### Changes (detailed)

#### Changed
- src/App.css
 - `.property-list-media`, `.property-list-card .list-card-img`
 - From: Image element stretched with row height (`height: 100%` against a taller shell), causing visible blank area and off-center placement even with `object-fit: contain`.
 - To: Fixed media frame height (`118px`) with flex centering; image keeps `object-fit: contain` plus explicit `object-position: center center` for true centering.

## v.1.0.00.365 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Adjusted list-view property card images to fit fully inside the media area instead of cropping.

### Changes (detailed)

#### Changed
- src/App.css
 - `.property-list-card .list-card-img`
 - From: Inherited `object-fit: cover`, which cropped portions of listing images.
 - To: Uses `object-fit: contain` with a light backdrop (`#d9eaf5`) so the full image is visible while preserving aspect ratio.

## v.1.0.00.364 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Reverted bottom-nav icon/label colors from green/teal back to neutral grey styling as requested.

### Changes (detailed)

#### Changed
- src/App.css
 - `.app-bottom-nav-item`, `.app-bottom-nav-item:hover`, `.app-bottom-nav-item.has-favorites:not(.active)`, `.app-bottom-nav-item.active`
 - From: Primary-family nav colors (`--bb-primary-soft`/`--bb-primary`) with primary-muted active background, which rendered tabs green/teal.
 - To: Neutral nav colors (`--bb-text-muted`/`--bb-text`) with `--bb-border` active background for grey visual treatment.

## v.1.0.00.363 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Unified Home/Search/Results page backgrounds to one universal blue by driving all major page surfaces through `--bb-surface` and removing conflicting hardcoded blue variants.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` `--bb-surface`
 - From: `#f6e5cc` (sand background), which caused mixed sand/blue page surfaces.
 - To: `#e3f2fd` as the universal page background token.

#### Changed
- src/App.css
 - `.search-page.search-page-landing`, `@media (max-width: 767.98px) .results-area`, `.results-portal-block.results-portal-summary`
 - From: Hardcoded backgrounds (`#e3f2fd`, `#b2d5f3`) separate from shared surface token, producing two blue tones.
 - To: Backgrounds now use `var(--bb-surface)` so Home/Search/Results share one consistent blue surface.

## v.1.0.00.362 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Unified bottom nav colors to a single primary-blue family so tabs no longer mix blue and orange accent states.

### Changes (detailed)

#### Changed
- src/App.css
 - `.app-bottom-nav-item`, `.app-bottom-nav-item:hover`, `.app-bottom-nav-item.has-favorites:not(.active)`
 - From: Inactive/hover nav item colors used general text tokens (`--bb-text-muted` / `--bb-text`) that could drift from nav palette.
 - To: Inactive/hover nav items use primary-family tokens (`--bb-primary-soft` / `--bb-primary`) for consistent hue.

#### Changed
- src/App.css
 - `.app-bottom-nav-item.active`
 - From: Active used mixed accent styling (`color: var(--bb-accent)`, `background: var(--bb-border)`).
 - To: Active uses primary scheme (`color: var(--bb-primary)`, `background: var(--bb-primary-muted)`).

#### Changed
- src/App.css
 - `.app-bottom-nav-messages`, `.app-bottom-nav-messages:hover`
 - From: Messages pill used accent tokens (`--bb-accent` / `--bb-accent-hover`) and appeared as a separate color system.
 - To: Messages pill uses primary tokens (`--bb-primary` / `--bb-primary-soft`) to match the same nav palette.

## v.1.0.00.361 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Applied the provided Hawaii palette across the app by remapping global theme tokens (`:root` CSS variables) so the new colors propagate sitewide without rewriting component styles.

### Changes (detailed)

#### Changed
- src/App.css
 - `:root` palette tokens (`--bb-primary`, `--bb-primary-soft`, `--bb-primary-muted`, `--bb-accent`, `--bb-accent-hover`, `--bb-accent-light`, `--bb-price`, `--bb-price-soft`, `--bb-surface`, `--bb-border`, `--bb-text`, `--bb-text-muted`, `--bb-success`, `--bb-success-soft`, `--bb-warning`, `--bb-danger`, `--bb-section-1..5`)
 - From: Previous teal/neutral palette values.
 - To: Hawaii-inspired mapping using requested colors (`#2396c8`, `#f6e5cc`, `#db9c46`, `#279583`, `#aebe76`, `#afd7ea`, `#144c89`, `#8b3724`) and matching derived muted/hover values.

#### Changed
- src/App.css
 - `html` tap highlight color
 - From: `rgba(13, 115, 119, 0.15)`.
 - To: `rgba(35, 150, 200, 0.2)` to match the new primary hue.

## v.1.0.00.360 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Centered the sort-direction arrows alongside the `Newest first` label so icon + text read as one centered group in the mobile sort pill.

### Changes (detailed)

#### Changed
- src/App.css
 - `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select-arrows`
 - From: Arrow icon was fixed near the far-left edge (`left: 9px`), visually unbalancing the centered label.
 - To: Arrow icon is positioned relative to control center (`left: calc(50% - 50px)` with `transform: translate(-50%, -50%)`) so it aligns with the centered label group.

## v.1.0.00.359 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Corrected centering for the mobile `Newest first` sort pill by centering the selected value text itself, not just symmetric padding.

### Changes (detailed)

#### Changed
- src/App.css
 - `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select`
 - From: Symmetric padding only; selected label still rendered left-aligned by native select text flow.
 - To: Added `text-align: center` and `text-align-last: center` so the visible sort label is truly centered within the pill.

## v.1.0.00.358 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Centered the internal spacing of the mobile `Newest first` sort pill so icon/text appear visually balanced.

### Changes (detailed)

#### Changed
- src/App.css
 - `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select`
 - From: Asymmetric horizontal padding (`6px 12px 6px 26px`) made content read left-heavy.
 - To: Balanced horizontal padding (`6px 26px 6px 26px`) to center the visible spacing around the sort label.

## v.1.0.00.357 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Aligned lateral spacing between the top search action buttons row and the œSearch results / sort row on mobile results.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-area > .sort-bar.sort-bar-portal-strip`
 - From: `.sort-bar.sort-bar-portal-strip { padding: 0; }` overrode mobile inset rules, so the sort row sat wider than the top action row.
 - To: Added explicit left/right safe-area-aware inset (`max(12px, env(safe-area-inset-*, 0px))`) so both rows share the same horizontal spacing.

## v.1.0.00.356 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Removed the nested `results-results-panel` layer and applied explicit blue ownership for mobile results: summary/filter strip uses `#b2d5f3`, while the full results canvas uses `#e3f2fd`.

### Changes (detailed)

#### Removed
- src/App.js
 - `AppContent` results branch (`hasSearched && !showMyPropertiesOnly`)
 - Removed: `<section className="results-results-panel">` wrapper; `SortBar`, listing/map content, and loading/empty blocks now render directly in `results-area`.

#### Removed
- src/App.css
 - `.results-results-panel` (mobile/base/desktop), `.results-results-panel .property-card`, `.results-results-panel .property-list-card`, `.app-has-bottom-nav .results-area:has(.results-results-panel)`
 - Removed: Wrapper-coupled panel styling and `:has`-based bottom-padding override tied to the deleted panel.

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` `.results-area`, `.results-portal-block.results-portal-summary`, `.results-area > .sort-bar`
 - From: Summary area used transparent/derived background and sort-bar inset skipped `sort-bar-portal-strip`, with styles depending on panel wrapper.
 - To: `results-area` keeps full-canvas `#e3f2fd`, summary strip is explicit `#b2d5f3`, and all direct sort bars receive horizontal inset to keep alignment after wrapper removal.

## v.1.0.00.355 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Made the blue search summary zone continuous by restoring the mobile results canvas to blue and removing redundant summary background paint.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` `.results-area`, `.results-portal-block.results-portal-summary`
 - From: `results-area` background was white while summary block painted blue, which could leave white seams around the summary region.
 - To: `results-area` background restored to `#e3f2fd` and summary block background set to transparent, so blue remains continuous from under the nav/header to the top edge of the white results panel.

## v.1.0.00.354 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Removed the remaining white strip between the blue search summary zone and the white results panel by clearing the panel™s top padding on mobile.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` `.results-results-panel`
 - From: `padding-top: 12px` (via `padding: 12px 0 0`) created a visible white band directly below the blue summary block.
 - To: `padding-top: 0` (via `padding: 0`) so the blue summary area meets the panel boundary cleanly.

## v.1.0.00.353 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Extended the blue search summary zone to start directly under the navigation/header by removing the mobile top inset on the results scroll area.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` `.results-area`
 - From: Mobile `results-area` kept inherited `padding-top: 12px`, leaving a white strip above the blue summary block.
 - To: Added `padding-top: 0` so the blue summary background reaches from the nav/header boundary down to the top of the white results panel.

## v.1.0.00.352 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Reverted the top search summary/options area on mobile results back to the original blue canvas while keeping the listings/results panel white.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` `.results-portal-block.results-portal-summary`, `.results-results-panel`
 - From: Summary/options strip inherited the white results canvas and the panel started with an `8px` top gap.
 - To: Summary/options strip uses `background: #e3f2fd` with top/bottom padding; results panel starts immediately below (`margin-top: 0`) so the top area reads as a blue header zone above white listings.

## v.1.0.00.351 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Results screens now use a full white mobile canvas (no blue background bleed), and list cards no longer show the `Live` badge for approved listings.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` `.results-area`
 - From: Mobile results canvas used `background: #e3f2fd`, causing blue to show around/behind cards.
 - To: Mobile results canvas uses `background: var(--bb-surface-elevated)` so the entire background stays white.

#### Changed
- src/components/PropertyListCard.js
 - `PropertyListCard` (`statusLabel`)
 - From: `approved` status mapped to `Live`, rendering the badge on list cards.
 - To: `approved` status maps to `null`, removing only the `Live` badge while preserving `Pending`, `Rejected`, and `Unlisted` badge behavior.

## v.1.0.00.350 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Restyled list-view property cards to match the second reference design: compact top title strip, horizontal image/details body, tighter chip-style specs/tags, and a bottom contact bar with a separate favorite button.

### Changes (detailed)

#### Changed
- src/components/PropertyListCard.js
 - `PropertyListCard`
 - From: Large, stacked list card with boxed spec grid and lower meta/action layout.
 - To: Compact card structure with top title/status row, smaller media/details region, compact spec chips, and footer action row using an orange contact CTA + favorite button.

#### Changed
- src/App.css
 - `.property-list-*` selectors (layout and visual styles)
 - From: Spacious vertical composition, larger image minimums, card-body padding, and generic button/chip styling.
 - To: Dense horizontal composition with tighter spacing, reduced image height, compact chips/tags, card-body reset, and SUUMO-like CTA styling for list cards.

## v.1.0.00.349 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Added mobile top safe-area spacing for no-header screens so content clears the phone system/status bar: Search landing/categories, Home landing, Admin header, and Confirm Email page.

### Changes (detailed)

#### Added
- src/App.css
 - `:root`
 - Added: `--bb-safe-top: env(safe-area-inset-top, 0px)` token for consistent top safe-area spacing.

#### Fixed
- src/App.css
 - `.search-page.search-page-landing`, `.search-page.search-page-categories`
 - From: No explicit top safe-area offset, so top content could sit under the system bar on notched devices.
 - To: Added `padding-top: var(--bb-safe-top)` so the page content starts below the status bar.

#### Fixed
- src/App.css
 - `.home-page`, `.admin-header`, `.confirm-email-page`
 - From: Top padding used fixed values only (`0`, `1rem`, `24px`) without safe-area inset support.
 - To: Added safe-area-aware top spacing using `var(--bb-safe-top)` (`home-page` top padding, `admin-header` top padding, `confirm-email-page` top padding).

## v.1.0.00.348 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Fixed** broken Search category layout: page header and category cards now stack vertically again (no split left blank column / right compressed content).

### Changes (detailed)

#### Fixed
- src/App.css
 - `.search-page.search-page-landing`, `.search-page.search-page-categories`
 - From: Inherited **row flex** layout from `.home-page`, causing `PageHeader` and content to render side-by-side.
 - To: Explicit **`flex-direction: column`** + **`align-items: stretch`** so header stays on top and content takes full width below.

## v.1.0.00.347 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Removed** the **Recently viewed** block from **sale / rent / my-properties** results (horizontal strip under the listing grid). **Deleted** **`RecentlyViewedCard`**; **removed** related **`.recently-viewed-*`** styles. **`RecentlyViewedProvider`** / **`addView`** on listing and property detail views **unchanged** (API / local storage tracking can remain).

### Changes (detailed)

#### Removed
- src/components/RecentlyViewedCard.js
 - `RecentlyViewedCard`
 - Removed: Component file (no remaining imports).

#### Removed
- src/App.js
 - `AppContent`
 - Removed: **`RecentlyViewedCard`** import, **`recentListings`** **`useMemo`**, **`handleOpenProperty`**, both **`<section className="recently-viewed-section">`** blocks.

#### Removed
- src/App.css
 - `.recently-viewed-*`, desktop override block, mobile **`.results-area > .recently-viewed-section`**
 - Removed: Styles for the removed UI.

## v.1.0.00.346 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Mobile** layout: **removed** the **`padding-bottom`** on **`.app-with-bottom-nav.app-has-bottom-nav`** that sat **below** **`app-main`** and showed as an **empty strip** (often **teal/primary** through transparent layers) **above** the fixed bottom nav. **Bottom nav clearance** now lives **inside** scrolling surfaces (**`.app-has-bottom-nav .page-content`**, **`.app-has-bottom-nav .menu-page .menu-page-body`**, existing **`.results-area`** / **panel** rules). **Search results** listing **cards** inside **`.results-results-panel`** use **square corners** on mobile so the last card no longer reads as a rounded œsheet above the gap.

### Changes (detailed)

#### Changed
- src/App.css
 - `.app-with-bottom-nav.app-has-bottom-nav`
 - From: **`padding-bottom: calc(var(--bb-bottom-nav-base) + env(safe-area-inset-bottom, 0px))`** (reserved space **outside** the scroll column, visible as a gap strip).
 - To: **`padding-bottom: 0`**; scroll areas own the clearance.

#### Added
- src/App.css
 - `.app-has-bottom-nav .page-content`, `.app-has-bottom-nav .menu-page .menu-page-body`
 - Added: **`padding-bottom: calc(16px + var(--bb-bottom-nav-base) + env(safe-area-inset-bottom, 0px))`** so pages with **`page-content`** / **menu** body scroll keep content above the nav after the wrapper change.

#### Added
- src/App.css
 - `.app-has-bottom-nav .page-content.settings-page-content`
 - Added: **`padding-bottom: calc(2rem + var(--bb-bottom-nav-base) + env(safe-area-inset-bottom, 0px))`** because **`.settings-page-content`** uses **`padding` shorthand** and would otherwise **drop** nav clearance.

#### Added
- src/App.css
 - `@media (max-width: 767.98px)` **`.results-results-panel .property-card`**, **`.property-list-card`**
 - Added: **`border-radius: 0`**, lighter **flat** shadow so listing tiles match the square results strip.

## v.1.0.00.345 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Mobile** main-search **white results panel** (`.results-results-panel`): **square corners** (no card radius/shadow), **top border only**; **bottom nav clearance** moved **into** the panel so the white area **fills to the bottom nav** without a sky-blue / primary gap below the panel.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-results-panel` (base)
 - From: **`border-radius: 12px`**, full border, light shadow.
 - To: **`border-radius: 0`**, **no** side/bottom border, **top** separator only, **no** box-shadow.

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` **`.results-results-panel`**, **`.app-has-bottom-nav .results-area:has(.results-results-panel)`**
 - From: Panel bottom padding **16px**; **`.results-area`** kept global **`padding-bottom`** for bottom nav (gap of canvas color below short white panel).
 - To: **`padding-bottom: 0`** on **`.results-area`** when the panel is present; panel gets **`padding-bottom: calc(16px + var(--bb-bottom-nav-base) + env(safe-area-inset-bottom, 0px))`**; **`flex: 1 1 auto`**; flat borders (no shadow).

## v.1.0.00.344 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Search** (`/search`) is a **two-step** flow: **Rent** / **Buy** landing (large cards on sky-blue canvas), then the existing **City / Map / Keyword / School** grid with **`listingType`** set by the first step. **Removed** the **For Sale / For Rent** toggle from the search flow. **URL** `?listingType=sale|rent&step=categories` selects the second step; **Edit search** and **results back** navigate to that URL so users skip re-picking rent vs sale.

### Changes (detailed)

#### Added
- src/pages/SearchPage.js
 - `SearchPage`
 - Added: Landing sections **Rent** / **Buy**, help banner, **`useSearchParams`** for **`step`** + **`listingType`**; category step keeps **`handleCardClick`** / **`submitSearch`** for map.

#### Changed
- src/pages/SearchPage.js
 - `SearchPage`
 - From: Single view with **`ListingTypeToggle`** and four category cards.
 - To: Landing first; **`ListingTypeToggle`** removed; category view shows hint line and **`PageHeader`** back to landing.

#### Changed
- src/App.js
 - `PageHeader` **`onBack`**, **Edit search** button
 - From: **`navigate('/search')`**.
 - To: **`navigate(\`/search?listingType=${listingType}&step=categories\`)`**.

#### Added
- src/App.css
 - `.search-page-landing`, `.search-landing-*`, `.search-page-categories`, `.search-page-inner`, `.search-page-categories-hint`
 - Added: SUUMO-style spacing: white cards, circular icon wells, banner block.

## v.1.0.00.343 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Mobile** search results use **full-width** layout: **`.results-area`** horizontal padding is **safe-area only** (removed the old **`max(20px, ¦)`** gutters); **`.results-results-panel`** is **edge-to-edge** white with **inner** padding; **summary** strip uses matching horizontal inset. **Non“main-search** direct children (**SortBar**, **listing grid**, etc.) get explicit horizontal inset so **My properties** and similar flows stay readable.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (max-width: 767.98px)` **`.results-area`**, **`.results-portal-summary`**, **`.results-results-panel`**
 - From: Page-wide **14px** / **`max(20px)`** side padding and inset white œcard panel.
 - To: **Full-bleed** canvas and white panel (**`border-radius: 0`**, no side borders); content padding **`max(12px, env(safe-area-inset-*))`** on summary and panel; removed duplicate **`max(20px)`** rule from the **`max-width: 767px`** overscroll block.

#### Added
- src/App.css
 - `@media (max-width: 767.98px)` selectors for **`.results-area >`** **`.search-now-empty`**, **`.my-properties-bar`**, **`.sort-bar:not(.sort-bar-portal-strip)`**, **`.listing-grid`**, **`.recently-viewed-section`**, **`.text-center.py-4`**, **`.text-center.py-5`**
 - Added: Horizontal inset for routes that are not wrapped by **`.results-results-panel`**.

## v.1.0.00.342 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Main search results** split into two sections: a top **summary** strip (kicker, criteria, tags, **Edit search** / **Edit filters**) on the existing results canvas, and a **white** **`.results-results-panel`** starting at the **SortBar** (œSearch results ¦) through listings, recently viewed, loaders, and search empty states. **My properties** keeps the previous layout (no white panel).

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent` results markup when `hasSearched && !showMyPropertiesOnly`
 - From: One **`results-portal-block`** wrapped summary **and** **`SortBar`**; map/grid and empties were siblings below the ternary.
 - To: **`results-portal-summary`** section (criteria + actions only), then **`results-results-panel`** with **`SortBar`**, map/grid, recently viewed, load-more, search loading, and school/generic empty states; filters modal unchanged.
 - Secondary branch **`(!hasSearched || showMyPropertiesOnly)`** renders **`SortBar`** (else) plus map/grid/load-more and **My properties** empty only.

#### Added
- src/App.css
 - `.results-portal-block.results-portal-summary`, `.results-results-panel` (+ desktop tweaks)
 - Added: White card panel with **`flex: 1`**, border/shadow; summary **`margin-bottom: 0`** to avoid double gap.

## v.1.0.00.341 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Edit filters** opens the advanced filters (keyword/school, price slider, more filters) in a **popup modal** (`createPortal` to **`document.body`**): backdrop + close, **Escape** to dismiss, **Apply** runs the search and **closes** the modal. Inline expansion below the sort bar was removed.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent`
 - From: **`showAdvancedFilters`** toggled an inline **`.results-filters-wrap`** panel under the portal **`SortBar`**.
 - To: **`closeFiltersModal`**, **`useEffect`** (body **`overflow: hidden`**, **Escape**), **`createPortal`** rendering **`auth-modal filters-modal`** with **`modal-header`** (œFilters) / **`modal-body`**, same filter markup inside **`results-filters-wrap--modal`**; **Edit filters** always opens the dialog (**`aria-haspopup="dialog"`**).

#### Added
- src/App.css
 - `.results-filters-wrap--modal`, `.filters-modal` / `.filters-modal-dialog` / `.filters-modal-body`
 - Added: Modal sizing and flat inner wrap so the filters are not double-card; **`max-height`** on **`.modal-content`** for scrollable body.

#### Removed
- src/App.css
 - `.results-portal-block .results-filters-wrap`
 - Removed: No longer used (filters are not nested under the portal block).

## v.1.0.00.340 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Edit search** / **Edit filters** labels use **regular** font weight (**`400`**); **Font Awesome** icons keep **`font-weight: 900`** so glyphs render correctly.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-block .results-portal-actions button.results-portal-btn`, `span`, `i`
 - From: Button and label text **`font-weight: 700`**; icon rules had no explicit weight.
 - To: Button and **`span`** **`400`**; **`i`** **`900 !important`** for FA solid icons.

## v.1.0.00.339 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Edit search** / **Edit filters** portal buttons use **rounder corners** via **`border-radius: var(--bb-radius-pill)`** instead of **`6px`**.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-block .results-portal-actions button.results-portal-btn`
 - From: **`border-radius: 6px`**.
 - To: **`border-radius: var(--bb-radius-pill)`** (`9999px` capsule / pill shape for the 26px-tall buttons).

## v.1.0.00.338 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Results **criteria** summary box (province“city + price) uses a **white** background and **regular** font weight for both lines; border uses **`var(--bb-border)`** for contrast on white.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-criteria-bar`, `.results-criteria-bar-location`, `.results-criteria-bar-price`
 - From: Light blue-grey **`#d1e1e9`** background; location **`font-weight: 700`**, price **`600`**; tinted border.
 - To: **`background: #fff`**, **`font-weight: 400`** on location and price, **`border: 1px solid var(--bb-border)`**.

## v.1.0.00.337 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Removed** the grid / list / map **view toggle** from **`SortBar`** entirely (not relocated). Results still use **`viewMode`** state for **grid vs list**; the dedicated **Map** search flow (`view === 'map'` from search) still shows **`MapView`**. Deleted **`btn-view-mode`** / **`.view-mode-toggle`** CSS and the **`btn-view-mode`** exception in **`index.css`** min-height rules.

### Changes (detailed)

#### Removed
- src/components/SortBar.js
 - `SortBar({ viewMode, onViewModeChange, showViewToggle, ... })`
 - Removed: The **view-mode-toggle** block (grid / list / map buttons) and the related props.

#### Changed
- src/App.js
 - `SortBar` usages (portal and default)
 - From: Passed **`viewMode`**, **`onViewModeChange`**, and **`showViewToggle`**.
 - To: Sort-only props; removed **`handleViewModeChange`** callback.

#### Removed
- src/App.css
 - `.view-mode-toggle`, `.btn-view-mode` (and variants), compact/portal/desktop overrides tied to those classes.

#### Changed
- src/index.css
 - Global **`min-height: 44px`** rule for buttons
 - From: Excluded **`.btn-view-mode`**.
 - To: That exclusion removed (class no longer used).

## v.1.0.00.336 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Removed the **list / map** segmented control from the **mobile page header**; **list / map** (and grid on desktop) remain on the **portal SortBar** row, with **`showViewToggle`** enabled on mobile so view switching is still available below the sort dropdown.

### Changes (detailed)

#### Removed
- src/App.js
 - `PageHeader` `right` slot (`page-header-view-toggle` with list/map `btn-view-mode` buttons)
 - Removed: Duplicate view toggle in the header on small screens.

#### Changed
- src/App.js
 - `SortBar` (`variant="portalStrip"`)
 - From: `showViewToggle={!isMobile}` (header carried list/map on mobile).
 - To: `showViewToggle` (true): portal strip shows the view toggle on all breakpoints.

#### Removed
- src/App.css
 - `.page-header-right:has(.page-header-view-toggle)`, `.page-header-view-toggle` and nested `.btn-view-mode` rules
 - Removed: Styles only used by the deleted header control.

## v.1.0.00.335 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- **Edit search** / **Edit filters** in the results portal now use **fixed 26px height** and **px-based typography** with **`!important`** so they reliably beat global button styles; **restored** the portal **sort** pill to a **readable** size (â‰ˆ34px min-height, `0.75rem` text) and scoped **â†•** arrow styling to the portal strip only.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-block .results-portal-actions button.results-portal-btn` (and `i` / `span`)
 - From: `rem`-sized text and padding without forced height; rules could lose to other button styles, so the row still looked tall.
 - To: `height` / `min-height` / `max-height: 26px`, `padding: 0 8px`, `font-size: 11px` with `!important` where needed for layout-critical properties.
- src/App.css
 - `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select`, `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select-arrows`
 - From: Shrunk sort control (`min-height`/`padding`/`font-size` tuned for a compact pill).
 - To: `min-height: 34px`, `padding: 6px 12px 6px 26px`, `font-size: 0.75rem`; arrows scoped under portal shell with `left: 9px`, `font-size: 0.65rem`.

## v.1.0.00.334 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Further **shrunk** portal **Edit search** / **Edit filters** (smaller font and horizontal padding); moved sort **â†•** affordance to the **left** of the label in `SortBar` and fixed portal sort `<select>` to use **`min-height: 0`** and **left padding** so it overrides global **`.sort-select { min-height: 34px }`**.

### Changes (detailed)

#### Changed
- src/components/SortBar.js
 - `SortBar` portal strip branch
 - From: Arrows `<span>` after `<select>`.
 - To: Arrows before `<select>` so the icon reads before the current sort label.
- src/App.css
 - `.results-portal-block .results-portal-actions button.results-portal-btn`, `.sort-bar.sort-bar-portal-strip .sort-select-shell--portal .sort-select`, `.sort-select-arrows`
 - From: Tall sort pill (28px / inherited 34px) with right-side arrows; larger action buttons.
 - To: `0.4375rem` action text, `0.48rem` icons, `padding: 0 4px`; portal select uses long selector, `min-height: 0`, `padding: 1px 8px 1px 20px`, arrows `left: 7px`.

## v.1.0.00.333 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Made portal **Edit search** / **Edit filters** buttons **shorter**: removed fixed min-height, use **`padding: 1px 6px`** with **line-height: 1**, smaller radius, **`align-items: center`** on the actions row (was `stretch`).

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-actions`, `.results-portal-block .results-portal-actions button.results-portal-btn`, `span`/`i`
 - From: `min-height: 26px`, `padding: 3px 6px`, `line-height: 1.2`, row `align-items: stretch`.
 - To: `min-height: 0`, `height: auto`, `padding: 1px 6px`, `line-height: 1`, tighter gap/radius, row `align-items: center`.

## v.1.0.00.332 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Removed **night / dark mode**: `ThemeProvider` always sets **`data-theme="light"`**, clears stored theme preference, and **`useTheme()`** only exposes `{ theme: 'light' }`; removed the Settings **Appearance** (System / Light / Dark) section; deleted **`[data-theme="dark"]`** CSS variable overrides and component-specific dark rules; removed unused **`.settings-theme-*`** styles.

### Changes (detailed)

#### Changed
- src/context/ThemeContext.js
 - `ThemeProvider`, `useTheme()`
 - From: System/light/dark preference, `effectiveDark`, `isDesktop`, and `matchMedia` for OS dark mode.
 - To: Always applies `data-theme="light"`, clears `localStorage` `balhinbalay_theme`, sets theme-color meta; `useTheme()` returns `{ theme: 'light' }`.
- src/pages/SettingsPage.js
 - `SettingsPage`
 - From: Appearance block with theme buttons using `useTheme` / `setTheme`.
 - To: Section removed; no theme import.

#### Removed
- src/context/ThemeContext.js
 - From: `system` / `dark` / `isDesktop`-gated `effectiveDark`, `matchMedia`, and `setTheme` persistence.
 - To: Single light-theme effect (night mode removed).
- src/App.css
 - `[data-theme="dark"]` root and body, portal/results/criteria/sort dark overrides, `.settings-theme-options` / `.settings-theme-btn*`
 - Removed: Dark theme styling and theme picker CSS.

## v.1.0.00.331 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Fixed portal action buttons not visually updating: styles now target **`.results-portal-block .results-portal-actions button.results-portal-btn`** so **font-size, padding, and min-height** override Bootstrap™s global `button` reboot; added `line-height`, `appearance`, and `span`/`i` sizing; outline/solid variants use the same scoped selectors.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-actions`, `.results-portal-btn` → scoped `button.results-portal-btn` rules; `.results-portal-btn--outline` / `--solid`
 - From: Class-only selectors could lose the cascade to Bootstrap `button` defaults, so sizes looked unchanged.
 - To: Higher-specificity selectors with explicit `line-height`, `box-sizing`, and nested `span`/`i` font rules.

## v.1.0.00.330 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Made **Edit search** / **Edit filters** more compact (lower min-height, padding, and font size) and reduced **criteria bar** typography (location and price lines) plus slightly tighter bar padding.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-btn`, `.results-portal-actions`, `.results-criteria-bar`, `.results-criteria-bar-location`, `.results-criteria-bar-price`, desktop media for `.results-criteria-bar` and `.results-portal-actions`
 - From: Buttons at 32px min-height / 0.65rem; criteria location 0.8rem and price 0.68rem.
 - To: Buttons 28px min-height, 0.58rem text, smaller icons; criteria location 0.7rem, price 0.6rem, less padding inside the box.

## v.1.0.00.329 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Further reduced portal typography; fixed **Edit search / Edit filters** contrast in dark theme by using **dark text (#1d1d1f)** on light button surfaces (and light grey fills in dark mode); removed **background, border, and radius** from the results count + sort row (`.sort-bar-portal-strip`); tightened sort pill and dark-theme sort colors for readability.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-kicker`, `.results-criteria-bar*`, `.results-portal-tag`, `.results-portal-btn*`, `.sort-bar-portal-strip`, `.results-count-portal*`, `.sort-select-shell--portal`
 - From: Smaller but still large type; outline buttons used `var(--bb-text)` on `#fff`, which became invisible in dark theme; sort row was a white/dark card; sort select text followed theme on light background.
 - To: Another step down in font sizes and padding; outline buttons force `#1d1d1f` on label/icon with `[data-theme="dark"]` light-grey fills; portal strip is transparent with no border/radius/padding; sort select uses explicit light/dark foreground colors; arrow tint in dark theme.

## v.1.0.00.328 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Tuned the mobile results portal to match the reference: **Properties for Sale / Rent** label, smaller typography, sky-blue **#e3f2fd** results background, neutral outlined **Edit search** and **Edit filters** (no teal fill), compact sort strip with white pill select and **up/down** arrow affordance, and tighter criteria bar spacing.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: Kicker read œSale properties / œRental properties; Edit filters used solid teal `results-portal-btn--solid`.
 - To: Kicker reads œProperties for Sale / œProperties for Rent; Edit filters uses `results-portal-btn--outline` to match Edit search.
- src/components/SortBar.js
 - `SortBar` portal strip branch
 - From: Bare `<select>` for sort order.
 - To: Wrapped portal sort in `sort-select-shell--portal` with `fa-arrows-alt-v` to signal a changeable control.
- src/App.css
 - `.results-area` (mobile), `.results-portal-kicker`, `.results-criteria-bar*`, `.results-portal-btn*`, `.results-portal-tag`, `.results-count-portal*`, `.sort-bar-portal-strip`, `.sort-select-shell--portal`, `.page-header-view-toggle .btn-view-mode`
 - From: Teal-bordered action buttons, larger type, gradient results background, teal secondary button, sort strip without arrows.
 - To: Smaller fonts, sky-blue flat mobile background (dark theme unchanged intent), white/neutral outline buttons, white sort strip and select pill with custom arrow icon, compact counts.

## v.1.0.00.327 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Implemented the criteria bar + SUUMO-style flow: a light blue results panel shows **Province “ City** (and search/school/keyword fallbacks) with **price range** on the bottom; filter chips remain below; mobile list/map toggles moved to the page header; the portal `SortBar` is sort-only on mobile while desktop keeps the full view controls.

### Changes (detailed)

#### Added
- src/utils/searchCriteriaFormat.js
 - `formatPriceCompact(value, sliderMax)`
 - `formatSearchPriceRangeLine(min, max, listingType, sliderMax)`
 - Added: Shared compact â‚± formatting for the criteria bar, aligned with PriceSlider-style thresholds.

#### Changed
- src/App.js
 - `AppContent()`
 - From: Portal summary used icon rows, meta text, and sort hint inside the card; `SortBar` portal strip included list/map toggles.
 - To: `criteriaProvinceCity` and `criteriaPriceLabel` drive a `results-criteria-bar`; `handleViewModeChange` is shared; `PageHeader` `right` on mobile shows list/map; `SortBar` uses `showViewToggle={!isMobile}` with `variant="portalStrip"` on results.
- src/components/SortBar.js
 - `SortBar({ ..., showViewToggle })`
 - From: View toggle always rendered.
 - To: `showViewToggle` (default `true`) hides the grid/list/map cluster when false (sort-only strip).
- src/App.css
 - `.results-criteria-bar`, `.results-criteria-bar-location`, `.results-criteria-bar-price`, `.page-header-view-toggle`, `.page-header-right:has(.page-header-view-toggle)`; removed unused portal summary-card row/meta rules; desktop tweak for `.results-criteria-bar`
 - From: No dedicated criteria panel; header right slot fixed width.
 - To: Criteria bar uses `#d1e1e9` in light theme and elevated surface in dark theme; header accommodates the view toggle width.

#### Removed
- src/App.css
 - `.results-portal-summary-card`, `.results-portal-row`, `.results-portal-icon`, `.results-portal-area`, `.results-portal-meta*`, `.results-portal-sort-hint`
 - Removed: Styles for the old summary card layout superseded by the criteria bar.

## v.1.0.00.326 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Tightened active-filter chips in the portal summary so they read as compact pills instead of tall tiles.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-portal-tags`, `.results-portal-tag`
 - From: Tags used large padding and square-ish corners, adding unnecessary height to the summary card.
 - To: Tags use pill radius, smaller padding, and tighter gaps to match the slim SUUMO-style density.

## v.1.0.00.325 — Development
Date: 2026-04-07
Type: Dev Change

### Summary
- Rebuilt the mobile results œportal header to match the SUUMO-style layout: one short kicker, a single elevated summary card (area line + meta Â· current sort), two full-contrast action buttons, and a separate slim results/sort strip—plus a light top tint on the results scroll area for separation without extra vertical stacking.

### Changes (detailed)

#### Added
- src/App.css
 - `.results-portal-block`, `.results-portal-kicker`, `.results-portal-summary-card`, `.results-portal-row`, `.results-portal-meta*`, `.results-portal-tags`, `.results-portal-btn*`, `.sort-bar-portal-strip`, `.results-count-portal*`
 - Added: Portal-specific layout and contrast rules so text and outline actions stay readable on light surfaces, and a dedicated thin strip for œSearch results + sort/view controls.

#### Changed
- src/App.js
 - `AppContent()`
 - From: The summary used nested `results-summary-*` blocks, a separate œArea label row, meta-only second row, embedded compact `SortBar`, and Bootstrap outline buttons that could read as low-contrast on the page background.
 - To: Markup uses `results-portal-*` with a two-line summary (meta and `getSortLabel(sortBy)` on one line), filter tags inside the card, `results-portal-btn` actions, and `SortBar` with `variant="portalStrip"` below the actions; `getSortLabel` is imported for the summary line.
- src/components/SortBar.js
 - `SortBar({ sortBy, viewMode, onSortChange, onViewModeChange, totalResults, isMyProperties, compact, variant })`
 - From: Only `default` and `compact` layouts; count was always the large number + word cluster.
 - To: Added `variant` (`default` | `compact` | `portalStrip`); `portalStrip` shows an inline œSearch results **N** properties cluster and hides the visible œOrder label via `visually-hidden`; `compact` still works when passed explicitly or via the legacy `compact` prop.
- src/App.css
 - `.results-area` (mobile gradient), removed prior `results-summary-card` / embedded-summary rules in favor of portal rules; `.results-portal-block .results-filters-wrap`; desktop `@media (min-width: 768px)` overrides for portal + sort strip
 - From: Tall stacked summary card, embedded compact sort inside the same card, and `sort-bar-compact` scoped only under `.results-summary-card`.
 - To: Shorter vertical rhythm, sort strip outside the summary card, freestanding `.sort-bar-compact` styles for any legacy use, and desktop reset of the mobile results-area gradient.

#### Removed
- src/App.css
 - `.results-summary-card`, `.results-summary-info-*`, `.results-summary-actions`, `.results-summary-pill*`, and related selectors removed from the stylesheet after the portal markup replaced them in `App.js`.
 - Removed: Unused summary-card CSS that duplicated the new portal block.

## v.1.0.00.324 — Development
Date: 2026-04-06
Type: Dev Change

### Summary
- Reshaped the mobile results header to match the SUUMO reference more closely by replacing the stacked detail tiles with a single compact info panel, tightening the action pills, and making the utility row read as one short block instead of several tall sections.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: The summary duplicated the search area in both the title and the utility tiles, and the action row used generic button content that still read taller than the reference layout.
 - To: The summary now uses a simple listing-type title, one combined search details card with icon-led rows, and clearer action pill labels/icons for editing the search and filters.
- src/App.css
 - `.results-summary-top`, `.results-summary-title`, new `.results-summary-info-*` selectors, `.results-summary-actions`, `.results-summary-action*`, and `.results-summary-pills`
 - From: The header still looked like multiple stacked cards, and the secondary action button could visually disappear against the shared button styles.
 - To: The header now reads as one compact info panel plus a short action row, with stronger button color overrides and tighter spacing that better follows the reference rhythm.

## v.1.0.00.323 — Development
Date: 2026-04-06
Type: Dev Change

### Summary
- Deduplicated embedded compact SortBar CSS so desktop tweaks live next to the base compact rules instead of a second block inside the general results-summary `@media (min-width: 768px)` section.

### Changes (detailed)

#### Changed
- src/App.css
 - `@media (min-width: 768px)` results-summary rules; `.results-summary-card .sort-bar.sort-bar-compact` (embedded compact sort row section)
 - From: Compact SortBar margin/padding were defined both in the wide desktop media block and again in the standalone embedded compact block, so cascade order could fight and the live page could look inconsistent.
 - To: Base compact SortBar styles stay in one place; desktop-only `margin-top` and `padding` for that bar sit in a small `@media` immediately after that block; the duplicate rule was removed from the general desktop results-summary media query.

## v.1.0.00.322 — Development
Date: 2026-04-06
Type: Dev Change

### Summary
- Finished the mobile compact results header CSS: utility tiles, embedded filter panel heading, integrated compact SortBar, tighter page/summary spacing, and a clearer œRecently viewed block after the listing grid.

### Changes (detailed)

#### Changed
- src/App.css
 - `.results-area`, `.results-summary-card`, `.results-summary-top`, `.results-summary-actions`, `.results-summary-action`, `.results-summary-pills`, `.results-filters-wrap`, `.recently-viewed-section`, `.recently-viewed-title`, and related selectors; new `.results-summary-utility-row` / `.results-summary-utility-item*` / `.results-summary-utility-label` / `.results-summary-utility-value*` / `.results-filters-header` / `.results-filters-title` / `.results-summary-card .sort-bar.sort-bar-compact` rules; desktop `@media (min-width: 768px)` overrides for the same.
 - From: New class names from `App.js` (`results-summary-utility-row`, embedded filters header, `sort-bar-compact`) had no styles; results area and summary still used looser padding; SortBar looked like a second full card inside the summary; œRecently viewed spacing did not reflect its position below listings.
 - To: Utility row renders as compact labeled tiles; œMore filters has a defined heading style; compact SortBar sits flush in the summary with smaller controls and no extra card shadow; mobile top/summary padding is reduced; recently viewed has a top border and adjusted margins after the grid; desktop restores slightly roomier summary and action heights.

## v.1.0.00.321 — Development
Date: 2026-04-03
Type: Dev Change

### Summary
- Compressed the results-page utility area so the summary, filter controls, and sort row take far less vertical space and the listing cards appear higher on screen while keeping the BalhinBalay theme and existing search behavior.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: The results summary still used a larger intro-style stack before the filters, which pushed the first listings too far down the screen.
 - To: The summary now uses a tighter utility layout with compact detail tiles and reduced duplicate copy so the page reaches the listings faster.
- src/App.css
 - Results summary, price slider, and sort bar selectors.
 - From: The summary card, slider area, and count/sort row used spacing and sizing that consumed too much mobile viewport height.
 - To: The utility area now uses smaller paddings, tighter chips, a shorter slider, and a denser results row to better match the compact SUUMO-style mobile rhythm without changing BalhinBalay colors.

## v.1.0.00.320 — Development
Date: 2026-04-03
Type: Dev Change

### Summary
- Shifted the results page away from the heavier mockup treatment into a flatter light-layout structure so the summary, results header, and cards follow the reference more closely while keeping BalhinBalay colors and existing sort behavior intact.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: The results summary used icon-led grouped blocks and more decorative action controls that still felt too heavy compared with the light reference.
 - To: The summary now uses simpler stacked area/sort lines and flatter action labels so the layout reads closer to the light SUUMO structure without changing search/filter behavior.
- src/components/SortBar.js
 - `SortBar(...)`
 - From: The results header still carried an extra kicker and a more emphasized card rhythm from the previous pass.
 - To: The results header now presents a flatter count-and-sort row that keeps the existing sort choices, including `Recommended`, but matches the lighter reference structure more closely.
- src/App.css
 - Results summary, results header, and property list selectors.
 - From: The results page styling still leaned on gradient-heavy, more elevated grouped cards from the darker interpretation of the mockup.
 - To: The page now uses flatter white surfaces, lighter shadows, tighter spacing, and simpler list-card treatments so the overall layout feels closer to the light reference while preserving the existing `--bb-*` theme palette.

## v.1.0.00.319 — Development
Date: 2026-04-03
Type: Dev Change

### Summary
- Corrected the earlier screenshot pass by reshaping the mobile results page much closer to the supplied mockup: larger grouped summary cards, tighter utility rows, and image-led property cards with the action controls integrated into the listing body while keeping BalhinBalay colors and sort behavior intact.

### Changes (detailed)

#### Changed
- src/components/PropertyListCard.js
 - `PropertyListCard(...)`
 - From: The previous screenshot pass still rendered the card like a generic portal listing with a separated footer/action treatment.
 - To: The list card now follows the mockup more closely with a title/status header, larger left image column, right-side fact tiles, tags under the facts, and the CTA/favorite controls embedded inside the card body.
- src/App.css
 - Results summary, results utility row, and property list selectors.
 - From: The previous screenshot-alignment styles were still too loose and app-like in spacing, grouping, and card rhythm.
 - To: The page now uses larger rounded summary/result cards, stronger grouped sections, more mockup-like spacing, and taller image-led list cards while preserving the existing BalhinBalay token palette.

## v.1.0.00.318 — Development
Date: 2026-04-03
Type: Dev Change

### Summary
- Aligned the `/sale` and `/rent` mobile results page more closely with the provided SUUMO screenshot by tightening the summary card, count/sort row, and property list density while keeping BalhinBalay colors and existing sorting behavior unchanged.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`
 - From: The refreshed results page used a broader summary card with pill-style metadata and a more app-like flow.
 - To: The top of the results page now uses a tighter screenshot-inspired mobile flow with stacked area/sort condition rows, compact action buttons, and filters grouped more like a property portal.
- src/components/SortBar.js
 - `SortBar(...)`
 - From: The results header used a generic portal-style count cluster and sort label.
 - To: The count and sort row now read more like the screenshot with a tighter utility-row treatment while preserving all existing sort values and behavior.
- src/components/PropertyListCard.js
 - `PropertyListCard(...)`
 - From: List cards used a denser portal layout, but still read more like a modern app card than the provided screenshot.
 - To: List cards now use a more screenshot-aligned hierarchy with a title/header row, compact image-details split, small spec grid, grouped tags, stronger bottom action row, and favorite action retained.
- src/components/PropertyCard.js
 - `PropertyCard(...)`
 - From: Grid cards matched the previous portal refresh but diverged from the tighter screenshot-inspired listing hierarchy.
 - To: Grid cards now better align with the updated list hierarchy by showing optional building specs while keeping existing favorite and detail actions.
- src/App.css
 - Results summary, sort row, and property card/list selectors.
 - From: Styling followed the earlier SUUMO-inspired refresh with broader spacing and a more generalized portal look.
 - To: Styling now more closely matches the supplied screenshot's compact spacing, grouped summary rows, practical utility header, and denser mobile card rhythm using the existing `--bb-*` theme tokens.

## v.1.0.00.317 — Development
Date: 2026-04-03
Type: Dev Change

### Summary
- Refreshed the `/sale` and `/rent` results experience with a denser SUUMO-inspired layout using the existing BalhinBalay palette, clearer search summary and results controls, and portal-style listing cards; added a visible `Recommended` sort option without removing or changing existing sort behavior.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()`, `mapSortByToApiSort(sortByValue)`
 - From: Results UI showed filters and sort controls as separate generic blocks, and only existing sort keys were exposed/mapped.
 - To: Results now render a compact summary card with search context, filter chips, current sort label, and compact actions above the results header; `recommended` is accepted as a UI sort key and safely aliases to the existing `newest` behavior.
- src/components/SortBar.js
 - `SORT_OPTIONS`, `getSortLabel(sortBy)`, `SortBar(...)`
 - From: Basic results count text plus a dropdown with `newest`, price, and size sorts only.
 - To: Practical portal-style results header with clearer count cluster, stronger sort control, and a new visible `Recommended` option while keeping all existing sort options.
- src/components/PropertyListCard.js
 - `PropertyListCard(...)`
 - From: Wider card with a simpler image/body split and sparse metadata.
 - To: Denser horizontal portal-style card with grouped tags, location/access line, price + rent fee summary, clearer specs/meta rows, favorite action, and a stronger CTA.
- src/components/PropertyCard.js
 - `PropertyCard(...)`
 - From: Standard vertical card with basic badges, location, and CTA.
 - To: More compact visual hierarchy aligned with the refreshed results page while preserving favorite and detail actions.
- src/App.css
 - Results summary, sort bar, listing card selectors.
 - From: Generic results filter card, lighter sort bar, and broader modern app card styling.
 - To: Mobile-first summary block, denser result controls, stronger CTA treatment, and portal-style list/grid card presentation using existing `--bb-*` theme tokens.

## v.1.0.00.316 — Development
Date: 2026-04-02
Type: Dev Change

### Summary
- Redirect `/sale` to `/search` on browser refresh when there is no active search state, so the app returns users to the search entry point instead of loading a stale or empty results page directly.

### Changes (detailed)

#### Changed
- src/App.js
 - `AppContent()` reload redirect effect
 - From: Refreshing on `/sale` reused the route directly even when no search state had been restored.
 - To: On browser reload only, `/sale` now redirects to `/search` when `hasSearched` is false; normal in-app navigation to `/sale` is unchanged.

## v.1.0.00.315 — Development
Date: 2026-04-02
Type: Dev Change

### Summary
- Reused the login-modal provider pattern for property details so in-app listing opens are controlled by one global `PropertyModal` instance instead of relying on the `/property/:id` route to mount and tear down the details view.

### Changes (detailed)

#### Added
- src/context/PropertyModalContext.js
 - `openProperty(propertyOrId, options)`, `closeProperty()`
 - Added: Provider-owned selected property state, globally rendered `PropertyModal`, chat/edit/delete wiring, unlist confirm modal, and auto-close when the underlying page route changes.

#### Changed
- src/App.js
 - `handleViewDetails(index)`, `handleOpenProperty(property)`, `MapView onPropertyClick`
 - From: `navigate('/property/:id', { state: { from } })` for in-app listing opens.
 - To: `openProperty(property, { from })` so search/list/map opens reuse the global modal lifecycle instead of route teardown.
- src/pages/SavedPage.js
 - `handleSelectProperty(property)`
 - From: `navigate('/property/:id', { state: { from } })`.
 - To: `openProperty(property, { from })` using the shared property modal provider.

## v.1.0.00.314 — Development
Date: 2026-04-02
Type: Dev Change

### Summary
- Hardened all main navigation exits from property details so desktop route changes cannot leave the app visually stuck on the property screen; added a route guard so `PropertyPage` renders only while the current pathname still matches that property.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - `navigateWithFallback(target, options)`, `handleLogoHome()`, `handleSearch()`, `handleOpenSavedSearches()`, logout redirect, sidebar/bottom-nav route handlers
 - From: Main navigation always used SPA `navigate(...)` directly.
 - To: When the current page is `/property/:id`, main navigation first uses SPA `navigate(...)` and then falls back to `window.location.assign(target)` only if the browser location remains stuck on the same property route.

#### Fixed
- src/pages/PropertyPage.js
 - `isActivePropertyRoute`, `handleBack()`
 - From: `PropertyPage` relied on route unmount alone and close fallback only covered the X button path.
 - To: `PropertyPage` now returns `null` unless the live pathname still matches `/property/:id`, and the same guarded navigation logic remains in the close handler for the X button path.

## v.1.0.00.313 — Development
Date: 2026-04-02
Type: Dev Change

### Summary
- Hardened property details close behavior so desktop close cannot loop back into another `/property/:id` route and falls back to a browser navigation only when SPA routing stays stuck; removed the viewport-fixed details CTA bar so the property UI cannot visually persist across other pages.

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js
 - `getCloseTarget()`, `handleBack()`
 - From: Accept any `location.state.from` path except the exact current pathname, then `navigate(target, { replace: true })` only.
 - To: Reject empty / invalid / `/property/*` return paths, keep SPA `navigate(...)` first, then use `window.location.assign(target)` only if the browser is still on the same property route after the SPA navigation attempt.

#### Fixed
- src/App.css
 - `.pd-cta-bar`, `.pd-scroll-pad`
 - From: Chat CTA used `position: fixed` with extra bottom spacer, which could visually linger over other pages if the property screen failed to unmount cleanly.
 - To: Chat CTA now stays in normal document flow inside the property details layout, and the extra fixed-bar spacer is reduced to a small content gap.

## v.1.0.00.312 — Development
Date: 2026-04-02
Type: Dev Change

### Summary
- Rebuilt property listing details UI with dedicated `pd-*` markup (toolbar, gallery, sections, overflow menu, bottom chat bar, report sheet) and matching CSS; removed Bootstrap `modal-header` / `modal-body` / carousel structure from this screen to avoid global modal conflicts and simplify layout.

### Changes (detailed)

#### Added
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(...)`
 - Added: `pd-shell` layout, sticky `pd-toolbar` with close/back, favorites + share + overflow menu (edit/unlist or report), custom `pd-gallery` with swipe + dots + arrows, `pd-card` / `pd-chips` / `pd-block` / `pd-contact`, fixed `pd-cta-bar` for chat, `pd-report-*` sheet (no global `.modal` on report root).

#### Changed
- src/App.css
 - Property detail section (former `.property-detail-*` + overlay flex rules).
 - From: Large block targeting `.property-detail-root`, `.property-detail-header.modal-header`, `.property-detail-body.modal-body`, carousel classes, `.property-report-modal-root`.
 - To: `.pd-*` rules for the same behaviors; overlay uses `.pd-shell` / `.pd-scroll`; report uses `.pd-report-root`; CTA bar positions above bottom nav on `/property/:id` route.

#### Removed
- src/App.css
 - `.property-detail-root`, `.property-detail-header`, `.property-detail-body`, `.property-detail-gallery`, `.property-detail-summary`, `.property-detail-spec-chip`, `.property-detail-section`, `.property-detail-contact-card`, `.property-detail-chat-btn`, `.property-detail-back-btn`, `.property-report-modal-root.report-listing-modal` (superseded by `pd-*`).

## v.1.0.00.311 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Restored SPA navigation when closing property details so search results and in-memory filter state are not lost (full `window.location.replace` remounted the app).

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js
 - `handleBack()`
 - From: `window.location.replace(target)` (full reload).
 - To: `navigate(target, { replace: true, state: {} })` so React state and context survive returning to `/sale` or `/rent`.

## v.1.0.00.310 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Made property details close reliably: raise sticky header stacking so the close control receives taps, stop propagation on close; exit details via `window.location.replace` so navigation works in WebView/Capacitor when SPA updates appear stuck.

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js
 - `handleBack()`
 - From: `navigate(target, { replace: true, state: {} })` only.
 - To: `window.location.replace(target)` for full document navigation.

#### Fixed
- src/App.css
 - `.property-detail-page-content .modal-header` z-index from 10 to 100 and `isolation: isolate`; `.property-modal-header-actions` `z-index: 101` and `flex-shrink: 0` so header controls are not covered by scrolling content.
- src/components/PropertyDetailContent.js
 - Close button `onClick`
 - From: `onClick={onClose}`.
 - To: `preventDefault` + `stopPropagation` + `onClose?.()`.

## v.1.0.00.309 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Replaced the property details route header back arrow with an explicit close button (X) so dismissing details uses one deterministic close action.

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js
 - `PropertyDetailContent` props in route render.
 - From: `showBackButton` enabled and `showCloseButton={false}`.
 - To: `showCloseButton` enabled and `showBackButton={false}`; close uses `handleBack()` target routing logic.

## v.1.0.00.308 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Fixed property details œmodal not dismissing after back by remounting the route outlet on navigation, using explicit navigate targets (no `navigate(-1)`), clearing route state, and scoping the report overlay away from the global `.modal` full-screen rule.

### Changes (detailed)

#### Added
- src/App.css
 - `.property-report-modal-root.report-listing-modal` positioning stack for the report dialog.

#### Changed
- src/components/MainLayout.js
 - `Outlet`
 - From: `<Outlet />`.
 - To: `<Outlet key={pathname + search} />` so leaving `/property/:id` always remounts the previous page (avoids stale UI).

#### Fixed
- src/pages/PropertyPage.js
 - `handleBack()`
 - From: Mixed `navigate(explicitFrom)`, `navigate(-1)`, and fallback.
 - To: Always `navigate` to `location.state.from` when valid, else `/sale` or `/rent`, with `replace: true` and `state: {}`.
- src/pages/PropertyPage.js
 - `handleConfirmUnlist()`
 - From: `navigate(-1)` after unlist (and briefly cleared listing before navigate).
 - To: Navigate explicitly to `/sale` or `/rent` from the captured listing; clear state consistently.

#### Changed
- src/components/PropertyDetailContent.js
 - Report overlay root `className`.
 - From: `modal report-listing-modal`.
 - To: `property-report-modal-root report-listing-modal` (avoids global `.modal { position: fixed; inset: 0 }` on the same subtree as listing details).

## v.1.0.00.307 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Fixed property details not closing after back/close by removing obsolete auto-open redirect logic that could reopen `/property/:id` right after navigation.

### Changes (detailed)

#### Removed
- src/App.js
 - `useEffect()` that watched `location.state?.openProperty` and redirected to `/property/${openProperty.id}`.
 - Removed: Legacy modal-open bridge from an older `/sale` state flow; it could conflict with current route-based details and make close/back appear stuck.

## v.1.0.00.306 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Fixed details close/back behavior by carrying an explicit return route when opening a property and prioritizing that route in the property page back action.

### Changes (detailed)

#### Changed
- src/App.js
 - `handleViewDetails(index)`, `handleOpenProperty(property)`, `MapView` `onPropertyClick(index)`
 - From: Navigated to `/property/:id` without origin state.
 - To: Navigates with `state.from` set to current path+query so details page knows exactly where to return.
- src/pages/SavedPage.js
 - `handleSelectProperty(property)`
 - From: Navigated to `/property/:id` without origin state.
 - To: Navigates with `state.from` from the saved page route.
- src/pages/PropertyPage.js
 - `handleBack()`
 - From: Browser-history fallback only (`navigate(-1)` then static fallback).
 - To: Closes by returning to `location.state.from` first, then `navigate(-1)`, then listing-type route (`/rent` or `/sale`) as last fallback.

## v.1.0.00.305 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Fixed property details back navigation by adding a fallback route when browser history cannot go back.

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js
 - `handleBack()`
 - From: Always `navigate(-1)`, which can no-op on direct entry/open without prior in-app history.
 - To: Uses `navigate(-1)` when history exists, otherwise routes to `/search` with `replace: true`.
- src/pages/PropertyPage.js
 - Not-found `PageHeader` back handler.
 - From: Inline `navigate(-1)`.
 - To: Reuses resilient `handleBack()` fallback logic.

## v.1.0.00.304 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Redesigned property listing detail UI (shared modal/page content): hero gallery, summary card, spec chips, clearer sections, contact CTA card; overlay uses a bottom sheet on mobile and a centered card on desktop.

### Changes (detailed)

#### Added
- src/App.css
 - Added: `.property-detail-root`, `.property-detail-header`, `.property-detail-body`, `.property-detail-gallery`, `.property-detail-summary`, `.property-detail-spec-chip`, `.property-detail-section`, `.property-detail-contact-card`, `.property-detail-chat-btn`, overlay sheet/desktop rules for `.property-detail-overlay-modal`, `.report-listing-modal` z-index, `.property-detail-page-content > .property-detail-root` flex chain.

#### Changed
- src/components/PropertyDetailContent.js
 - `PropertyDetailContent(props)`
 - From: Flat `modal-header` / `modal-body` with basic price row, `property-features`, `contact-section`, and inline image `maxHeight`.
 - To: Wrapped in `.property-detail-root`; gallery in `.property-detail-gallery` with `.property-detail-gallery-img`; summary card with fees table layout; spec chips; œAbout this place and contact/map sections with updated semantics and primary chat button styling class.
- src/components/PropertyModal.js
 - `PropertyModal`
 - From: Inline `style={{ display: visible ? 'block' : 'none' }}` on root.
 - To: Root class `property-detail-overlay-modal` only; visibility from `.show` and CSS `display: flex` for overlay layout (no inline display override).

#### Removed
- src/components/PropertyDetailContent.js
 - `hasAnyMoveInFee` (unused computed flag).
 - Removed: Dead variable only.

## v.1.0.00.303 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Increased clearance above the fixed bottom navigation so the last listing row is not hidden behind the bar; spacing uses a shared rem-based token so it scales with font size.

### Changes (detailed)

#### Added
- src/App.css
 - `:root` custom property `--bb-bottom-nav-base` (5.5rem).
 - Added: Single source for bottom-nav vertical reserve.

#### Changed
- src/App.css
 - `.app-with-bottom-nav.app-has-bottom-nav`, `.app-has-bottom-nav .results-area`, `.home-page`, `.search-filter-page`, `.property-page .page-content.property-detail-page-content`, `.floating-messages-pill` bottom offset.
 - From: Fixed `72px` (+ safe area) for bottom nav clearance.
 - To: `calc(var(--bb-bottom-nav-base) + env(safe-area-inset-bottom, 0px))` (and pill uses base + 12px + safe area) so reserved space matches taller navs and accessibility text scaling.
- src/components/MainLayout.js
 - Default export layout wrapper `div.app-with-bottom-nav`.
 - From: Inline `paddingBottom` from `NAV_PADDING_BOTTOM` constant.
 - To: Padding applied via `.app-with-bottom-nav.app-has-bottom-nav` in CSS only.

#### Removed
- src/components/MainLayout.constants.js
 - `NAV_PADDING_BOTTOM` string constant.
 - Removed: Duplicated magic value; layout uses CSS variable instead.

## v.1.0.00.302 — Development
Date: 2026-04-01
Type: Dev Change

### Summary
- Removed horizontal swipe-to-change-tab on mobile and removed pull-to-refresh on the listings area; navigation and refresh are via the bottom nav and explicit actions only.

### Changes (detailed)

#### Removed
- src/components/MainLayout.js
 - `handleSwipeStart`, `handleSwipeEnd`, `onTouchStart`/`onTouchEnd` on `.app-with-bottom-nav`, `navBlockedAfterSwipe`, `navBlockTimeoutRef`, `app-bottom-nav-blocked` class.
 - Removed: Swipe left/right no longer changes routes; bottom nav is not briefly blocked after a swipe.
- src/components/MainLayout.constants.js
 - `SWIPE_ROUTES`, `SWIPE_THRESHOLD_PX`, `NAV_BLOCK_AFTER_SWIPE_MS`, `getSwipeRouteIndex(pathname)`.
 - Removed: Swipe navigation configuration only.
- src/App.js
 - `PullToRefresh` wrapper around mobile results content; `SliderDragProvider` around `MainLayout`; `useSliderDrag` / `isSliding`.
 - Removed: Pull-down-to-refresh UI and context used only to coordinate refresh/swipe with the price slider.
- src/components/PullToRefresh.js
 - `PullToRefresh` component.
 - Removed: Unused after pull-to-refresh removal.
- src/context/SliderDragContext.js
 - `SliderDragProvider`, `useSliderDrag`.
 - Removed: No remaining consumers after pull-to-refresh and swipe removal.
- src/components/PriceSlider.js
 - `useSliderDrag`, `sliderPointerHandlers`, `setSliding` calls on thumb drag and range inputs.
 - Removed: Drag state was only used to disable pull-to-refresh and swipe navigation while sliding.
- src/App.css
 - `.results-area > .pull-to-refresh-wrap`, `.pull-to-refresh-*`, `.app-bottom-nav-blocked`.
 - Removed: Styles for removed components/behaviour.

#### Changed
- src/App.js
 - `AppContent` render path.
 - From: On mobile, listings were wrapped in `PullToRefresh`.
 - To: Always returns the same `content` tree without pull-to-refresh.

## v.1.0.00.301 — Development
Date: 2026-03-31
Type: Dev Change

### Summary
- Standardized route entry points under `src/pages/*/index.js` and extracted `MainLayout` constants/helpers so page architecture is more predictable without changing routes or UI behavior.

### Changes (detailed)

#### Added
- src/components/MainLayout.constants.js
 - Added: `NAV_PADDING_BOTTOM`, `DESKTOP_BREAKPOINT`, `SWIPE_ROUTES`, `SWIPE_THRESHOLD_PX`, `NAV_BLOCK_AFTER_SWIPE_MS`, `getSwipeRouteIndex(pathname)`, `getIsDesktop()`.
- src/pages/AdminPage/index.js
 - Added: route entry component for `AdminPage`.
- src/pages/AdminPage/AdminPageView.js
 - Added: composition/view wrapper delegating to legacy page implementation.
- src/pages/ProfilePage/index.js
 - Added: route entry file.
- src/pages/SettingsPage/index.js
 - Added: route entry file.
- src/pages/AddPropertyPage/index.js
 - Added: route entry file.
- src/pages/ConfirmEmailPage/index.js
 - Added: route entry file.
- src/pages/SavedPage/index.js
 - Added: route entry file.
- src/pages/MessagesPage/index.js
 - Added: route entry file.
- src/pages/PropertyPage/index.js
 - Added: route entry file.
- src/pages/ChatPage/index.js
 - Added: route entry file.
- src/pages/HomePage/index.js
 - Added: route entry file.
- src/pages/SearchPage/index.js
 - Added: route entry file.
- src/pages/SearchCityPage/index.js
 - Added: route entry file.
- src/pages/SearchKeywordPage/index.js
 - Added: route entry file.
- src/pages/SearchMapPage/index.js
 - Added: route entry file.
- src/pages/SearchSchoolPage/index.js
 - Added: route entry file.
- src/pages/MenuPage/index.js
 - Added: route entry file.

#### Changed
- src/components/MainLayout.js
 - From: constants and helper functions co-located with layout component implementation.
 - To: imports constants/helpers from `MainLayout.constants.js`; component remains layout-focused.
- src/App.js
 - From: page imports resolved directly to legacy `src/pages/*.js` files.
 - To: page imports resolve to standardized route entry files in `src/pages/*/index.js`; routes and behavior unchanged.

## v.1.0.00.300 — Development
Date: 2026-03-31
Type: Dev Change

### Summary
- Fixed results list not scrolling on mobile: Outlet wrapper always uses `app-main` flex column; `.App` fills height; `.results-area` can shrink and scroll. Infinite-scroll listener uses `useLayoutEffect` so it attaches after the scroll container exists.

### Changes (detailed)

#### Fixed
- src/components/MainLayout.js
  - Outlet wrapper `className`: From conditional `showSidebar ? 'app-main' : ''` (mobile had no flex chain). To: always `app-main`.
- src/App.css
  - `.App`: Added `flex: 1` so the route view fills `app-main` and passes bounded height to `.results-area`.
  - `.app-main`: `overflow` set to `hidden` so scrolling stays in `.results-area` (matches html/body overflow hidden).
  - Added `.app-layout-wrap.app-with-sidebar .app-main { overflow: auto; }` so desktop sidebar pages that need main-level scroll still work.
- src/App.js
  - Infinite-scroll `useEffect` for `resultsAreaRef` scroll listener: From `useEffect`. To `useLayoutEffect` so the listener attaches reliably after layout.

## v.1.0.00.299 — Development
Date: 2026-03-31
Type: Dev Change

### Summary
- Restored infinite-scroll loading on results by binding scroll detection to the actual scroll container (`results-area`) instead of `window`.

### Changes (detailed)

#### Fixed
- src/App.js
 - AppContent infinite-scroll `useEffect` and results `<main>`
 - From: listened to `window` scroll (`window.scrollY`, `document.documentElement.scrollHeight`) while results scroll is contained inside `.results-area` (`overflow-y: auto`), so load-more never triggered.
 - To: attach listener to `resultsAreaRef` (`scrollTop`, `clientHeight`, `scrollHeight`) and set `ref` on the results `<main>` container.

## v.1.0.00.298 — Development
Date: 2026-03-31
Type: Dev Change

### Summary
- Price range slider enforces a minimum gap between min and max handles; avoids zero-width range, divide-by-zero in layout, and tick loop edge cases when both values match.

### Changes (detailed)

#### Added
- src/utils/priceSliderRange.js
  - `clampPriceRange(valueMin, valueMax, min, max, step)` — ensures min/max stay at least one gap apart (â‰¥ step, ~5% of span).
  - `getPriceMinGap(min, max, step)` — shared gap for drag/input handlers.

#### Changed
- src/components/PriceSlider.js
  - `PriceSlider` — uses shared clamp; safe `percent()` when `max <= min`; tick `stepMark` never 0; drag/input handlers use `minGap`; effect syncs parent when stored min/max are equal or too close.
- src/App.js
  - `handlePriceChange(min, max)` — normalizes via `clampPriceRange` with `priceSliderConfig` bounds before `setPriceMin` / `setPriceMax`.

#### Fixed
- src/components/PriceSlider.js
  - From: overlapping handles could yield 0% range width, `NaN` positions, or broken tick iteration when span/step produced `stepMark === 0`.
  - To: enforced minimum separation and defensive math throughout.

## v.1.0.00.297 — Development
Date: 2026-03-31
Type: Dev Change

### Summary
- Restored results incremental scrolling behavior and ensured new searches reset to the submitted filter defaults instead of reusing stale in-page filters.

### Changes (detailed)

#### Changed
- src/App.js
 - AppContent `useEffect` that resets `itemsToShow`
 - From: dependency included entire `listingsForView` array, causing repeated reset churn.
 - To: dependency uses `listingsForView.length`, so visible count resets only when result size changes and infinite scroll can progress.

#### Fixed
- src/context/SearchContext.js
 - `submitSearch(state)`
 - From: only set `lastSearchState`; persisted per-tab in-page filter state could override newly submitted search defaults on results pages.
 - To: also update `currentResultsState` for the submitted `listingType` with normalized search payload, so each new search starts from fresh submitted filters.

## v.1.0.00.296 — Development
Date: 2026-03-31
Type: Dev Change

### Summary
- Search filter panel (price slider and advanced filters) stays visible when a filter returns zero listings so users can adjust filters without the UI disappearing.

### Changes (detailed)

#### Fixed
- src/App.js
  - AppContent render condition for `results-filters-wrap`
  - From: Wrapped in `hasSearched && !showMyPropertiesOnly && listingsForView.length > 0`, so the whole filter block unmounted when Apply returned zero results.
  - To: `hasSearched && !showMyPropertiesOnly` only, so filters remain on screen when there are no matches.

## v.1.0.00.295 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Search entry (toggle + 4 category cards) moved to `/search`. New home page at `/` with hero and "Search properties" CTA. Nav Search and bottom tab 4 go to `/search`; results back goes to `/search`.

### Changes (detailed)

#### Added
- src/pages/SearchPage.js: Search entry page with ListingTypeToggle and 4 cards (City, Map, Keyword, School); same logic as former HomePage (submitSearch, navigate to /search/{path} or /sale|/rent for map).
- src/App.js: Route `path="search"` element SearchPage. Import SearchPage.
- src/App.css: .home-hero, .home-hero-title, .home-hero-text, .home-hero-cta for new home landing.

#### Changed
- src/pages/HomePage.js: Replaced with new landing (hero title "BalhinBalay", tagline "Find your place in the Philippines", primary button "Search properties" → navigate('/search')).
- src/components/MainLayout.js: handleSearch → navigate('/search'). isSearchActive when path === '/search' or (sale|rent and not my-properties). SWIPE_ROUTES[3] = '/search'; getSwipeRouteIndex returns 3 for /search, /sale, /rent. Swipe to tab 4 uses SWIPE_ROUTES[nextIdx] (no special case for /sale|/rent).
- src/App.js: AppContent PageHeader onBack → navigate('/search').

## v.1.0.00.294 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- My properties bar: For Sale / For Rent toggle is centered in the bar.

### Changes (detailed)

#### Changed
- src/App.css: .my-properties-bar-toggle-wrap justify-content set to center (from flex-start) so the listing type toggle is centered.

## v.1.0.00.293 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- My properties: For Sale / For Rent use the same sliding toggle as home search (ListingTypeToggle) instead of two separate buttons.

### Changes (detailed)

#### Changed
- src/App.js: Import ListingTypeToggle; in my-properties bar replace the two toggle buttons with ListingTypeToggle (value=myPropertiesListingType, onChange=setMyPropertiesListingType).
- src/App.css: .my-properties-bar-toggle-wrap now only lays out the toggle; removed .my-properties-bar-toggle button styles. Added .my-properties-bar-toggle-wrap .listing-type-toggle-wrap { padding: 0 } so the toggle fits in the bar.

## v.1.0.00.292 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Desktop: results area explicitly full width; listing grid gains 4 columns at 1280px and 5 columns at 1536px so content uses horizontal space.

### Changes (detailed)

#### Changed
- src/App.css: Added .app-with-sidebar .results-area.full { width: 100%; max-width: none; }. Added @media (min-width: 1280px) and @media (min-width: 1536px) for .listing-grid with 4 and 5 columns; .listing-grid.list-view remains single column at all breakpoints.

## v.1.0.00.291 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Added a dedicated `/my-properties` route. Menu and sidebar link to `/my-properties`; nav highlights My properties when path is `/my-properties`. Old `/sale` or `/rent` with state redirect to `/my-properties`. "Show all properties" navigates to `/sale` or `/rent`.

### Changes (detailed)

#### Added
- src/App.js: Route `my-properties` rendering AppContent. showMyPropertiesOnly derived from pathname === '/my-properties' or (path === '/sale'|'/rent' and location.state?.showMyProperties). listingType on /my-properties uses myPropertiesListingType.

#### Changed
- src/App.js: Removed showMyPropertiesOnly state; redirect /sale|/rent with state.showMyProperties to /my-properties. "Show all properties" button navigates to /rent or /sale instead of setState.
- src/components/MainLayout.js: isMyPropertiesView = path === '/my-properties'; My properties link navigates to /my-properties.
- src/pages/MenuPage.js: My properties button navigates to /my-properties.

## v.1.0.00.290 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Nav (sidebar and bottom bar) now highlights "My properties" when viewing My properties, and "Search" only when viewing search results (not when on My properties).

### Changes (detailed)

#### Changed
- src/components/MainLayout.js: Added isMyPropertiesView from path and location.state?.showMyProperties. isSearchActive is now true only when path is /sale or /rent and not My properties view. My properties sidebar item uses isMyPropertiesView for active state and aria-current.

## v.1.0.00.289 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Desktop: main content area now uses full width next to the sidebar (no narrow column or empty right margin). Sale/rent and My properties pages fill the available width.

### Changes (detailed)

#### Changed
- src/App.css: .app-with-sidebar .app-with-bottom-nav and .app-main given width: 100%. .app-with-sidebar .app-main > * given width: 100%, max-width: 100%. Desktop .app-layout-desktop and .app-layout-desktop .results-area given width: 100%, flex: 1, min-width: 0 so the listing/content area fills the main column.

## v.1.0.00.288 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Desktop: all pages in the main content area now fill the full height (full-page layout). Main area uses flex so page roots stretch to 100% height.

### Changes (detailed)

#### Changed
- src/App.css: .app-main made a flex column with min-height: 0. Added .app-with-sidebar .app-main > * so Outlet page roots get min-height: 100%, flex: 1 1 auto, display: flex; flex-direction: column, ensuring every page fills the desktop main area.

## v.1.0.00.287 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Pull-to-refresh and dark mode are disabled on desktop (â‰¥768px): results area uses PullToRefresh only on mobile; theme is forced to light on desktop and Appearance (Theme) is hidden in Settings.

### Changes (detailed)

#### Changed
- src/context/ThemeContext.js: Added isDesktop state (window.innerWidth >= 768, resize listener). effectiveDark is true only when !isDesktop and (theme === 'dark' || (theme === 'system' && systemDark)); on desktop effectiveDark is always false. Context value now includes isDesktop.
- src/pages/SettingsPage.js: Appearance section (Theme row) is rendered only when !isDesktop so theme cannot be changed on desktop.
- src/App.js: Results area content is wrapped in PullToRefresh only when isMobile; on desktop the same content is rendered without PullToRefresh (IIFE with content variable).

## v.1.0.00.286 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- Desktop/mobile layout: at 768px+ show left sidebar (nav + account links); below 768px keep bottom nav. No user toggle; viewport-driven.

### Changes (detailed)

#### Added
- src/components/MainLayout.js: isDesktop state (window.innerWidth >= 768) with resize listener; when isDesktop && showNav render sidebar (logo, Home, Saved, Messages, Search, then if user: Add property, My properties, Saved searches, Settings, Log out; else Log in) and app-main wrapping Outlet; ConfirmModal for logout. Bottom nav rendered only when !isDesktop && showNav. Swipe handlers no-op when isDesktop.
- src/App.css: .app-with-sidebar (flex row, min-height 100vh), .app-sidebar (260px, nav list), .app-main (flex 1, overflow auto), .app-sidebar-brand, .app-sidebar-nav, .app-sidebar-item (and .active, .app-sidebar-item-logout), .app-sidebar-section-label, .app-sidebar-badge.

#### Changed
- src/components/MainLayout.js: paddingBottom and app-has-bottom-nav applied only when !isDesktop && showNav so desktop content has no bottom nav padding.

## v.1.0.00.285 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- My properties: only rent/sale toggle, show all own listings (no search filters); show status on cards (Pending, Live, Rejected, Unlisted). Empty state for my properties with Add property CTA.

### Changes (detailed)

#### Changed
- src/App.js: filteredListingsForMyProperties now only filters by myPropertiesListingType (sale/rent) and sortBy; removed price, region, city, propertyType, furnishedFilter, minBeds, minBaths, sizeRange, searchQuery. Hide results-filters-wrap (price slider, advanced filters) when showMyPropertiesOnly. Show list when showMyPropertiesOnly even if !hasSearched; hide SearchBar and school selector when showMyPropertiesOnly. Empty state for my properties: "No rental/sale listings" + Add property button.
- src/components/PropertyCard.js: show status badges Approved (Live), Unlisted in addition to Pending and Rejected.
- src/components/PropertyListCard.js: same status badges (Live, Unlisted, Pending, Rejected).

#### Added
- src/App.js: when location.state.showMyProperties and user, set showMyPropertiesOnly and clear state so menu "My properties" opens the view.
- src/pages/MenuPage.js: My properties button navigates to /sale with state { showMyProperties: true }.

## v.1.0.00.284 — Development
Date: 2026-03-16
Type: Dev Change

### Summary
- My properties view has its own For Sale / For Rent toggle; listing type and price range are independent from the main sale/rent tab.

### Changes (detailed)

#### Added
- src/App.js: myPropertiesListingType state ('sale' | 'rent'); effectiveListingTypeForMyProperties; sync myPropertiesListingType from listingType when entering My Properties (useEffect). For Sale / For Rent toggle buttons in my-properties bar (my-properties-bar-toggle-wrap, my-properties-bar-toggle).
- src/App.css: .my-properties-bar-top, .my-properties-bar-toggle-wrap, .my-properties-bar-toggle (and .active) for the My Properties rent/sale toggle.

#### Changed
- src/App.js: filteredListingsForMyProperties filters by myPropertiesListingType and uses price range for that type; listingsByType uses effectiveListingTypeForMyProperties; PageHeader title shows "My properties" when showMyPropertiesOnly; PriceSlider uses effectiveListingTypeForMyProperties for config and values. My properties bar layout: top row (text + "Show all"), then toggle row (For Sale | For Rent).

## v.1.0.00.283 — Development
Date: 2026-03-15
Type: Dev Change

### Summary
- Add server/set-admin.js and npm run admin:set to set a user to admin by email (e.g. npm run admin:set -- khacey).

### Changes (detailed)

#### Added
- server/set-admin.js: loads .env, updates users SET role = 'admin' WHERE email matches argument (default khacey).
- package.json: script admin:set (node server/set-admin.js).

## v.1.0.00.282 — Development
Date: 2026-03-15
Type: Dev Change

### Summary
- Run Cloudflare tunnel (and server) under PM2 via ecosystem.config.cjs; document in TUNNEL.md.

### Changes (detailed)

#### Added
- ecosystem.config.cjs: PM2 apps balhinbalay-server (server/index.js) and balhinbalay-tunnel (cloudflared tunnel run balhinbalay); start with `pm2 start ecosystem.config.cjs`.
- TUNNEL.md: new section 7 "Run the tunnel (and server) with PM2" (pm2 start, status, logs, save/startup).

## v.1.0.00.281 — Development
Date: 2026-03-15
Type: Dev Change

### Summary
- Add PLAY-STORE.md: step-by-step plan for submitting the Android app to Google Play (developer account, Play Console, signed AAB, store listing, content rating, release).

### Changes (detailed)

#### Added
- PLAY-STORE.md: Google Play Developer registration ($25), create app, build signed AAB (Android Studio Generate Signed Bundle), App Signing, store listing (icon, screenshots, descriptions, privacy), content rating and data safety, production release; versionCode/versionName for updates; link from APP-STORE.md.

## v.1.0.00.280 — Development
Date: 2026-03-15
Type: Dev Change

### Summary
- Add APP-STORE.md: step-by-step plan for submitting the iOS app to the Apple App Store (developer account, App Store Connect, build/archive, metadata, review).

### Changes (detailed)

#### Added
- APP-STORE.md: Apple Developer enrollment, App Store Connect app creation (bundle id com.balhinbalay.app), Xcode signing and archive/upload, metadata and screenshots, submit for review; checklist and TestFlight/Android notes.

## v.1.0.00.279 — Development
Date: 2026-03-15
Type: Dev Change

### Summary
- `npm run migrate` now applies the base schema (schema.sql) automatically when the database has no tables, so a single command sets up a fresh DB.

### Changes (detailed)

#### Changed
- server/run-migrations.js: From: migrations only; failed with "listings does not exist" on fresh DB. To: before running migrations, checks for `listings` table; if missing, runs schema.sql first, then runs all migrations.

## v.1.0.00.278 — Development
Date: 2026-03-15
Type: Dev Change

### Summary
- TUNNEL.md: add "Reset / re-setup cloudflared" section with step-by-step for reusing or creating a tunnel and running it.

### Changes (detailed)

#### Added
- TUNNEL.md: "Reset / re-setup cloudflared" section at top — install, login, reuse (tunnel list) or create tunnel, config.yml, DNS, run server + tunnel.

## v.1.0.00.277 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Advanced filters (min beds, min baths, property type, furnished) apply only when the user clicks "Apply"; price, region, city, search query, and sort still trigger search immediately.

### Changes (detailed)

#### Added
- src/App.js: applyAdvancedFilters callback that calls fetchSearchListings with current filter state. "Apply" button in the advanced filters panel that calls applyAdvancedFilters. useCallback import.
- src/App.css: .results-advanced-filters-apply-wrap (grid-column 1 / -1, margin-top, flex), .results-advanced-filters-apply (min-width).

#### Changed
- src/App.js: From: useEffect to fetch search depended on propertyType, furnishedFilter, minBeds, minBaths, sizeRange — changing any advanced filter triggered an immediate refetch. To: useEffect dependency array no longer includes those; refetch runs only when listingType, price, region, city, searchQuery, or sortBy change. Advanced filter values are applied only when the user clicks "Apply".

## v.1.0.00.276 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Search filters applied in the API query (server-side) instead of client-side. GET /api/listings accepts query params; search results view uses fetchSearchListings and searchResults.

### Changes (detailed)

#### Added
- server/routes/listings.js: GET `/` now supports query params listingType, priceMin, priceMax, cityId, cityIds, type, furnished, minBeds, minBaths, sizeMin, sizeMax, q (keyword ILIKE), sort (newest|price-asc|price-desc|size-asc|size-desc); builds parameterized WHERE and ORDER BY; LIMIT 500. Keeps includeMine behavior.
- src/context/ListingsContext.js: buildSearchQueryString(params), searchResults, searchLoading, searchError state; fetchSearchListings(params) calling GET /api/listings with query string from params.

#### Changed
- src/App.js: From: single client-side filtered list (filteredListings) from full apiListings. To: when hasSearched and not showMyPropertiesOnly, call fetchSearchListings with params derived from filter state; use searchResults for main list; show searchLoading and searchError for search path; keep filteredListingsForMyProperties (client-side) only for My properties; school filter on searchResults or my-properties list; listingsForView uses searchResults or school-filtered or my-properties. PullToRefresh disabled uses searchLoading on search path; error banner shows searchError on search path. setItemsToShow effect depends on listingsForView.

#### Removed
- src/App.js: Large client-side filteredListings useMemo for the main search path (replaced by server-filtered searchResults and filteredListingsForMyProperties for My properties only).

## v.1.0.00.275 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- œSend reset code to my email button styled red. Report/flag listing and total move-in fees implemented (backend, form, detail UI).

### Changes (detailed)

#### Added
- server/migrations/add-move-in-fees-and-reports.sql: listing columns advance_pay, broker_fee, association_fee, utilities_included, reservation_fee; listing_reports table (listing_id, reporter_id, reason, created_at). Registered in run-migrations.js.
- server/routes/listings.js: COLS and INSERT/PATCH include new move-in fields; POST /:id/report (auth, non-owner only, one report per user per listing, optional reason).
- server/lib/listings.js: mapListingRow returns advancePay, brokerFee, associationFee, utilitiesIncluded, reservationFee.
- src/components/AddPropertyForm.js: advance pay, broker fee, association fee, utilities included (checkbox), reservation fee (rent-only); state, initial sync, and submit payload.
- src/components/PropertyDetailContent.js: Move-in fees section for rent — key money, security deposit, advance pay, broker fee, association fee, reservation fee, utilities included/not, extra fees; total move-in sum. Report/flag: button (non-owner, logged-in), modal with optional reason and submit; api.post report endpoint.

#### Changed
- src/pages/ProfilePage.js: œSend reset code to my email button class from btn-outline-secondary to btn-danger (red).
- MVP.md: Report/flag listing and Total move-in fees marked done in To do (backlog) with implementation refs.

## v.1.0.00.274 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile: single œChange password flow; always requires email 5-digit code (removed current-password form).

### Changes (detailed)

#### Changed
- src/pages/ProfilePage.js: Removed œChange password section that used current password + new password (no email code). Kept only the email-code flow and renamed it to œChange password with hint œWe™ll send a 5-digit code to your email. Enter the code and choose a new password (at least 8 characters). Removed changePassword, handlePasswordSubmit, doChangePassword, related state, and ConfirmModal. From: two options (current-password change and reset via email). To: one flow — change password always requires email confirmation (5-digit code).

#### Removed
- src/pages/ProfilePage.js: ConfirmModal import and usage for change-password confirm; current-password / new-password / confirm-password state and form.

## v.1.0.00.273 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Password reset available when logged in; still requires email confirmation (5-digit code).

### Changes (detailed)

#### Added
- src/pages/ProfilePage.js: œReset password (via email) section — same flow as forgot password: send 5-digit code to user™s email (pre-filled), then enter code + new password + confirm. Cancel/Back to collapse. From: only LoginModal offered reset (forgot password). To: logged-in users can reset password from Profile and must confirm via email code.

## v.1.0.00.272 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- MVP.md: add to To do (backlog) — total move-in fees calculation (key-money, security deposit, advance pay, broker fee, association fee, utilities included/not, reservation fee).

### Changes (detailed)

#### Changed
- MVP.md: New backlog item for total move-in fees calculation with listed fee types.

## v.1.0.00.271 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- MVP doc: inquiry via chat (no separate view); report/flag moved to To do. Password reset: 5-digit code sent to email, request/reset API, Forgot password flow in LoginModal.

### Changes (detailed)

#### Added
- server/migrations/add-password-reset-code.sql: password_reset_code (VARCHAR 5), password_reset_expires (TIMESTAMPTZ); registered in run-migrations.js.
- server/services/email.js: sendPasswordResetCode(toEmail, code, userName) — HTML + text email with 5-digit code.
- server/routes/auth.js: POST /api/auth/request-password-reset (email) — generate 5-digit code, store with 15-min expiry, send email; POST /api/auth/reset-password (email, code, newPassword) — verify code, update password, clear code.
- src/context/AuthContext.js: requestPasswordReset(email), resetPassword(email, code, newPassword) and exposed in context value.
- src/components/LoginModal.js: Forgot password flow — œForgot password? link on login tab; reset step œemail (send code) and œcode (enter code + new password + confirm); Back to login; reset state cleared when modal closes.

#### Changed
- MVP.md: œView inquiries marked implemented (inquiry via chat). œReport / flag listing removed from Optional MVP Enhancements and added under new œTo do (backlog) section. Password reset checklist item marked implemented.

## v.1.0.00.270 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add MVP.md checklist; cross-check features against codebase and mark implemented vs not.

### Changes (detailed)

#### Added
- MVP.md: Real Estate Platform MVP checklist (User accounts, Property listings, Search & discovery, Property detail, Messaging, Saved properties, Listing management, Notifications, Admin panel, Location, Optional enhancements) with [x]/[ ] per item based on codebase review.

## v.1.0.00.269 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: set isSliding (SliderDragContext) when dragging via thumb hit zones so pull-to-refresh stays disabled.

### Changes (detailed)

#### Fixed
- src/components/PriceSlider.js: handleThumbPointerDown now calls setSliding(true); handleThumbPointerUpOrCancel calls setSliding(false). From: thumb hit zones did not set isSliding, so PullToRefresh remained enabled and vertical movement while dragging triggered refresh. To: pull-to-refresh is disabled while using the sliders.

## v.1.0.00.268 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: only thumb-sized hit zones are clickable; track has no hit target.

### Changes (detailed)

#### Changed
- src/components/PriceSlider.js: Replaced full-width overlay with two thumb-sized hit divs (price-slider-thumb-hit) positioned at minPct and maxPct, each 28px wide centered on the thumb. Container has pointer-events: none; only the two hit divs have pointer-events: auto. startDrag(which, clientX) and handleThumbPointerDown(e, which) start drag only when pointer is on a hit zone. valueFromX uses railRef for rect. From: single overlay with px hit test still allowed track clicks (bug or coordinate mismatch). To: track has no overlay; only the two small divs over the thumbs receive pointer events.
- src/App.css: .price-slider-thumb-hit-container (pointer-events: none), .price-slider-thumb-hit (pointer-events: auto); removed full .price-slider-overlay.

## v.1.0.00.267 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: use pixel-based thumb hit area (THUMB_HIT_PX = 14) so only the thumb is clickable, not the track.

### Changes (detailed)

#### Changed
- src/components/PriceSlider.js: Replaced THUMB_HIT_PCT (8%) with THUMB_HIT_PX (14). Hit test now uses distance in px from click to thumb center (minPx, maxPx from rect); only start drag when within 14px of a thumb. From: 8% of track was ~29px on 360px slider so track still felt clickable. To: fixed 14px radius so only the thumb area starts a drag.

## v.1.0.00.266 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: only start drag when pointer is near a thumb (within THUMB_HIT_PCT); track is no longer clickable.

### Changes (detailed)

#### Changed
- src/components/PriceSlider.js: Added THUMB_HIT_PCT (8). In handleOverlayPointerDown, only set activeInputRef and capture when click is within THUMB_HIT_PCT of min or max thumb; otherwise return without starting drag. From: whole track started a drag (left/mid = min, right = max). To: only clicks on or near the thumbs start a drag.

## v.1.0.00.265 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: replace wrapper/overflow approach with transparent overlay that captures all pointer events and updates min/max via valueFromX + onChange so both thumbs are draggable.

### Changes (detailed)

#### Changed
- src/components/PriceSlider.js: Removed input wrappers. Added transparent overlay (price-slider-overlay) over the track; on pointer down we decide min vs max from click position (midpoint between thumbs), set activeInputRef, update value once, setPointerCapture. On pointer move we update the active value from clientX (valueFromX). On pointer up/leave/cancel we release capture. Inputs have pointer-events: none and remain for display only; overlay drives interaction.
- src/App.css: Replaced wrapper styles with .price-slider-overlay (full width, z-index 3); .price-slider-input pointer-events: none; removed .price-slider-input-wrap and .price-slider-input-active.

## v.1.0.00.264 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: fix dual slider by making min and max wrappers non-overlapping (max wrapper starts at maxPct, not minPct) and giving max wrapper higher z-index.

### Changes (detailed)

#### Fixed
- src/components/PriceSlider.js: Max wrapper left set to maxPct% and width to (100-maxPct)% so it does not overlap min wrapper (0 to maxPct). maxInputLeft/maxInputWidth use (100-maxPct) so thumb stays correct. From: max wrapper spanned minPct“100 and overlapped min wrapper (0“maxPct); min had z-index 2 so it captured clicks meant for the max thumb. To: wrappers are adjacent (0“maxPct and maxPct“100), no overlap; max handle receives events on the right.
- src/App.css: .price-slider-input-wrap-max z-index 2, .price-slider-input-wrap-min z-index 1 so max wins at boundary.

## v.1.0.00.263 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: fix end (max) handle not movable by using wrapper divs with overflow hidden instead of clip-path (clip-path does not limit hit-testing in some browsers).

### Changes (detailed)

#### Changed
- src/components/PriceSlider.js: Wrap each range input in a div (price-slider-input-wrap) that limits hit area: min wrapper width minWrapWidth% (max(maxPct, 5)), max wrapper left minPct%, width maxWrapWidth% (max(100-minPct, 5)). Inputs sized/positioned so thumb remains correct; max input uses left/width so it spans full rail. From: clip-path on inputs did not restrict pointer events so max handle still could not be moved. To: wrappers create non-overlapping hit regions so both thumbs are draggable.
- src/App.css: .price-slider-input-wrap (absolute, overflow hidden, pointer-events auto); .price-slider-input-wrap-min z-index 2; .price-slider-input top 0, width/left from inline styles; removed clip-path approach.

## v.1.0.00.262 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: both handles movable via clip-path hit areas; Advanced Filters label and centered toggle.

### Changes (detailed)

#### Changed
- src/components/PriceSlider.js: Min and max inputs use inline clip-path so hit areas do not overlap (min: left 0 to maxPct%; max: minPct% to 100%). From: min input on top (z-index 2) captured all events so max handle could not be moved. To: both thumbs independently draggable.
- src/App.js: Toggle text "More filters" -> "Advanced Filters"; wrap toggle in results-advanced-filters-toggle-wrap for centering.
- src/App.css: .results-advanced-filters-toggle-wrap added (flex, justify-content: center) to center Advanced Filters button horizontally.

## v.1.0.00.261 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price slider: fix min handle not movable (z-index); disable pull-to-refresh and swipe navigation while dragging; advanced filters hidden by default and tucked with price selector in a collapsible "More filters" section.

### Changes (detailed)

#### Added
- src/context/SliderDragContext.js: SliderDragProvider, useSliderDrag(); isSliding state and setSliding so PriceSlider can signal drag and PullToRefresh/MainLayout can disable during drag.
- src/App.js: showAdvancedFilters state (default false); results-filters-wrap grouping price slider + "More filters" toggle + collapsible results-advanced-filters panel; SliderDragProvider wraps MainLayout route; useSliderDrag() in AppContent; PullToRefresh disabled when isSliding.
- src/App.css: .results-filters-wrap, .results-advanced-filters-toggle, .results-filters-wrap .results-price-slider-wrap and .results-advanced-filters overrides so filters are one card with slider and tucked panel.

#### Changed
- src/App.css: .price-slider-input-min z-index 2, .price-slider-input-max z-index 1. From: max on top so min handle could not be dragged. To: min on top so first handle is movable.
- src/components/PriceSlider.js: useSliderDrag(); pointer handlers (onPointerDown/Up/Leave/Cancel) on both range inputs call setSliding(true/false).
- src/components/MainLayout.js: useSliderDrag(); handleSwipeEnd returns early when isSliding so swipe does not navigate while dragging slider.

## v.1.0.00.260 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Push token registration runs once per session instead of on every page change.

### Changes (detailed)

#### Changed
- src/components/PushTokenHandler.js: Register effect now depends on userId (user?.id), not user object, and uses a ref for navigate so route changes do not re-run the effect. From: effect re-ran when user or navigate reference changed (e.g. on navigation), causing repeated "[push] Token registered" server calls. To: registration runs only when startupRevokeDone, userId, pushEnabled, or trigger change (i.e. once after login when push is enabled, or when user toggles push in Settings).

## v.1.0.00.259 — Development
Date: 2026-03-12
Type: Dev Change

### Summary
- Fix app getting stuck on search results page: remove currentResultsState from restore effect deps to break restore/persist effect loop that could freeze navigation.

### Changes (detailed)

#### Fixed
- src/App.js: Restore-filters effect no longer lists currentResultsState in dependency array. From: persist effect updated context -> restore effect ran (currentResultsState in deps) -> setState -> persist ran again -> infinite re-render loop, app stuck. To: restore runs only when hasSearched, lastSearchState, or listingType changes; still reads currentResultsState inside effect for restore on mount/return to tab.

## v.1.0.00.258 — Development
Date: 2026-03-12
Type: Dev Change

### Summary
- Fix second bottom nav highlight when swiping: restrict pill background to .active; hover on non-active no longer uses same background (sticky hover on touch).

### Changes (detailed)

#### Changed
- src/App.css: .app-bottom-nav-item:hover no longer sets background; added .app-bottom-nav-item:hover:not(.active) { background: transparent }. From: hover used same background as .active so a second tab could show the pill (sticky hover on touch). To: only .active has the pill background.

## v.1.0.00.257 — Development
Date: 2026-03-12
Type: Dev Change

### Summary
- Add dark mode control to Settings: ThemeContext with System / Light / Dark; preference stored in localStorage and overrides system when set.

### Changes (detailed)

#### Added
- src/context/ThemeContext.js: ThemeProvider, useTheme(); theme preference 'system' | 'light' | 'dark' in localStorage (balhinbalay_theme); applies data-theme and theme-color; when 'system' uses matchMedia('prefers-color-scheme: dark').
- src/pages/SettingsPage.js: Appearance section with Dark mode buttons (System, Light, Dark) using useTheme().

#### Changed
- src/App.js: Wrap app in ThemeProvider; remove inline theme useEffect (theme logic moved to ThemeContext).

## v.1.0.00.256 — Development
Date: 2026-03-12
Type: Dev Change

### Summary
- Nav: prevent second tab highlight when swiping (tap :active style + blur after swipe).
- Results: add advanced search block under price sliders (min beds, min baths, property type, furnished).
- Filters: persist results filters in SearchContext (currentResultsState) so they survive swipe navigation.
- Theme: auto-detect device dark mode (prefers-color-scheme) and apply dark theme (data-theme + CSS variables).

### Changes (detailed)

#### Added
- src/App.js: Advanced search block (results-advanced-filters) under price slider when hasSearched: min beds, min baths, property type, furnished dropdowns; useEffect to persist current filters to SearchContext (setCurrentResultsState); useEffect to detect prefers-color-scheme: dark and set data-theme + theme-color meta; hasRestoredFiltersRef to avoid overwriting context on first mount.
- src/App.css: .app-bottom-nav-item:active { background: transparent }; .results-advanced-filters grid and labels; [data-theme="dark"] variable overrides and body background/color.
- src/context/SearchContext.js: currentResultsState (object keyed by listingType), setCurrentResultsStateForListing(listingType, state) in provider value.

#### Changed
- src/components/MainLayout.js: document.activeElement?.blur?.() after navigate() in handleSwipeEnd so no nav button retains focus/active state.
- src/App.js: Restore effect prefers currentResultsState[listingType] over lastSearchState when available; persist effect writes filter state via setCurrentResultsStateForListing(listingType, ...) so sale and rent each keep their own filters.
- src/context/SearchContext.js: SearchProvider holds currentResultsState as { sale?: state, rent?: state } and exposes setCurrentResultsStateForListing.

## v.1.0.00.255 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Bottom nav: block taps briefly after swipe navigation so touch end does not highlight a second tab (fixes "two highlighted pages" when swiping left/right).

### Changes (detailed)

#### Added
- src/components/MainLayout.js: navBlockedAfterSwipe state and navBlockTimeoutRef; after handleSwipeEnd navigates, set navBlockedAfterSwipe true for NAV_BLOCK_AFTER_SWIPE_MS (350ms) and apply app-bottom-nav-blocked class to nav.
- src/App.css: .app-bottom-nav-blocked { pointer-events: none; }.

#### Changed
- src/components/MainLayout.js: handleSwipeEnd now clears any existing timeout and starts a new one when a swipe navigation occurs; nav gets conditional class for blocked state. useEffect cleanup clears navBlockTimeoutRef on unmount.

## v.1.0.00.254 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Pull-to-refresh: use scroll container scrollTop and add dead zone so the indicator does not show on small drags (e.g. when using handles).

### Changes (detailed)

#### Changed
- src/components/PullToRefresh.js: getScrollTop() now returns containerRef.current?.parentElement?.scrollTop ?? 0 instead of window scroll. From: pull activated whenever window was at top (window scroll always 0 in this app), so any downward drag showed refresh. To: pull only activates when the list (results-area) is scrolled to the top. Added MIN_PULL_TO_SHOW = 25; onTouchMove and onPointerMove only set pullY when delta > MIN_PULL_TO_SHOW; showIndicator = pullY > MIN_PULL_TO_SHOW || refreshing. From: indicator showed on any pullY > 0. To: small drags (e.g. handles) do not show the indicator or trigger refresh.

## v.1.0.00.253 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Search: highlight Search tab in bottom nav on /sale and /rent; add header with back button and title (For Sale / For Rent) on results view.
- Menu: replace profile sidebar with full-page menu at /menu; bottom nav Menu navigates to /menu.
- Headers: introduce shared PageHeader component and unify all page headers with structure (back + title + optional right) and visual refresh (typography, shadow); migrate all pages and search filter pages to PageHeader; remove obsolete search-filter header CSS.

### Changes (detailed)

#### Added
- src/components/PageHeader.js: New component PageHeader(title, onBack?, right?, className?) for unified back + title + optional right slot.
- src/pages/MenuPage.js: Full-page menu with PageHeader, user chip, Main (Add property, My properties, Saved properties, Saved searches), Account (Settings, Delete account, Profile, Log out); redirects to / when not logged in; own logout ConfirmModal.
- src/App.js: Route path="menu" element={<MenuPage />}; PageHeader import; sale/rent results header uses PageHeader with title "For Sale"/"For Rent" and onBack to /.
- src/App.css: .page-header box-shadow, .page-header-back-placeholder, .page-header-right, .page-header-right-placeholder; .menu-page .menu-page-body for scroll and safe-area; .chat-page-header .page-header-title max-width 60vw.

#### Changed
- src/components/MainLayout.js: isSearchActive when path is /sale or /rent; Search nav item gets active class and aria-current; Menu nav item navigates to /menu instead of opening ProfileDrawer; removed ProfileDrawer, ConfirmModal, showHeaderMenu, showLogoutConfirm, loggingOut, handleOpenSavedSearches, useListings.
- src/App.css: .page-header unified layout (flex, back/placeholder 40px, title flex:1, right/placeholder); .page-header-title font-size 1.2rem, font-weight 700; chat-page-header keeps sticky/z-index, .chat-page-title replaced by .chat-page-header .page-header-title.
- src/pages/SavedPage.js, MessagesPage.js, PropertyPage.js, SettingsPage.js, AddPropertyPage.js, ProfilePage.js, ChatPage.js, SearchCityPage.js, SearchKeywordPage.js, SearchSchoolPage.js: Use PageHeader component instead of raw page-header/search-filter-page-header markup.
- src/components/PageHeader.js: Supports title as React node; optional className prop for header element.

#### Removed
- src/App.css: .search-filter-page-header, .search-filter-page-back, .search-filter-page-title (replaced by PageHeader using .page-header).

## v.1.0.00.252 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove remaining filter modal: drop FiltersOpenProvider, filter sheet/backdrop/floating button CSS, and desktop sidebar layout so no filter modal can appear.

### Changes (detailed)

#### Removed
- src/App.js: FiltersOpenProvider import and wrapper; filter modal is not rendered anywhere, provider was unused.
- src/App.css: .floating-filters-btn, .btn-filter-trigger, .filter-backdrop, .filter-sheet, .filter-sheet-handle, .filter-sheet-header, .filter-sheet-close, .filter-sidebar-content (sheet block); desktop media query block for filter-backdrop/filter-sheet/filter-sidebar-content; .App.desktop-filters-closed .listing-tabs. .app-header-actions icon rule no longer references .btn-filter-trigger.

#### Changed
- src/App.css: .app-layout-desktop .results-area margin-left set to 0 (no sidebar); removed .results-area.full margin-left override.

## v.1.0.00.251 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat: show timestamp once per minute; fix getMinuteKey to use date milliseconds so messages in the same minute share one timestamp.

### Changes (detailed)

#### Fixed
- src/pages/ChatPage.js: getMinuteKey(ts) now derives the minute key from new Date(ts).getTime() instead of Number(ts). From: timestamps (ISO strings) produced NaN key so every message showed time. To: same-minute messages share key, only first message of each minute shows time.
- src/components/ChatModal.js: same getMinuteKey fix as ChatPage.js.

## v.1.0.00.250 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Native: no account logged in on first install; first-launch detection clears any restored auth so a fresh install (or backup restore) starts logged out.

### Changes (detailed)

#### Changed
- src/context/AuthContext.js: On native, initial user state is null (no sync restore from localStorage). In the native useEffect, if Preferences has no "balhinbalay_has_launched" flag, treat as first launch: clear auth from localStorage and Preferences, set the flag, and keep user null. Only restore auth from Preferences when the flag is already set (subsequent launches). Ensures a fresh install or restore-from-backup does not show a previously logged-in account.

## v.1.0.00.249 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Push: revoke token on every app startup (before auth); only re-register after startup revoke so device never keeps receiving after logout.

### Changes (detailed)

#### Changed
- src/components/PushTokenHandler.js: On native, run revoke with stored token as soon as the handler mounts (every app cold start). Set startupRevokeDone when done (or when non-native / no token). Register effect now waits for startupRevokeDone so we never register then immediately revoke. Ensures server drops this device™s token on open; token is re-added only if user is logged in.

## v.1.0.00.248 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix push revoke never running: move push token register/revoke into PushTokenHandler that is always mounted; revoke was in AppContent which only mounts on /sale and /rent so logged-out users on home or other routes never revoked.

### Changes (detailed)

#### Added
- src/components/PushTokenHandler.js: New component that handles FCM token registration (when user + push enabled) and revoke (when no user). Rendered once inside PushProvider so it runs on every route. Ensures revoke runs when user is logged out on any screen (home, messages, etc.).

#### Changed
- src/App.js: Render PushTokenHandler inside PushProvider. Removed all push/revoke logic from AppContent. Dropped unused imports (api, Capacitor, useCallback).

## v.1.0.00.247 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Harden push revoke: retry revoke on app visibility when no user; clear stored token after revoke; useCallback for revoke so it can be reused.

### Changes (detailed)

#### Added
- src/context/PushContext.js: clearStoredToken() to remove push token from state and Preferences (used after successful revoke so device does not keep a stale token).

#### Changed
- src/App.js: Revoke logic extracted to revokeToken callback; revoke runs on mount when no user and again on visibilitychange when no user. After successful revoke, clearStoredToken() is called. Added useCallback import.

## v.1.0.00.246 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix app receiving push when no user is logged in: revoke device token on server when app runs with no user so device stops getting notifications until someone logs in.

### Changes (detailed)

#### Added
- server/routes/users.js: POST /api/users/revoke-push-token (no auth), body { token }; deletes that token from user_push_tokens so the device stops receiving push. Mounted before authMiddleware.

#### Changed
- src/App.js: When user is null and native, effect runs and calls revoke-push-token with stored token so server removes that device from all users.

## v.1.0.00.245 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix device still receiving push for other accounts: send stored FCM token to server whenever logged-in user is set so device is reassigned to current account (FCM often does not fire registration again after user switch).

### Changes (detailed)

#### Changed
- src/App.js
  - Push setup effect: On run (e.g. after login), send any stored FCM token to server immediately via getStoredToken + POST /me/push-token so the device is reassigned to the current user even when the registration event does not fire again. Also send stored token on the 15s retry. Extracted sendTokenToServer helper used by both registration callback and stored-token path.

## v.1.0.00.244 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix push notifications for wrong account: one device = one account for push; remove token on logout; reassign token to current user on register.

### Changes (detailed)

#### Changed
- server/routes/users.js
  - POST /me/push-token: Before inserting, DELETE FROM user_push_tokens WHERE token = $1 so the token is removed from any other user; one FCM token is only associated with the current user (fixes same device receiving notifications for a previously logged-in account).
- src/context/AuthContext.js
  - logout(): Now async; calls DELETE /api/users/me/push-token before clearing local auth so the device stops receiving push for that account after logout.

## v.1.0.00.243 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Ensure new chats are loaded when opening Messages: refetch threads on Messages page and modal open; createOrGetThread refetches after create.

### Changes (detailed)

#### Changed
- src/context/ChatContext.js
  - createOrGetThread(listingId): After creating a thread, call fetchThreads() instead of optimistically appending a minimal thread so the list has full API shape and new chats appear.
  - Expose refreshThreads (alias of fetchThreads) in context value so consumers can trigger a refetch.
- src/pages/MessagesPage.js: Call refreshThreads() when the Messages page mounts (when user is set) so opening the list loads new chats.
- src/components/MessagesModal.js: Call refreshThreads() when the messages modal is shown so the thread list is fresh when opened.

## v.1.0.00.242 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Revert notification icon to project icon.png (white + transparent).

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_notification.png: copy of project root icon.png.

#### Removed
- android/app/src/main/res/drawable/ic_notification.xml: removed so FCM uses PNG (AndroidManifest meta-data still points to @drawable/ic_notification).

## v.1.0.00.241 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix notification icon white square: set FCM default icon in AndroidManifest; simplify vector to 24x24 viewport house so status bar shows shape correctly.

### Changes (detailed)

#### Changed
- android/app/src/main/AndroidManifest.xml: added meta-data com.google.firebase.messaging.default_notification_icon pointing to @drawable/ic_notification so FCM uses our icon when building the notification.
- android/app/src/main/res/drawable/ic_notification.xml: simplified to 24x24 viewport and single house path (M12,2L2,9v13h6v-6h8v6h6V9L12,2z) so transparent areas are clear and icon is not rendered as a solid block.

## v.1.0.00.240 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix notification icon still showing as white square: use vector of app launcher house shape (white only) so status bar shows correct icon.

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_notification.xml: VectorDrawable using same house body path as ic_launcher_foreground, white fill only (24dp, status bar compatible).

#### Removed
- android/app/src/main/res/drawable/ic_notification.png: PNG still rendered as white square (Android uses alpha only; vector guarantees correct shape).

## v.1.0.00.239 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Use project icon.png (white with transparency) as notification icon again; remove vector fallback.

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_notification.png: copy of project root icon.png (white + transparent) for FCM small icon.

#### Removed
- android/app/src/main/res/drawable/ic_notification.xml: vector house icon removed so PNG is used.

## v.1.0.00.238 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix notification status bar icon showing as white square: use a white silhouette vector so Android tints it correctly.

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_notification.xml: VectorDrawable white house silhouette for notification small icon.

#### Removed
- android/app/src/main/res/drawable/ic_notification.png: replaced by vector (full-color icon rendered as solid white in status bar).

## v.1.0.00.237 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Use project icon.png as the small notification icon for Android push notifications.

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_notification.png: copy of project root icon.png for FCM notification small icon.

#### Changed
- server/services/push.js: set android.notification.icon to 'ic_notification' in the FCM payload so push notifications show the app icon in the status bar and notification tray.

## v.1.0.00.236 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove the floating filter button and filter modal/sheet altogether. Filtering is done via home page categories, search filter pages, and the price slider on the results page.

### Changes (detailed)

#### Removed
- src/App.js: FilterSidebar import and both filter sheet blocks (mobile AnimatePresence + desktop); floating-filters-btn; filtersOpen state and all setFiltersOpen / filtersOpenRequested logic; handleApplyFilters; useFiltersOpen usage; AnimatePresence/motion import.
- src/components/MainLayout.js: useFiltersOpen import and requestOpenFilters() call from handleOpenSavedSearches.

#### Changed
- src/App.js: App layout now only has header + app-layout-desktop div + main.results-area; results-area gets 'full' when !isMobile; resize handler no longer toggles filtersOpen.

## v.1.0.00.235 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move price slider to results page above SortBar; put Sort (label + dropdown) next to results count on the left; restore Price Range dropdown in filter panel.

### Changes (detailed)

#### Added
- src/App.js: PriceSlider in results area above SortBar (when hasSearched), wrapped in .results-price-slider-wrap.
- src/App.css: .results-price-slider-wrap; .sort-bar-left as flex row with count + Sort.

#### Changed
- src/components/SortBar.js: Sort label and dropdown moved into .sort-bar-left (after count); view toggle only in .sort-bar-right.
- src/components/FilterSidebar.js: Price Range slider removed; Price Range dropdown restored; priceMin, priceMax, onPriceChange props removed.
- src/App.js: FilterSidebar calls no longer pass priceMin, priceMax, onPriceChange.

## v.1.0.00.234 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add dual-handle price range slider (bubbles, ticks, track) in filters; add priceMin/priceMax state and persist in search/saved state. Restyle results bar (count, view toggle, sort).

### Changes (detailed)

#### Added
- src/components/PriceSlider.js: dual-handle range slider with min/max bubbles, track fill, ticks; formatPrice (â‚±k/â‚±M/Any); listing-type config (sale/rent).
- src/data/listings.js: priceSliderConfig (sale: 0“10M step 500k; rent: 0“100k step 5k).
- src/App.css: .price-slider, .price-bubble, .price-slider-rail, .price-slider-track, .price-slider-range, .price-slider-tick, .price-slider-input and thumb styles; z-index for min/max inputs.

#### Changed
- src/App.js: priceMin, priceMax state; filter uses effectivePriceMin/effectivePriceMax (fallback to priceRangeIndex preset); handlePriceChange; currentFilterState, submitSearch, applySavedSearchState, hydrate include priceMin/priceMax; FilterSidebar receives priceMin, priceMax, onPriceChange.
- src/components/FilterSidebar.js: Price Range dropdown replaced with PriceSlider; props priceMin, priceMax, onPriceChange; display values from preset when priceMin/priceMax null.
- src/context/SearchContext.js: defaultSearchState and normalized state include priceMin, priceMax.
- src/context/SavedSearchesContext.js: serializeFilterState and deserializeFilterState include priceMin, priceMax, furnishedFilter.
- src/App.css: .sort-bar restyled (card-like container, padding, border, shadow); .results-count, .view-mode-toggle, .btn-view-mode, .sort-select updated (heights, hover, pill style).

## v.1.0.00.233 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix page scroll: lock html/body/#root to viewport with overflow hidden; add .app-root and .app-root-inner wrappers and flex chain so only .results-area scrolls.

### Changes (detailed)

#### Added
- src/App.js: .app-root and .app-root-inner wrappers around app tree.
- src/components/MainLayout.js: .app-layout-wrap div wrapping outlet and nav so flex layout applies.
- src/App.css: .app-layout-wrap, .app-root / .app-root-inner and descendant flex chain for no-scroll layout.

#### Changed
- src/index.css: html height 100% overflow hidden; body height 100% overflow hidden; #root height 100% min-height 0 overflow hidden display flex flex-direction column.
- src/App.css: .app-with-bottom-nav uses flex 1 min-height 0 instead of height 100vh.

## v.1.0.00.232 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- No scroll on home, filter pages, saved, messages; only search results area scrolls. Header stays fixed (does not move when scrolling results).

### Changes (detailed)

#### Changed
- src/App.css
 - .app-with-bottom-nav: height 100vh/100dvh, overflow hidden, flex column; .app-with-bottom-nav > *: flex 1 min-height 0 so outlet content fills viewport without body scroll.
 - .App: flex column, min-height 0, overflow hidden (no fixed height); .app-header: flex-shrink 0; .App > div: flex 1 min-height 0 flex column overflow hidden; .results-area: flex 1 min-height 0 overflow-y auto (only this area scrolls on results page).
 - .home-page, .search-filter-page: flex 1 min-height 0 overflow hidden (no scroll).
 - .page-with-header: flex column min-height 0 overflow hidden; .page-header: flex-shrink 0; .page-content: min-height 0 (flex 1 already) so Saved/Messages scroll only inside .page-content.
 - .search-filter-page-header: flex-shrink 0; .search-filter-page-main: min-height 0.

## v.1.0.00.231 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- UI centered vertically: home page and search filter pages (e.g. city) use full viewport height and center main content vertically.

### Changes (detailed)

#### Changed
- src/App.css
 - .home-page: min-height 100vh/100dvh, align-items: center so toggle + cards are vertically centered.
 - .search-filter-page: min-height 100vh/100dvh, flex column; .search-filter-page-main: flex: 1, flex column, justify-content: center so form is vertically centered below the header.

## v.1.0.00.230 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- City search: Region, Province, and City dropdowns always visible (Province shown between Region and City, disabled until a region is selected). Map: clicking Map on home goes straight to results in map view (no intermediate œShow on map page); /search/map still redirects to map results.

### Changes (detailed)

#### Changed
- src/pages/SearchCityPage.js
 - Province dropdown always rendered between Region and City; disabled when no region or region is œall. showProvince no longer gates visibility.
- src/pages/HomePage.js
 - Map card: on click calls submitSearch({ listingType, view: 'map', ...defaults }) and navigate to /sale or /rent (results in map view). Added useSearch, defaultSearchState.
- src/pages/SearchMapPage.js
 - From: page with œShow on map button. To: redirect-only; on mount submitSearch with view 'map' and navigate to /listingType (replace), render null. Keeps /search/map URL working.

## v.1.0.00.229 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Listing type toggle redesigned to match reference: sliding knob over œFor Rent / œFor Sale text, hidden checkbox, pill track with primary-colour knob that slides on toggle.

### Changes (detailed)

#### Changed
- src/components/ListingTypeToggle.js
 - From: button with track + thumb + label. To: label wrapping hidden checkbox and .listing-type-toggle div with two spans (For Rent, For Sale). Checked = For Sale (knob right), unchecked = For Rent (knob left). handleChange toggles via checkbox state.
- src/App.css
 - .listing-type-toggle-wrap: container with flex/center; .toggle-input: visually hidden; .listing-type-toggle: 160px Ã— 44px pill track, ::before as sliding knob (76px Ã— 36px, primary); spans 50% width, text colour flips (active = white, inactive = muted). .toggle-input:checked + .listing-type-toggle::before { transform: translateX(76px) } and span colour toggles.

## v.1.0.00.228 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat badge shows unread chats count (threads with unread), not total unread messages. Chat timestamps moved outside bubbles (right for sent, left for received) and shown only for the first message per minute. Sale/Rent is a single ON/OFF switch (ON = For Sale, OFF = For Rent) only on Home; removed from results page. Filter modal simplified: no Sale/Rent or location; added Furnished filter; filter modal always shows keyword, price, property type, furnished, advanced. Swipe left/right between nav pages (Home → Saved → Messages → Search).

### Changes (detailed)

#### Added
- src/context/ChatContext.js
 - unreadChatCount: number of threads with at least one unread message (for badge).
- src/pages/ChatPage.js, src/components/ChatModal.js
 - Timestamp outside bubble (right for me, left for them); showTimeForMessage(msg, prevMsg) and getMinuteKey(ts) so only first message per minute shows time.
- src/App.css
 - .chat-panel-message-row, .chat-panel-message-row-me/them, .chat-panel-time-outside for timestamp outside bubble.
- src/components/ListingTypeToggle.js
 - Redesigned as single switch (role="switch", aria-checked): ON = For Sale, OFF = For Rent; track + thumb; label shows current mode.
- src/App.css
 - .listing-type-toggle-switch-btn, .listing-type-toggle-switch-track, .listing-type-toggle-switch-thumb, .listing-type-toggle-switch-on (thumb slides right when sale).
- src/components/FilterSidebar.js
 - furnishedFilter, onFurnishedFilterChange props; Furnished dropdown (Any / Furnished / Semi-furnished / Unfurnished). When !locationOnly, form shows only Property Type, Price Range, Furnished (no Region/Province/City, no Listing Type).
- src/App.js
 - furnishedFilter state; filter by item.furnished in filteredListings; currentFilterState and submitSearch include furnishedFilter; hydrate and applySavedSearchState set furnishedFilter.
- src/context/SearchContext.js
 - furnishedFilter in defaultSearchState and normalized submit state.
- src/components/MainLayout.js
 - SWIPE_ROUTES, getSwipeRouteIndex(); touchStartRef, handleSwipeStart, handleSwipeEnd: swipe left → next tab, swipe right → prev tab (threshold 50px, horizontal > vertical).

#### Changed
- src/components/MainLayout.js
 - messagesPillData.count uses unreadChatCount from useChat() instead of summing thread unread messages.
- src/pages/MessagesPage.js, src/components/MessagesModal.js
 - displayableUnreadCount uses unreadChatCount from useChat() for badge.
- src/App.js
 - Removed listing-tabs block and ListingTypeToggle from results page; removed ListingTypeToggle import. Removed handleListingTypeChange. FilterSidebar calls: removed onListingTypeChange; added furnishedFilter, onFurnishedFilterChange; locationOnly={false} so filter modal never shows location.
- src/components/FilterSidebar.js
 - Removed Listing Type dropdown. When !locationOnly, form has only Property Type, Price Range, Furnished (location fields only when locationOnly).

#### Removed
- src/App.js
 - handleListingTypeChange (no longer used after removing Sale/Rent from filter).

## v.1.0.00.227 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Sale/Rent control styled as one button: single pill container with two segments inside (no gap); active segment uses primary background.

### Changes (detailed)

#### Changed
- src/components/ListingTypeToggle.js
 - Wrapped the two option buttons in a .listing-type-toggle-inner div so they render as one contiguous pill.
- src/App.css
 - .listing-type-toggle: removed gap. .listing-type-toggle-inner: new wrapper with single border and border-radius (one pill). .listing-type-toggle-option: no individual border/radius, transparent background; first/last get inner radius; .active fills with primary color.

## v.1.0.00.226 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Home search flow and category filter pages: home categories centered; each category (City, Keyword, Map, School) has a dedicated full-page filter screen; Submit navigates to results and persists last search; results page shows "Search now" when no search yet and last results when returning; bottom nav Search goes to results only.

### Changes (detailed)

#### Added
- src/context/SearchContext.js
 - SearchProvider, useSearch(): lastSearchState, hasSearched, submitSearch(state) to persist last search across navigation.
- src/pages/SearchCityPage.js
 - SearchCityPage(): Full-page city filter (region, province, city); Submit calls submitSearch and navigates to /sale or /rent.
- src/pages/SearchKeywordPage.js
 - SearchKeywordPage(): Full-page keyword input; Submit submits and navigates to results.
- src/pages/SearchMapPage.js
 - SearchMapPage(): Full-page "Show on map" action; Submit with view=map and navigate to results.
- src/pages/SearchSchoolPage.js
 - SearchSchoolPage(): Full-page school selector; Submit with selectedSchoolId and navigate to results.
- src/App.css
 - .home-page-inner, .search-filter-page*, .search-now-empty: centered home layout; shared filter page layout; "Search now" empty state.

#### Changed
- src/pages/HomePage.js
 - Card click navigates to /search/:path (city|keyword|map|school) with listingType in query; added .home-page-inner wrapper for centering.
- src/App.js
 - SearchProvider wraps routes. Routes for /search/city, /search/keyword, /search/map, /search/school. AppContent: useSearch(); hydrate filter state from lastSearchState when hasSearched; view derived from lastSearchState.view when hasSearched; "Search now" empty state when !hasSearched; handleApplyFilters calls submitSearch and setFiltersOpen(false); both FilterSidebars use onApply={handleApplyFilters}.
- src/components/MainLayout.js
 - handleSearch: navigate to /rent or /sale based on lastSearchState.listingType when hasSearched, else /sale; no longer opens filter sheet.
- src/App.css
 - .home-page: flex + center; .home-page-inner max-width 480px for centered categories.

## v.1.0.00.225 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Home page redesign: default landing is a 4-card search framework (City, Map, Keyword, School) with a single Sale/Rent toggle. Each card navigates to the corresponding filtered view; city uses location-only filters, map opens map view, keyword shows search bar and results, school uses a school selector and nearby properties by distance.

### Changes (detailed)

#### Added
- src/components/ListingTypeToggle.js
 - ListingTypeToggle(): Single toggle for For Sale / For Rent; supports controlled (value/onChange) for Home and URL-synced on listing pages.
- src/pages/HomePage.js
 - HomePage(): Four search cards (City, Map, Keyword, School) and Sale/Rent toggle; cards navigate to /sale or /rent with ?view=city|map|search|school.
- src/data/schools.js
 - schools array, getSchoolById(): Static list of Philippine schools/universities with coordinates for nearby-properties search.
- src/utils/distance.js
 - haversineKm(): Haversine distance in km for filtering listings by distance from selected school.

#### Changed
- src/App.js
 - AppContent(): Replaced Sale/Rent NavLinks with ListingTypeToggle. Added useSearchParams for view; effectiveViewMode forces map when view=map; view=search shows SearchBar at top; view=city opens filter sheet on mobile and uses locationOnly FilterSidebar; view=school adds school selector and schoolFilteredListings (distance-filtered, 10 km). listingsForView and visibleListings drive results; handleViewDetails uses visibleListings; map uses listingsForView and index-based handler.
 - Index route now renders HomePage instead of Navigate to /sale.
- src/components/FilterSidebar.js
 - locationOnly prop: when true, shows only region/province/city and Apply button; hides SearchBar, saved presets, listing type, property type, price, advanced filters.
- src/components/MainLayout.js
 - handleLogoHome: From navigate('/sale') to navigate('/'). isHomeActive: From path === '/' || '/sale' || '/rent' to path === '/' only.
- src/App.css
 - Replaced .listing-tab with .listing-type-toggle / .listing-type-toggle-option. Added .home-page, .home-search-cards, .home-search-card, .results-search-bar-wrap, .school-selector-wrap, .home-search-card:focus-visible.

#### Removed
- src/App.js
 - NavLink import and two listing tabs (For Sale / For Rent) in favor of ListingTypeToggle.
- src/App.css
 - .listing-tab, .listing-tab.active, .listing-tab:active (replaced by toggle classes).

## v.1.0.00.224 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat behavior stabilized per mobile UX requirements: opens already at latest message, header remains fixed when focusing textbox, and messages/composer track keyboard movement together.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Initial open could visually scroll from top to bottom; keyboard inset changes did not always keep messages anchored with composer movement.
 - To: Added `messagesListRef` and deterministic bottom anchoring (`scrollTop = scrollHeight`) in `useLayoutEffect`; added double-RAF re-anchor on keyboard inset updates while composer is focused; unified bottom sync via shared `activeInset`; kept focus-after-send behavior.
- src/App.css
 - .chat-page, .chat-page-header
 - From: Chat container/header positioning allowed viewport/keyboard interactions to move header unexpectedly.
 - To: Chat page pinned with `position: fixed; inset: 0`; header restored to `position: sticky; top: 0` inside fixed chat layout for stable top positioning.

## v.1.0.00.223 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat now opens at the bottom immediately (no visible scroll-down), and header remains fixed while composer/messages move without transition jitter.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Messages appeared to load at top then animate to bottom.
 - To: Added `useLayoutEffect` auto-scroll to end on thread/message updates so initial render starts at bottom with no visible animation.
- src/App.css
 - .chat-page-header, .chat-page-form
 - From: Header used `position: sticky`; composer had transform transition that could jitter.
 - To: Header set to `position: relative` (fixed by layout, not scrolling pane); removed composer transition for stable keyboard movement.

## v.1.0.00.222 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Reduced chat open/keyboard jitter and restored stable sticky header behavior while typing.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Keyboard inset transform/padding applied immediately on open, which could jitter; header appeared unstable during focus transitions.
 - To: Added focus-gated keyboard offset (`activeInset` = `keyboardInset` only when input is focused). Messages/composer move only during active typing, removing startup jitter.
- src/App.css
 - .chat-page-header, .chat-page-messages, .chat-page-form
 - To: Reinforced header width for sticky stability, added `overscroll-behavior: contain` on messages pane, and shortened form transform transition to reduce visible jitter.

## v.1.0.00.221 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat keyboard UX improved: keyboard now stays open after sending, and messages track the input bar movement as it rises/falls with keyboard.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Keyboard could close after one send; form offset used margin causing less smooth coupling with message pane.
 - To: Added `inputRef` focus restore after send, prevented send button from stealing focus (`onMouseDown`/`onTouchStart` preventDefault), moved form using `transform: translateY(-keyboardInset)` while message list uses matching bottom padding.
- src/App.css
 - .chat-page-form
 - Added transform transition/will-change for smoother keyboard-linked movement.

## v.1.0.00.220 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Removed chat header jitter on input focus by stopping full-container viewport repositioning; keyboard handling now only adjusts bottom inset for the form/messages.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Applied `visualViewport` `top/height` to the whole chat container, which could cause header jitter while keyboard animates.
 - To: Keep chat container static; retain keyboard inset logic only for `chat-page-form` margin and `chat-page-messages` bottom padding.

## v.1.0.00.219 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat input now moves up with the mobile keyboard while keeping the header pinned.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Header stability improved, but message form could remain behind keyboard on some mobile WebViews.
 - To: Added keyboard inset calculation from `visualViewport` (`innerHeight - (vv.height + vv.offsetTop)`) plus `window.resize` fallback; apply inset to chat form `marginBottom` and message list `paddingBottom` so input and latest messages stay visible above keyboard.

## v.1.0.00.218 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed chat header shifting when focusing the message textbox on mobile keyboards.

### Changes (detailed)

#### Changed
- src/pages/ChatPage.js
 - ChatPage()
 - From: Keyboard/viewport resize could move the header when input focused.
 - To: Added `visualViewport` resize/scroll handling and applied viewport-bound fixed layout (`top`, `height`) so the chat container tracks the visual viewport while keeping the header stable.

## v.1.0.00.217 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat header now stays fixed at the top while messages scroll.

### Changes (detailed)

#### Changed
- src/App.css
 - .chat-page, .chat-page-header, .chat-page-body
 - From: Header relied on default flow; page/body could scroll in a way that let the header move.
 - To: Chat page now uses fixed viewport height with overflow hidden; header is explicitly `position: sticky; top: 0; z-index: 60`; body overflow is hidden so only message pane scrolls under a pinned header.

## v.1.0.00.216 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Restored bottom-nav Menu icon to the expected menu glyph.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - MainLayout()
 - From: Menu button icon used `fa-ellipsis-v`.
 - To: Menu button icon now uses `fa-bars`.

## v.1.0.00.215 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Android emulator build now uses the live API/domain instead of localhost alias.

### Changes (detailed)

#### Changed
- .env.android.emulator
 - REACT_APP_API_URL
 - From: `http://10.0.2.2:5000`
 - To: `https://balhinbalay.com`

## v.1.0.00.214 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Bottom nav is now hidden on chat pages and remains visible elsewhere.

### Changes (detailed)

#### Changed
- src/components/MainLayout.js
 - MainLayout()
 - From: `showNav` was always `true` (nav visible on all routes).
 - To: `showNav = !path.startsWith('/chat/')` so chat route hides the nav while all other pages keep it visible.

## v.1.0.00.213 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed broken tick image in confirmation emails by embedding `tick.png` inline as CID attachment (email-safe), with URL fallback.

### Changes (detailed)

#### Changed
- server/services/email.js
 - sendConfirmationEmail(toEmail, confirmUrl, userName)
 - From: `<img src="${APP_URL}/tick.png">`, which breaks when the public URL/file is unavailable.
 - To: Resolve local `tick.png` from known paths and send as inline attachment (`cid:bb-verify-tick`); fallback to `${APP_URL}/tick.png` only if no local file is found.

## v.1.0.00.212 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Confirmation email now uses `tick.png` image instead of a text tick character, positioned in the card header area above the title.

### Changes (detailed)

#### Changed
- server/services/email.js
 - sendConfirmationEmail(toEmail, confirmUrl, userName)
 - From: A green text checkmark character (`âœ”`) above the heading.
 - To: An image icon (`tick.png`) loaded from `${APP_URL}/tick.png` (fallback base `https://balhinbalay.com`) and centered above the heading for cleaner hierarchy.

## v.1.0.00.211 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Sample confirmation email now defaults to production app URL instead of localhost.

### Changes (detailed)

#### Changed
- server/send-sample-email.js
 - main()
 - From: sampleUrl defaulted to `http://localhost:3000`.
 - To: sampleUrl now defaults to `https://balhinbalay.com` when `APP_URL` is not set.

## v.1.0.00.210 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Registration confirmation email now uses your provided HTML card template with a styled verify button and live verification link.

### Changes (detailed)

#### Changed
- server/services/email.js
 - sendConfirmationEmail(toEmail, confirmUrl, userName)
 - From: Minimal inline HTML paragraphs with a plain link.
 - To: Full HTML email layout (centered white card on gray background), green check icon, title/body text, blue CTA button, info/footer text. Button `href` now uses `${confirmUrl}`.

## v.1.0.00.209 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Bottom nav stays visible on property details: higher z-index so it stays on top; property detail content has bottom padding so it does not sit under the nav when scrolled.

### Changes (detailed)

#### Changed
- src/App.css: .app-bottom-nav z-index 140 to 1000; .property-detail-page-content padding-bottom added (72px + safe area) so scrollable content clears the nav.

## v.1.0.00.208 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Bottom nav is visible on all pages: property, chat, profile, settings, add-property, admin, confirm-email now render inside MainLayout so the nav bar stays at the bottom everywhere.

### Changes (detailed)

#### Changed
- src/App.js: Nested all routes under MainLayout (property/:id, chat/:threadId, profile, settings, add-property, admin, confirm-email).
- src/components/MainLayout.js: showNav always true; removed useChatModal and usePropertyModal.

## v.1.0.00.207 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Property page has one header only: the teal bar with back + title + actions (favorite, share, edit/unlist). Duplicate page header removed.

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js: Removed separate page header; PropertyDetailContent is shown with showBackButton and onBack so the teal bar is the only header (back | title | actions).
- src/App.css: Property page uses single .modal-header as sticky header; removed .property-page .page-header and .property-page-title; teal header has safe-area padding and sticks on scroll.

## v.1.0.00.206 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Property screen is now a real page, not a modal on a page: PropertyPage renders page header + PropertyDetailContent only (no PropertyModal, no modal wrapper). Same content, normal page layout and scroll.

### Changes (detailed)

#### Changed
- src/pages/PropertyPage.js: Renders a normal page (property-page, page-header with back + title, page-content) and PropertyDetailContent directly; no PropertyModal or asPage.
- src/App.css: Property page styles use .property-detail-page-content; page scrolls via main.page-content overflow-y auto; removed modal-as-page and old property-page-content modal overrides for this flow.

## v.1.0.00.204 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Property page is now the same PropertyModal component in œpage mode (asPage): one component for both overlay modal and full-page view; back button in header when as page.

### Changes (detailed)

#### Changed
- src/components/PropertyModal.js: Added `asPage` prop; when true, no backdrop, show back button instead of close, pass showBackButton/onBack to PropertyDetailContent.
- src/components/PropertyDetailContent.js: Added `showBackButton` and `onBack`; render back button in header when set.
- src/pages/PropertyPage.js: Renders PropertyModal with `asPage` and same handlers (no separate page layout or PropertyDetailContent); still handles not-found and unlist ConfirmModal.
- src/App.css: .property-modal-as-page (fixed full viewport, full-width dialog/content), .property-detail-back-btn (header back button), desktop override so as-page modal stays full width.

## v.1.0.00.203 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Property page layout is now full-bleed: no side margins, no card-style rounded corners so it reads as a true full page.

### Changes (detailed)

#### Changed
- src/App.css: .property-page uses full viewport height and elevated surface background; .property-page .page-content and .property-page-content have zero horizontal (and top) padding; .property-page-content .modal-content forced to full width, no border-radius, no box-shadow; modal-body keeps internal padding; desktop media query override so property page modal-content stays edge-to-edge.

## v.1.0.00.202 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Property detail and Chat are now full pages (/property/:id, /chat/:threadId) so Android back (and browser back) navigate back instead of closing modals.

### Changes (detailed)

#### Added
- src/components/PropertyDetailContent.js: Shared property detail UI used by PropertyModal and PropertyPage.
- src/pages/PropertyPage.js: Full-page property detail at /property/:id; back button and hardware back go to previous screen; Chat opens /chat/:threadId; Edit/Unlist handled on page.
- src/pages/ChatPage.js: Full-page chat at /chat/:threadId; back returns to messages or previous screen.
- src/context/ChatContext.js: createOrGetThread(listingId) to get or create a thread and return thread id for navigation.
- Routes /property/:id and /chat/:threadId (outside MainLayout so no bottom nav on these screens).
- App.css: .property-page, .property-page-content, .chat-page, .chat-page-body, .chat-page-messages, .chat-page-form styles.

#### Changed
- src/components/PropertyModal.js: Now renders PropertyDetailContent inside modal wrapper (kept for any legacy use).
- src/context/ChatModalContext.js: openChat(property, threadId) now navigates to /chat/:threadId when threadId is set; ChatModal no longer rendered.
- src/App.js: Listing tap and handleOpenProperty navigate to /property/:id; removed PropertyModal, showModal, selectedProperty, unlist ConfirmModal from AppContent; openProperty state effect navigates to /property/:id; push notification with threadId navigates to /chat/:threadId.
- src/pages/MessagesPage.js: Thread tap navigates to /chat/:threadId; push state threadId triggers navigate to /chat/:threadId; removed useChatModal.
- src/pages/SavedPage.js: Saved property tap navigates to /property/:id instead of /sale with state.
- src/pages/SavedPage.js: useListings() now uses listings (not apiListings).

#### Removed
- Property detail and chat modal flow from main app flow; modals replaced by page navigation.

## v.1.0.00.201 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Messages list: bold text for unread threads, normal weight for read.

### Changes (detailed)

#### Changed
- src/pages/MessagesPage.js: Add class messages-panel-row-has-unread on row when thread.unreadCount > 0.
- src/App.css: .messages-panel-row-name default font-weight 500; .messages-panel-row-has-unread .messages-panel-row-name font-weight 700; .messages-panel-row-preview default 400, unread 600.

## v.1.0.00.200 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Messages list preview now shows their message text without having to open the thread. API returns last message per thread; client uses it for preview.

### Changes (detailed)

#### Added
- server/routes/chat.js: GET /api/chat/threads now includes last_message_text, last_message_at, last_message_sender_id per thread; response adds lastMessage: { text, createdAt, senderId }.
- src/context/ChatContext.js: thread shape now includes lastMessage from API.
- src/pages/MessagesPage.js: use thread.lastMessage from API for preview when available (useAuth for isFromUser); fall back to getMessagesByThreadId cache when API lastMessage not present.

#### Changed
- Messages list shows the other person's message or "Sent X ago" / "now" immediately from thread list data instead of only after opening the conversation.

## v.1.0.00.199 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Messages list preview: show their message text when last message is from them; when last message is from you show "Sent X m/h" or "now" instead of "You: ...".

### Changes (detailed)

#### Changed
- src/pages/MessagesPage.js: Preview line shows other participant's message when last message is from them; when last message is from current user, show "Sent {relativeTime}" or "now" instead of "You: [message]".

## v.1.0.00.198 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Bottom nav stays visible when navigating to Saved, Messages, Sale, Rent (nav on top of pages). MainLayout wraps these routes and renders the nav; ProfileDrawer and logout moved to layout.

### Changes (detailed)

#### Added
- src/context/FiltersOpenContext.js: openRequested, requestOpen, clearRequest so MainLayout Search can request filters open on sale/rent.
- src/context/PropertyModalContext.js: isPropertyModalOpen, setPropertyModalOpen so MainLayout can hide nav when property modal is open.
- src/components/MainLayout.js: Layout with Outlet + bottom nav + ProfileDrawer + logout ConfirmModal; showNav when !isChatModalOpen && !isPropertyModalOpen; Search calls requestOpenFilters and navigates to /sale if needed.

#### Changed
- src/App.js: Routes for /, /sale, /rent, /saved, /messages nested under MainLayout; FiltersOpenProvider and PropertyModalProvider wrap Routes. AppContent: removed bottom nav, ProfileDrawer, logout ConfirmModal, handleLogoHome; added useFiltersOpen (open filters when requested), usePropertyModal (setPropertyModalOpen(showModal)); removed showHeaderMenu, loggingOut, showLogoutConfirm state.
- MainLayout provides bottom nav and padding for all main tabs so the nav stays on top when switching pages.

## v.1.0.00.197 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Messages list: unread dot on the right; name on top and message/preview below; show last message or "Sent X ago"; smaller avatar and text.

### Changes (detailed)

#### Changed
- src/pages/MessagesPage.js: Row order avatar → main → unread dot. Main content: name (title + otherParticipantName) on top; below show last message text or "Sent {relativeTime}" when no message. Preview always shown when available.
- src/App.css: .messages-panel-row smaller padding and min-height; .messages-panel-row-avatar 40px; .messages-panel-row-main column layout (name then preview); .messages-panel-row-name 0.875rem; .messages-panel-row-preview 0.8125rem; .messages-panel-row-unread 8px, margin-left: auto (right side). Removed .messages-panel-row-top.

## v.1.0.00.196 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Messages page showed no threads despite notifications: fixed wrong ListingsContext prop (listings not apiListings). Threads now show even when listing not in main feed (use thread.listingTitle fallback).

### Changes (detailed)

#### Fixed
- src/pages/MessagesPage.js: From: useListings() destructured apiListings (undefined), so allListings was [] and every thread was filtered out. To: use listings from useListings(), so Messages page shows all threads. Also show threads whose listing is not in the feed by using a fallback listing object (id, title from thread.listingTitle, images: []).

## v.1.0.00.195 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Messages is a full page at /messages (not a modal). Messages put back on the bottom nav; opening a thread opens the chat modal (from context). Push notification navigates to /messages with threadId.

### Changes (detailed)

#### Added
- src/context/ChatModalContext.js: ChatModalProvider holds openChat/closeChat state and renders ChatModal; useChatModal() for opening chat from any route; Back to messages navigates to /messages.
- src/pages/MessagesPage.js: Full-page messages list with back header; uses useChat(), useListings(), useChatModal(); supports location.state.threadId for push deep link.
- src/App.js: Route /messages → MessagesPage; ChatModalProvider wraps Routes; Messages back on bottom nav (navigate to /messages or openLogin); unread badge on Messages nav item.
- src/App.css: .messages-page, .messages-page-content, .messages-page-list, .messages-page-badge.

#### Changed
- src/App.js: From: Messages as floating pill + MessagesModal. To: Messages as bottom nav item → /messages page; ChatModal and open state moved to ChatModalContext; PropertyModal onOpenChat uses openChat(p, null); push onTap navigates to /messages with state.threadId.
- src/App.js: Removed showChatModal, chatProperty, chatThreadId, showMessagesModal, notificationThreadId; use useChatModal() and anyModalOpen = isChatModalOpen || showModal.

#### Removed
- src/App.js: MessagesModal import and usage; floating-messages-pill; ChatModal render from AppContent (now in ChatModalProvider).

## v.1.0.00.194 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Saved is a full page at /saved instead of a pull-up modal. Messages moved to floating pill (nav no longer under it). Filter is a floating circle button at top-right (~15% from top).

### Changes (detailed)

#### Added
- src/pages/SavedPage.js: full-page Saved with back header and favorite list; uses useFavorites + useListings; opening a property navigates to /sale with state.openProperty so AppContent opens the property modal.
- src/App.js: Route /saved → SavedPage; useEffect to open property modal when location.state.openProperty is set; floating-filters-btn (top 15%, right); floating-messages-pill (above bottom nav).
- src/App.css: .floating-filters-btn (fixed top 15%, right); .floating-messages-pill and .floating-messages-pill-badge; .saved-page, .saved-page-empty, .saved-page-list, .saved-page-card, etc.

#### Changed
- src/App.js: From: header with filter button, bottom nav with Messages in center. To: header without filter; Saved in nav navigates to /saved; Messages removed from nav and shown as floating pill; filter is floating circle at top-right.
- src/App.js: ProfileDrawer onOpenSavedProperties now navigates to /saved instead of opening FavoritesModal.
- src/App.css: Removed .app-header-filter-btn; added floating filter and messages pill styles.

#### Removed
- src/App.js: FavoritesModal import and usage; showFavoritesModal state. FavoritesModal component file kept for possible reuse.

## v.1.0.00.193 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Header: logo removed, filter button in header. Bottom nav: Home, Saved, Messages (center), Search, Menu/Log in. Pull-to-refresh: spinning loader always visible during refresh.

### Changes (detailed)

#### Added
- src/App.js: app-header-filter-btn in header (opens filters); app-bottom-nav with Home, Saved, Messages (center), Search, Menu/Log in; app-has-bottom-nav class for content padding.
- src/App.css: .app-header-filter-btn; .app-bottom-nav, .app-bottom-nav-item, .app-bottom-nav-messages, .app-bottom-nav-messages-badge, .app-has-bottom-nav .results-area padding; .pull-to-refresh-indicator-active, .pull-to-refresh-spinner.

#### Changed
- src/App.js: From: header with logo + app-header-actions (Favorites, Search, Menu/Login). To: header with filter button only. From: floating-filters-btn and floating-messages-pill. To: bottom nav with all actions, Messages in center.
- src/App.css: From: logo and header-actions grid/layout. To: header filter button layout. Removed floating-filters-btn and floating-messages-pill blocks.
- src/components/PullToRefresh.js: When refreshing, indicator uses opacity 1 and class pull-to-refresh-indicator-active; spinner has pull-to-refresh-spinner class for visibility.

#### Removed
- src/App.js: logo button and image; app-header-actions block; floating-filters-btn; floating-messages-pill.

## v.1.0.00.192 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Confirm email page: send confirmation request only once so the first click shows success instead of "invalid or already used" (fixes double run in React Strict Mode).

### Changes (detailed)

#### Fixed
- src/pages/ConfirmEmailPage.js: use requestSentRef so the confirm API is called only once; From: effect could run twice (e.g. Strict Mode), second request failed after first cleared token and UI showed error. To: single request, UI shows success on first click.

## v.1.0.00.191 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- New accounts start as 'pending' until email is confirmed; confirm-email sets them to 'active'. Admin UI shows Pending badge; login blocked for pending.

### Changes (detailed)

#### Added
- server/migrations/add-account-status-pending.sql: allow account_status 'pending'; drop and re-add check constraint.
- server/run-migrations.js: add add-account-status-pending.sql to migrations list.
- src/App.css: .admin-badge-status-pending for Admin Users table.

#### Changed
- server/routes/auth.js: register INSERT sets account_status = 'pending'. confirm-email UPDATE also sets account_status = 'active'. login rejects status === 'pending' with same message as unverified email (verify your email / EMAIL_NOT_VERIFIED).

## v.1.0.00.190 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Confirmation email link: when API runs on localhost:5000, use http://localhost:3000 so the link opens the React app.

### Changes (detailed)

#### Changed
- server/routes/auth.js (getAppUrl): From: using req.get('host') so link could be localhost:5000. To: if host is localhost:5000 use http://localhost:3000; APP_URL still overrides when set.

## v.1.0.00.189 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin: add "Delete" user action that permanently removes a user and all their data from the database (listings, favorites, saved searches, chat, etc.). Cannot delete own account.

### Changes (detailed)

#### Added
- server/routes/admin.js: DELETE /api/admin/users/:id — admin only; deletes target user's listings then user row (CASCADE removes related data). Returns 400 if targeting self, 404 if user not found, 204 on success.
- src/pages/AdminPage.js: "Delete" button per user row (hidden for current admin), openDeleteUserConfirm(u), handleDeleteUser(userId); confirm modal explains permanent deletion.

## v.1.0.00.188 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Delete account: visible in profile drawer; opening it navigates to Settings and scrolls to the delete section.

### Changes (detailed)

#### Added
- ProfileDrawer: "Delete account" button in Account section (danger style) that navigates to /settings#delete-account.
- App.js: onDeleteAccount prop for ProfileDrawer (navigate to /settings#delete-account).
- SettingsPage: useLocation, deleteSectionRef; useEffect scrolls to #delete-account-section when hash is #delete-account (when logged in).

#### Changed
- None.

## v.1.0.00.187 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Delete account: backend endpoint and Settings UI to permanently delete the user and all associated data (listings, favorites, saved searches, chat, push tokens, etc.). Requires password confirmation. Logout now clears stored auth.

### Changes (detailed)

#### Added
- server/routes/users.js: DELETE /api/users/me — requires body { password }; verifies password then deletes user's listings and user row (CASCADE removes favorites, saved_searches, recently_viewed, user_push_tokens, chat_threads, chat_messages, thread_reads).
- src/pages/SettingsPage.js: "Delete account" section with password field and "Delete my account" button; on success calls logout and navigates to /sale.
- src/App.css: .settings-delete-section for spacing/border above delete block.

#### Changed
- src/api/client.js: api.delete(path, body) now accepts optional body for DELETE requests.
- src/context/AuthContext.js: logout() now calls saveAuth(null, null) so stored auth (localStorage + Capacitor Preferences) is cleared and user is not restored on next load.

## v.1.0.00.186 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Email confirmation: clearer message when link is invalid or already used; hint on confirm page to try logging in if link was already clicked.

### Changes (detailed)

#### Changed
- server/routes/auth.js (GET /confirm-email): From: returning "Invalid confirmation token." when token not found. To: returning "This link is invalid or was already used. Try logging in; if it doesn't work, use \"Resend confirmation email\" on the sign-in page."
- src/pages/ConfirmEmailPage.js: From: error state showed only message and button. To: also show hint "If you already clicked this link once, your email may be confirmed. Try logging in."
- src/App.css: added .confirm-email-hint for spacing below the hint.

## v.1.0.00.185 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- LoginModal: show/hide password buttons (eye icon) on Password and Confirm password; UI text "Passwords match" / "Passwords do not match" on signup.

### Changes (detailed)

#### Added
- src/components/LoginModal.js: state showPassword, showConfirmPassword; eye/eye-slash toggle buttons for both password fields; "Passwords match." (green) and "Passwords do not match." (red) below Confirm password when both fields have content.
- src/App.css: .password-input-wrap, .password-toggle-btn for inline show/hide password button.

## v.1.0.00.184 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Search history: "Saved searches" in profile drawer (opens filter sheet); enlarged saved-filters section in FilterSidebar (full-width, larger touch targets, clearer title). Chat/mobile: message row min-height and avatar fallback in MessagesModal.

### Changes (detailed)

#### Added
- ProfileDrawer: `onOpenSavedSearches` prop and "Saved searches" button (opens filter sheet from sidebar).
- App.js: pass `onOpenSavedSearches={() => setFiltersOpen(true)}` to ProfileDrawer.

#### Changed
- FilterSidebar (App.css): .filter-saved-presets wider padding and spacing; .filter-saved-list-title 1rem; .filter-saved-item min-height 44px, padding 12px 0; .filter-saved-item-name 0.9375rem; .filter-saved-item-actions .btn min-height 36px.
- MessagesModal: thread row avatar fallback (fa-home icon when listing has no image); .messages-panel-row min-height 56px for touch targets.

#### Fixed
- src/pages/ProfilePage.js: destructure `refreshUser` from useAuth() so avatar upload/remove can refresh user state (fixes no-undef build error).

## v.1.0.00.183 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Skip rental search options in current plan; document in FUTURE_PLANS.md. Plan-to-finish: only search history (enlarge/move) remains; execution order renumbered.

### Changes (detailed)

#### Added
- FUTURE_PLANS.md: rental search options (rental_term, school/university) documented for later implementation.

#### Changed
- .cursor/plans/plan-to-finish.md: removed "Search UI" (rental_term, school) from remaining work; section 2 is now "Search history (saved filters)" only; execution order 1“5 (was 1“6); quick reference "Search" → "Search history"; note added that rental search moved to FUTURE_PLANS.md.

## v.1.0.00.182 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile picture: migration avatar_url, GET/PATCH /me and POST/DELETE /me/avatar, ProfileDrawer avatar display, Profile page upload/remove.

### Changes (detailed)

#### Added
- server/migrations/add-user-avatar.sql: add users.avatar_url VARCHAR(500).
- server/run-migrations.js: include add-user-avatar.sql.
- server/routes/users.js: POST /me/avatar (body image dataUrl), DELETE /me/avatar; GET/PATCH /me include avatar_url.
- src/context/AuthContext.js: refreshUser(), updateProfile accepts avatar_url; login and native restore call refreshUser.
- src/components/ProfileDrawer.js: show user avatar image when avatar_url set, else placeholder icon; baseUrl for relative URLs.
- src/pages/ProfilePage.js: Profile photo section with change/remove, fileToDataUrl, resizeImageToDataUrl, api post/delete avatar.
- src/App.css: profile-drawer-avatar img, profile-avatar-preview styles.

#### Changed
- server/routes/users.js: GET /me and PATCH /me return/accept avatar_url; PATCH validates length.

## v.1.0.00.181 — Development
Date: 2026-03-08
Type: Dev Change

### Summary
- Push notifications toggle: user preference (DB push_enabled), API GET/PATCH /me, Settings page toggle, server skips sending when disabled.

### Changes (detailed)

#### Added
- server/migrations/add-user-push-enabled.sql: add users.push_enabled BOOLEAN DEFAULT true.
- server/run-migrations.js: include add-user-push-enabled.sql.

#### Changed
- server/routes/users.js: GET /me and PATCH /me include push_enabled; PATCH accepts push_enabled.
- server/services/push.js: sendPushToUser checks user push_enabled and skips if false.
- src/pages/SettingsPage.js: Notifications section with push toggle (native); syncs with server, PATCH and DELETE token on toggle.
- src/context/PushContext.js: setPushEnabled updates state immediately.

## v.1.0.00.180 — Development
Date: 2026-03-08
Type: Dev Change

### Summary
- Map coordinates: MapPicker center fallback to default when city/barangay missing.

### Changes (detailed)

#### Changed
- src/components/AddPropertyForm.js: MapPicker center prop adds fallback { lat: 10.3157, lng: 123.8854 }.

## v.1.0.00.179 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Phase 1 plan: owner listing delete becomes unlist (soft); add confirmation button after add/edit property (no auto-navigation).

### Changes (detailed)

#### Changed
- server/routes/listings.js: DELETE /api/listings/:id now sets status = unlisted instead of removing the row; returns 200 with updated listing.
- src/context/UserListingsContext.js: deleteListing renamed to unlistListing.
- src/App.js: use unlistListing; confirm modal and handler updated to Unlist.
- src/components/PropertyModal.js: owner button label to Unlist, icon fa-eye-slash.
- src/components/AddPropertyForm.js: after submit success, show Back to listings button; removed setTimeout auto-navigation.

## v.1.0.00.178 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Replace Android app launcher icons with assets from the project™s "android icons" folder (mipmap-* and values/ic_launcher_background).

### Changes (detailed)

#### Changed
- android/app/src/main/res/: mipmap-anydpi-v26, mipmap-ldpi, mipmap-mdpi, mipmap-hdpi, mipmap-xhdpi, mipmap-xxhdpi, mipmap-xxxhdpi, and values/ic_launcher_background.xml replaced/copied from "android icons" folder.

## v.1.0.00.177 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix Android app icon: replace all mipmap launcher assets with logo.png so the default Capacitor/Android icon no longer appears.

### Changes (detailed)

#### Changed
- android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/: ic_launcher.png, ic_launcher_round.png, and ic_launcher_foreground.png in each folder replaced with public/logo.png.
- android/app/src/main/AndroidManifest.xml: reverted to android:icon="@mipmap/ic_launcher" and android:roundIcon="@mipmap/ic_launcher_round" so standard mipmap resolution is used.
- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml and ic_launcher_round.xml: reverted foreground to @mipmap/ic_launcher_foreground (now our logo in each density).

## v.1.0.00.176 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Use public/logo.png as the native app icon for Android and iOS (Capacitor).

### Changes (detailed)

#### Added
- android/app/src/main/res/drawable/ic_launcher_foreground.png: copy of public/logo.png used as app icon.

#### Changed
- android/app/src/main/AndroidManifest.xml: android:icon and android:roundIcon set to @drawable/ic_launcher_foreground (replacing @mipmap/ic_launcher and @mipmap/ic_launcher_round).
- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml: foreground drawable set to @drawable/ic_launcher_foreground.
- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml: foreground drawable set to @drawable/ic_launcher_foreground.
- ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png: replaced with public/logo.png (1024Ã—1024 source recommended for best quality).

## v.1.0.00.175 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Add build:tunnel script and doc so tunnel build always uses https://balhinbalay.com (fix "Failed to fetch" with localhost after hard reset).

### Changes (detailed)

#### Added
- package.json: script build:tunnel (env-cmd -f .env.production craco build).
- TUNNEL.md: use npm run build:tunnel and optional "rm -rf build" + rebuild if API still shows localhost.

## v.1.0.00.174 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Android app: production build script and docs so app works via tunnel (https://balhinbalay.com/api) from anywhere.

### Changes (detailed)

#### Added
- package.json: script cap:sync:android:production (env-cmd -f .env.production npm run build && npx cap sync android).
- CAPACITOR.md: "Production / tunnel (use from anywhere)" and cap:sync:android:production in API URL section and commands table.
- TUNNEL.md: Android app note and npm run cap:sync:android:production.

## v.1.0.00.173 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Reroute app to use https://balhinbalay.com/api in production builds via .env.production.

### Changes (detailed)

#### Added
- .env.production: REACT_APP_API_URL=https://balhinbalay.com so production build uses tunnel API.
- TUNNEL.md: note that production build uses tunnel URL for API.

## v.1.0.00.172 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Add TUNNEL.md: Cloudflare Tunnel (cloudflared) setup to expose local server + React app from outside the network.

### Changes (detailed)

#### Added
- TUNNEL.md: Install cloudflared, login, create tunnel, config.yml (hostname → localhost:5000), route DNS, run tunnel; optional service; mobile app note for tunnel URL as API base.

## v.1.0.00.171 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Use direct import from @capacitor/push-notifications instead of registerPlugin so the real plugin (and native bridge) is used on device.

### Changes (detailed)

#### Changed
- src/App.js: From: registerPlugin('PushNotifications') from @capacitor/core (returned "not implemented" stub). To: import('@capacitor/push-notifications') and use PushNotifications so the official plugin and native implementation are used.

## v.1.0.00.170 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix "PushNotifications plugin is not implemented on android": install @capacitor/push-notifications and run cap sync so native plugin is included.

### Changes (detailed)

#### Fixed
- @capacitor/push-notifications was in package.json but not installed in node_modules; native Android project had no push-notifications module. Ran npm install @capacitor/push-notifications and npx cap sync android so capacitor.settings.gradle and capacitor.build.gradle include capacitor-push-notifications (fixes "not implemented on android").

## v.1.0.00.169 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push: retry register() after 15s; add "Enable push notifications" in profile drawer on native so user can manually trigger token registration.

### Changes (detailed)

#### Added
- src/App.js: pushRegisterTrigger state; effect re-runs on trigger; retry PushNotifications.register() after 15s; pass isNative and onEnableNotifications to ProfileDrawer.
- src/components/ProfileDrawer.js: "Notifications" section with "Enable push notifications" button when isNative and onEnableNotifications (triggers push registration again).

## v.1.0.00.168 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix Android build: onResume() override must be public to match BridgeActivity.

### Changes (detailed)

#### Fixed
- android/.../MainActivity.java: onResume() changed from protected to public so override matches parent (fixes "attempting to assign weaker access privileges").

## v.1.0.00.167 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Android 13+: request POST_NOTIFICATIONS from MainActivity on resume so the system "Allow notifications?" prompt appears when the app opens.

### Changes (detailed)

#### Added
- android/.../MainActivity.java: requestNotificationPermissionIfNeeded() in onResume; on API 33+ request POST_NOTIFICATIONS if not granted so the system dialog shows (fixes "no allow notifs prompt").

## v.1.0.00.166 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix push on device: use registerPlugin('PushNotifications') from @capacitor/core so plugin resolves in WebView (fixes "Failed to resolve module specifier '@capacitor/push-notifications'").

### Changes (detailed)

#### Fixed
- src/App.js: From: dynamic import('@capacitor/push-notifications') which fails to resolve in native WebView. To: import('@capacitor/core') then registerPlugin('PushNotifications') so the plugin is provided by the native bridge and no push-notifications module resolution in JS.

## v.1.0.00.165 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push on device: client logs for permission, register(), token, and server POST; log status/data on fail; CAPACITOR debug steps.

### Changes (detailed)

#### Changed
- src/App.js: Push flow now logs "Requesting notification permission¦", "Permission granted, calling register()¦", "Got FCM token, sending to server¦", "Token registered with server." or "Failed to register token" with status/data; log when permission not granted.
- CAPACITOR.md: Added "Debug push on a physical device" (chrome://inspect, what [push] logs mean).

## v.1.0.00.164 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Build for physical Android device: .env.android.device.example and cap:sync:android:device script so phone can reach local server via PC IP.

### Changes (detailed)

#### Added
- .env.android.device.example: template with YOUR_PC_IP for device build; copy to .env.android.device and set PC IPv4.
- package.json: script cap:sync:android:device (env-cmd -f .env.android.device npm run build && npx cap sync android).
- .gitignore: .env.android.device so local IP is not committed.
- CAPACITOR.md: physical device steps and script in API URL section and commands table.

## v.1.0.00.163 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix user_push_tokens migration: user_id must be UUID to match users(id); run migrations to create table.

### Changes (detailed)

#### Fixed
- server/migrations/add-user-push-tokens.sql: From: user_id INT REFERENCES users(id) (foreign key failed). To: user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE to match schema.

## v.1.0.00.162 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix FCM never initializing: start with messaging undefined so first call runs init instead of returning cached null.

### Changes (detailed)

#### Fixed
- server/services/push.js: getMessaging() — From: messaging started as null so first call treated as "cached failure" and never ran Firebase init. To: messaging starts as undefined so first call runs init; null is only set after a failed init.

## v.1.0.00.161 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Load .env with override so GOOGLE_APPLICATION_CREDENTIALS from .env is used even when the shell has an old value.

### Changes (detailed)

#### Changed
- server/index.js: dotenv.config() now uses override: true so .env values (e.g. correct Firebase key path) override existing process.env from the terminal.

## v.1.0.00.160 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push: when FCM is disabled (cached), log last init error so credential path + file-exists case shows why init failed.

### Changes (detailed)

#### Changed
- server/services/push.js: Added lastPushError; on init failure store err.message and log stack. When returning cached null, log lastPushError so "credPath set | exists true" case shows the actual Firebase/init error.

## v.1.0.00.159 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push optional: no console spam when FCM not configured; only log "Push: FCM enabled" when it is.

### Changes (detailed)

#### Changed
- server/services/push.js: When GOOGLE_APPLICATION_CREDENTIALS not set, return null without logging instructions.
- server/index.js: When push disabled, do not log a line (in-app notifications work without push).

## v.1.0.00.158 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix webpack "Can't resolve '@capacitor/push-notifications'" warning: use webpackIgnore on dynamic import.

### Changes (detailed)

#### Changed
- src/App.js: dynamic import of @capacitor/push-notifications now uses /* webpackIgnore: true */ so webpack does not resolve the native-only module at build time; runtime import still works in Capacitor app.

## v.1.0.00.157 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push false: clearer server instructions and .env.example; check credential file exists before init.

### Changes (detailed)

#### Added
- .env.example: DATABASE_URL and GOOGLE_APPLICATION_CREDENTIALS with short instructions.
- server/services/push.js: When FCM disabled, log 4-step instructions (Firebase key, save file, add to .env, restart). When path set but file missing, log full path and hint.

## v.1.0.00.156 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push (outside app): FCM channel ID, Android default channel, health push status, token registration log, FCM error log, troubleshooting.

### Changes (detailed)

#### Added
- server/services/push.js: android.notification.channelId 'default' and priority for Android 8+ display. Log FCM error code/message when a token fails.
- server/index.js: require getMessaging; /api/health returns push: true/false; startup log "Push: FCM enabled" or "FCM disabled".
- server/routes/users.js: GET /api/users/me/push-token returns { registered: true/false }. Log "[push] Token registered for user X" on POST success.
- android/.../MainActivity.java: create default notification channel "Messages" (id: default) in onCreate so FCM notifications show when app is in background.
- CAPACITOR.md: "Still no push?" checklist (health push, token log, google-services.json, send result).

## v.1.0.00.155 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push (outside app): add listener before register() so token is not missed; document FCM + google-services.json in CAPACITOR.md.

### Changes (detailed)

#### Changed
- src/App.js: Push notification listeners (registration + tap) are now added before requestPermissions/register() so the token event is not missed. Log push registration failures to console.
- CAPACITOR.md: New section "Push notifications (when app is in background or closed)" — Firebase project, google-services.json in android/app, server GOOGLE_APPLICATION_CREDENTIALS, and troubleshooting.

## v.1.0.00.154 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Push/in-app notifications debugging: server logs for FCM, SSE, and chat; in-app toast on new message; proxy buffer off for SSE.

### Changes (detailed)

#### Added
- server/services/push.js: Log when FCM is disabled (no creds), when no pool, when no tokens for user, and when send succeeds (N ok, M failed).
- server/chatEvents.js: Log on SSE subscribe (user, connection count) and when notifying user; log when no SSE connection for recipient.
- server/routes/chat.js: Log when new message is sent and recipient user id.
- src/context/ChatContext.js: inAppNotification state; show "New message" toast (fixed top) when threads_updated received; auto-clear after 4s; expose inAppNotification in context.

#### Changed
- src/setupProxy.js: buffer: false on /api proxy so SSE stream is not buffered.

## v.1.0.00.153 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix MessagesModal ReferenceError: compute thread/listing inside effect so threadsWithListing is not used before initialization.

### Changes (detailed)

#### Fixed
- src/components/MessagesModal.js: initialThreadId effect no longer references threadsWithListing (which was declared later). Effect now builds thread list from getThreads() and allListings inside the effect and finds thread/listing there.

## v.1.0.00.152 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Complete push notification flow: open specific thread from notification tap; FCM credential path from project root; FCM data strings; Android POST_NOTIFICATIONS.

### Changes (detailed)

#### Added
- src/App.js: notificationThreadId state; set from push tap data.threadId; pass initialThreadId and onClearInitialThreadId to MessagesModal.
- src/components/MessagesModal.js: initialThreadId and onClearInitialThreadId props; useEffect to auto-open that thread when in list (from notification tap).
- android/app/src/main/AndroidManifest.xml: POST_NOTIFICATIONS permission for FCM on Android 13+.

#### Changed
- server/services/push.js: Resolve FCM credential path from project root (__dirname/../..) when relative so .env at root works. Ensure all FCM data payload values are strings (required by FCM).

## v.1.0.00.151 — Development
Date: 2026-03-07
Type: Dev Change

### Summary
- Fix webpack compile: resolve @capacitor/push-notifications only on native via dynamic import; avoid server ENOENT when build/index.html missing.

### Changes (detailed)

#### Changed
- src/App.js: Removed top-level import of @capacitor/push-notifications. Push notification registration and listeners now use dynamic import('@capacitor/push-notifications') inside the native-only useEffect so the web build does not resolve the native plugin. Added cancelled guard to avoid adding listeners after unmount.
- server/index.js: Serve static/SPA fallback only when build/index.html exists (hasIndex). From: serving when BUILD_DIR existed but index.html was missing caused ENOENT. To: require both BUILD_DIR and indexPath to exist before registering static and catch-all.

## v.1.0.00.150 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Server: login error for missing DB column (42703); add npm run migrate; point message to migrate.

### Changes (detailed)

#### Added
- package.json: script "migrate" runs node server/run-migrations.js (applies add-email-confirmation and other migrations).

#### Changed
- server/routes/auth.js: catch 42703 (undefined_column) and return message "Database schema out of date. From project root run: npm run migrate".

## v.1.0.00.149 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Server: clearer login 500 handling and messages (DB/schema); log [auth/login] errors.

### Changes (detailed)

#### Changed
- server/routes/auth.js: login catch logs [auth/login] and message; return specific messages for DB unavailable (503) and missing schema (42P01); otherwise "Login failed. Check server logs for details."

## v.1.0.00.148 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Improve login error messages: clearer fallbacks and use non-JSON response body when present.

### Changes (detailed)

#### Changed
- src/context/AuthContext.js: login failure fallback message suggests checking email, password, and email verification; catch fallback "Connection problem. Check your network and try again." when no server message.
- src/api/client.js: when response is not ok and body is not valid JSON, set err.data.message from raw text (truncated) so it can be shown.

## v.1.0.00.147 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix login in Capacitor app: persist auth with Preferences, restore on launch, show server error messages.

### Changes (detailed)

#### Added
- package.json: dependency @capacitor/preferences.
- src/context/AuthContext.js: Capacitor Preferences for auth in native app; on mount when Capacitor.isNativePlatform() load auth from Preferences and set user/token; saveAuth now also writes to Preferences when native so login persists across app restarts.

#### Changed
- src/context/AuthContext.js: saveAuth is async and clears/writes Preferences when on native platform; login catch returns err.userMessage so server messages (e.g. "Please verify your email") are shown.

## v.1.0.00.146 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Allow HTTP API calls from Capacitor app WebView: mixed content, CORS, and domain-config.

### Changes (detailed)

#### Added
- capacitor.config.ts: android.allowMixedContent: true.
- android/app/src/main/java/.../MainActivity.java: onResume() calls allowMixedContent() to set WebSettings.MIXED_CONTENT_ALWAYS_ALLOW so fetch() to http://10.0.2.2:5000 works in the app (Chrome in emulator already worked).
- android/app/src/main/res/xml/network_security_config.xml: domain-config for 10.0.2.2, localhost, 127.0.0.1 with cleartext permitted.

#### Changed
- server/index.js: CORS origin callback explicitly allows capacitor://, localhost, 10.0.2.2, file://.

## v.1.0.00.145 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Server: make /api/health and /api responses explicit; add listen error handler and Health URL log.

### Changes (detailed)

#### Changed
- server/index.js: /api/health now sets status 200 and Content-Type application/json explicitly; added GET /api returning { message, health }; server logs Health URL on startup; listen error handler for EADDRINUSE and other errors.

## v.1.0.00.144 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- CAPACITOR.md: add Windows Firewall steps to allow port 5000 so emulator can reach host API.

### Changes (detailed)

#### Changed
- CAPACITOR.md: new troubleshooting block "If http://10.0.2.2:5000/api/health fails in the emulator's browser" with steps to create an inbound rule for TCP port 5000 (Private/Domain) so the Android emulator can connect to the backend.

## v.1.0.00.143 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Show API base URL in listings error banner to debug emulator connection; document clean rebuild in CAPACITOR.md.

### Changes (detailed)

#### Changed
- src/App.js: import baseUrl from api/client; in listings error banner show "— API: <baseUrl>" or "— API: same origin" so user can confirm which URL the app is using.
- CAPACITOR.md: add clean-rebuild step (delete build then cap:sync:android:emulator); note that error banner shows API URL to verify build.

## v.1.0.00.142 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix Android emulator not connecting to API: use .env.android.emulator for emulator build (avoids .env override), bind server to 0.0.0.0.

### Changes (detailed)

#### Added
- .env.android.emulator: REACT_APP_API_URL=http://10.0.2.2:5000 (used only by cap:sync:android:emulator).
- package.json: devDependency env-cmd; cap:sync:android:emulator now runs `env-cmd -f .env.android.emulator npm run build` so the build is not overridden by main .env.

#### Changed
- server/index.js: app.listen(PORT, '0.0.0.0', ...) so the server accepts connections from the emulator (host 0.0.0.0).
- CAPACITOR.md: troubleshooting step to restart backend so it listens on 0.0.0.0; note that emulator build uses .env.android.emulator.

## v.1.0.00.141 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- CAPACITOR.md: add troubleshooting for "Failed to fetch" when API runs on host localhost:5000 (rebuild with cap:sync:android:emulator).

### Changes (detailed)

#### Changed
- CAPACITOR.md: added note under Quick start that "Failed to fetch" / "0 properties found" means app was built with wrong API host; instruct to run `npm run cap:sync:android:emulator` then Run in Android Studio.

## v.1.0.00.140 — Development
Date: 2026-03-06
Type: Dev Change

### Summary
- Wire Android emulator: one-command build/sync/open with emulator API URL; add Quick start to CAPACITOR.md.

### Changes (detailed)

#### Added
- package.json: devDependency cross-env; scripts cap:sync:android:emulator (build with REACT_APP_API_URL=http://10.0.2.2:5000, then cap sync android), android:emulator (run cap:sync:android:emulator then cap:android).
- CAPACITOR.md: "Quick start: run in emulator" section (start server, run android:emulator, run in Android Studio); note that backend must be running or API calls fail.

## v.1.0.00.139 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Android-first: allow HTTP (cleartext) for API, add cap:sync:android, docs focused on Android.

### Changes (detailed)

#### Added
- android/app/src/main/res/xml/network_security_config.xml: allow cleartext traffic so HTTP API URLs work (e.g. dev server at 10.0.2.2:5000).
- package.json: script cap:sync:android (build and sync Android only).
- CAPACITOR.md: reordered for Android first (prerequisites, build/run steps, API URL), then iOS; documented cap:sync:android.

#### Changed
- android/app/src/main/AndroidManifest.xml: android:networkSecurityConfig and android:usesCleartextTraffic so backend can be HTTP.

## v.1.0.00.138 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add Capacitor to build Android and iOS apps from the React web app.

### Changes (detailed)

#### Added
- package.json: @capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios; scripts cap:sync, cap:android, cap:ios.
- capacitor.config.ts: appId com.balhinbalay.app, appName BalhinBalay, webDir build.
- android/: Capacitor Android project (open with Android Studio).
- ios/: Capacitor iOS project (open with Xcode on macOS).
- CAPACITOR.md: workflow (build/sync, open native IDE), API URL for native builds, useful commands.

## v.1.0.00.137 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Email: default From address to SMTP_USER so IONOS accepts sender (fixes 550 Sender address not allowed).

### Changes (detailed)

#### Fixed
- server/services/email.js
  - sendConfirmationEmail()
  - From: `SMTP_FROM || noreply@SMTP_HOST` (rejected by IONOS when SMTP_FROM unset). To: `SMTP_FROM || SMTP_USER || noreply@SMTP_HOST` so From matches authenticated mailbox.

## v.1.0.00.136 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- .env template: add commented SMTP block (IONOS-ready) so only credentials need to be pasted.

### Changes (detailed)

#### Added
- .env: Commented block for SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, SMTP_FROM, APP_URL with IONOS host/port and short instructions.

## v.1.0.00.135 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix profile drawer: moved out of header to escape backdrop-filter containment; added AnimatePresence keys; scrim changed from button to div.

### Changes (detailed)

#### Fixed
- src/App.js: ProfileDrawer moved from inside app-header to top-level (sibling to FavoritesModal). From: drawer rendered inside header, broken by parent backdrop-filter creating fixed-position containment. To: drawer renders at root, position:fixed now correct relative to viewport.
- src/components/ProfileDrawer.js: Scrim changed from motion.button to motion.div (role=button, onKeyDown) for overlay semantics; added unique keys for AnimatePresence children (profile-drawer-scrim, profile-drawer-panel) for proper exit animations.

## v.1.0.00.134 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Full UI redesign: modern app aesthetic—card-heavy, soft shadows, rounded corners, pill-shaped buttons. New design tokens, updated header, tabs, property cards, modals, profile, Admin, forms.

### Changes (detailed)

#### Changed
- src/App.css: New design system (--bb-primary #0d7377, softer shadows, larger radius, typography vars); header with backdrop blur; pill segment tabs; property cards with soft shadow, pill View Details; favorites modal card style; filter sheet, modals; profile drawer, admin stat cards, nav pills; global form/btn overrides; transitions 0.25s ease.
- public/index.html: theme-color to #0d7377.

## v.1.0.00.133 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- UI made more mobile-oriented: larger touch targets (48px min), improved padding and spacing, better readability.

### Changes (detailed)

#### Changed
- src/App.css: Touch targets use --bb-tap (48px) for header buttons, listing tabs, view-mode toggle, sort select, favorite button, View Details; header min-height 56px with more padding; listing tabs flex:1 on mobile, 48px min-height; sort bar and results area more padding; property card body padding 16“18px; card title 1.125rem; html -webkit-tap-highlight-color; results-area safe-area insets on mobile; App min-height 100dvh.

## v.1.0.00.132 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- npm start now runs both React dev server and API server concurrently.

### Changes (detailed)

#### Added
- package.json: concurrently ^9.1.2 (devDependency).

#### Changed
- package.json: start script from "craco start" to "concurrently \"craco start\" \"npm run server\"".

## v.1.0.00.131 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Resolved React hooks exhaustive-deps ESLint warnings in MapPicker.

### Changes (detailed)

#### Fixed
- src/components/MapPicker.js: Use onPickRef to avoid stale onPick closure (no deps needed); add center to first useEffect deps; add eslint-disable for markerPosition (second effect handles updates); add markerPosition to second useEffect deps.

## v.1.0.00.130 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add Property section headers use a new color scheme (purple, teal, olive, orange, pink) separate from the main app palette.

### Changes (detailed)

#### Changed
- src/App.css: Added --bb-section-1 through --bb-section-5 (purple #7b1fa2, teal #00796b, olive #558b2f, deep orange #e65100, pink #ad1457). Add Property form section titles now use these instead of --bb-primary/accent/success/price.

## v.1.0.00.129 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Section headers use distinct colours; Contact info header changed from accent to price (orange).

### Changes (detailed)

#### Changed
- src/App.css: Add Property form section titles — Contact info (nth-child 5) from var(--bb-accent) to var(--bb-price); Basic info, Location, Property details, Images remain primary, accent, success, primary-soft respectively.

## v.1.0.00.128 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed validateDOMNesting: button cannot appear as descendant of button in FavoritesModal.

### Changes (detailed)

#### Fixed
- src/components/FavoritesModal.js: Changed favorites-modal-card from `<button>` to `<div role="button">` so FavoritesButton (which renders a button) is no longer nested inside a button. Added tabIndex={0} and onKeyDown for Enter/Space to preserve accessibility.

## v.1.0.00.127 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Moved heart (favorite) icon to top-right corner of property cards.

### Changes (detailed)

#### Changed
- src/components/PropertyListCard.js: FavoritesButton moved from image container to card-level; position-absolute top-0 end-0 for top-right of full card.
- src/components/PropertyCard.js: Same; FavoritesButton at card level, top-right.
- src/components/FavoritesModal.js: FavoritesButton moved from image wrap to card level; positioned top-right of card.
- src/App.css: .favorites-modal-card — Added position: relative for fav positioning.

## v.1.0.00.126 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Removed logo from profile sidebar/drawer header.

### Changes (detailed)

#### Removed
- src/components/ProfileDrawer.js: Logo image (profile-drawer-logo) from drawer header; email/user-info remains.
- src/App.css: .profile-drawer-logo styles (orphaned).

## v.1.0.00.125 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Reverted Messages component to original look (right-side panel with minimize/close, list rows).

### Changes (detailed)

#### Changed
- src/components/MessagesModal.js: Reverted to messages-panel-wrap / messages-panel structure, minimize and close buttons, original row layout (unread dot + avatar + title Â· participant + time, preview).
- src/App.css: Removed messages-modal-* styles; kept messages-panel-* as active.

## v.1.0.00.124 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile and Add Property modals converted to full-page routes (/profile, /add-property, /add-property/:id) with mobile-app layout.
- Profile drawer and header actions now navigate to pages instead of opening modals.
- Edit property flow navigates to /add-property/:id.

### Changes (detailed)

#### Added
- src/pages/ProfilePage.js — Full-page account view; profile section, change password section; login gate for guests.
- src/pages/AddPropertyPage.js — Full-page add/edit property form; login gate for guests.
- src/components/AddPropertyForm.js — Extracted form from AddPropertyModal; reusable by modal and page.
- src/context/LoginModalContext.js — LoginModalProvider, useLoginModal(); allows opening login from any route.
- src/App.css: .profile-page, .add-property-page, .page-header, .page-header-back, .page-header-title, .page-content, .page-section, .page-section-gate, .page-gate-text, .profile-page-section, .add-property-page-form styles.

#### Changed
- src/App.js: Added routes /profile, /add-property, /add-property/:id; wrapped Routes with LoginModalProvider; removed showProfileModal, showAddPropertyModal, editProperty state; Profile drawer onProfile/onAddProperty and header Profile/Add buttons now navigate; handleEditListing navigates to /add-property/:id; removed ProfileModal, AddPropertyModal, LoginModal from render; AppContent uses useLoginModal().openLogin() for login.
- src/components/AddPropertyModal.js: Refactored to use AddPropertyForm; kept for potential modal use elsewhere.

## v.1.0.00.123 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile drawer stays open when clicking Add property, My properties, Profile, or Log out.

### Changes (detailed)

#### Changed
- src/components/ProfileDrawer.js: handleAction(fn) — From: fn(); onClose(); To: fn() only. Drawer no longer auto-closes on button click; user closes via X or scrim.

## v.1.0.00.122 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Filter sidebar no longer closes when clicking Search Properties, Apply, Save, or other buttons; stays open until X or backdrop.

### Changes (detailed)

#### Changed
- src/App.js: onApply no longer closes filter; applySavedSearchState no longer closes filter; added onClick stopPropagation on filter-sheet to prevent accidental backdrop clicks.
- src/components/FilterSidebar.js: added stopPropagation on content wrapper and all buttons (Save, Apply, Delete, Search Properties, Advanced filters toggle).

## v.1.0.00.121 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Distinguish search results vs My Properties view; logo as home button.

### Changes (detailed)

#### Added
- src/App.js: handleLogoHome() — resets filters, showMyPropertiesOnly, scrolls to top. Logo wrapped in button with aria-label="Home".
- src/components/SortBar.js: isMyProperties prop — "X of your property/properties" when true, "X property/properties found" when false.

#### Changed
- src/App.js: pass isMyProperties={showMyPropertiesOnly && !!user} to SortBar; add house icon to my-properties-bar text.
- src/App.css: .app-logo-btn (reset styles, cursor pointer, hover opacity); .my-properties-bar — stronger styling (accent background, 2px border, house icon with margin).

## v.1.0.00.120 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- My properties icon changed from user to house.

### Changes (detailed)

#### Changed
- src/App.js: My properties icon fa-user → fa-house (mobile menu + desktop header).
- src/components/ProfileDrawer.js: My properties icon fa-user → fa-house.

## v.1.0.00.119 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix admin Unlist (and Approve/Relist); modal awaits API before closing; errors keep modal open.

### Changes (detailed)

#### Fixed
- src/pages/AdminPage.js: handleListingStatus(listingId, status)
  - From: Approve used handleListingStatus(id) only, so status was undefined → 400 error.
  - To: onApprove now passes (id) => handleListingStatus(id, 'approved'); rethrow on error so modal can detect failure.
- src/components/AdminListingDetailModal.js: Unlist/Relist/Approve handlers
  - From: Fire-and-forget; modal closed immediately; errors often missed.
  - To: await async callbacks; close only on success; show loading state; stay open on error.

#### Changed
- src/pages/AdminPage.js: add .catch(() => {}) to table-row Unlist/Relist/Approve buttons to avoid unhandled rejection.

## v.1.0.00.118 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Restore Search header button; opens filter sheet instead of saved searches modal.

### Changes (detailed)

#### Changed
- src/App.js: add Search button (mobile + desktop) that calls setFiltersOpen(true).

## v.1.0.00.117 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Unify saved search with filters; remove standalone modal and Searches button.

### Changes (detailed)

#### Added
- src/components/FilterSidebar.js: saved filters section (save row, list with Apply/Delete); useSavedSearches; currentFilterState, onApplySavedState props.
- src/App.css: .filter-saved-presets, .filter-saved-save-row, .filter-saved-list, etc.

#### Changed
- src/App.js: remove SavedSearchesModal, showSavedSearchesModal, both Searches header buttons; pass currentFilterState, onApplySavedState to FilterSidebar.

#### Removed
- src/components/SavedSearchesModal.js: deleted.
- src/App.css: saved-searches modal styles (replaced by filter-saved-*).

## v.1.0.00.116 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile drawer slides in from right instead of left.

### Changes (detailed)

#### Changed
- src/components/ProfileDrawer.js: initial/exit x from -100% to 100%.
- src/App.css: .profile-drawer-panel left: 0 to right: 0.

## v.1.0.00.115 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Mobile nav patterns: Drawer for profile; framer-motion bottom sheets for filters, favorites, saved searches.

### Changes (detailed)

#### Added
- framer-motion dependency.
- src/components/ProfileDrawer.js: slide-in drawer for mobile profile/account menu (82vw max 360px, Escape to close).
- src/App.css: .profile-drawer-* styles; .filter-backdrop-animated, .filter-sheet-mobile; .favorites-modal-handle.

#### Changed
- src/App.js: ProfileDrawer for mobile (replaces dropdown); filter sheet uses AnimatePresence + motion on mobile.
- src/components/FavoritesModal.js: AnimatePresence, motion backdrop + sheet (y 100%→0, 0.24s easeOut).
- src/components/SavedSearchesModal.js: same framer-motion bottom sheet pattern.
- Desktop filter sheet and profile dropdown unchanged.

## v.1.0.00.114 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Sync updated signed logo to public/logo-nav.png.

### Changes (detailed)

#### Changed
- public/logo-nav.png: replaced with updated signed logo from project root.

## v.1.0.00.113 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Split logo usage: logo.png for favicon only; signed logo (logo-nav.png) for navigation/header.

### Changes (detailed)

#### Added
- public/logo-nav.png: nav logo with site name (from signed logo.png).

#### Changed
- src/App.js: header img uses /logo-nav.png instead of /logo.png.
- Favicon remains /logo.png.

## v.1.0.00.112 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Sync updated logo.png to public folder.

### Changes (detailed)

#### Changed
- public/logo.png: replaced with updated logo from project root.

## v.1.0.00.111 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Use logo.png as site logo and favicon.

### Changes (detailed)

#### Added
- public/logo.png: copy of root logo.png for serving.
- public/index.html: favicon link to logo.png.
- src/App.css: .app-logo-img for header logo image.

#### Changed
- src/App.js: replace text logo with img src="/logo.png".
- src/App.css: .app-logo removed; .app-logo-img responsive (32px mobile, 40px desktop).

## v.1.0.00.110 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table: alternating row stripes for readability.

### Changes (detailed)

#### Added
- src/App.css: .admin-table tbody tr:nth-child(odd/even) stripes; hover overrides stripe.

## v.1.0.00.109 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table: fixed height even with little/no content.

### Changes (detailed)

#### Changed
- src/App.css: .admin-table-wrap
 - From: max-height only; table shrinks when few rows.
 - To: min-height: min(60vh, 500px); table area always same size.

## v.1.0.00.108 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin Pending listings: add search by title, owner, type.

### Changes (detailed)

#### Added
- src/pages/AdminPage.js: pendingListingSearch state; filteredPendingListings; search input for pending tab.

## v.1.0.00.107 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table always visible; empty/loading shown as table row.

### Changes (detailed)

#### Changed
- src/pages/AdminPage.js: table always renders; loading/empty as single row with colspan.
- src/App.css: .admin-table-empty for centered muted cell.

## v.1.0.00.106 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin: single prerendered table; headers and rows switch by tab.

### Changes (detailed)

#### Changed
- src/pages/AdminPage.js: one section, one table; thead/tbody content conditional on adminTab; search inputs for all/users only.

## v.1.0.00.105 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin table: scrollable with sticky header (max-height, overflow-y).

### Changes (detailed)

#### Changed
- src/App.css: .admin-table-wrap — overflow-y: auto, max-height: min(60vh, 500px), border; .admin-table th — position: sticky, top: 0, box-shadow.

## v.1.0.00.104 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Admin page: tabs switch table content instead of scrolling.

### Changes (detailed)

#### Changed
- src/pages/AdminPage.js: adminTab state; nav links → buttons; conditional render of All/Pending/Users sections.
- src/App.css: .admin-nav-link as button styles; .admin-nav-link.active for selected tab.

## v.1.0.00.103 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat button uses price color (F68048).

### Changes (detailed)

#### Changed
- src/App.css: .btn-chat — background var(--bb-price); hover #e06d38.

## v.1.0.00.102 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Price color: F68048 (coral orange).

### Changes (detailed)

#### Changed
- src/App.css: --bb-price: #f68048; price styles use var(--bb-price).
- src/components/MapView.js: popup price color #F68048.

## v.1.0.00.101 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Use D2C1B6 (--bb-accent-light) for all price displays.

### Changes (detailed)

#### Changed
- src/App.css: .property-price, .recently-viewed-card-price, .favorites-modal-card-price — color: var(--bb-accent-light).
- src/App.css: .admin-table-price added for admin table price cells.
- src/components/MapView.js: map popup price color #D2C1B6.
- src/pages/AdminPage.js: add admin-table-price class to price cells.

## v.1.0.00.100 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Apply slate-blue palette (1B3C53, 234C6A, 456882, D2C1B6).

### Changes (detailed)

#### Changed
- src/App.css: :root — primary #1b3c53, primary-soft #234c6a, accent #456882, accent-light #d2c1b6; surface/border/text cooler; shadows use navy tint.

## v.1.0.00.99 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Apply warm coral“yellow palette (FF5A5A, FF8B5A, FFA95A, FFD45A).

### Changes (detailed)

#### Changed
- src/App.css: :root — primary #e04a4a (from FF5A5A), primary-soft #ff8b5a, accent #ffa95a, accent-hover #ff9240; surface/border/text tuned for warm palette; shadows use coral tint.

## v.1.0.00.98 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Update colour scheme: coastal teal primary, lighter surfaces, warmer accent.

### Changes (detailed)

#### Changed
- src/App.css: :root — primary #0d3b2c→#0c5460, primary-soft #1a5c45→#14707d, accent-hover darker; surface #faf9f7→#f5f8f9, border cooler; text tones adjusted; success #2d7d5e→#2d8f6f; shadows use teal tint.

## v.1.0.00.97 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove debug outlines from image upload section.

### Changes (detailed)

#### Removed
- src/components/AddPropertyModal.js: add-property-images-debug class.
- src/App.css: Debug outline rules for image upload divs.

## v.1.0.00.96 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move X button inside image container so it positions correctly on thumbnail.

### Changes (detailed)

#### Changed
- src/components/AddPropertyModal.js: X button now inside add-property-thumb-img.
- src/App.css: .add-property-thumb-img overflow: visible (was hidden) so button isn't clipped; img border-radius for clipping.

## v.1.0.00.95 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Thumbnail image fill fix: inner clip div, stronger overrides.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: .add-property-thumb-img wrapper around img.
- src/App.css: .add-property-thumb-img with overflow:hidden; img position:absolute inset:0 with !important overrides.

#### Changed
- src/App.css: .add-property-thumb-wrap — min-width/height, flex-shrink:0.

## v.1.0.00.94 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix thumbnail image not filling container (black margin around image).

### Changes (detailed)

#### Fixed
- src/App.css: .add-property-thumb-wrap img — From: width/height 100% only. To: position:absolute, inset:0, max-width:none, max-height:none — overrides Bootstrap/Leaflet img constraints so image fills 64x64 box.

## v.1.0.00.93 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image remove X: center on top-right corner (transform: translate 50%, -50%).

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — top:0 right:0 + transform for corner placement; thumb-wrap overflow:visible.

## v.1.0.00.92 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image remove X: revert to top-right corner (4px inset).

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — top:4px right:4px (corner placement).

## v.1.0.00.90 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Symmetrical X for image remove: SVG icon, centered on corner; thumb-wrap overflow visible.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-wrap overflow: visible; .add-property-thumb-remove top:0 right:0 + transform: translate(50%,-50%) for centered corner placement; img border-radius.
- src/components/AddPropertyModal.js: Replace fa-times with symmetrical SVG X.

## v.1.0.00.89 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move image remove X higher.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — From: top: 2px, right: 2px. To: top: -4px, right: -4px.

## v.1.0.00.88 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image remove button: plain X only, no background.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — transparent background, text-colour X; hover uses primary.

## v.1.0.00.87 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove horizontal section divider bars from add-property form.

### Changes (detailed)

#### Removed
- src/App.css: border-bottom from .add-property-form-section.

## v.1.0.00.86 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Move section accent bar to left side of headers.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-section-title — horizontal accent bar on right side of header (::after, flex layout); bar extends from text to right edge.

## v.1.0.00.85 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove circular shape from image remove button; use rounded square.

### Changes (detailed)

#### Changed
- src/App.css: .add-property-thumb-remove — From: border-radius: 50%. To: border-radius: 4px.

## v.1.0.00.84 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Province and City on one line; add coloured accents to add-property form sections.

### Changes (detailed)

#### Changed
- src/components/AddPropertyModal.js: Province and City in a row (col-6 each) for compact layout.
- src/App.css: .add-property-section-title — coloured headers per section (primary, accent, success, primary-soft); removed left borders.

## v.1.0.00.83 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Group add-property form into sections for readability: Basic info, Location, Property details, Images, Contact info.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: Section wrappers with headings (Basic info, Location, Property details, Images, Contact info).
- src/App.css: .add-property-form-section, .add-property-section-title for grouped form styling.

#### Changed
- src/components/AddPropertyModal.js: Form structure — fields wrapped in semantic sections; removed duplicate "Images" form label (section title suffices).

## v.1.0.00.82 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove manual latitude/longitude inputs and instruction from add-property form; keep map picker only.

### Changes (detailed)

#### Removed
- src/components/AddPropertyModal.js: "Click on the map to place the pin..." instruction; Latitude (optional) and Longitude (optional) input fields.

## v.1.0.00.81 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Remove blue tap/focus highlight under cluster pin on hover or tap.

### Changes (detailed)

#### Changed
- src/App.css: .marker-cluster-pin-wrap
  - From: only background/border reset
  - To: outline: none, -webkit-tap-highlight-color: transparent, focus/focus-visible overrides — removes blue oval under pin.

## v.1.0.00.80 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Lower cluster count badge to match white dot position (center of rounded head).

### Changes (detailed)

#### Changed
- src/App.css: .marker-cluster-pin-count
  - From: top: 10px
  - To: top: 13px — moves badge lower into center of pin head.

## v.1.0.00.79 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Cluster count badge positioned like white dot (centered in rounded head of pin).

### Changes (detailed)

#### Changed
- src/App.css: .marker-cluster-pin-count
  - From: top: 2px, transform: translateX(-50%)
  - To: top: 10px, transform: translate(-50%, -50%) — aligns count with white dot on Leaflet marker.

## v.1.0.00.78 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map clusters use pin icon instead of circle; count badge on pin.

### Changes (detailed)

#### Added
- src/App.css: .marker-cluster-pin-wrap, .marker-cluster-pin, .marker-cluster-pin-count for pin-style cluster icon.
- src/components/MapView.js: iconCreateFunction for markerClusterGroup — pin image + count badge.

## v.1.0.00.77 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map marker clustering: nearby pins combine into numbered clusters; zoom/click expands to individual pins.

### Changes (detailed)

#### Added
- src/components/MapView.js: Leaflet.markercluster plugin (CDN); L.markerClusterGroup() for property markers.

#### Changed
- src/components/MapView.js: Markers added to cluster group instead of map; ensureLeaflet → ensureMarkerCluster → initializeMap load order; cleanup removes cluster group.

## v.1.0.00.76 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Hide coordinates and "View on Map" button below property map; keep map preview only.

### Changes (detailed)

#### Removed
- src/components/PropertyModal.js: "Coordinates: lat, lng" paragraph and "View on Map" button below map preview.

## v.1.0.00.75 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Simplify image upload: client-side resize (max 1200px, JPEG 80%) + base64 JSON; remove multipart/multer entirely.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: resizeImageToDataUrl() — uses canvas to resize images before upload; keeps payload small for JSON.

#### Changed
- src/components/AddPropertyModal.js: uploadedImages (data URLs) instead of uploadedFiles; handleImageUpload resizes then stores; always JSON POST.
- src/context/UserListingsContext.js: addListing(listing) only — removed FormData/multipart branch.
- server/routes/listings.js: Removed multer and multipart handling; POST / accepts only JSON with processImages for data URLs.

#### Removed
- server: multer usage from listings route (dependency can stay for future use).

## v.1.0.00.74 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix "Title is required" when uploading with images: multer.any() parses both listing JSON and image files; extract listing from req.files.

### Changes (detailed)

#### Fixed
- server/routes/listings.js: From: multer.array('images') which didn't populate req.body with text fields. To: multer.any() parses all parts; get listing from req.files (fieldname 'listing'), images from fieldname 'images'.

## v.1.0.00.73 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix 404 on image upload: use POST /api/listings for both JSON and multipart instead of separate /upload route.

### Changes (detailed)

#### Changed
- server/routes/listings.js: POST / now accepts both application/json and multipart/form-data; multer runs conditionally for multipart.
- src/context/UserListingsContext.js: postFormData path /api/listings/upload → /api/listings.

## v.1.0.00.72 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Improve error surfacing: show server message or status when generic "Something went wrong"; add multer to server deps.

### Changes (detailed)

#### Changed
- src/api/client.js: request() and requestFormData() — From: generic "Something went wrong. Try again." for non-401/403/404/413. To: use data.error/data.message first; else "Request failed (status). Check that the server is running."
- src/components/AddPropertyModal.js: catch — added err?.data?.error to fallback chain.

#### Fixed
- server/package.json: Added multer dependency (was only in root; server needs it for /upload).

## v.1.0.00.71 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fix missed rename: setUploadedImages → setUploadedFiles in AddPropertyModal edit-init effect.

### Changes (detailed)

#### Fixed
- src/components/AddPropertyModal.js: useEffect for initialListing — From: setUploadedImages([]). To: setUploadedFiles([]).

## v.1.0.00.70 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image upload via multipart FormData instead of base64 in JSON to fix 413 on small images (e.g. 153kb).

### Changes (detailed)

#### Added
- server/lib/imageProcessor.js: processMulterFiles() — converts multer buffers to WebP.
- server/routes/listings.js: POST /upload route with multer; accepts FormData (listing JSON + image files).
- src/api/client.js: postFormData() for multipart requests.

#### Changed
- src/components/AddPropertyModal.js: Store File objects (uploadedFiles) instead of base64; use addListing(listing, files) for multipart; preview via URL.createObjectURL.
- src/context/UserListingsContext.js: addListing(listing, imageFiles) — uses postFormData to /api/listings/upload when imageFiles present.
- server: multer dependency.

## v.1.0.00.69 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Submit error (e.g. images too large) shown as modal instead of inline alert.

### Changes (detailed)

#### Added
- src/components/ConfirmModal.js: `alertOnly` prop for OK-only modal.

#### Changed
- src/components/AddPropertyModal.js: Replaced inline submit-error div with ConfirmModal (alertOnly, variant="danger"); Import ConfirmModal.

## v.1.0.00.68 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Image limit: 2MB per file (client + server); still convert to WebP.

### Changes (detailed)

#### Changed
- src/components/AddPropertyModal.js: Restored 2MB per-file limit in handleImageUpload; updated hint to "Up to 5 images, 2MB each. Converted to WebP on the server."
- server/index.js: express.json limit 200mb → 15mb (enough for 5Ã—2MB base64).
- server/lib/imageProcessor.js: Skip data URLs over 2MB before conversion; convert remaining to WebP.

## v.1.0.00.67 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Add property: UI error handling for 413 (payload too large) and other API errors.

### Changes (detailed)

#### Changed
- src/api/client.js: Added 413 status handler with userMessage "Images are too large. Try fewer or smaller images, then submit again."
- src/components/AddPropertyModal.js: catch uses err.userMessage first so friendly messages display in the UI.

## v.1.0.00.66 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Images: accept any size; convert uploaded images to WebP on server.

### Changes (detailed)

#### Added
- server/lib/imageProcessor.js: processImages() — converts data URLs to WebP via sharp; saves to uploads/; passes through http/https URLs.
- server/index.js: express.json limit 50mb; /uploads static route.
- src/setupProxy.js: proxy /uploads to backend for dev.

#### Changed
- src/components/AddPropertyModal.js: handleImageUpload — removed 2MB per-file limit; accept any size.
- server/routes/listings.js: POST and PATCH — process images through processImages before storing; store /uploads/xxx.webp URLs instead of base64.
- .gitignore: /uploads.

#### Dependencies
- server: sharp (WebP conversion).

## v.1.0.00.65 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Seed script to add sample listings under user email@gmail.com.

### Changes (detailed)

#### Added
- server/seed-user-listings.js: Creates or finds user email@gmail.com; inserts 5 sample listings (sale/rent, Cebu/Mandaue/Lapu-Lapu) with owner_id and status approved.
- package.json: seed-user script for running the seed.

## v.1.0.00.64 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed "BodyStreamBuffer was aborted" runtime error when navigating between /sale and /rent.

### Changes (detailed)

#### Fixed
- src/context/ChatContext.js: SSE read() — From: reader.read() had no .catch(), so AbortError from cleanup propagated as uncaught. To: added .catch() to ignore AbortError and avoid reconnect when intentionally aborted.

## v.1.0.00.63 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- For Sale and For Rent are now separate routes /sale and /rent so refreshes keep the selected page.

### Changes (detailed)

#### Changed
- src/App.js: Routes — added /sale and /rent; / redirects to /sale. AppContent derives listingType from pathname (useLocation). Tabs are NavLink to /sale and /rent. handleListingTypeChange and applySavedSearchState use navigate() instead of setListingType.
- src/App.css: .listing-tab — added text-decoration: none, display, align-items, justify-content for NavLink (anchor) styling.

## v.1.0.00.62 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map pins: barangay centroid lookup before Nominatim geocoding for more accurate pin placement.

### Changes (detailed)

#### Added
- src/data/barangayCentroids.js: BARANGAY_CENTROIDS lookup; getBarangayCoordinates(location, cityName); normalizes "Barangay X" / "Bgy. X" for key lookup.

#### Changed
- src/components/AddPropertyModal.js: handleSubmit — From: geocode via Nominatim only. To: try getBarangayCoordinates first (sync local lookup); if not found, fall back to Nominatim; then city center. Improves pin accuracy for known barangays.

## v.1.0.00.61 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Chat: fixed per-property-per-user. Inquirer now correctly finds their thread; owner with multiple inquirers gets most recent. Messages list shows "Property Â· Other Person".

### Changes (detailed)

#### Changed
- server/routes/chat.js: GET /threads — join users for inquirer_name, owner_name; return otherParticipantName (other party in the chat). POST /threads — return listingTitle, listingOwnerId.
- src/context/ChatContext.js: Store userId, listingOwnerId, updatedAt, otherParticipantName; loadMessagesForListing, getMessages, sendMessage, markThreadReadByListingId — use correct thread: inquirer finds thread where userId===me; owner with multiple threads gets most recent by updatedAt.
- src/components/MessagesModal.js: Display "Property Â· Other Person" in thread row.

## v.1.0.00.60 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map: added "Pick location on map" — click-to-place pin for accurate barangay-level location. Replaces inaccurate geocoding when OpenStreetMap lacks barangay data.

### Changes (detailed)

#### Added
- src/components/MapPicker.js: Interactive map; click to place/move marker; draggable marker; center on city.
- src/components/AddPropertyModal.js: "Pick location on map" toggle; MapPicker integration; onPick updates manualLat/manualLng.

## v.1.0.00.59 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map coordinates: improved geocoding (structured query, countrycodes=ph, viewbox bias); added optional manual lat/lng override when geocoding is wrong.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: manualLat, manualLng state; optional Latitude/Longitude inputs; hint text under Location field.

#### Changed
- src/components/AddPropertyModal.js: geocodeAddress — From: free-form q param. To: structured street/city/country params, countrycodes=ph, viewbox around city for bias; fallback to free-form q if structured fails.
- src/components/AddPropertyModal.js: handleSubmit — manual lat/lng take precedence over geocoding when both valid; geocode only when no manual coords.

## v.1.0.00.58 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Map coordinates: use barangay/location for marker position. Geocode "Location / Barangay" + city via Nominatim; fall back to city center if geocoding fails.

### Changes (detailed)

#### Added
- src/components/AddPropertyModal.js: geocodeAddress(address) — calls Nominatim API to get lat/lng for address in Philippines.

#### Changed
- src/components/AddPropertyModal.js: handleSubmit — From: coordinates always from city. To: if location (barangay) is entered, geocode "location, cityName, Philippines"; use result for coordinates, else fall back to city center.

## v.1.0.00.57 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Recently viewed: fixed duplicate listings. Server returns unique IDs (most recent per listing); client deduplicates as fallback.

### Changes (detailed)

#### Changed
- server/routes/recentViewed.js: GET query — From: all rows ordered by viewed_at. To: ROW_NUMBER() subquery to return one row per listing_id (most recent), ordered by viewed_at DESC, LIMIT 20.
- src/App.js: recentListings useMemo — added client-side deduplication by listing.id (seen Set) so each listing appears once.

## v.1.0.00.56 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Recently viewed section: hidden when viewing "My properties" (profile area); visible only in search results.

### Changes (detailed)

#### Changed
- src/App.js: Recently viewed section condition — From: viewMode !== 'map' && recentListings.length > 0. To: also requires !showMyPropertiesOnly so it does not show in profile/my-properties view.

## v.1.0.00.55 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- ESLint: removed unused variables (navigate, userListings, confirmEmail); fixed useMemo/useEffect dependency arrays.

### Changes (detailed)

#### Changed
- src/App.js: Removed unused navigate and useNavigate import; destructure only deleteListing from useUserListings; removed selectedProvince from filteredListings useMemo deps.
- src/components/ProfileModal.js: Removed unused confirmEmail state and setConfirmEmail calls.
- src/components/PropertyMapPreview.js: useEffect dependency array — From: [coordinates?.lat, coordinates?.lng, title]. To: [coordinates, title].

## v.1.0.00.54 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Fixed ECONNREFUSED / Gateway Timeout: port conflict between React dev server and API. React now runs on 3000, API on 5000.
- Server can run API-only when build folder is missing (dev mode).

### Changes (detailed)

#### Added
- .env.development: PORT=3000 so React dev server uses 3000 (avoids conflict with API on 5000).
- package.json: "server" script to run API from project root.

#### Changed
- server/index.js: From: required build folder, exited if missing. To: API_ONLY mode when build missing; serves API routes only, GET / returns JSON message.
- server/index.js: Console output shows "API-only" or "Static" mode.

## v.1.0.00.53 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Webpack Dev Server: replaced deprecated onBeforeSetupMiddleware/onAfterSetupMiddleware with setupMiddlewares to remove deprecation warnings.
- Auth: proactive session validation on app load — call /api/auth/me when a stored token exists; expired tokens trigger logout immediately instead of waiting for the next auth-protected request.

### Changes (detailed)

#### Added
- craco.config.js: CRACO dev server override using setupMiddlewares; preserves evalSourceMapMiddleware, setupProxy, redirectServedPath, noopServiceWorkerMiddleware.
- src/context/AuthContext.js: validateStoredSession() effect; on mount, if token exists, calls GET /api/auth/me; 401 triggers existing on401Callback → setUser(null).

#### Changed
- package.json: start/build/test scripts now use craco instead of react-scripts for start and build.
- package.json: Added @craco/craco as devDependency.

#### Removed
- Removed: none (deprecated keys deleted from devServer config at runtime via CRACO override).

## v.1.0.00.52 — Development
Date: 2026-02-22
Type: Dev Change

### Summary
- Confirmation modals for destructive actions: Log out, Change password, and Delete listing now show an in-app "Are you sure?" modal with Confirm and Cancel instead of window.confirm/alert.

### Changes (detailed)

#### Added
- src/components/ConfirmModal.js: Reusable confirmation modal (show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, optional variant e.g. danger).
- src/App.js: showLogoutConfirm and listingToDelete state; ConfirmModal for logout and for delete listing; handleConfirmDeleteListing to perform delete on confirm.
- src/components/ProfileModal.js: showChangePasswordConfirm state; ConfirmModal for change password; doChangePassword called on confirm after validation.

#### Changed
- src/App.js: Log out buttons (mobile and desktop) open logout ConfirmModal instead of calling logout immediately; on confirm, close menu then run existing logout flow. handleDeleteListing now sets listingToDelete to open delete ConfirmModal; delete runs on confirm.
- src/components/PropertyModal.js: Delete button no longer uses window.confirm; calls onDelete(property) only (parent shows confirm modal).
- src/components/ProfileModal.js: Change password form submit validates then shows ConfirmModal; actual changePassword API call runs only when user clicks Confirm.

## v.1.0.00.51 — Development
Date: 2026-02-22
Type: Dev Change

### Summary
- Login and logout loader animations: spinner during login/sign-up submit; brief spinner and "Logging out..." when user clicks Log out (mobile and desktop).

### Changes (detailed)

#### Added
- src/components/LoginModal.js: Submit button shows fa-spinner fa-spin + "Logging in..." or "Signing up..." when loading; button has class btn-loading.
- src/App.js: loggingOut state; both logout controls (mobile menu and desktop header) set loggingOut true, then after 400ms call logout() and set loggingOut false; show spinner + "Logging out..." and disable buttons while loggingOut.
- src/App.css: @keyframes auth-spin, .fa-spin, .auth-spinner (inline-block, size, margin-right), .btn-loading (flex, align center, gap) for spinner alignment in buttons.

#### Changed
- src/components/LoginModal.js: Submit button content — From: text only "Please wait...". To: spinner icon + "Logging in..." / "Signing up...".

## v.1.0.00.50 — Development
Date: 2026-02-22
Type: Dev Change

### Summary
- Auto logout on 401: clear user state and storage when API returns unauthorized.
- Chat messages: show time at bottom-right of each bubble; defensive formatTime for missing timestamp.
- API client: fix 403 userMessage string so build does not fail (apostrophe in single-quoted string).

### Changes (detailed)

#### Added
- src/api/client.js: on401Callback, setOn401(fn); on 401 response, after clearToken() call on401Callback() if set.
- src/context/AuthContext.js: useEffect registers setOn401(() => setUser(null)), cleanup setOn401(null), so any 401 logs user out in UI.
- src/components/ChatModal.js: chat-panel-bubble-footer wrapper around time; formatTime(ts) returns '' when ts is null or invalid.
- src/App.css: .chat-panel-bubble-footer (flex, justify-content flex-end) to align time at bottom-right of each bubble.

#### Changed
- src/components/ChatModal.js: .chat-panel-text margin 0 0 4px 0 → 0 0 2px 0; time moved inside bubble-footer.
- src/api/client.js: 403 userMessage string — From: single-quoted 'You don't have permission.' (apostrophe terminated string, SyntaxError). To: double-quoted "You don't have permission.".

## v.1.0.00.49 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Account profile: confirm email field; email and confirm must match when changing email.

### Changes (detailed)

#### Added
- src/components/ProfileModal.js: Confirm email field; when email is being changed, email and confirm email must match (case-insensitive) or show œEmail and confirm email do not match.

#### Changed
- src/components/ProfileModal.js: handleProfileSubmit validates email vs confirmEmail when new email differs from current; confirmEmail state synced on open and on success.

## v.1.0.00.48 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Profile/Account modal: two sections (Profile + Change password); change password with current/new/confirm; clearer labels and hints.

### Changes (detailed)

#### Added
- src/context/AuthContext.js: changePassword(currentPassword, newPassword) — verifies current (hash or legacy), hashes and saves new password.
- src/components/ProfileModal.js: œProfile section (name, email, hint, Save profile); œChange password section (current, new, confirm, hint, Change password button). Separate success/error per section.
- src/App.css: .profile-modal-dialog, .profile-modal-body, .profile-section, .profile-section-password, .profile-section-title, .profile-section-hint.

#### Changed
- src/components/ProfileModal.js: Modal title to œAccount; two forms and sections; password form clears on success.

## v.1.0.00.47 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Security: password hashing (bcrypt), no plaintext passwords; minimum password length; input length limits.

### Changes (detailed)

#### Added
- package.json: bcryptjs dependency for password hashing.
- src/context/AuthContext.js: bcrypt hash on register; compare hash on login; migrate legacy plaintext passwords to hash on next login. MIN_PASSWORD_LENGTH (8), BCRYPT_ROUNDS (10).
- src/components/LoginModal.js: Password hint œAt least 8 characters on Sign up; minLength={8} on password when registering.

#### Changed
- src/context/AuthContext.js: register stores passwordHash only (no plaintext); login uses bcrypt.compareSync; updateProfile trims and limits name/email length (200 / 254 chars). Register limits name and email length.

## v.1.0.00.46 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Profile management: edit name and email from a Profile modal; Profile entry in header (desktop and mobile menu).

### Changes (detailed)

#### Added
- src/context/AuthContext.js: updateProfile(updates) — updates name and/or email for current user; persists to stored users and in-memory user.
- src/components/ProfileModal.js: Profile modal with name and email form; save calls updateProfile; shows success/error.

#### Changed
- src/App.js: showProfileModal state; Profile button in desktop header and in mobile account menu; ProfileModal rendered; anyModalOpen includes showProfileModal.

## v.1.0.00.45 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Chat + Messages panels: stronger viewport resize (maxHeight, rAF); Messages panel full-viewport + viewport resize on mobile.

### Changes (detailed)

#### Changed
- src/components/ChatModal.js: Viewport update runs in requestAnimationFrame; panel inline style now includes maxHeight so CSS max-height cannot prevent shrinking when keyboard opens.
- src/components/MessagesModal.js: Added viewportSize state and visualViewport listener on mobile; Messages panel gets same inline height/top/maxHeight when viewport shrinks; body scroll lock when open; full-viewport on mobile.
- src/App.css: Messages panel on max-width 767px is full-viewport (inset 0, height 100%); messages-panel-header gets top safe-area padding on mobile.

## v.1.0.00.44 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Chat panel (mobile): resize to visual viewport when keyboard opens so header stays fixed and message bar moves up.

### Changes (detailed)

#### Changed
- src/components/ChatModal.js: Added viewportSize state and visualViewport resize/scroll listener on mobile when chat is open; chat panel gets inline height and top from visualViewport so the whole div resizes and the header does not move when the keyboard opens.

## v.1.0.00.43 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Chat panel: mobile fixes — full-viewport on small screens, safe-area padding, larger touch targets, body scroll lock.

### Changes (detailed)

#### Changed
- src/App.css: On max-width 767px, chat panel is full-viewport (inset 0, height 100%) so map no longer shows behind and keyboard resizing works; chat header gets top safe-area padding; form gets bottom safe-area padding; input min-height and send button size 44px on mobile for touch targets.
- src/components/ChatModal.js: When chat is open, set body overflow hidden and restore on close so background does not scroll on mobile.

## v.1.0.00.42 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat input bar: removed emoji button; send button is icon-only (no circle/pill background).

### Changes (detailed)

#### Removed
- src/components/ChatModal.js: Emoji button in chat form.

#### Changed
- src/App.css: .chat-panel-send — From: pill/circle background (--bb-primary), white icon. To: no background, primary-colored icon only; hover darkens icon color.

## v.1.0.00.41 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- FUTURE_FEATURES.md: added Chat & Messages (database-backed + real notifications) for when an actual database is connected; renumbered subsequent items.

### Changes (detailed)

#### Added
- FUTURE_FEATURES.md: New item 6 — Chat & Messages (database-backed + real notifications). Describes current (localStorage-only) vs planned (DB persistence, two-way messaging, unread count, push/email, cross-device sync). Renumbered Medium/Low items 6→7 through 16→17.

## v.1.0.00.40 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat send button: aligned with theme and input bar (primary green, pill shape).

### Changes (detailed)

#### Changed
- src/App.css: .chat-panel-send — From: circle (border-radius: 50%), orange (--bb-accent). To: pill (border-radius: 20px to match input), primary green (--bb-primary), hover --bb-primary-soft; added min-width and flex-shrink: 0 for alignment.

## v.1.0.00.39 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat input bar: strictly text messages — removed microphone, camera, and gallery buttons.

### Changes (detailed)

#### Removed
- src/components/ChatModal.js: Microphone, Camera, and Gallery buttons in the chat form. Removed: voice, photo, and image-attachment actions so chat is text-only.

## v.1.0.00.38 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages and Chat panels: same height (56vh), reduced size so they are not too big.

### Changes (detailed)

#### Changed
- src/App.css: Messages panel From: height 70vh. To: height 56vh, max-height 56vh. Chat panel From: height 85vh. To: height 56vh, max-height 56vh. Both panels now share the same height.

## v.1.0.00.37 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages pill and Messages/Chat panels anchored from the same bottom-right position.

### Changes (detailed)

#### Changed
- src/App.css: Messages panel and Chat panel From: vertically centered (top: 50%, transform: translateY(-50%), right: 24px). To: same anchor as pill — right: 16px, bottom: calc(24px + var(--bb-safe-bottom)); desktop (768px+) right: 24px, bottom: 24px. Panels now sit above the pill and share the same bottom-right corner.

## v.1.0.00.36 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Remove pencil FAB from Messages panel; chat panel same bottom (rounded input bar); pill and both panels use site theme (BalhinBalay).

### Changes (detailed)

#### Removed
- src/components/MessagesModal.js: Pencil (new message) FAB button.
- src/App.css: .messages-panel-fab, .messages-panel-fab:hover; padding-bottom: 80px from .messages-panel-body.

#### Changed
- src/App.css: Pill (.instagram-style): From dark #262626. To: var(--bb-surface-elevated), var(--bb-text), var(--bb-border), badge var(--bb-accent), avatars var(--bb-border). Messages panel: From dark #1a1a1a/#3e4042. To: var(--bb-surface-elevated), var(--bb-border), var(--bb-text), var(--bb-text-muted), var(--bb-primary) for badge and unread dot, header/row hover var(--bb-surface). Chat panel: Same theme; form has border-radius 0 0 var(--bb-radius) var(--bb-radius) so same bottom as Messages; bubbles var(--bb-primary)/var(--bb-border); input and send use --bb-surface, --bb-accent. All use var(--bb-radius) for panel and bubbles.

## v.1.0.00.35 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages/Chat panels and pill match reference: floating panels (not full height), 10px border-radius, pill ellipsis; bubble radius 8px.

### Changes (detailed)

#### Added
- src/App.js: Ellipsis icon (fa-ellipsis-v) after avatars in Messages pill.
- src/App.css: .floating-messages-pill-ellipsis; explicit border-radius 9999px on .instagram-style pill.

#### Changed
- src/App.css: Messages panel From: full height (top:0; right:0; bottom:0). To: floating, height 70vh, top 50% + translateY(-50%), right 24px, border-radius 10px, overflow hidden. Chat panel From: full height. To: floating, height 85vh, top 50% + translateY(-50%), right 24px, border-radius 10px, overflow hidden. Chat bubble border-radius From: 18px. To: 8px. Panel headers get border-radius 10px 10px 0 0.

## v.1.0.00.34 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat UI aligned to Instagram reference images: dark theme (pill #262626, panels #1a1a1a), red badge (#e7385a), blue unread dots in list, blue "me" bubbles (#0084ff) and gray "them" (#3e4042), blue pencil FAB and send button, input bar dark (#3e4042). Header grouped as "< Name" (back + avatar + title).

### Changes (detailed)

#### Added
- src/components/MessagesModal.js: Blue unread dot (.messages-panel-row-unread) when last message is not from user.
- src/components/ChatModal.js: .chat-panel-header-left wrapper for back + avatar + title (Instagram "< Name" style).
- src/App.css: .messages-panel-row-unread (10px blue circle); .chat-panel-header-left.

#### Changed
- src/App.css: Pill, Messages panel, Chat panel reverted to dark Instagram look from reference: pill #262626, red badge #e7385a; panel backgrounds #1a1a1a, borders #3e4042, text #fff/#e4e6eb/#b0b3b8; list row hover #262626; FAB and send #0084ff; "me" bubble #0084ff, "them" #3e4042; input bar background #3e4042. From: site theme (light). To: dark theme per Instagram screenshots.

## v.1.0.00.33 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages pill and chat panels restyled to match site theme (BalhinBalay): light surfaces, primary green, accent orange, border and text muted.

### Changes (detailed)

#### Changed
- src/App.css: Messages pill (.instagram-style) From: dark #262626. To: var(--bb-surface-elevated), var(--bb-text), var(--bb-border); badge var(--bb-accent); avatar border/background var(--bb-*). Messages panel From: dark #1a1a1a, #3e4042, #0084ff. To: var(--bb-surface-elevated), var(--bb-border), var(--bb-text), var(--bb-text-muted), badge var(--bb-primary), FAB var(--bb-accent). Chat panel From: dark theme, blue bubbles. To: var(--bb-surface-elevated), var(--bb-border); "me" bubble var(--bb-primary), "them" var(--bb-border); input bar and form buttons use --bb-surface, --bb-text-muted, --bb-primary hover; send button var(--bb-accent).

## v.1.0.00.32 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Chat UI updated to match new Instagram-style: floating Messages pill (bottom-right, dark, paper plane + badge + stacked avatars), right-side dark Messages panel with pencil FAB, right-side dark Chat panel with back arrow, grey/blue bubbles, and input bar (emoji, mic, camera, gallery, send). Filters FAB moved to bottom-left.

### Changes (detailed)

#### Added
- src/App.js: useChat(); messagesPillData (thread count + recent 3 listings for avatars); Messages pill with class instagram-style, paper plane icon, badge (count), "Messages" label, stacked avatars from recent threads.
- src/App.css: .floating-messages-pill.instagram-style (bottom-right, #262626); .floating-messages-pill-icon-wrap, .floating-messages-pill-badge (red), .floating-messages-pill-avatars/avatar (stacked circles); Instagram-style Messages panel (.messages-panel-wrap, .messages-panel, .messages-panel-header, .messages-panel-badge, .messages-panel-body, .messages-panel-list, .messages-panel-row, .messages-panel-fab); Instagram-style Chat panel (.chat-panel-wrap, .chat-panel, .chat-panel-header, .chat-panel-back, .chat-panel-bubble-me/them, .chat-panel-form, .chat-panel-input, .chat-panel-send, .chat-panel-form-btn for emoji/mic/camera/gallery). Dark theme (#1a1a1a, #3e4042, #0084ff for me/send/FAB).

#### Changed
- src/components/MessagesModal.js: From: centered modal (.modal.auth-modal). To: right-side panel (.messages-panel-wrap, .messages-panel), dark header with minimize + close, list rows (.messages-panel-row), pencil FAB bottom-right.
- src/components/ChatModal.js: From: centered modal. To: right-side panel (.chat-panel-wrap, .chat-panel), back arrow, dark header, grey/blue bubbles (.chat-panel-bubble-them/me), input bar with emoji, mic, camera, gallery, send.
- src/App.css: .floating-filters-btn From: right 16px. To: left 16px (bottom-left). Messages pill From: left (green). To: right, dark, paper plane + badge + avatars.

## v.1.0.00.31 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Changelog dates corrected from 2025 to 2026.

### Changes (detailed)

#### Changed
- CHANGELOG.md: All entry dates From: 2025-02-19. To: 2026-02-19.

## v.1.0.00.30 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Messages entry moved from header to a floating pill: remove Messages from desktop header and mobile menu; add floating Messages pill (bottom-left) when logged in and no modal open.

### Changes (detailed)

#### Added
- src/App.js: Floating Messages pill button (envelope icon + "Messages" label) shown when user && !anyModalOpen; opens MessagesModal on click.
- src/App.css: .floating-messages-pill, .floating-messages-pill-label — fixed bottom-left, pill shape (border-radius 9999px), --bb-primary background, responsive inset for desktop.

#### Removed
- src/App.js: Messages button from desktop header (header-actions-full). Messages menu item from mobile header menu dropdown.

## v.1.0.00.29 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fix Messages/Chat modals not visible: override global full-height .modal-content so content shows; flex layout so header and body stay visible and scrollable.

### Changes (detailed)

#### Fixed
- src/App.css: From: Messages/Chat modals inherited .modal-content min-height: 100vh so content could overflow or appear blank. To: .auth-modal .modal-content.messages-modal-content and .chat-modal-content get min-height: auto, flex: 1, min-height: 0; .messages-modal-body and .chat-modal-body get flex: 1, min-height: 0; headers get flex-shrink: 0 so layout stays visible and scrollable.

## v.1.0.00.28 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Desktop chat (Messages + Chat modals) restyled to messenger-style layout with site theme: avatars, timestamps, back button, accent send button.

### Changes (detailed)

#### Added
- src/components/MessagesModal.js: relativeTime(ts); messenger-style header (Messages + badge count, expand/close); thread list rows with circular avatar (listing image), title + relative time row, "You: " prefix on preview when from user.
- src/components/ChatModal.js: onBack prop; header with back button, property avatar + title, expand/close; emoji button in form; placeholder "Message..."; send button styled with --bb-accent.
- src/App.js: ChatModal onBack callback that closes chat and reopens MessagesModal.
- src/App.css: .messages-modal-content, .messages-modal-header, .messages-modal-title, .messages-modal-badge, .messages-modal-header-actions, .messages-modal-icon-btn; .messages-thread-avatar, .messages-thread-main, .messages-thread-row, .messages-thread-time; .chat-modal-content, .chat-modal-header, .chat-modal-back, .chat-modal-header-main, .chat-modal-header-avatar, .chat-modal-header-title, .chat-modal-header-actions, .chat-form-emoji; .chat-send-btn uses --bb-accent/--bb-accent-hover; all use site theme (--bb-surface-elevated, --bb-border, --bb-text, --bb-text-muted, --bb-primary).

#### Changed
- src/components/MessagesModal.js: From: single-line thread rows with title + preview. To: rows with avatar, title + relative time, and preview with "You: " when last message from user.
- src/components/ChatModal.js: From: plain modal header and single input. To: back button (when onBack), avatar + title in header, emoji + input + send bar; styling aligned to BalhinBalay theme.

## v.1.0.00.27 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- When viewing "My properties", add a bar with "Show all properties" so users can return to the full search/list.

### Changes (detailed)

#### Added
- src/App.js: When showMyPropertiesOnly && user, render a bar above SortBar with text "Showing only your properties" and button "Show all properties" that calls setShowMyPropertiesOnly(false).
- src/App.css: .my-properties-bar, .my-properties-bar-text, .my-properties-bar-back for layout and button styling.

## v.1.0.00.26 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add all Philippine regions with provinces and cities so users can add properties anywhere (e.g. Samar, NCR, CAR, I“XIII, BARMM). Search filters show only regions and cities that have at least one listing.

### Changes (detailed)

#### Added
- src/data/cities.js: getCityIdsWithListings(listings). City entries for Region VIII (Samar, Eastern Samar, Northern Samar, Leyte, Biliran, Southern Leyte), NCR (Manila, Quezon City, Makati, Taguig), CAR (Baguio, Bangued), Region I (Laoag, Vigan, San Fernando La Union, Dagupan), Region II (Tuguegarao, Ilagan), Region III (Angeles, San Jose del Monte), Region IV-A (Lipa, Bacoor, Calamba), Region IV-B (Puerto Princesa, Calapan), Region V (Legazpi, Naga Camarines Sur), Region VI (Iloilo City, Bacolod, Roxas), Region VII extra (Tagbilaran, Dumaguete, Siquijor), Region IX (Zamboanga City, Dipolog), Region X (Valencia Bukidnon, Ozamiz), Region XI (Davao City, Tagum), Region XII (General Santos, Koronadal), Region XIII (Butuan, Surigao City), BARMM (Cotabato City, Marawi).
- src/App.js: availableCityIds from getCityIdsWithListings(listingsByType); pass availableCityIds to FilterSidebar; useEffect to reset selectedCity to cebu-province when current city has no listings.

#### Changed
- src/components/FilterSidebar.js: Accept availableCityIds; city dropdown now shows only œAll Cities plus cities that have at least one listing (citiesForDropdown filtered by availableCityIds). Search thus restricts to areas that have properties.

## v.1.0.00.25 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Mobile header: logo left, actions right (2-column layout) so logo and buttons never overlap; logo truncates with ellipsis when narrow. Desktop keeps centered 3-column layout.

### Changes (detailed)

#### Changed
- src/App.css: Mobile (default): .app-header grid-template-columns: minmax(0, 1fr) auto (logo column | actions column). .app-header-spacer and .app-logo both grid-column: 1 / row: 1 (spacer 0 width so logo uses the space); .app-logo justify-self: start, min-width: 0, max-width: 100% for truncation. .app-header-actions grid-column: 2. Desktop (768px+): restore 3-column layout (1fr minmax(100px, auto) 1fr), spacer and logo/actions reset to auto placement, logo centered.

## v.1.0.00.24 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Prevent heart and Log in from covering the logo on mobile: reserve center column and logo min-width.

### Changes (detailed)

#### Fixed
- src/App.css: .app-header — From: grid-template-columns: 1fr auto 1fr (center could shrink). To: grid-template-columns: 1fr minmax(100px, auto) 1fr so the center column is at least 100px on mobile. .app-logo — added min-width: 100px so the logo keeps space and header actions don™t overlap it.

## v.1.0.00.23 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Increase spacing between header buttons on desktop (gap 14px for .header-actions-full).

### Changes (detailed)

#### Changed
- src/App.css: .header-actions-full at 768px+ — From: inherited gap 8px from .app-header-actions. To: gap: 14px so Saved, Add, Messages, My properties, Log out (or Log in) have more space between them on desktop.

## v.1.0.00.22 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Keep mobile Log in button text on one line (white-space: nowrap, flex-shrink: 0, padding tweak).

### Changes (detailed)

#### Fixed
- src/App.css: .btn-header-login-mobile — From: "Log in" could wrap to two lines on narrow mobile. To: white-space: nowrap, flex-shrink: 0, padding 10px horizontal so label stays on one line.

## v.1.0.00.21 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Restore Log in button on mobile header when user is not logged in (was missing after mobile menu refactor).

### Changes (detailed)

#### Fixed
- src/App.js: From: header-actions-mobile showed only Favorites when !user (no Log in). To: when !user show Favorites + Log in button (btn-header-login); when user show Favorites + account menu (â‹®). Log in opens LoginModal.

## v.1.0.00.20 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add Property form: location hierarchy Region → Province → City; show all cities in selected region+province (no listing filter); add getProvincesByRegion, getCitiesByRegionAndProvince, getRegionIdsWithCities in cities.js.

### Changes (detailed)

#### Added
- src/data/cities.js: getProvincesByRegion(regionId), getCitiesByRegionAndProvince(regionId, province), getRegionIdsWithCities(). All cities in data for that region+province are shown (fully unlocked).

#### Changed
- src/components/AddPropertyModal.js: From: Province → City only. To: Region dropdown first (all Philippine regions except "All"), then Province (from getProvincesByRegion(regionId)), then City (from getCitiesByRegionAndProvince(regionId, province)). Region change resets province and city; province change resets city. City list is all cities in data for that region and province, not filtered by listings.

## v.1.0.00.19 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add Property form: add Province dropdown (Province → City); add image upload (file input, up to 5 images, 2MB each, data URLs stored); keep optional Image URL; add getProvinces and getCitiesByProvince in cities.js.

### Changes (detailed)

#### Added
- src/data/cities.js: getProvinces(), getCitiesByProvince(province).
- src/components/AddPropertyModal.js: Province state and dropdown; city options filtered by selected province; handleProvinceChange (resets city to first in province); uploadedImages state; handleImageUpload (FileReader data URLs, max 5, 2MB/file); removeUploadedImage; image upload file input and thumbnails with remove; optional Image URL field. Submit uses validCityId and images = URL + uploaded data URLs, or default.
- src/App.css: .add-property-thumbnails, .add-property-thumb-wrap, .add-property-thumb-remove for upload previews.

#### Changed
- src/components/AddPropertyModal.js: From: City only, single Image URL. To: Province dropdown before City; City options from getCitiesByProvince(province); image upload + optional URL; listing.images built from uploaded + URL or default.

## v.1.0.00.18 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Hide orange floating filters button when any modal is open (Saved properties, Login, Add property, Chat, Messages, property details) so it no longer overlaps modals.

### Changes (detailed)

#### Changed
- src/App.js: Added anyModalOpen (true when showLoginModal, showAddPropertyModal, showChatModal, showMessagesModal, showFavoritesModal, or showModal). Floating filters button now renders only when !filtersOpen && !anyModalOpen. From: FAB visible whenever filter panel closed. To: FAB hidden when any overlay/modal is open.

## v.1.0.00.17 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Show orange floating filters button on desktop when filter sidebar is closed (remove CSS that hid it at 768px+).

### Changes (detailed)

#### Changed
- src/App.css: From: .floating-filters-btn { display: none; } inside @media (min-width: 768px) hid the orange FAB on desktop. To: rule removed so the floating filters button appears on desktop when filters are closed, matching mobile.

## v.1.0.00.16 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Remove green header "Filters" button from mobile and desktop; filters are opened only via the orange floating button when the filter panel is closed (same on both viewports).

### Changes (detailed)

#### Removed
- src/App.js: Green "Filters" button (btn-filter-trigger) from header-actions-mobile and header-actions-full. Filters are now opened solely via the orange floating filters button when filtersOpen is false (mobile and desktop).

## v.1.0.00.15 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fix mobile header overflow: on mobile show Favorites + account menu (dropdown) + Filters instead of five separate buttons; add Saved/Favorites entry point and Favorites modal; change floating filters button icon from search to sliders; keep logo from shrinking (white-space: nowrap, text-overflow: ellipsis).

### Changes (detailed)

#### Added
- src/components/FavoritesModal.js: modal/sheet listing saved properties from FavoritesContext; empty state; tap listing opens property details and closes modal.
- App.js: useFavorites, showFavoritesModal, showHeaderMenu, favoriteListings memo; Favorites button (mobile + desktop); mobile-only header menu (ellipsis) with dropdown (Add, Messages, My properties, Log out) and backdrop to close.
- src/App.css: .favorites-modal-backdrop, .favorites-modal-sheet, .favorites-modal-header/body/list/card; .header-actions-mobile, .header-actions-full, .header-menu-backdrop, .header-menu-dropdown, .btn-header-favorites, .btn-header-menu-trigger.

#### Changed
- src/App.js
  - Header: From: single row of 4“5 buttons + Filters causing cramping on mobile. To: on mobile, Favorites (icon) + account menu (icon, dropdown) + Filters; on desktop (768px+), Favorites (Saved) + full auth actions + Filters. Logo: no code change; CSS prevents shrink.
  - Floating filters button: From: fa-search (magnifying glass). To: fa-sliders-h to match "Open filters" and avoid confusion with search.
- src/App.css: .app-logo given white-space: nowrap, overflow: hidden, text-overflow: ellipsis, min-width: 0. Media query to show .header-actions-full at 768px+ and .header-actions-mobile below.

## v.1.0.00.14 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- FUTURE_FEATURES.md: Clarify that all listed items are not implemented; add dedicated sections for Profile Management, Saved Searches & Alerts, and Favorite Properties (account sync/cross-device); add "Not implemented" to each future feature.

### Changes (detailed)

#### Changed
- FUTURE_FEATURES.md
  - From: Some unimplemented features (profile management, saved search, favorites sync) were folded into combined sections; no explicit "not implemented" note.
  - To: Intro states "All items listed here are not yet implemented." Profile Management is its own section (#2). Saved Searches & Alerts remains (#3). New section (#4) "Favorite Properties (account sync / cross-device)" clarifies current behavior (localStorage per device) vs planned (account sync). "Other Account-Related Features" (#5) keeps comparison lists and viewing history. All numbered features now include "Not implemented" where applicable. Sections renumbered 1“16.

## v.1.0.00.13 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Filter FUTURE_FEATURES.md to list only planned work; remove or reframe items already implemented (chat, auth, basic listing form, basic share, basic accessibility).

### Changes (detailed)

#### Changed
- FUTURE_FEATURES.md
  - From: Roadmap included Chat Integration, User Accounts & Authentication, Property Listing Management, Social Media Integration, and Accessibility as full future items.
  - To: Removed duplicate œfuture items that exist in the app (in-house chat, login/signup, add property form, Web Share/copy URL, ARIA/modal focus). Kept only truly planned work: province-level filtering, saved searches & alerts, enhanced user features (profile, comparison, history, cross-device favorites), comparison tool, virtual tours, analytics, advanced search, listing enhancements (upload, edit/delete, stats), reviews & ratings, mobile app, i18n, social sharing enhancements, financing calculator, agent directory, and technical debt. Added link to FEATURES.md; renumbered sections; noted œcurrent vs œplanned where partially implemented.

## v.1.0.00.12 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add FEATURES.md documenting all app features: listing types, filters, view modes, property display, auth, user listings, favorites, chat, map, layout, data/regions, accessibility.

### Changes (detailed)

#### Added
- FEATURES.md
  - Documented: listing types and browsing, filters, view modes and sorting, property display, authentication, user listings (add property), favorites, chat and messages, map, layout and responsiveness, data and regions, accessibility and UX.

## v.1.0.00.11 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Add login so users can add properties to their profile: AuthContext (login/register/logout, localStorage), UserListingsContext (user listings by owner), LoginModal, Add Property modal, header auth UI (Log in / Add, My properties, Log out), and œMy properties filter.

### Changes (detailed)

#### Added
- src/context/AuthContext.js: user, login, register, logout; persistence via balhinbalay_user and balhinbalay_users in localStorage.
- src/context/UserListingsContext.js: userListings, addListing, getListingsByOwner; persistence via balhinbalay_user_listings.
- src/components/LoginModal.js: Login / Sign up tabs, email, password, name (sign up).
- src/components/AddPropertyModal.js: Form (title, listing type, property type, price, city, location, beds, baths, size, description, image URL, contact); submits with ownerId.
- App.js: AuthProvider → UserListingsProvider → FavoritesProvider → AppContent; allListings = sampleListings + userListings; listingsToFilter when œMy properties uses ownerId filter; header shows Log in (when guest) or Add, My properties toggle, Log out (when user); LoginModal and AddPropertyModal with show/onClose.

#### Changed
- src/App.css: .btn-header-login, .btn-header-secondary(.active), .btn-header-label (hidden on small screens); .auth-modal (z-index 1060, centered dialog, non“full-screen); .login-tabs; .auth-modal .modal-dialog.add-property-modal-dialog max-width 520px.
- LoginModal.js and AddPropertyModal.js: wrapper div uses class auth-modal for centered, non“full-screen styling.

## v.1.0.00.10 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Center the logo / home (BalhinBalay) in the app header.

### Changes (detailed)

#### Changed
- src/App.js: Added empty app-header-spacer div so header has three columns (spacer, logo, actions).
- src/App.css: .app-header now uses display: grid; grid-template-columns: 1fr auto 1fr; .app-logo has justify-self: center; .app-header-actions has justify-content: flex-end so the Filters button stays on the right.

## v.1.0.00.09 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Default to list view when viewport is mobile (initial load and when resizing to mobile).

### Changes (detailed)

#### Changed
- src/App.js
  - viewMode initial state, handleResize
    - From: viewMode always started as 'grid'; no change on resize.
    - To: viewMode initial state is 'list' when window.innerWidth < 768, else 'grid'; when resize crosses to mobile (nextIsMobile && wasDesktop), setViewMode('list').

## v.1.0.00.08 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- On mobile show list + map view only (hide grid/tiled); on desktop show grid, list, and map.

### Changes (detailed)

#### Changed
- src/App.css
  - .view-mode-toggle .btn-view-mode:nth-child(1)
    - From: List view hidden on mobile (grid + map only).
    - To: Grid/tiled view hidden on mobile (list + map only); first button (grid) display: none until 768px.

## v.1.0.00.07 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed white block overlaying property photo in View Details modal; made close button a clear X.

### Changes (detailed)

#### Fixed
- src/components/PropertyModal.js
  - Close button: Replaced Bootstrap btn-close (which was not clearly visible) with custom modal-close-btn using Font Awesome fa-times so the X is visible on the dark green header.
  - Carousel: Replaced Bootstrap carousel structure with property-modal-carousel; moved indicators out of overlay into a bar below the image (carousel-indicators-bar) so no white block appears on the photo; removed rounded/mb from img to avoid layout glitches.
- src/App.css
  - Added .modal-close-btn: visible X button (white icon, light background) in modal header.
  - Added .property-modal-carousel, .carousel-indicators-bar and related styles: image area contained with overflow hidden; indicators as small dots below the image (no overlay on photo).

## v.1.0.00.06 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed filter sheet closing on mobile when tapping the search bar (keyboard open was triggering resize and closing the sheet).

### Changes (detailed)

#### Fixed
- src/App.js
  - handleResize (in useEffect), prevWidthRef
    - From: Any resize while on mobile (nextIsMobile) called setFiltersOpen(false), so opening the virtual keyboard (which fires resize) closed the sheet before the user could type.
    - To: Only close the sheet when actually crossing from desktop (width >= 768) to mobile (width < 768), using prevWidthRef to store previous width; keyboard-open resize on an already-mobile viewport no longer closes the sheet.

## v.1.0.00.05 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed View Details modal greyed out and not interactable (backdrop was covering content).

### Changes (detailed)

#### Fixed
- src/App.css
  - .modal, .modal-backdrop, .modal-dialog
    - From: No z-index; backdrop rendered after dialog in DOM so it sat on top and blocked clicks.
    - To: .modal position fixed, z-index 1050; .modal-backdrop z-index 0; .modal-dialog position relative, z-index 1 so dialog is above backdrop and receives clicks.
- src/components/PropertyModal.js
  - Modal structure
    - From: Backdrop rendered after modal-dialog.
    - To: Backdrop rendered before modal-dialog so stacking order is correct; backdrop still closes on click.

## v.1.0.00.04 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Added Iligan City and Cagayan de Oro (Region X “ Northern Mindanao) with sample properties.

### Changes (detailed)

#### Added
- src/data/cities.js
  - Iligan City (id: iligan-city, province: Lanao del Norte, regionId: region-x)
  - Cagayan de Oro (id: cagayan-de-oro, province: Misamis Oriental, regionId: region-x)
- src/data/listings.js
  - 3 listings in Iligan City: 3BR house for sale, 2BR apartment for rent, commercial lot for sale (ids 21“23)
  - 3 listings in Cagayan de Oro: 4BR house for sale, studio condo for rent, 2BR house and lot for sale (ids 24“26)

## v.1.0.00.03 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed search bar placeholder/text overlapping icon in filter sheet (specificity override).

### Changes (detailed)

#### Fixed
- src/App.css
  - .filter-sidebar-content .form-control.search-input
    - From: Padding was overridden by .filter-sidebar-content .form-control (padding: 12px 14px), so left padding was 14px and text overlapped the search icon.
    - To: Added more specific rule with padding-left: 52px and padding-right: 44px so placeholder and text start clear of the icon.

## v.1.0.00.02 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Fixed search bar icon alignment and overlap in filter sheet.

### Changes (detailed)

#### Fixed
- src/App.css
  - .search-icon, .search-input
    - From: Icon left-aligned only, possible clip/overlap with input corner.
    - To: Icon vertically centered (top: 50%, transform: translateY(-50%)), left 16px, z-index: 2, line-height: 1; input padding-left 48px so text clears icon.
