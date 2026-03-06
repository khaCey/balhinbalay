# Future Features Roadmap

This document outlines **planned** features and enhancements for the BalhinBalay real estate platform. Items here are **not yet implemented** or are **enhancements** to existing features. What is already in the app is documented in [FEATURES.md](FEATURES.md).

**Current app (summary):** Login/signup, add property, My properties toggle. **Profile:** per-field edit (pencil for Name, pencil for Email; each row read-only until pencil; single email field when editing); Change password section always visible (no pencil). Favorites (localStorage), Saved button in header, Favorites modal. In-app Chat (per listing, login-gated), Messages floating pill and inbox (thread list). Filters (region, city, search, price, etc.), grid/list/map views, Philippines-wide regions. Header: Saved, Add, My properties, Profile, Log out, Filters; uniform button font size and icon spacing; For Sale/For Rent tabs without bar, content-sized.

---

## High Priority Features

### 1. Province-Level Filtering
**Status:** Planned · **Not implemented**  
**Description:** Expand location filtering to include province selection before city selection.  
**Implementation Notes:**
- Add province data structure
- Update filtering logic to support Province → City → Barangay hierarchy
- Update UI to show province dropdown first, then city dropdown based on selection

### 2. Profile Enhancements
**Status:** Planned · **Not implemented**  
**Description:** Build on the existing Account/Profile modal (per-field edit for name and email, change password always visible).  
**Planned:**
- Avatar upload and display
- Dedicated profile/settings page (optional)
- Email change with verification (if moving off localStorage)

### 3. Saved Searches & Alerts
**Status:** Planned · **Not implemented**  
**Description:** Allow users to save search criteria and receive notifications when new matching properties are added.  
**Implementation:**
- Save current filter state as a named search
- Email/push notifications when new properties match saved criteria
- Manage saved searches from user dashboard

### 4. Favorite Properties (account sync / cross-device)
**Status:** Planned · **Not implemented**  
**Description:** Favorites are currently stored per device (localStorage) only.  
**Planned:**
- Tie favorites to user account
- Sync favorites across devices when logged in
- Persist favorites in account (not only in browser)

### 5. Property Comparison & Viewing History
**Status:** Planned · **Not implemented**  
**Description:** Account-related discovery features.  
**Features:**
- Property comparison (select 2–4 listings, side-by-side comparison)
- Recently viewed properties (per device or per account when synced)

### 6. Chat & Messages (database-backed + real notifications)
**Status:** Planned · **Not implemented**  
**Description:** Move chat off localStorage and add real two-way messaging and notifications once a backend/database exists.  
**Current:** In-app chat: "Chat with Owner/Agent" (login-gated), per-listing threads, floating Messages pill opening Messages modal (thread list), message bubbles and send input. All stored in browser (`ChatContext` + localStorage). No server sync or push.
**Planned (after DB/backend):**
- Persist messages in the database (per listing, per user/owner)
- Real two-way messaging (owner/agent and buyer see each other’s messages)
- Unread tracking: mark threads as read when opened; badge and pill show **unread message count** (not just conversation count)
- Optional: push or email notifications when the user receives a new message
- Sync chat state across devices when logged in

## Medium Priority Features

### 7. Property Comparison Tool (detailed)
**Status:** Planned · **Not implemented**  
**Description:** Dedicated comparison flow (see also §5).  
**Features:**
- Select up to 3–4 properties to compare
- Side-by-side comparison view (price, size, location, features, etc.)
- Export comparison as PDF

### 8. Virtual Tours
**Status:** Planned · **Not implemented**  
**Description:** Add 360° virtual tour support for properties.  
**Implementation:**
- Support for 360° image viewers
- Video tour uploads
- Interactive floor plans
- Integration with VR headsets (optional)

### 9. Advanced Analytics & Insights
**Status:** Planned · **Not implemented**  
**Description:** Provide market insights and analytics.  
**Features:**
- Average prices by city/area
- Price trends over time
- Market reports
- Property value estimates
- Neighborhood statistics

### 10. Advanced Search Features
**Status:** Planned · **Not implemented**  
**Description:** Enhanced search capabilities.  
**Features:**
- Search by amenities (parking, pool, gym, etc.)
- Search by nearby landmarks (schools, hospitals, malls)
- Radius search on map
- Draw custom area on map to search
- Search by commute time to specific locations

### 11. Property Listing Management (enhancements)
**Status:** Planned · **Not implemented**  
**Description:** Enhance the existing Add Property flow.  
**Current:** Add property form (title, listing type, property type, price, city, location, beds, baths, size, description, image URL, contact). My properties toggle shows only the user’s listings.  
**Planned:**
- Image upload and management (multiple images per listing)
- Edit and delete own listings
- View inquiry statistics (views, messages per listing)
- Manage contact information per listing

### 12. Reviews & Ratings
**Status:** Planned · **Not implemented**  
**Description:** Allow users to rate and review properties and agents.  
**Features:**
- Property ratings (1–5 stars)
- Agent ratings and reviews
- Verified reviews (only from users who viewed property)
- Review moderation system

## Low Priority / Nice-to-Have Features

### 13. Mobile App
**Status:** Future Consideration · **Not implemented**  
**Description:** Native mobile applications for iOS and Android.  
**Technology Options:**
- React Native
- Flutter
- Native development

### 14. Multi-language Support
**Status:** Future Consideration · **Not implemented**  
**Description:** Support for multiple languages (English, Tagalog, Cebuano, etc.).  
**Implementation:**
- i18n library integration
- Language switcher
- Translated content

### 15. Social Sharing Enhancements
**Status:** Future Consideration · **Not implemented**  
**Description:** Replace the current share button (native Web Share API or copy-URL fallback) with a **proprietary share experience** — our own custom share UI and flow rather than relying on the browser. Expand further with social and rich sharing.  
**Planned:**
- **Proprietary share button:** Custom share UI (e.g. modal or dropdown) with copy link, share to app, etc., instead of native share/copy only
- One-click sharing to Facebook, Twitter, Instagram
- Generate shareable property cards/images
- Social media login options

### 16. Property Financing Calculator
**Status:** Future Consideration · **Not implemented**  
**Description:** Mortgage and financing calculator tools.  
**Features:**
- Loan calculator
- Down payment calculator
- Monthly payment estimates
- Affordability calculator

### 17. Agent Directory
**Status:** Future Consideration · **Not implemented**  
**Description:** Directory of real estate agents with profiles.  
**Features:**
- Agent profiles
- Specializations
- Contact information
- Agent ratings and reviews
- Portfolio of listed properties

## Technical Debt & Improvements

### Performance Optimization
- Implement lazy loading for images
- Virtual scrolling for large property lists
- Image optimization and CDN integration
- Caching strategies

### SEO Improvements
- Server-side rendering (SSR) or static site generation (SSG)
- Meta tags optimization
- Structured data (Schema.org)
- Sitemap generation

### Accessibility (beyond current)
**Current:** ARIA labels on buttons/controls, modal focus and backdrops, theme/meta.  
**Planned:**
- Keyboard navigation improvements (e.g. full tab order, escape to close)
- Screen reader optimization
- Color contrast improvements

### Testing
- Unit tests for components
- Integration tests
- E2E tests with Cypress or Playwright
- Performance testing

## Notes

- Features are prioritized based on user needs and business value.
- Implementation order may change based on user feedback.
- Each feature should be designed with a mobile-first approach.
- All features should maintain the modern, bold design aesthetic.
- Consider API rate limits and costs when implementing third-party integrations.
- For current behavior (auth, filters, chat, map, layout), see [FEATURES.md](FEATURES.md).
