# Plan to finish — where we left off

Checked the codebase after the crash. Everything through **Phase 7** of the To-Do List Implementation Plan is already done. This file lists **only what remains**, in order.

---

## Already done (do not redo)

| Phase | Item | Verified in codebase |
|-------|------|----------------------|
| 1 | Unlist + confirmation step | listings DELETE → unlist; AddPropertyForm "Back to listings" button |
| 2 | Header in modal + Newest first dropdown | app-header-modal-open; SortBar `<select>` |
| 3 | Map coordinates | AddPropertyForm coord order + MapPicker center fallback |
| 4 | Saved in sidebar | ProfileDrawer "Saved properties", onOpenSavedProperties |
| 5 | Settings + push in settings + push toggle | SettingsPage, push_enabled in DB/API, Settings toggle, push.js skips when disabled |
| 6 | Pull down to refresh | PullToRefresh.js, App.js wraps main content with onRefresh={refreshListings} |
| 7 | Payments, furnished, sold/rented | add-listing-payments-furnished-sold.sql, listings routes + lib, AddPropertyForm, PropertyModal |
| — | Remove maximise on chat | ChatModal.js has only Close button (no expand) |

---

## Remaining (in order)

### 1. Profile picture (Plan item 7)

- **Backend:** Migration to add `avatar_url` (or similar) to `users`. PATCH `/api/users/me` (or dedicated avatar endpoint) to set/clear URL. If storing files, reuse listing image upload and save URL in user row.
- **Frontend:** [ProfileDrawer.js](src/components/ProfileDrawer.js) show user avatar when present, else placeholder. Profile page and/or Settings: upload/change/remove photo.

**Files:** New migration, [server/routes/users.js](server/routes/users.js), [server/lib/listings.js](server/lib/listings.js) or user mapping, [ProfileDrawer.js](src/components/ProfileDrawer.js), profile/settings UI.

---

### 2. Search history (saved filters) (Plan item 11)

- **Search history (saved filters):** Enlarge and/or move saved filter list: e.g. full-width in filter sheet, or "Saved searches" entry in profile/sidebar. [FilterSidebar.js](src/components/FilterSidebar.js), [SavedSearchesContext.js](src/context/SavedSearchesContext.js).

**Files:** [FilterSidebar.js](src/components/FilterSidebar.js), [App.js](src/App.js).

*(Rental search options — rental_term, school/university — moved to [FUTURE_PLANS.md](../../FUTURE_PLANS.md).)*

---

### 3. Chat, navigation, mobile UX (Plan items 15, 16, 18)

- **Chat:** Improve ordering, loading states, empty states, errors. [ChatContext.js](src/context/ChatContext.js), [ChatModal.js](src/components/ChatModal.js), [MessagesModal.js](src/components/MessagesModal.js).
- **Navigation:** Clearer back behavior, routes, or breadcrumbs.
- **Mobile:** Touch targets, spacing, readability. Scope per iteration.

No single checklist; implement incrementally.

---

### 4. Notifications when message is opened (Plan item 21 — non-priority)

When user opens a thread, clear or dismiss the related in-app or badge notification. [MessagesModal.js](src/components/MessagesModal.js), [ChatContext.js](src/context/ChatContext.js), or push handling.

---

### 5. Full scan / verification (after all above)

- Run app (`npm start`) and confirm API and frontend start.
- Test: auth (login/logout, token persistence), listings (feed, filters, sort, view modes), profile (drawer, My Properties, Saved, Settings), add/edit property (including map, images, new fields).
- Test: chat (threads, send/receive, SSE), messages list, open thread from push if applicable.
- Test: push toggle in Settings, pull-to-refresh, unlist, saved searches.
- Check for console errors, failed requests, and fix any regressions.

---

## Execution order

1. **Profile picture** — migration, API, ProfileDrawer + upload UI.
2. **Search history** — enlarge/move saved filters.
3. **Chat / navigation / mobile** — iterative improvements.
4. **Notifications when opened** — non-priority last.
5. **Full scan / verification** — after all items above are done: run app and API, test auth, listings, filters, profile, chat, push, and key flows; fix any regressions or broken behavior.

---

## Quick reference

- **Profile picture:** New migration `add-user-avatar.sql`, users route PATCH, [ProfileDrawer.js](src/components/ProfileDrawer.js), profile/settings upload.
- **Search history:** [FilterSidebar.js](src/components/FilterSidebar.js), [SavedSearchesContext.js](src/context/SavedSearchesContext.js).
- **Chat/nav/mobile:** [ChatContext.js](src/context/ChatContext.js), [ChatModal.js](src/components/ChatModal.js), [MessagesModal.js](src/components/MessagesModal.js), [App.js](src/App.js).
