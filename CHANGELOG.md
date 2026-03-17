# Changelog

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
- Pull-to-refresh and dark mode are disabled on desktop (≥768px): results area uses PullToRefresh only on mobile; theme is forced to light on desktop and Appearance (Theme) is hidden in Settings.

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
- “Send reset code to my email” button styled red. Report/flag listing and total move-in fees implemented (backend, form, detail UI).

### Changes (detailed)

#### Added
- server/migrations/add-move-in-fees-and-reports.sql: listing columns advance_pay, broker_fee, association_fee, utilities_included, reservation_fee; listing_reports table (listing_id, reporter_id, reason, created_at). Registered in run-migrations.js.
- server/routes/listings.js: COLS and INSERT/PATCH include new move-in fields; POST /:id/report (auth, non-owner only, one report per user per listing, optional reason).
- server/lib/listings.js: mapListingRow returns advancePay, brokerFee, associationFee, utilitiesIncluded, reservationFee.
- src/components/AddPropertyForm.js: advance pay, broker fee, association fee, utilities included (checkbox), reservation fee (rent-only); state, initial sync, and submit payload.
- src/components/PropertyDetailContent.js: Move-in fees section for rent — key money, security deposit, advance pay, broker fee, association fee, reservation fee, utilities included/not, extra fees; total move-in sum. Report/flag: button (non-owner, logged-in), modal with optional reason and submit; api.post report endpoint.

#### Changed
- src/pages/ProfilePage.js: “Send reset code to my email” button class from btn-outline-secondary to btn-danger (red).
- MVP.md: Report/flag listing and Total move-in fees marked done in To do (backlog) with implementation refs.

## v.1.0.00.274 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Profile: single “Change password” flow; always requires email 5-digit code (removed current-password form).

### Changes (detailed)

#### Changed
- src/pages/ProfilePage.js: Removed “Change password” section that used current password + new password (no email code). Kept only the email-code flow and renamed it to “Change password” with hint “We’ll send a 5-digit code to your email. Enter the code and choose a new password (at least 8 characters).” Removed changePassword, handlePasswordSubmit, doChangePassword, related state, and ConfirmModal. From: two options (current-password change and reset via email). To: one flow — change password always requires email confirmation (5-digit code).

#### Removed
- src/pages/ProfilePage.js: ConfirmModal import and usage for change-password confirm; current-password / new-password / confirm-password state and form.

## v.1.0.00.273 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Password reset available when logged in; still requires email confirmation (5-digit code).

### Changes (detailed)

#### Added
- src/pages/ProfilePage.js: “Reset password (via email)” section — same flow as forgot password: send 5-digit code to user’s email (pre-filled), then enter code + new password + confirm. Cancel/Back to collapse. From: only LoginModal offered reset (forgot password). To: logged-in users can reset password from Profile and must confirm via email code.

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
- src/components/LoginModal.js: Forgot password flow — “Forgot password?” link on login tab; reset step “email” (send code) and “code” (enter code + new password + confirm); Back to login; reset state cleared when modal closes.

#### Changed
- MVP.md: “View inquiries” marked implemented (inquiry via chat). “Report / flag listing” removed from Optional MVP Enhancements and added under new “To do (backlog)” section. Password reset checklist item marked implemented.

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
- src/components/PriceSlider.js: Max wrapper left set to maxPct% and width to (100-maxPct)% so it does not overlap min wrapper (0 to maxPct). maxInputLeft/maxInputWidth use (100-maxPct) so thumb stays correct. From: max wrapper spanned minPct–100 and overlapped min wrapper (0–maxPct); min had z-index 2 so it captured clicks meant for the max thumb. To: wrappers are adjacent (0–maxPct and maxPct–100), no overlap; max handle receives events on the right.
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
- src/components/PushTokenHandler.js: On native, run revoke with stored token as soon as the handler mounts (every app cold start). Set startupRevokeDone when done (or when non-native / no token). Register effect now waits for startupRevokeDone so we never register then immediately revoke. Ensures server drops this device’s token on open; token is re-added only if user is logged in.

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
- src/components/PriceSlider.js: dual-handle range slider with min/max bubbles, track fill, ticks; formatPrice (₱k/₱M/Any); listing-type config (sale/rent).
- src/data/listings.js: priceSliderConfig (sale: 0–10M step 500k; rent: 0–100k step 5k).
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
- City search: Region, Province, and City dropdowns always visible (Province shown between Region and City, disabled until a region is selected). Map: clicking Map on home goes straight to results in map view (no intermediate “Show on map” page); /search/map still redirects to map results.

