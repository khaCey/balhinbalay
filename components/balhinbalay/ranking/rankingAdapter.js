import {photos} from '../data.js';
import {DEMO_RANKING_METRICS} from './demoRankingMetrics.js';

const text = value => String(value ?? '').trim().toLowerCase();
const unavailable = new Set(['unavailable', 'rented', 'sold', 'currently occupied']);

// Existing public sample listings have no status. Honour explicit lifecycle
// fields when supplied; never infer availability/quality facts from UI defaults.
export function isCityListingEligible(listing) {
  if (listing.active === false) return false;
  if (listing.status && text(listing.status) !== 'active') return false;
  if (listing.marketStatus && text(listing.marketStatus) !== 'active') return false;
  if (listing.reviewStatus && text(listing.reviewStatus) !== 'approved') return false;
  return ![listing.availabilityStatus, listing.availability].some(v => unavailable.has(text(v)));
}

export function deriveAgeDays(listing, now = Date.now()) {
  // updatedAt is deliberately excluded: an ordinary edit is not republication.
  for (const value of [listing.publishedAt, listing.createdAt]) {
    if (value === null || value === undefined || value === '') continue;
    const time = new Date(value).getTime();
    if (Number.isFinite(time)) return Math.max(0, (now - time) / 86400000);
  }
  // The current app already carries explicit, stable demo publication ages.
  for (const value of [listing.ageDays, listing.age]) {
    if (value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))) {
      return Math.max(0, Number(value));
    }
  }
  return Infinity; // Unknown publication age must not earn a freshness boost.
}

export function toRankingListing(listing, metrics = DEMO_RANKING_METRICS[listing.id] ?? {}) {
  // Only count images actually used by the existing sample gallery.
  const images = listing.images?.length ? listing.images :
    Number.isInteger(listing.photo) && photos[listing.photo] ? photos : [];
  return {
    ...listing,
    ...metrics,
    listingType: listing.mode === 'Buy' ? 'sale' : 'rent',
    location: listing.area,
    sizeSqm: listing.size,
    ageDays: deriveAgeDays(listing),
    photoCount: new Set(images.filter(Boolean)).size,
    // Studio is a residential unit. Existing "Boarding house" fixture represents
    // accommodation near campus; apply room facts without inventing occupancy.
    type: listing.type === 'Boarding house' ? 'room/bedspace' : listing.type,
    furnishing: listing.furnishing || (listing.tags?.includes('furnished') ? 'Furnished' : undefined),
    depositInfo: listing.deposit,
    availabilityStatus: listing.availabilityStatus ?? listing.availability,
    // description, leaseMonths, bathroomAccess, maxOccupants and saleTermsComplete
    // remain absent unless actually supplied. UI-generated filler gets no credit.
  };
}
