// Adapted from the supplied 2026-09-20 simulator; pure scoring only.
// Eligibility and manual sorts are owned by searchListings.js.
import {RANKING_CONFIG as DEFAULT_CONFIG} from './rankingConfig.js';

const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const present = (v) => v !== null && v !== undefined && v !== '';

export function decayFactor(ageDays, halfLifeDays) {
  const age = Math.max(0, Number(ageDays) || 0);
  const halfLife = Math.max(1, Number(halfLifeDays) || 1);
  return Math.pow(2, -age / halfLife);
}

export function scoreFreshness(ageDays, halfLifeDays = DEFAULT_CONFIG.freshnessHalfLifeDays) {
  return clamp01(decayFactor(ageDays, halfLifeDays));
}

export function scoreQuality(listing, config = DEFAULT_CONFIG) {
  let points = 0;
  let possible = 0;

  // 30 points: objective core facts.
  for (const key of ['title', 'price', 'city', 'location', 'type', 'listingType']) {
    possible += 5;
    if (present(listing[key]) && listing[key] !== 0) points += 5;
  }

  // 20 points: photos. Five usable photos reaches full credit.
  possible += 20;
  points += Math.min(Math.max(Number(listing.photoCount) || 0, 0) / 5, 1) * 20;

  // 15 points: useful description. 200 chars is a simulator tuning value, not a locked product rule.
  possible += 15;
  const descriptionLength = String(listing.description || '').trim().length;
  points += Math.min(descriptionLength / config.qualityDescriptionCharacterCap, 1) * 15;

  // 20 points: property-type-aware facts.
  const type = String(listing.type || '').toLowerCase();
  if (type === 'land') {
    possible += 20;
    if ((Number(listing.sizeSqm) || 0) > 0) points += 20;
  } else if (type === 'room' || type === 'bedspace' || type === 'room/bedspace') {
    const checks = [
      (Number(listing.sizeSqm) || 0) > 0,
      present(listing.furnishing),
      present(listing.bathroomAccess),
      (Number(listing.maxOccupants) || 0) > 0,
    ];
    possible += 20;
    points += checks.filter(Boolean).length * 5;
  } else {
    const checks = [
      present(listing.beds) && Number.isFinite(Number(listing.beds)) && Number(listing.beds) >= 0,
      present(listing.baths) && Number.isFinite(Number(listing.baths)) && Number(listing.baths) >= 0,
      (Number(listing.sizeSqm) || 0) > 0,
      present(listing.furnishing),
    ];
    possible += 20;
    points += checks.filter(Boolean).length * 5;
  }

  // 15 points: transaction-specific terms.
  possible += 15;
  if (String(listing.listingType).toLowerCase() === 'rent') {
    if (present(listing.availabilityStatus)) points += 5;
    if (present(listing.depositInfo)) points += 5;
    if ((Number(listing.leaseMonths) || 0) > 0) points += 5;
  } else {
    if (present(listing.availabilityStatus)) points += 5;
    if (listing.saleTermsComplete === true) points += 10;
  }

  return clamp01(possible ? points / possible : 0);
}

function metricBuckets(listing) {
  if (Array.isArray(listing.metricBuckets) && listing.metricBuckets.length) return listing.metricBuckets;
  return [{
    ageDays: 0,
    impressions: listing.impressions,
    detailOpens: listing.detailOpens,
    engagedViews: listing.engagedViews,
    favourites: listing.favourites,
    savedSearches: listing.savedSearches,
    contacts: listing.contacts,
  }];
}

export function weightedEngagement(metric, config = DEFAULT_CONFIG) {
  const w = config.popularityEventWeights;
  return (
    (Number(metric.detailOpens) || 0) * w.detailOpen +
    (Number(metric.engagedViews) || 0) * w.engagedView +
    (Number(metric.favourites) || 0) * w.favourite +
    (Number(metric.savedSearches) || 0) * w.savedSearch +
    (Number(metric.contacts) || 0) * w.contact
  );
}

export function decayedPopularityStats(listing, config = DEFAULT_CONFIG) {
  let effectiveImpressions = 0;
  let effectiveEngagement = 0;
  for (const bucket of metricBuckets(listing)) {
    const decay = decayFactor(bucket.ageDays, config.popularityEngagementHalfLifeDays);
    effectiveImpressions += Math.max(0, Number(bucket.impressions) || 0) * decay;
    effectiveEngagement += Math.max(0, weightedEngagement(bucket, config)) * decay;
  }
  return {effectiveImpressions, effectiveEngagement};
}