### Changes (detailed)

#### Changed
- src/pages/SearchCityPage.js
 - Province dropdown always rendered between Region and City; disabled when no region or region is “all”. showProvince no longer gates visibility.
- src/pages/HomePage.js
 - Map card: on click calls submitSearch({ listingType, view: 'map', ...defaults }) and navigate to /sale or /rent (results in map view). Added useSearch, defaultSearchState.
- src/pages/SearchMapPage.js
 - From: page with “Show on map” button. To: redirect-only; on mount submitSearch with view 'map' and navigate to /listingType (replace), render null. Keeps /search/map URL working.

## v.1.0.00.229 — Development
Date: 2026-02-28
Type: Dev Change

### Summary
- Listing type toggle redesigned to match reference: sliding knob over “For Rent” / “For Sale” text, hidden checkbox, pill track with primary-colour knob that slides on toggle.

### Changes (detailed)

#### Changed
- src/components/ListingTypeToggle.js
 - From: button with track + thumb + label. To: label wrapping hidden checkbox and .listing-type-toggle div with two spans (For Rent, For Sale). Checked = For Sale (knob right), unchecked = For Rent (knob left). handleChange toggles via checkbox state.
- src/App.css
 - .listing-type-toggle-wrap: container with flex/center; .toggle-input: visually hidden; .listing-type-toggle: 160px × 44px pill track, ::before as sliding knob (76px × 36px, primary); spans 50% width, text colour flips (active = white, inactive = muted). .toggle-input:checked + .listing-type-toggle::before { transform: translateX(76px) } and span colour toggles.

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
 - From: A green text checkmark character (`✔`) above the heading.
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
- Property page is now the same PropertyModal component in “page” mode (asPage): one component for both overlay modal and full-page view; back button in header when as page.

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
- .cursor/plans/plan-to-finish.md: removed "Search UI" (rental_term, school) from remaining work; section 2 is now "Search history (saved filters)" only; execution order 1–5 (was 1–6); quick reference "Search" → "Search history"; note added that rental search moved to FUTURE_PLANS.md.

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
- Replace Android app launcher icons with assets from the project’s "android icons" folder (mipmap-* and values/ic_launcher_background).

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
- ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png: replaced with public/logo.png (1024×1024 source recommended for best quality).

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
- src/App.js: Push flow now logs "Requesting notification permission…", "Permission granted, calling register()…", "Got FCM token, sending to server…", "Token registered with server." or "Failed to register token" with status/data; log when permission not granted.
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
- src/App.css: Touch targets use --bb-tap (48px) for header buttons, listing tabs, view-mode toggle, sort select, favorite button, View Details; header min-height 56px with more padding; listing tabs flex:1 on mobile, 48px min-height; sort bar and results area more padding; property card body padding 16–18px; card title 1.125rem; html -webkit-tap-highlight-color; results-area safe-area insets on mobile; App min-height 100dvh.

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
- src/components/MessagesModal.js: Reverted to messages-panel-wrap / messages-panel structure, minimize and close buttons, original row layout (unread dot + avatar + title · participant + time, preview).
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
- Apply warm coral–yellow palette (FF5A5A, FF8B5A, FFA95A, FFD45A).

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
- server/index.js: express.json limit 200mb → 15mb (enough for 5×2MB base64).
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
- Chat: fixed per-property-per-user. Inquirer now correctly finds their thread; owner with multiple inquirers gets most recent. Messages list shows "Property · Other Person".

