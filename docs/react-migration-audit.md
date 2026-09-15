# Approved prototype → existing React application

Baseline: `khaCey/balhinbalay`, `dev` commit `b0ffe745ca1171bd13bcb576a446180877699324`.
Implementation branch: `feature/react-prototype-ui`.
Visual reference: approved Site v2, source commit `6e6311da0303ea22f5b5647db70ecbd3c98fc044`, https://balhinbalay-design-prototype.khacey-salvador.chatgpt.site/.

The uploaded ZIP is an older snapshot. Implementation continues in the clean current-dev checkout; the older archive and the published prototype are not modified.

## Architecture retained

React 18, React Router 7, CRA 5 / CRACO 7, existing API client and provider hierarchy. No framework replacement. Node/Express and PostgreSQL contracts remain authoritative. Existing authentication uses AuthContext and the bearer-token API client, including 401 handling, email confirmation and password-reset flows. The existing push implementation is web-disabled; it is not replaced with fake preferences.

| Area | Existing authority | Migration approach |
|---|---|---|
| Shell and navigation | MainLayout, React Router, AuthContext, ChatContext | Approved horizontal desktop header; Home/Search/Saved/Profile bottom navigation; inbox unread indicator; existing login gates |
| Home | ListingsContext, SearchContext, RecentlyViewedContext | Location-first hero; compact city search; real listing rails; continue search; owner CTA |
| City/keyword/school | SearchModule, cities/schools catalogues, SearchContext | React controls and native city sheet; preserve payload fields, 10 km school radius and keyword semantics |
| Results and filters | AppContent, ListingsContext, priceRanges, SortBar | Shared cards, compact controls, full existing filter inputs in native sheet; retain sort values |
| Map | Leaflet + MarkerCluster, ListingsContext | Real pins and compact selected-property preview; same API filters; remember viewport/selection within the session |
| Property | PropertyPage/PropertyModalContext, API listing object | Reusable gallery, summary, fee disclosure, contact panel; real favourite/share/report/chat handlers |
| Saved | FavoritesContext, SavedSearchesContext, RecentlyViewedContext | Three tabs and resume/delete actions; no replacement of account-backed storage |
| Chat | ChatContext, /api/chat/threads and messages endpoints | Existing thread and message logic; property context strip and prototype composer/bubbles |
| Owner | UserListingsContext, AddPropertyForm, /api/listings | Six steps around existing fields, upload processing, geocoding, validation and create/update calls |
| Account | AuthContext, ProfilePage, SettingsPage, /api/users/me | Approved surfaces and account menu; preserve validation, password reset and account deletion |

## Explicit boundaries

- `server/`, `schema.sql`, migrations, API contracts and native wrappers are unchanged.
- No production deployment or merge is authorised by this migration.
- New comparison state is React UI state, limited to three real listings and cleared when the account changes. It does not claim account-backed persistence.
- Home uses the API listing order under “Places to explore”; no popularity or personalised ranking is fabricated.
- Shared `approved-ui.css` contains tokens and adapters for legacy surfaces. Existing CSS remains for non-migrated/admin functionality; removal would be separate cleanup.
- The old global viewport lock is overridden because the approved layout scrolls the document. Results retain a Show more fallback so pagination remains usable.

## Continuation checkpoint

Work was resumed from existing uncommitted shell/search/card changes, not restarted. The original Site is preserved. Later implementation and validation are recorded in `react-migration-handoff.md`; product decisions are kept in `react-migration-confirmations.md`.
