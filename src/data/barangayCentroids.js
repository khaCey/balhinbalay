/**
 * Barangay centroid coordinates for map pin placement.
 * Lookup key: "barangay_name|city_name" (lowercase, trimmed).
 * Sources: seed listings (verified coords), common barangays from PSGC/GeoJSON-derived data.
 * Use getBarangayCoordinates(location, cityName) for lookup.
 */
const BARANGAY_CENTROIDS = {
  // Cebu City
  'lahug|cebu city': { lat: 10.3157, lng: 123.8854 },
  'apas|cebu city': { lat: 10.3200, lng: 123.8900 },
  'talamban|cebu city': { lat: 10.3500, lng: 123.9000 },
  'guadalupe|cebu city': { lat: 10.3100, lng: 123.8800 },
  'colon|cebu city': { lat: 10.2960, lng: 123.8985 },
  'capitol site|cebu city': { lat: 10.3120, lng: 123.8950 },
  'kamputhaw|cebu city': { lat: 10.3180, lng: 123.8920 },
  'hibuna|cebu city': { lat: 10.3050, lng: 123.8900 },
  'sambag i|cebu city': { lat: 10.3000, lng: 123.9010 },
  'sambag ii|cebu city': { lat: 10.2980, lng: 123.8990 },
  'poblacion|cebu city': { lat: 10.2930, lng: 123.9030 },
  // Mandaue City
  'banilad|mandaue city': { lat: 10.3333, lng: 123.9333 },
  'tipolo|mandaue city': { lat: 10.3400, lng: 123.9400 },
  'poblacion|mandaue city': { lat: 10.3300, lng: 123.9350 },
  'centro|mandaue city': { lat: 10.3320, lng: 123.9340 },
  // Lapu-Lapu City
  'maribago|lapu-lapu city': { lat: 10.3103, lng: 123.9494 },
  'poblacion|lapu-lapu city': { lat: 10.3050, lng: 123.9550 },
  'gungab|lapu-lapu city': { lat: 10.2980, lng: 123.9600 },
  // Talisay City
  'lawaan|talisay city': { lat: 10.2447, lng: 123.8425 },
  'poblacion|talisay city': { lat: 10.2480, lng: 123.8380 },
  // Danao City
  'poblacion|danao city': { lat: 10.5200, lng: 123.9300 },
  // Carcar City
  'poblacion|carcar city': { lat: 10.1167, lng: 123.6333 },
  // Naga City (Cebu)
  'colon|naga city': { lat: 10.2167, lng: 123.7500 },
  'poblacion|naga city': { lat: 10.2180, lng: 123.7520 },
  // Minglanilla
  'tulay|minglanilla': { lat: 10.2500, lng: 123.8000 },
  'poblacion|minglanilla': { lat: 10.2480, lng: 123.7950 },
  // Consolacion
  'poblacion|consolacion': { lat: 10.3667, lng: 123.9500 },
  // Liloan
  'poblacion|liloan': { lat: 10.4000, lng: 123.9667 },
  // Compostela
  'poblacion|compostela': { lat: 10.4500, lng: 123.9833 },
  // Cordova
  'gabi|cordova': { lat: 10.2500, lng: 123.9500 },
  'poblacion|cordova': { lat: 10.2530, lng: 123.9480 },
  // San Fernando
  'poblacion|san fernando': { lat: 10.1667, lng: 123.7000 },
  // Bogo City
  'poblacion|bogo city': { lat: 11.0500, lng: 124.0000 },
  // Moalboal
  'basdiot|moalboal': { lat: 9.9500, lng: 123.4000 },
  'poblacion|moalboal': { lat: 9.9480, lng: 123.3980 },
  // Oslob
  'tan-awan|oslob': { lat: 9.5167, lng: 123.4333 },
  'poblacion|oslob': { lat: 9.5200, lng: 123.4300 },
  // Iligan City
  'pala-o|iligan city': { lat: 8.2282, lng: 124.2452 },
  'tubod|iligan city': { lat: 8.2350, lng: 124.2500 },
  'tambacan|iligan city': { lat: 8.2200, lng: 124.2400 },
  'poblacion|iligan city': { lat: 8.2300, lng: 124.2480 },
  // Cagayan de Oro
  'carmen|cagayan de oro': { lat: 8.4762, lng: 124.6439 },
  'lapasan|cagayan de oro': { lat: 8.4800, lng: 124.6500 },
  'gusa|cagayan de oro': { lat: 8.4700, lng: 124.6400 },
  'poblacion|cagayan de oro': { lat: 8.4780, lng: 124.6450 },
  'macasandig|cagayan de oro': { lat: 8.4720, lng: 124.6480 },
  'nazareth|cagayan de oro': { lat: 8.4650, lng: 124.6550 },
  // Toledo City
  'poblacion|toledo city': { lat: 10.3833, lng: 123.6500 },
  // Manila / NCR (common barangays for future use)
  'ermita|manila': { lat: 14.5830, lng: 120.9810 },
  'malate|manila': { lat: 14.5720, lng: 120.9850 },
  'poblacion|manila': { lat: 14.5995, lng: 120.9842 },
  // Davao City
  'poblacion|davao city': { lat: 7.0731, lng: 125.6128 },
  'talomo|davao city': { lat: 7.0650, lng: 125.6050 },
  'buhangin|davao city': { lat: 7.1100, lng: 125.6200 }
};

/**
 * Normalize location (barangay) and city for lookup key.
 * Handles "Barangay X", "Bgy. X", "X" formats.
 */
function normalizeKey(locationPart, cityName) {
  if (!locationPart || !cityName) return null;
  let brgy = String(locationPart).trim();
  brgy = brgy
    .replace(/^barangay\s+/i, '')
    .replace(/^bgy\.?\s*/i, '')
    .replace(/^brgy\.?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const city = String(cityName).trim().toLowerCase();
  if (!brgy || !city) return null;
  return `${brgy}|${city}`;
}

/**
 * Look up coordinates for a barangay/location within a city.
 * Returns { lat, lng } if found, null otherwise.
 */
export function getBarangayCoordinates(location, cityName) {
  const key = normalizeKey(location, cityName);
  if (!key) return null;
  return BARANGAY_CENTROIDS[key] || null;
}
