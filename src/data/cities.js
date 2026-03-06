/**
 * Philippine administrative regions (official 17 regions + NCR).
 * Used for region filter; cities/areas are grouped by regionId.
 */
export const philippineRegions = [
  { id: 'all', displayName: 'All Regions' },
  { id: 'ncr', displayName: 'National Capital Region (NCR)' },
  { id: 'car', displayName: 'Cordillera Administrative Region (CAR)' },
  { id: 'region-i', displayName: 'Region I – Ilocos Region' },
  { id: 'region-ii', displayName: 'Region II – Cagayan Valley' },
  { id: 'region-iii', displayName: 'Region III – Central Luzon' },
  { id: 'region-iv-a', displayName: 'Region IV-A – Calabarzon' },
  { id: 'region-iv-b', displayName: 'Region IV-B – Mimaropa' },
  { id: 'region-v', displayName: 'Region V – Bicol Region' },
  { id: 'region-vi', displayName: 'Region VI – Western Visayas' },
  { id: 'region-vii', displayName: 'Region VII – Central Visayas' },
  { id: 'region-viii', displayName: 'Region VIII – Eastern Visayas' },
  { id: 'region-ix', displayName: 'Region IX – Zamboanga Peninsula' },
  { id: 'region-x', displayName: 'Region X – Northern Mindanao' },
  { id: 'region-xi', displayName: 'Region XI – Davao Region' },
  { id: 'region-xii', displayName: 'Region XII – Soccsksargen' },
  { id: 'region-xiii', displayName: 'Region XIII – Caraga' },
  { id: 'barmm', displayName: 'BARMM – Bangsamoro Autonomous Region in Muslim Mindanao' }
];

/** @deprecated Use philippineRegions. Kept for backward compatibility. */
export const cebuRegions = philippineRegions;

/**
 * All cities/areas (currently Cebu under Region VII; can be extended for other regions).
 * "All Cities" has id 'cebu-province' and regionId null for backward compatibility.
 */