function isMarketEligible(listing, transactionType) {
  if (transactionType && String(listing.listingType).toLowerCase() !== String(transactionType).toLowerCase()) return false;
  if (listing.active === false) return false;
  const availability = String(listing.availabilityStatus || '').toLowerCase();
  if (availability === 'unavailable' || availability === 'rented' || availability === 'sold') return false;
  return true;
}

export function computeMarketAverage(listings, search, config = DEFAULT_CONFIG) {
  const transaction = String(search.listingType || '').toLowerCase();
  const cities = Array.isArray(search.cities) ? search.cities : [search.city].filter(Boolean);

  const allTransactionListings = listings.filter((l) => isMarketEligible(l, transaction));
  const cityListings = allTransactionListings.filter((l) => !cities.length || cities.includes(l.city));

  const aggregate = (rows) => rows.reduce((acc, l) => {
    const stats = decayedPopularityStats(l, config);
    acc.impressions += stats.effectiveImpressions;
    acc.engagement += stats.effectiveEngagement;
    return acc;
  }, {impressions: 0, engagement: 0});

  const local = aggregate(cityListings);
  const global = aggregate(allTransactionListings);
  const useFallback = local.impressions < config.sparseMarketMinEffectiveImpressions && global.impressions > local.impressions;
  const selected = useFallback ? global : local;

  return {
    rate: selected.impressions > 0 ? selected.engagement / selected.impressions : 0,
    effectiveImpressions: selected.impressions,
    source: useFallback ? 'broader-market-fallback' : 'city',
    cityEffectiveImpressions: local.impressions,
  };
}

export function adjustedPopularityRate(listing, marketRate, config = DEFAULT_CONFIG) {
  const {effectiveImpressions, effectiveEngagement} = decayedPopularityStats(listing, config);
  const prior = Math.max(1, Number(config.popularitySmoothingImpressions) || 50);
  const safeMarketRate = Math.max(0, Number(marketRate) || 0);
  const adjustedRate = (effectiveEngagement + prior * safeMarketRate) / (effectiveImpressions + prior);
  return {adjustedRate, effectiveImpressions, effectiveEngagement};
}

export function scorePopularity(listing, marketRate, config = DEFAULT_CONFIG) {
  const stats = adjustedPopularityRate(listing, marketRate, config);
  const safeMarketRate = Math.max(0, Number(marketRate) || 0);

  // Neutral cold-start score when the market itself has no engagement history.
  if (safeMarketRate === 0) {
    return {...stats, score: stats.adjustedRate > 0 ? 1 : 0.5};
  }

  // Ratio-to-market transform. A listing exactly at the market rate scores 0.5.
  // Strong listings approach 1; weak listings approach 0. This preserves Bayesian shrinkage.
  const ratio = Math.max(0, stats.adjustedRate / safeMarketRate);
  return {...stats, score: clamp01(ratio / (1 + ratio))};
}

export function rankCityListings(listings, search, config = DEFAULT_CONFIG) {
  // The canonical search pipeline has already applied every hard filter.
  const candidates = listings;
  if (!candidates.length) return [];

  const market = computeMarketAverage(listings, search, config);
  const weights = config.cityWeights;

  const ranked = candidates.map((listing) => {
    const popularityStats = scorePopularity(listing, market.rate, config);
    const popularity = popularityStats.score;
    const freshness = scoreFreshness(listing.ageDays, config.freshnessHalfLifeDays);
    const quality = scoreQuality(listing, config);
    const totalScore = weights.popularity * popularity + weights.freshness * freshness + weights.quality * quality;

    return {
      ...listing,
      scores: {
        popularity,
        freshness,
        quality,
        totalScore,
        adjustedPopularityRate: popularityStats.adjustedRate,
        effectiveImpressions: popularityStats.effectiveImpressions,
        effectiveEngagement: popularityStats.effectiveEngagement,
        marketRate: market.rate,
        marketSource: market.source,
      },
      isExploration: false,
      diversityMoved: false,
    };
  });

  ranked.sort((a, b) => b.scores.totalScore - a.scores.totalScore || (a.ageDays || 0) - (b.ageDays || 0) || String(a.id).localeCompare(String(b.id)));
  return ranked;
}
