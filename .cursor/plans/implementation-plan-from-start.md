# BalhinBalay — Implementation plan (from start)

Plan created from a full codebase check. Use this as the single source of truth; work through the phases in order.

---

## Current state (already done — do not redo)

Verified in codebase:

| Item | Where |
|------|--------|
| **Unlist instead of delete** | Backend: `DELETE /api/listings/:id` does `UPDATE status = 'unlisted'`. GET excludes unlisted from main feed; owner sees own unlisted when `includeMine=1`. Frontend: `unlistListing()`, ConfirmModal "Unlist listing" / "Unlist". |
| **Property confirmation step** | [AddPropertyForm.js](src/components/AddPropertyForm.js): success state shows "Back to listings" button; no auto-navigate. |
| **Settings page** | Route `/settings`, [SettingsPage.js](src/pages/SettingsPage.js), link in [ProfileDrawer.js](src/components/ProfileDrawer.js) via `onSettings`. |
| **Saved properties in sidebar** | ProfileDrawer has "Saved properties" and `onOpenSavedProperties`; opens favorites. |
| **Header when property modal open** | [App.js](src/App.js): header gets `app-header-modal-open`; [App.css](src/App.css) hides header actions. |
| **Newest first as dropdown** | [SortBar.js](src/components/SortBar.js): `<select>` with "Newest first", etc. |
| **Remove maximise button on chat** | [ChatModal.js](src/components/ChatModal.js): only Close button in header; no expand/fullscreen. |

---

## What remains (in order)

### Phase 1 — Push notifications toggle

Settings page has placeholder text only. Implement full toggle:

1. **Preference**
   - Option A: DB — add `push_enabled` (or similar) to `users` or a prefs table; migration.
   - Option B: Capacitor Preferences key when native, localStorage when web.
2. **API**
   - GET and PATCH for push-enabled (e.g. `GET/PATCH /api/users/me` with `push_enabled`, or `GET/PATCH /api/users/me/push-token` with enabled flag).
3. **UI**
   - In [SettingsPage.js](src/pages/SettingsPage.js): when native, show a toggle "Allow push notifications"; read/write preference and call registration when on, unregister or stop sending when off.
4. **Server**
   - In [server/services/push.js](server/services/push.js) (or wherever push is sent): if user has `push_enabled = false`, skip sending. Check preference when sending.

**Files:** Migration (if DB), [server/routes/users.js](server/routes/users.js), [server/services/push.js](server/services/push.js), [SettingsPage.js](src/pages/SettingsPage.js), [App.js](src/App.js) (only register when preference is on).

---

### Phase 2 — Map coordinates

Ensure listing coordinates use the right priority and that MapPicker state is used on submit.

1. In [AddPropertyForm.js](src/components/AddPropertyForm.js) submit handler, set coordinates in this order:
   - Manual lat/lng from MapPicker (already in state).
   - Barangay lookup via [barangayCentroids.js](src/data/barangayCentroids.js) (location + city name).
   - Geocode (existing logic).
   - City coordinates from [cities.js](src/data/cities.js) (`getCityById`).
   - Last resort: hardcoded default.
2. Ensure when user picks on the map, that position is stored (e.g. in `manualLat`/`manualLng` or dedicated state) and sent; pass `markerPosition` back into MapPicker so the map does not reset to city center on reopen.

**Files:** [AddPropertyForm.js](src/components/AddPropertyForm.js), [MapPicker.js](src/components/MapPicker.js), [barangayCentroids.js](src/data/barangayCentroids.js), [cities.js](src/data/cities.js).

---

### Phase 3 — Pull down to refresh

Add pull-to-refresh on the main listings area.

1. Choose approach: custom touch handling, or a small library, or Capacitor plugin if native-only.
2. On pull (or equivalent gesture), call `refreshListings()` from [ListingsContext.js](src/context/ListingsContext.js).
3. Optional: show a short loading indicator at top while refreshing.

**Files:** [App.js](src/App.js) (main results area), possibly a small wrapper component or hook.

---

### Phase 4 — Listing fields: payments, furnished, sold/rented

1. **Migration**
   - Add columns to `listings`, e.g.: `key_money`, `security_deposit`, `extra_fees` (numeric or text), `furnished` (e.g. varchar or boolean), `sold` (boolean), `currently_rented` (boolean), `available_from` (date or text). One migration file.
2. **Backend**
   - [server/routes/listings.js](server/routes/listings.js): in POST and PATCH, read and validate these fields; in GET and mapping, return them. [server/lib/listings.js](server/lib/listings.js) if you have a shared mapping function.
