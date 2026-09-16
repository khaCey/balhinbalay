import { priceRanges, priceSliderConfig } from '../data/listings';
import { getCitiesByRegion } from '../data/cities';

/** Match the existing results API contract when switching to the map. */
export function searchRequest(state, listingType) {
  const cityIds = [
    ...new Set(
      (state.selectedCityIds || []).filter(
        (id) => id && id !== 'cebu-province',
      ),
    ),
  ];
  const range = priceRanges[listingType]?.[state.priceRangeIndex || 0];
  const regionCities =
    state.selectedRegion && state.selectedRegion !== 'all'
      ? getCitiesByRegion(state.selectedRegion)
          .map((city) => city.id)
          .filter((id) => id !== 'cebu-province')
      : [];
  const location =
    cityIds.length === 1
      ? { cityId: cityIds[0] }
      : cityIds.length > 1
        ? { cityIds }
        : state.selectedCity && state.selectedCity !== 'cebu-province'
          ? { cityId: state.selectedCity }
          : regionCities.length
            ? { cityIds: regionCities }
            : {};
  return {
    listingType,
    ...location,
    priceMin: state.priceMin ?? range?.min ?? 0,
    priceMax:
      state.priceMax ??
      (range?.max === Infinity
        ? priceSliderConfig[listingType]?.max
        : range?.max),
    type: state.propertyType || undefined,
    furnished: state.furnishedFilter || undefined,
    minBeds: state.minBeds || undefined,
    minBaths: state.minBaths || undefined,
    sizeMin: state.sizeRange?.min || undefined,
    sizeMax:
      state.sizeRange?.max === Infinity
        ? undefined
        : state.sizeRange?.max || undefined,
    q: state.searchQuery?.trim() || undefined,
    sort:
      {
        'price-low': 'price-asc',
        'price-high': 'price-desc',
        'size-large': 'size-desc',
        'size-small': 'size-asc',
      }[state.sortBy] || 'newest',
  };
}
