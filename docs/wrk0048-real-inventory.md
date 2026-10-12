# WRK0048 real public inventory

The main public Home, Search, Results and Map flow reads `GET /api/marketplace/public/listings`. It does not use the twelve illustrative records as inventory or as an empty/error fallback. The direct `/listing/<uuid>` page continues to read the same public projection by ID.

The collection starts with the same current account, Lister, property and authority eligibility predicate as direct detail. Each candidate passes `approvedPublication`, then `publicProjection`; failures are omitted. Filters and ordering run only on those approved public projections, so mutable drafts and private fields cannot influence or enter the response. There is no collection cache: unlisting or losing eligibility removes a listing on the next request. The API returns `listings`, `page`, `limit`, `total` and `has_more`. Default order is newest publication timestamp then UUID; price and floor-area orders also use UUID to break ties. Limit is 1–50.

Supported query parameters: `transaction_type` (`RENT`/`SALE`), exact case-insensitive `city`, `property_type`, `min_price`, `max_price`, `min_bedrooms`, `min_bathrooms`, `min_floor_area`, `keyword` (public title, description, city and barangay), `sort`, `page`, `limit`. Unsupported parameters are rejected. The frontend retrieves every page for Results/Map so a coordinate-less listing remains in list results. Map pins come only from `location.map_point` in the public projection. No coordinate is generated or derived from city or barangay.

The Home/Results cards link to `/listing/<uuid>`. The current marketplace has no public media subsystem, so cards show a neutral BalhinBalay panel. School-distance, sample tags, quality/popularity scores, sample photos and illustrative fallback are absent from the main flow. Sample fixtures remain only in older isolated demo utilities and tests.

This is source implementation only. It does not migrate the database, deploy, change production state, or perform WRK0043.
