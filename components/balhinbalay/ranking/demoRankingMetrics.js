// Fixed, synthetic engagement counts for the 12 public sample listings.
// These are never updated by browsing, saving, messaging or production telemetry.
// Counts describe a current demo bucket (ageDays 0), not real visitor activity.
export const DEMO_RANKING_METRICS = Object.freeze(Object.fromEntries([
  [1, 420, 75, 35, 14, 3, 10],
  [2, 330, 40, 21, 10, 2, 6],
  [3, 290, 41, 18, 6, 1, 3],
  [4, 360, 94, 51, 23, 5, 17],
  [5, 240, 38, 21, 8, 2, 5],
  [6, 80, 12, 6, 2, 0, 1],
  [7, 210, 32, 16, 6, 1, 3],
  [8, 410, 56, 28, 11, 2, 8],
  [9, 0, 0, 0, 0, 0, 0],
  [10, 90, 14, 7, 3, 0, 2],
  [11, 180, 29, 14, 5, 1, 4],
  [12, 310, 30, 11, 3, 0, 2],
].map(([id, impressions, detailOpens, engagedViews, favourites, savedSearches, contacts]) =>
  [id, Object.freeze({impressions, detailOpens, engagedViews, favourites, savedSearches, contacts})]
)));
