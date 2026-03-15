# Real Estate Platform MVP Checklist

Status: **[x]** = implemented in codebase · **[ ]** = not implemented

---

## User Accounts
- [x] User registration — `server/routes/auth.js` POST `/register`; `LoginModal.js` sign-up flow
- [x] Email confirmation — `server/routes/auth.js` GET `/confirm-email`; `ConfirmEmailPage.js`; `sendConfirmationEmail`
- [x] Login — `server/routes/auth.js` POST `/login`; `LoginModal.js`; `AuthContext`
- [x] Logout — `AuthContext` logout; `MenuPage.js` Log out
- [x] Password reset — 5-digit code sent to email; `server/routes/auth.js` request-password-reset, reset-password; `LoginModal.js` Forgot password flow
- [x] Profile page — `ProfilePage.js`; `/profile` route
- [x] Profile picture upload — `ProfilePage.js` avatar upload/remove; `server/routes/users.js` POST/DELETE `/me/avatar`
- [x] Account settings — `SettingsPage.js`; profile, notifications, appearance (theme)

---

## Property Listings
- [x] Create property listing — `AddPropertyPage.js`; `AddPropertyForm.js`; `server/routes/listings.js` POST
- [x] Edit property listing — `AddPropertyPage.js` with `id`; `AddPropertyForm` with `initialListing`; PATCH listing
- [x] Unlist / delete property — `PropertyPage.js` `handleDelete` / `unlistListing`; `server` PATCH unlist (status `unlisted`)
- [x] Property detail page — `PropertyPage.js`; `PropertyDetailContent.js`; `/property/:id`
- [x] Upload property photos — `AddPropertyForm.js` images; server listing create/update with `images`
- [x] Property status — listing status and sale/rent state
  - [x] For Sale — `listingType` sale; filter/search
  - [x] For Rent — `listingType` rent; filter/search
  - [x] Sold / Rented — `sold`, `currentlyRented` in DB and form; owner can update

### Listing Fields
- [x] Title — form and API
- [x] Description — form and API
- [x] Price — form and API
- [x] Property type — `type` (House, Apartment, Condo, etc.)
- [x] Bedrooms — `beds`
- [x] Bathrooms — `baths`
- [x] Floor area — `sizeSqm` / `size_sqm`
- [x] Furnished / unfurnished — `furnished` in form and API
- [x] Address — `location`; geocoding in form
- [x] City — `cityId`; region/province/city selectors; `data/cities.js`
- [x] Coordinates (map) — `coordinates`; `MapPicker.js`; map view in search and detail

---

## Search & Discovery
- [x] Property search — home search entry; `/sale`, `/rent` results; keyword/city/school/map search
- [x] Filters
  - [x] For Sale / For Rent — listing type toggle and filters
  - [x] Price range — price slider and presets
  - [x] Location — region, province, city; school proximity
  - [x] Property type — filter in results and advanced filters
  - [x] Bedrooms — min beds in advanced filters
- [x] Sort results — `SortBar.js`
  - [x] Price low → high — `price-low`
  - [x] Price high → low — `price-high`
  - [x] Newest listings — `newest`; also size large/small

---

## Property Detail Page
- [x] Photo gallery — `PropertyDetailContent.js` images carousel
- [x] Property description — shown in detail
- [x] Map location — `PropertyMapPreview.js`; coordinates
- [x] Contact seller button — “Contact” opens chat; `onOpenChat` / `createOrGetThread`
- [x] Save property button — `FavoritesButton`; `FavoritesContext`

---

## Messaging System
- [x] Chat between users — `ChatPage.js`; `ChatContext`; `server/routes/chat.js`; threads and messages
- [x] Chat history — messages loaded per thread; persisted on server
- [x] Message notifications — push tokens; `server/services/push.js`; unread count in nav

---

## Saved Properties
- [x] Save property — `FavoritesButton`; `FavoritesContext`; API
- [x] Remove saved property — unfavorite in UI and context
- [x] Saved properties page — `SavedPage.js`; `/saved`; list of favorited listings

---

## Listing Management
- [x] My listings dashboard — “My properties” from menu; filter `showMyPropertiesOnly` in App
- [x] Edit listings — navigate to `AddPropertyPage` with listing id
- [x] Mark listing as sold / rented — `AddPropertyForm` and API `sold`, `currentlyRented`
- [x] View inquiries — inquiry is via chat (no separate inquiries view needed)

---

## Notifications
- [x] Email confirmation — sent on register; confirm-email flow
- [x] New message notification — push notification for new chat messages
- [ ] Listing inquiry notification — no separate “inquiry” event; messages cover contact

---

## Admin Panel (Minimal)
- [x] View users — `server/routes/admin.js` GET `/users`; `AdminPage.js`
- [x] View listings — admin GET `/listings`; pending/approved; admin UI
- [x] Remove listings — admin DELETE `/listings/:id`; admin UI
- [x] Ban users — admin PATCH `/users/:id` with `accountStatus`: `suspended` / `banned`

---

## Location System
- [x] Country — Philippines (implied; regions/cities are PH)
- [x] Region / Province — `data/cities.js`; region and province in filters and add-property form
- [x] City — city selector; `cityId` on listings; city-based search
- [x] Map coordinates — listing `coordinates`; MapPicker; map view

---

# Optional MVP Enhancements
- [x] Recently viewed properties — `RecentlyViewedContext`; `RecentlyViewedCard` on results
- [x] Search history — `SavedSearchesContext`; saved searches in menu/settings
- [ ] Email alerts for new listings — no email alert subscription found
- [ ] Listing view counter — no view-count field or increment found (recently viewed is client-side only)

---

# To do (backlog)
- [x] Report / flag listing — `server/routes/listings.js` POST `/api/listings/:id/report`; `listing_reports` table; Report button + modal in `PropertyDetailContent.js` (logged-in non-owner)
- [x] Total move-in fees calculation — key-money, security deposit, advance pay, broker fee, association fee, utilities included/not, reservation fee; DB columns + `AddPropertyForm` fields; detail page shows breakdown and total in `PropertyDetailContent.js`