3. **Frontend**
   - [AddPropertyForm.js](src/components/AddPropertyForm.js): add optional inputs for key money, security deposit, extra fees; dropdown or radio for furnished (e.g. Furnished / Unfurnished / Semi-furnished); for sale: sold checkbox; for rent: currently rented, next availability.
   - Listing cards and property detail modal: show these when present (e.g. "Security deposit: ₱X", "Furnished", "Available from …").

**Files:** New migration, [server/routes/listings.js](server/routes/listings.js), [server/lib/listings.js](server/lib/listings.js) if used, [AddPropertyForm.js](src/components/AddPropertyForm.js), listing card and detail components.

---

### Phase 5 — Profile picture

1. **Backend**
   - Migration: add `avatar_url` (or similar) to `users`.
   - Endpoint: PATCH `/api/users/me` (or dedicated avatar) to set/clear URL. If storing files, reuse listing image upload and save URL.
2. **Frontend**
   - [ProfileDrawer.js](src/components/ProfileDrawer.js): show user avatar when present, else placeholder.
   - Profile page and/or Settings: upload/change/remove photo.

**Files:** Migration, user routes, [ProfileDrawer.js](src/components/ProfileDrawer.js), profile/settings UI.

---

### Phase 6 — Search UI and history

1. **Search UI**
   - Clarify or add: search by city (already have city filter; can emphasize), by school/university (field or keyword), keywords (existing searchQuery), and for rent: long-term/short-term.
   - Backend: add `rental_term` (or similar) to listings if needed; optional school/university field or search in description/title; filter in GET.
   - [FilterSidebar.js](src/components/FilterSidebar.js) (or dedicated search page): add/relabel controls.
2. **Search history (saved filters)**
   - Enlarge and/or move saved filter list: e.g. full-width in filter sheet, or "Saved searches" entry in profile/sidebar. [FilterSidebar.js](src/components/FilterSidebar.js), [SavedSearchesContext.js](src/context/SavedSearchesContext.js).

**Files:** Migration if new listing fields, [server/routes/listings.js](server/routes/listings.js), [FilterSidebar.js](src/components/FilterSidebar.js), [App.js](src/App.js).

---

### Phase 7 — Chat, navigation, mobile UX (optional / iterative)

- **Chat:** Improve ordering, loading states, empty states, errors. [ChatContext.js](src/context/ChatContext.js), [ChatModal.js](src/components/ChatModal.js), [MessagesModal.js](src/components/MessagesModal.js).
- **Navigation:** Clearer back behavior, routes, or breadcrumbs.
- **Mobile:** Touch targets, spacing, readability.

Scope per iteration; no single checklist.

---

### Phase 8 — Notifications when message is opened (non-priority)

When user opens a thread, clear or dismiss the related in-app or badge notification so it doesn’t stay as “unread”. [MessagesModal.js](src/components/MessagesModal.js), [ChatContext.js](src/context/ChatContext.js), or push handling.

---

## Execution order summary

| Step | Phase | Notes |
|------|--------|--------|
| 1 | Push toggle | Preference + API + Settings UI + server skip |
| 2 | Map coordinates | Priority order + MapPicker state |
| 3 | Pull to refresh | Main list area |
| 4 | Listing fields | Migration + API + form + cards/detail |
| 5 | Profile picture | Migration + API + ProfileDrawer + upload UI |
| 6 | Search UI + history | Filters + saved searches placement |
| 7 | Chat / nav / mobile | Iterative |
| 8 | Notifications when opened | Non-priority |

---

## Quick reference — key files

- **Push:** [SettingsPage.js](src/pages/SettingsPage.js), [App.js](src/App.js), [server/routes/users.js](server/routes/users.js), [server/services/push.js](server/services/push.js)
- **Map:** [AddPropertyForm.js](src/components/AddPropertyForm.js), [MapPicker.js](src/components/MapPicker.js), [barangayCentroids.js](src/data/barangayCentroids.js)
- **Listings API/schema:** [server/routes/listings.js](server/routes/listings.js), [server/lib/listings.js](server/lib/listings.js), migrations
- **Profile:** [ProfileDrawer.js](src/components/ProfileDrawer.js), user routes, profile/settings pages
- **Search:** [FilterSidebar.js](src/components/FilterSidebar.js), [SavedSearchesContext.js](src/context/SavedSearchesContext.js), [App.js](src/App.js)
