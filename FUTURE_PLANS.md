# Future plans

Items moved here from the main plan for later implementation.

---

## Rental search options (deferred)

- **Backend:** Add `rental_term` to listings (migration + GET/POST/PATCH in `server/routes/listings.js`); optional school/university field or search in description/title; filter in GET.
- **Frontend:** `src/components/FilterSidebar.js`: add controls for long-term/short-term (rent), and optional school/university (field or keyword).
- **Files:** New migration, listings route and lib, FilterSidebar.
