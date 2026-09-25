export const RANKING_CONFIG = Object.freeze({
  algorithmVersion: 'rank-v1-city-demo',

  // Accepted City rank-v1 decisions.
  freshnessHalfLifeDays: 30,
  cityWeights: Object.freeze({
    popularity: 0.70,
    freshness: 0.15,
    quality: 0.15,
  }),

  // PROPOSED / DEMO ONLY (IDE0085): not accepted production rules.
  popularitySmoothingImpressions: 50,
  popularityEngagementHalfLifeDays: 14,
  sparseMarketMinEffectiveImpressions: 200,
  popularityEventWeights: Object.freeze({
    detailOpen: 1,
    engagedView: 2,
    favourite: 5,
    savedSearch: 6,
    contact: 10,
  }),

  qualityDescriptionCharacterCap: 200, // Simulator tuning, not an accepted threshold.

  // PROPOSED (IDE0086). Disabled; no diversity pass is integrated.
  diversity: Object.freeze({enabled: false}),
});