### Changes (detailed)

#### Changed
- server/routes/chat.js: GET /threads — join users for inquirer_name, owner_name; return otherParticipantName (other party in the chat). POST /threads — return listingTitle, listingOwnerId.
- src/context/ChatContext.js: Store userId, listingOwnerId, updatedAt, otherParticipantName; loadMessagesForListing, getMessages, sendMessage, markThreadReadByListingId — use correct thread: inquirer finds thread where userId===me; owner with multiple threads gets most recent by updatedAt.
- src/components/MessagesModal.js: Display "Property · Other Person" in thread row.

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
- src/components/ProfileModal.js: Confirm email field; when email is being changed, email and confirm email must match (case-insensitive) or show “Email and confirm email do not match.”

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
- src/components/ProfileModal.js: “Profile” section (name, email, hint, Save profile); “Change password” section (current, new, confirm, hint, Change password button). Separate success/error per section.
- src/App.css: .profile-modal-dialog, .profile-modal-body, .profile-section, .profile-section-password, .profile-section-title, .profile-section-hint.

#### Changed
- src/components/ProfileModal.js: Modal title to “Account”; two forms and sections; password form clears on success.

## v.1.0.00.47 — Development
Date: 2026-02-20
Type: Dev Change

### Summary
- Security: password hashing (bcrypt), no plaintext passwords; minimum password length; input length limits.

### Changes (detailed)

#### Added
- package.json: bcryptjs dependency for password hashing.
- src/context/AuthContext.js: bcrypt hash on register; compare hash on login; migrate legacy plaintext passwords to hash on next login. MIN_PASSWORD_LENGTH (8), BCRYPT_ROUNDS (10).
- src/components/LoginModal.js: Password hint “At least 8 characters” on Sign up; minLength={8} on password when registering.

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
- Add all Philippine regions with provinces and cities so users can add properties anywhere (e.g. Samar, NCR, CAR, I–XIII, BARMM). Search filters show only regions and cities that have at least one listing.

### Changes (detailed)

#### Added
- src/data/cities.js: getCityIdsWithListings(listings). City entries for Region VIII (Samar, Eastern Samar, Northern Samar, Leyte, Biliran, Southern Leyte), NCR (Manila, Quezon City, Makati, Taguig), CAR (Baguio, Bangued), Region I (Laoag, Vigan, San Fernando La Union, Dagupan), Region II (Tuguegarao, Ilagan), Region III (Angeles, San Jose del Monte), Region IV-A (Lipa, Bacoor, Calamba), Region IV-B (Puerto Princesa, Calapan), Region V (Legazpi, Naga Camarines Sur), Region VI (Iloilo City, Bacolod, Roxas), Region VII extra (Tagbilaran, Dumaguete, Siquijor), Region IX (Zamboanga City, Dipolog), Region X (Valencia Bukidnon, Ozamiz), Region XI (Davao City, Tagum), Region XII (General Santos, Koronadal), Region XIII (Butuan, Surigao City), BARMM (Cotabato City, Marawi).
- src/App.js: availableCityIds from getCityIdsWithListings(listingsByType); pass availableCityIds to FilterSidebar; useEffect to reset selectedCity to cebu-province when current city has no listings.

