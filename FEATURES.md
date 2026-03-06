# BalhinBalay — App Features

A single-page property listing app for the Philippines. Browse **For Sale** and **For Rent** listings, filter by region and city, view on map or list, save favorites, and message owners.

---

## Listing types and browsing

- **For Sale / For Rent** — Tabs at the top switch between sale and rent listings.
- **Sample + user listings** — Listings come from sample data and from logged-in users who add properties.
- **Infinite scroll** — Grid and list views load more properties as you scroll (6 per page on mobile, 9 on desktop).
- **Empty state** — When no results match filters, a message suggests adjusting filters.

---

## Filters

- **Search** — Text search over title, location, city, and description. Clear button when there is text.
- **Region** — Dropdown: “All Regions” or official Philippine regions (NCR, CAR, Region I–XIII, BARMM). Only regions that have at least one listing for the current type (sale/rent) are shown.
- **Province** — When a region is selected, a Province dropdown appears (if that region has multiple provinces with listings): All Provinces or a specific province. Only provinces with at least one listing are shown. Resets when region changes.
- **City** — "All Cities" or cities in the selected region (and province, if selected). Resets when region or province changes.
- **Listing type** — For Sale / For Rent (same as tabs).
- **Property type** — All Types, House, Apartment, Condo, Land, Boarding House, Room.
- **Price range** — Preset ranges for sale (e.g. Under ₱1M, ₱1M–₱3M) and rent (e.g. Under ₱10k, ₱10k–₱15k).
- **Advanced (collapsible)** — Min bedrooms (0–5+), min bathrooms (0–4+), size range (min/max sqm).
- **Apply** — “Search Properties” applies filters; on mobile it also closes the filter sheet.

---

## View modes and sorting

- **Grid view** — Property cards in a grid (desktop default; hidden on mobile).
- **List view** — Horizontal list cards; default on mobile.
- **Map view** — Leaflet map with markers for filtered listings; popup and “View Details” open the property modal.
- **Sort options** — Newest first, Price low→high, Price high→low, Size largest first, Size smallest first.
- **Result count** — “X properties found” (or “1 property found”) in the sort bar.
- **Saved searches** — Header "Searches" opens a modal: save current filters with a name, list saved searches, Apply (restore filters) or Delete. Stored per device in localStorage. No email/push notifications yet.

---

## Property display

- **Property cards (grid)** — Image, “New” badge (≤7 days), type/city badges, title, price, location, beds/baths/size, View Details, Favorites.
- **Property cards (list)** — Horizontal layout; card click opens details; same actions.
- **Property details modal** — Full details: image carousel, price, location, features, description, contact (agent, phone, email), “Chat with Owner/Agent”, map preview, “View on Map” (OpenStreetMap link).
- **Recently viewed** — Opening a property (grid, list, map, or Saved) records it in “Recently viewed.” A horizontal strip of up to 10 recent listings appears above the main results (grid/list only); stored per device in localStorage.
- **Share** — Uses Web Share API when available; otherwise copies page URL to clipboard.

---

## Authentication

- **Log in** — Email and password; opens from header “Log in”.
- **Sign up** — Name, email, password; tab in the same modal.
- **Profile / Account** — “Account” modal opened via “Profile” in header (desktop and mobile menu).  
  - **Profile section:** Name and Email each shown as read-only with a **pencil**; tap pencil to edit that field only (inline input + Save/Cancel). Single email field when editing (no confirm-email).  
  - **Change password:** Always visible (current password, new password, confirm new password, “Change password” button). No divider between Profile and Change password.  
  - Changes persist in localStorage.
- **Persistence** — User and registered users stored in localStorage; session survives refresh.
- **Header when logged out** — Saved, Log in, Filters.
- **Header when logged in** — Saved, Add, My properties, Profile, Log out, Filters; floating **Messages** pill when no modal is open (opens Messages inbox).

---

## User listings (add property)

- **Add property** — Form: title, listing type (sale/rent), property type, price, city, location, beds, baths, size (sqm), description, image URL, contact name/phone/email.
- **My properties** — When logged in, header toggle shows only the current user’s listings.
- **Visibility** — New listings appear in the main list and can be filtered with “My properties”.

---

## Favorites

- **Save favorites** — Heart icon on cards and in the property details modal; toggles add/remove.
- **Saved (header)** — “Saved” button in the header (mobile and desktop) opens a modal that lists all saved properties; tap/click a listing to open its details.
- **Persistence** — Favorites stored in localStorage and persist across sessions.

---

## Chat and messages

- **Chat with owner/agent** — In property details, “Chat with Owner/Agent”. If not logged in, opens login modal; if logged in, opens chat for that listing.
- **Per-listing chat** — Message list (bubbles, sender, time), input and send. Stored in localStorage.
- **Messages (header)** — Lists all threads (listings with at least one message), sorted by latest message; click opens chat for that listing.

---

## Map

- **Main map view** — Leaflet + OpenStreetMap; center from selected city or default (e.g. Cebu); markers for each filtered listing; popup with title, price, location, “View Details”.
- **Property modal map** — Small map preview for the property; “View on Map” links to OpenStreetMap.

---

## Layout and responsiveness

- **Mobile-first** — Design and CSS for mobile first; desktop is progressive enhancement (e.g. 768px breakpoint).
- **Filter sheet (mobile)** — Slide-up sheet with handle; contains all filters; backdrop closes it.
- **Filter sidebar (desktop)** — Same filters in a side panel; can be collapsed for full-width results.
- **Floating filters button** — When filters are closed, a button opens the filter sheet/sidebar.
- **Overflow** — Filter sheet and dropdowns stay contained (no horizontal overflow); vertical scroll where needed.
- **Header** — Centered logo “BalhinBalay”; white background; actions on the right (Saved, auth, Filters). For Sale / For Rent tabs below with no bar under them; tab buttons are content-sized and centered.
- **Desktop** — Listing tabs and results align with content area (margin when filter sidebar open); when sidebar is closed, tabs and content go full width. Header buttons use uniform font size and icon spacing.

---

## Data and regions

- **Philippines-wide** — Regions are the official 17 Philippine administrative regions (NCR, CAR, Region I–XIII, BARMM).
- **Cities** — Cities scoped by region; only regions (and when applicable cities) with at least one listing for the current type are shown in filters.
- **Price formatting** — Rent shown as “₱X/month”, sale as “₱X”.

---

## Accessibility and UX

- **Labels** — Buttons and controls use `aria-label` where useful (e.g. “Open filters”, “Grid view”, “Close”).
- **Modal focus** — Modals are focusable; backdrops marked `aria-hidden`.
- **Theme** — `theme-color` and meta description in the app; title “BalhinBalay - Find Your Dream Home in Cebu”.