export const cebuCities = [
  {
    id: 'cebu-province',
    name: 'All Cities',
    displayName: 'All Cities',
    coordinates: { lat: 10.3157, lng: 123.8854 },
    province: 'Cebu',
    regionId: null
  },
  {
    id: 'cebu-city',
    name: 'Cebu City',
    displayName: 'Cebu City',
    coordinates: { lat: 10.3157, lng: 123.8854 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'mandaue-city',
    name: 'Mandaue City',
    displayName: 'Mandaue City',
    coordinates: { lat: 10.3333, lng: 123.9333 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'lapu-lapu-city',
    name: 'Lapu-Lapu City',
    displayName: 'Lapu-Lapu City',
    coordinates: { lat: 10.3103, lng: 123.9494 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'talisay-city',
    name: 'Talisay City',
    displayName: 'Talisay City',
    coordinates: { lat: 10.2447, lng: 123.8425 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'danao-city',
    name: 'Danao City',
    displayName: 'Danao City',
    coordinates: { lat: 10.5200, lng: 123.9300 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'carcar-city',
    name: 'Carcar City',
    displayName: 'Carcar City',
    coordinates: { lat: 10.1167, lng: 123.6333 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'naga-city',
    name: 'Naga City',
    displayName: 'Naga City',
    coordinates: { lat: 10.2167, lng: 123.7500 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'bogo-city',
    name: 'Bogo City',
    displayName: 'Bogo City',
    coordinates: { lat: 11.0500, lng: 124.0000 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'toledo-city',
    name: 'Toledo City',
    displayName: 'Toledo City',
    coordinates: { lat: 10.3833, lng: 123.6500 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'minglanilla',
    name: 'Minglanilla',
    displayName: 'Minglanilla',
    coordinates: { lat: 10.2500, lng: 123.8000 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'consolacion',
    name: 'Consolacion',
    displayName: 'Consolacion',
    coordinates: { lat: 10.3667, lng: 123.9500 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'liloan',
    name: 'Liloan',
    displayName: 'Liloan',
    coordinates: { lat: 10.4000, lng: 123.9667 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'compostela',
    name: 'Compostela',
    displayName: 'Compostela',
    coordinates: { lat: 10.4500, lng: 123.9833 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'cordova',
    name: 'Cordova',
    displayName: 'Cordova',
    coordinates: { lat: 10.2500, lng: 123.9500 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'san-fernando',
    name: 'San Fernando',
    displayName: 'San Fernando',
    coordinates: { lat: 10.1667, lng: 123.7000 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'argao',
    name: 'Argao',
    displayName: 'Argao',
    coordinates: { lat: 9.8833, lng: 123.6000 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'moalboal',
    name: 'Moalboal',
    displayName: 'Moalboal',
    coordinates: { lat: 9.9500, lng: 123.4000 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'barili',
    name: 'Barili',
    displayName: 'Barili',
    coordinates: { lat: 10.1167, lng: 123.5167 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'oslob',
    name: 'Oslob',
    displayName: 'Oslob',
    coordinates: { lat: 9.5167, lng: 123.4333 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'bantayan',
    name: 'Bantayan',
    displayName: 'Bantayan',
    coordinates: { lat: 11.1667, lng: 123.7333 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'dumanjug',
    name: 'Dumanjug',
    displayName: 'Dumanjug',
    coordinates: { lat: 10.0500, lng: 123.4667 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'alegria',
    name: 'Alegria',
    displayName: 'Alegria',
    coordinates: { lat: 9.7333, lng: 123.3833 },
    province: 'Cebu',
    regionId: 'region-vii'
  },
  {
    id: 'iligan-city',
    name: 'Iligan City',
    displayName: 'Iligan City',
    coordinates: { lat: 8.2282, lng: 124.2452 },
    province: 'Lanao del Norte',
    regionId: 'region-x'
  },
  {
    id: 'cagayan-de-oro',
    name: 'Cagayan de Oro',
    displayName: 'Cagayan de Oro',
    coordinates: { lat: 8.4762, lng: 124.6439 },
    province: 'Misamis Oriental',
    regionId: 'region-x'
  },
  /* Region VIII – Eastern Visayas */
  { id: 'catbalogan', name: 'Catbalogan', displayName: 'Catbalogan', coordinates: { lat: 11.7753, lng: 124.8861 }, province: 'Samar', regionId: 'region-viii' },
  { id: 'calbayog', name: 'Calbayog', displayName: 'Calbayog', coordinates: { lat: 12.0667, lng: 124.6000 }, province: 'Samar', regionId: 'region-viii' },
  { id: 'borongan', name: 'Borongan', displayName: 'Borongan', coordinates: { lat: 11.6081, lng: 125.4319 }, province: 'Eastern Samar', regionId: 'region-viii' },
  { id: 'catarman', name: 'Catarman', displayName: 'Catarman', coordinates: { lat: 12.4989, lng: 124.6378 }, province: 'Northern Samar', regionId: 'region-viii' },
  { id: 'tacloban', name: 'Tacloban', displayName: 'Tacloban', coordinates: { lat: 11.2444, lng: 125.0098 }, province: 'Leyte', regionId: 'region-viii' },
  { id: 'ormoc', name: 'Ormoc', displayName: 'Ormoc', coordinates: { lat: 11.0064, lng: 124.6075 }, province: 'Leyte', regionId: 'region-viii' },
  { id: 'naval', name: 'Naval', displayName: 'Naval', coordinates: { lat: 11.5667, lng: 124.3833 }, province: 'Biliran', regionId: 'region-viii' },
  { id: 'maasin', name: 'Maasin', displayName: 'Maasin', coordinates: { lat: 10.1333, lng: 124.8500 }, province: 'Southern Leyte', regionId: 'region-viii' },
  /* NCR */
  { id: 'manila', name: 'Manila', displayName: 'Manila', coordinates: { lat: 14.5995, lng: 120.9842 }, province: 'Metro Manila', regionId: 'ncr' },
  { id: 'quezon-city', name: 'Quezon City', displayName: 'Quezon City', coordinates: { lat: 14.6500, lng: 121.0500 }, province: 'Metro Manila', regionId: 'ncr' },
  { id: 'makati', name: 'Makati', displayName: 'Makati', coordinates: { lat: 14.5547, lng: 121.0244 }, province: 'Metro Manila', regionId: 'ncr' },
  { id: 'taguig', name: 'Taguig', displayName: 'Taguig', coordinates: { lat: 14.5176, lng: 121.0509 }, province: 'Metro Manila', regionId: 'ncr' },
  /* CAR */
  { id: 'baguio', name: 'Baguio', displayName: 'Baguio', coordinates: { lat: 16.4023, lng: 120.5960 }, province: 'Benguet', regionId: 'car' },
  { id: 'bangued', name: 'Bangued', displayName: 'Bangued', coordinates: { lat: 17.5961, lng: 120.6183 }, province: 'Abra', regionId: 'car' },
  /* Region I */
  { id: 'laoag', name: 'Laoag', displayName: 'Laoag', coordinates: { lat: 18.1978, lng: 120.5957 }, province: 'Ilocos Norte', regionId: 'region-i' },
  { id: 'vigan', name: 'Vigan', displayName: 'Vigan', coordinates: { lat: 17.5747, lng: 120.3869 }, province: 'Ilocos Sur', regionId: 'region-i' },
  { id: 'san-fernando-la-union', name: 'San Fernando', displayName: 'San Fernando (La Union)', coordinates: { lat: 16.6169, lng: 120.3164 }, province: 'La Union', regionId: 'region-i' },
  { id: 'dagupan', name: 'Dagupan', displayName: 'Dagupan', coordinates: { lat: 16.0439, lng: 120.3328 }, province: 'Pangasinan', regionId: 'region-i' },
  /* Region II */
  { id: 'tuguegarao', name: 'Tuguegarao', displayName: 'Tuguegarao', coordinates: { lat: 17.6131, lng: 121.7269 }, province: 'Cagayan', regionId: 'region-ii' },
  { id: 'ilagan', name: 'Ilagan', displayName: 'Ilagan', coordinates: { lat: 17.1333, lng: 121.8833 }, province: 'Isabela', regionId: 'region-ii' },
  /* Region III */
  { id: 'angeles', name: 'Angeles', displayName: 'Angeles', coordinates: { lat: 15.1450, lng: 120.5833 }, province: 'Pampanga', regionId: 'region-iii' },
  { id: 'san-jose-del-monte', name: 'San Jose del Monte', displayName: 'San Jose del Monte', coordinates: { lat: 14.8139, lng: 121.0453 }, province: 'Bulacan', regionId: 'region-iii' },
  /* Region IV-A */
  { id: 'lipa', name: 'Lipa', displayName: 'Lipa', coordinates: { lat: 13.9411, lng: 121.1631 }, province: 'Batangas', regionId: 'region-iv-a' },
  { id: 'bacoor', name: 'Bacoor', displayName: 'Bacoor', coordinates: { lat: 14.4584, lng: 120.9389 }, province: 'Cavite', regionId: 'region-iv-a' },
  { id: 'calamba', name: 'Calamba', displayName: 'Calamba', coordinates: { lat: 14.2111, lng: 121.1653 }, province: 'Laguna', regionId: 'region-iv-a' },
  /* Region IV-B */
  { id: 'puerto-princesa', name: 'Puerto Princesa', displayName: 'Puerto Princesa', coordinates: { lat: 9.7407, lng: 118.7357 }, province: 'Palawan', regionId: 'region-iv-b' },
  { id: 'calapan', name: 'Calapan', displayName: 'Calapan', coordinates: { lat: 13.4100, lng: 121.1792 }, province: 'Oriental Mindoro', regionId: 'region-iv-b' },
  /* Region V */
  { id: 'legazpi', name: 'Legazpi', displayName: 'Legazpi', coordinates: { lat: 13.1392, lng: 123.7442 }, province: 'Albay', regionId: 'region-v' },
  { id: 'naga-camarines', name: 'Naga', displayName: 'Naga (Camarines Sur)', coordinates: { lat: 13.6192, lng: 123.1814 }, province: 'Camarines Sur', regionId: 'region-v' },
  /* Region VI */
  { id: 'iloilo-city', name: 'Iloilo City', displayName: 'Iloilo City', coordinates: { lat: 10.7202, lng: 122.5621 }, province: 'Iloilo', regionId: 'region-vi' },
  { id: 'bacolod', name: 'Bacolod', displayName: 'Bacolod', coordinates: { lat: 10.6765, lng: 122.9509 }, province: 'Negros Occidental', regionId: 'region-vi' },
  { id: 'roxas', name: 'Roxas', displayName: 'Roxas', coordinates: { lat: 11.5853, lng: 122.7511 }, province: 'Capiz', regionId: 'region-vi' },
  /* Region VII – add Bohol, Negros Oriental, Siquijor */
  { id: 'tagbilaran', name: 'Tagbilaran', displayName: 'Tagbilaran', coordinates: { lat: 9.6644, lng: 123.8533 }, province: 'Bohol', regionId: 'region-vii' },
  { id: 'dumaguete', name: 'Dumaguete', displayName: 'Dumaguete', coordinates: { lat: 9.3103, lng: 123.3082 }, province: 'Negros Oriental', regionId: 'region-vii' },
  { id: 'siquijor-town', name: 'Siquijor', displayName: 'Siquijor', coordinates: { lat: 9.2142, lng: 123.5150 }, province: 'Siquijor', regionId: 'region-vii' },
  /* Region IX */
  { id: 'zamboanga-city', name: 'Zamboanga City', displayName: 'Zamboanga City', coordinates: { lat: 6.9214, lng: 122.0790 }, province: 'Zamboanga del Sur', regionId: 'region-ix' },
  { id: 'dipolog', name: 'Dipolog', displayName: 'Dipolog', coordinates: { lat: 8.5862, lng: 123.3414 }, province: 'Zamboanga del Norte', regionId: 'region-ix' },
  /* Region X – add more */
  { id: 'valencia-bukidnon', name: 'Valencia', displayName: 'Valencia (Bukidnon)', coordinates: { lat: 7.9064, lng: 125.0936 }, province: 'Bukidnon', regionId: 'region-x' },
  { id: 'ozamiz', name: 'Ozamiz', displayName: 'Ozamiz', coordinates: { lat: 8.1458, lng: 123.8444 }, province: 'Misamis Occidental', regionId: 'region-x' },
  /* Region XI */
  { id: 'davao-city', name: 'Davao City', displayName: 'Davao City', coordinates: { lat: 7.0731, lng: 125.6128 }, province: 'Davao del Sur', regionId: 'region-xi' },
  { id: 'tagum', name: 'Tagum', displayName: 'Tagum', coordinates: { lat: 7.4475, lng: 125.8092 }, province: 'Davao del Norte', regionId: 'region-xi' },
  /* Region XII */
  { id: 'general-santos', name: 'General Santos', displayName: 'General Santos', coordinates: { lat: 6.1167, lng: 125.1667 }, province: 'South Cotabato', regionId: 'region-xii' },
  { id: 'koronadal', name: 'Koronadal', displayName: 'Koronadal', coordinates: { lat: 6.5031, lng: 124.8469 }, province: 'South Cotabato', regionId: 'region-xii' },
  /* Region XIII */
  { id: 'butuan', name: 'Butuan', displayName: 'Butuan', coordinates: { lat: 8.9475, lng: 125.5406 }, province: 'Agusan del Norte', regionId: 'region-xiii' },
  { id: 'surigao-city', name: 'Surigao City', displayName: 'Surigao City', coordinates: { lat: 9.7890, lng: 125.4950 }, province: 'Surigao del Norte', regionId: 'region-xiii' },
  /* BARMM */
  { id: 'cotabato-city', name: 'Cotabato City', displayName: 'Cotabato City', coordinates: { lat: 7.2044, lng: 124.1772 }, province: 'Maguindanao', regionId: 'barmm' },
  { id: 'marawi', name: 'Marawi', displayName: 'Marawi', coordinates: { lat: 8.0034, lng: 124.2839 }, province: 'Lanao del Sur', regionId: 'barmm' }
];

export const getCityById = (id) => {
  return cebuCities.find(city => city.id === id);
};

export const getCityCoordinates = (cityId) => {
  const city = getCityById(cityId);
  return city ? city.coordinates : cebuCities[0].coordinates;
};

/**
 * Get cities/areas that belong to a region.
 * Pass 'all' or null for all cities. Otherwise returns "All Cities" plus cities with matching regionId.
 */
export const getCitiesByRegion = (regionId) => {
  if (!regionId || regionId === 'all') return cebuCities;
  const allCitiesEntry = cebuCities.find(c => c.id === 'cebu-province');
  const inRegion = cebuCities.filter(city => city.regionId === regionId);
  return allCitiesEntry ? [allCitiesEntry, ...inRegion] : inRegion;
};

/** Get region ID for a city ID. */
export const getRegionIdByCityId = (cityId) => {
  const city = getCityById(cityId);
  return city ? city.regionId : null;
};

/**
 * Unique province names from cities (excluding "All Cities" entry).
 * Used for Add Property form: Province → City.
 */
export const getProvinces = () => {
  const names = new Set(
    cebuCities
      .filter((c) => c.province && c.id !== 'cebu-province')
      .map((c) => c.province)
  );
  return Array.from(names).sort();
};

/**
 * Get cities that belong to a province (for Add Property form).
 * Excludes "All Cities" entry.
 */
export const getCitiesByProvince = (province) => {
  if (!province) return cebuCities.filter((c) => c.id !== 'cebu-province');
  return cebuCities.filter(
    (c) => c.id !== 'cebu-province' && c.province === province
  );
};

/**
 * Unique province names in a region (for Add Property: Region → Province → City).
 * Returns all provinces that have at least one city in the data for that region.
 */
export const getProvincesByRegion = (regionId) => {
  if (!regionId || regionId === 'all') return [];
  const names = new Set(
    cebuCities
      .filter((c) => c.regionId === regionId && c.province && c.id !== 'cebu-province')
      .map((c) => c.province)
  );
  return Array.from(names).sort();
};

/**
 * All cities in a region and province (for Add Property form).
 * Fully unlocks all cities in the data for that region+province; no listing filter.
 */
export const getCitiesByRegionAndProvince = (regionId, province) => {
  if (!regionId || regionId === 'all')
    return province ? getCitiesByProvince(province) : cebuCities.filter((c) => c.id !== 'cebu-province');
  if (!province) {
    return cebuCities.filter((c) => c.id !== 'cebu-province' && c.regionId === regionId);
  }
  return cebuCities.filter(
    (c) =>
      c.id !== 'cebu-province' &&
      c.regionId === regionId &&
      c.province === province
  );
};

/** Region IDs that have at least one city in the data (for Add Property default). */
export const getRegionIdsWithCities = () => {
  const ids = new Set(
    cebuCities
      .filter((c) => c.regionId && c.id !== 'cebu-province')
      .map((c) => c.regionId)
  );
  return Array.from(ids);
};

/**
 * Given a list of listings (each with cityId), return region IDs that have at least one listing.
 * Used to show only regions that have property available in search filters.
 */
export const getRegionIdsWithListings = (listings) => {
  const ids = new Set();
  listings.forEach((item) => {
    const regionId = getRegionIdByCityId(item.cityId);
    if (regionId) ids.add(regionId);
  });
  return Array.from(ids);
};

/**
 * Given a list of listings (each with cityId), return city IDs that have at least one listing.
 * Used so search filters show only cities that have properties.
 */
export const getCityIdsWithListings = (listings) => {
  const ids = new Set();
  listings.forEach((item) => {
    if (item.cityId && item.cityId !== 'cebu-province') ids.add(item.cityId);
  });
  return Array.from(ids);
};