#### Changed
- src/components/FilterSidebar.js: Accept availableCityIds; city dropdown now shows only “All Cities” plus cities that have at least one listing (citiesForDropdown filtered by availableCityIds). Search thus restricts to areas that have properties.

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
- src/App.css: .app-header — From: grid-template-columns: 1fr auto 1fr (center could shrink). To: grid-template-columns: 1fr minmax(100px, auto) 1fr so the center column is at least 100px on mobile. .app-logo — added min-width: 100px so the logo keeps space and header actions don’t overlap it.

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
- src/App.js: From: header-actions-mobile showed only Favorites when !user (no Log in). To: when !user show Favorites + Log in button (btn-header-login); when user show Favorites + account menu (⋮). Log in opens LoginModal.

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
  - Header: From: single row of 4–5 buttons + Filters causing cramping on mobile. To: on mobile, Favorites (icon) + account menu (icon, dropdown) + Filters; on desktop (768px+), Favorites (Saved) + full auth actions + Filters. Logo: no code change; CSS prevents shrink.
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
  - To: Intro states "All items listed here are not yet implemented." Profile Management is its own section (#2). Saved Searches & Alerts remains (#3). New section (#4) "Favorite Properties (account sync / cross-device)" clarifies current behavior (localStorage per device) vs planned (account sync). "Other Account-Related Features" (#5) keeps comparison lists and viewing history. All numbered features now include "Not implemented" where applicable. Sections renumbered 1–16.

## v.1.0.00.13 — Development
Date: 2026-02-19
Type: Dev Change

### Summary
- Filter FUTURE_FEATURES.md to list only planned work; remove or reframe items already implemented (chat, auth, basic listing form, basic share, basic accessibility).

### Changes (detailed)

#### Changed
- FUTURE_FEATURES.md
  - From: Roadmap included Chat Integration, User Accounts & Authentication, Property Listing Management, Social Media Integration, and Accessibility as full future items.
  - To: Removed duplicate “future” items that exist in the app (in-house chat, login/signup, add property form, Web Share/copy URL, ARIA/modal focus). Kept only truly planned work: province-level filtering, saved searches & alerts, enhanced user features (profile, comparison, history, cross-device favorites), comparison tool, virtual tours, analytics, advanced search, listing enhancements (upload, edit/delete, stats), reviews & ratings, mobile app, i18n, social sharing enhancements, financing calculator, agent directory, and technical debt. Added link to FEATURES.md; renumbered sections; noted “current” vs “planned” where partially implemented.

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
- Add login so users can add properties to their profile: AuthContext (login/register/logout, localStorage), UserListingsContext (user listings by owner), LoginModal, Add Property modal, header auth UI (Log in / Add, My properties, Log out), and “My properties” filter.

### Changes (detailed)

#### Added
- src/context/AuthContext.js: user, login, register, logout; persistence via balhinbalay_user and balhinbalay_users in localStorage.
- src/context/UserListingsContext.js: userListings, addListing, getListingsByOwner; persistence via balhinbalay_user_listings.
- src/components/LoginModal.js: Login / Sign up tabs, email, password, name (sign up).
- src/components/AddPropertyModal.js: Form (title, listing type, property type, price, city, location, beds, baths, size, description, image URL, contact); submits with ownerId.
- App.js: AuthProvider → UserListingsProvider → FavoritesProvider → AppContent; allListings = sampleListings + userListings; listingsToFilter when “My properties” uses ownerId filter; header shows Log in (when guest) or Add, My properties toggle, Log out (when user); LoginModal and AddPropertyModal with show/onClose.

#### Changed
- src/App.css: .btn-header-login, .btn-header-secondary(.active), .btn-header-label (hidden on small screens); .auth-modal (z-index 1060, centered dialog, non–full-screen); .login-tabs; .auth-modal .modal-dialog.add-property-modal-dialog max-width 520px.
- LoginModal.js and AddPropertyModal.js: wrapper div uses class auth-modal for centered, non–full-screen styling.

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
- Added Iligan City and Cagayan de Oro (Region X – Northern Mindanao) with sample properties.

### Changes (detailed)

#### Added
- src/data/cities.js
  - Iligan City (id: iligan-city, province: Lanao del Norte, regionId: region-x)
  - Cagayan de Oro (id: cagayan-de-oro, province: Misamis Oriental, regionId: region-x)
- src/data/listings.js
  - 3 listings in Iligan City: 3BR house for sale, 2BR apartment for rent, commercial lot for sale (ids 21–23)
  - 3 listings in Cagayan de Oro: 4BR house for sale, studio condo for rent, 2BR house and lot for sale (ids 24–26)

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
