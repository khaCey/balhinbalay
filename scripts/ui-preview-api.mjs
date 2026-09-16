import http from 'node:http';

const PORT = Number(process.env.UI_PREVIEW_API_PORT || 5000);

const svg = (label, bg = '#dce8f8') =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="42" fill="#607188">${label}</text></svg>`)}`;

const listings = [
  {
    id: 'preview-rent-1',
    title: 'A bright little home near IT Park',
    price: 25000,
    size: '42 sqm',
    sizeSqm: 42,
    location: 'Lahug',
    city: 'Cebu City',
    cityId: 'cebu-city',
    beds: 2,
    baths: 1,
    type: 'Condo',
    images: [svg('Cebu condo', '#dce8f8')],
    listingType: 'rent',
    furnishing: 'Furnished',
    furnished: 'Furnished',
    description: 'A bright furnished condo close to everyday essentials and transport.',
    coordinates: { lat: 10.331, lng: 123.906 },
    contactInfo: { agentName: 'Ana Reyes', phone: '+63 917 000 0001', email: 'ana@example.com' },
    ownerName: 'Ana Reyes',
    ownerId: 'preview-owner-1',
    status: 'approved',
    sold: false,
    currentlyRented: false,
    securityDeposit: 25000,
    advancePay: 25000,
    associationFee: 1800,
    reservationFee: 5000,
    utilitiesIncluded: false,
    features: ['Furnished', 'With parking', 'Near a mall']
  },
  {
    id: 'preview-rent-2',
    title: 'Quiet 1BR Apartment in Banilad',
    price: 16000,
    size: '42 sqm',
    sizeSqm: 42,
    location: 'Banilad',
    city: 'Mandaue City',
    cityId: 'mandaue-city',
    beds: 1,
    baths: 1,
    type: 'Apartment',
    images: [svg('Mandaue apartment', '#e7edf5')],
    listingType: 'rent',
    furnishing: 'Semi-furnished',
    furnished: 'Semi-furnished',
    description: 'A practical one-bedroom apartment in a quiet residential area.',
    coordinates: { lat: 10.344, lng: 123.913 },
    contactInfo: { agentName: 'Marco Lim', phone: '+63 917 000 0002', email: 'marco@example.com' },
    ownerName: 'Marco Lim',
    ownerId: 'preview-owner-2',
    status: 'approved',
    sold: false,
    currentlyRented: false
  },
  {
    id: 'preview-rent-3',
    title: 'Room with Shared Kitchen in Danao',
    price: 6500,
    size: '18 sqm',
    sizeSqm: 18,
    location: 'Poblacion',
    city: 'Danao City',
    cityId: 'danao-city',
    beds: 1,
    baths: 1,
    type: 'Room',
    images: [svg('Danao room', '#e1f0e9')],
    listingType: 'rent',
    furnishing: 'Furnished',
    furnished: 'Furnished',
    description: 'A simple furnished room with shared cooking space.',
    coordinates: { lat: 10.522, lng: 124.027 },
    contactInfo: { agentName: 'Mia Cruz', phone: '+63 917 000 0003', email: 'mia@example.com' },
    ownerName: 'Mia Cruz',
    ownerId: 'preview-owner-3',
    status: 'approved',
    sold: false,
    currentlyRented: false
  },
  {
    id: 'preview-rent-4',
    title: 'Island Studio in Lapu-Lapu',
    price: 19000,
    size: '34 sqm',
    sizeSqm: 34,
    location: 'Maribago',
    city: 'Lapu-Lapu City',
    cityId: 'lapu-lapu-city',
    beds: 1,
    baths: 1,
    type: 'Condo',
    images: [svg('Lapu-Lapu studio', '#f0e9df')],
    listingType: 'rent',
    furnishing: 'Furnished',
    furnished: 'Furnished',
    description: 'A compact island studio near shops and coastal areas.',
    coordinates: { lat: 10.289, lng: 124.0 },
    contactInfo: { agentName: 'Lea Tan', phone: '+63 917 000 0004', email: 'lea@example.com' },
    ownerName: 'Lea Tan',
    ownerId: 'preview-owner-4',
    status: 'approved',
    sold: false,
    currentlyRented: false
  },
  {
    id: 'preview-rent-5',
    title: 'Calm 2BR near Fuente Osmeña',
    price: 22000,
    size: '49 sqm',
    sizeSqm: 49,
    location: 'Capitol Site',
    city: 'Cebu City',
    cityId: 'cebu-city',
    beds: 2,
    baths: 1,
    type: 'Apartment',
    images: [svg('Cebu apartment', '#e8edf6')],
    listingType: 'rent',
    furnishing: 'Semi-furnished',
    furnished: 'Semi-furnished',
    description: 'A calm two-bedroom home close to central Cebu conveniences.',
    coordinates: { lat: 10.315, lng: 123.893 },
    contactInfo: { agentName: 'Jo Santos', phone: '+63 917 000 0006', email: 'jo@example.com' },
    ownerName: 'Jo Santos',
    ownerId: 'preview-owner-5',
    status: 'approved',
    sold: false,
    currentlyRented: false
  },
  {
    id: 'preview-rent-6',
    title: 'Compact Studio near Ayala Center',
    price: 14000,
    size: '26 sqm',
    sizeSqm: 26,
    location: 'Luz',
    city: 'Cebu City',
    cityId: 'cebu-city',
    beds: 0,
    baths: 1,
    type: 'Condo',
    images: [svg('Cebu studio', '#ede7df')],
    listingType: 'rent',
    furnishing: 'Furnished',
    furnished: 'Furnished',
    description: 'A compact studio for someone who wants to stay close to the city centre.',
    coordinates: { lat: 10.318, lng: 123.904 },
    contactInfo: { agentName: 'Lea Tan', phone: '+63 917 000 0007', email: 'lea@example.com' },
    ownerName: 'Lea Tan',
    ownerId: 'preview-owner-6',
    status: 'approved',
    sold: false,
    currentlyRented: false
  },
  {
    id: 'preview-sale-1',
    title: 'Family House in Cebu City',
    price: 5600000,
    size: '135 sqm',
    sizeSqm: 135,
    location: 'Talamban',
    city: 'Cebu City',
    cityId: 'cebu-city',
    beds: 3,
    baths: 2,
    type: 'House',
    images: [svg('Cebu house', '#e6e2dc')],
    listingType: 'sale',
    furnishing: 'Semi-furnished',
    furnished: 'Semi-furnished',
    description: 'A family house with practical indoor and outdoor space.',
    coordinates: { lat: 10.37, lng: 123.91 },
    contactInfo: { agentName: 'Nina Go', phone: '+63 917 000 0005', email: 'nina@example.com' },
    ownerName: 'Nina Go',
    ownerId: 'preview-owner-7',
    status: 'approved',
    sold: false,
    currentlyRented: false
  },
  {
    id: 'preview-sale-2',
    title: 'A city home to make your own',
    price: 4200000,
    size: '96 sqm',
    sizeSqm: 96,
    location: 'Basak',
    city: 'Lapu-Lapu City',
    cityId: 'lapu-lapu-city',
    beds: 3,
    baths: 2,
    type: 'Townhouse',
    images: [svg('Lapu-Lapu townhouse', '#e8e4df')],
    listingType: 'sale',
    furnishing: 'Unfurnished',
    furnished: 'Unfurnished',
    description: 'A practical townhouse close to city conveniences.',
    coordinates: { lat: 10.291, lng: 123.96 },
    contactInfo: { agentName: 'Paolo Yu', phone: '+63 917 000 0009', email: 'paolo@example.com' },
    ownerName: 'Paolo Yu',
    ownerId: 'preview-owner-8',
    status: 'approved',
    sold: false,
    currentlyRented: false
  }
];

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function filterListings(url) {
  let result = listings.slice();
  const listingType = url.searchParams.get('listingType');
  const cityIds = (url.searchParams.get('cityIds') || url.searchParams.get('cityId') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const type = url.searchParams.get('type');
  const furnished = url.searchParams.get('furnished');
  const minBeds = Number(url.searchParams.get('minBeds') || 0);
  const minBaths = Number(url.searchParams.get('minBaths') || 0);
  const priceMin = Number(url.searchParams.get('priceMin') || 0);
  const priceMaxRaw = url.searchParams.get('priceMax');
  const priceMax = priceMaxRaw ? Number(priceMaxRaw) : Infinity;
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();

  if (listingType) result = result.filter((item) => item.listingType === listingType);
  if (cityIds.length) result = result.filter((item) => cityIds.includes(item.cityId));
  if (type) result = result.filter((item) => item.type === type);
  if (furnished) result = result.filter((item) => (item.furnished || item.furnishing) === furnished);
  if (minBeds) result = result.filter((item) => Number(item.beds || 0) >= minBeds);
  if (minBaths) result = result.filter((item) => Number(item.baths || 0) >= minBaths);
  if (priceMin) result = result.filter((item) => Number(item.price || 0) >= priceMin);
  if (Number.isFinite(priceMax)) result = result.filter((item) => Number(item.price || 0) <= priceMax);
  if (q) {
    result = result.filter((item) =>
      [item.title, item.location, item.city, item.type, item.furnishing, ...(item.features || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }
  return result;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${PORT}`}`);
  const method = req.method || 'GET';

  if (method === 'GET' && url.pathname === '/api/listings') {
    return send(res, 200, filterListings(url));
  }

  if (method === 'GET' && url.pathname.startsWith('/api/listings/')) {
    const id = decodeURIComponent(url.pathname.slice('/api/listings/'.length));
    const listing = listings.find((item) => String(item.id) === id);
    return listing ? send(res, 200, listing) : send(res, 404, { error: 'Listing not found' });
  }

  if (method === 'GET' && url.pathname === '/api/favorites') return send(res, 200, []);
  if (method === 'GET' && url.pathname === '/api/recently-viewed') return send(res, 200, []);
  if (method === 'GET' && url.pathname === '/api/saved-searches') return send(res, 200, []);
  if (method === 'GET' && url.pathname === '/api/chat/threads') return send(res, 200, []);
  if (method === 'GET' && url.pathname === '/api/auth/me') return send(res, 401, { error: 'Preview guest' });
  if (method === 'GET' && url.pathname === '/api/users/me') return send(res, 401, { error: 'Preview guest' });
  if (url.pathname === '/api/chat/events') {
    res.writeHead(204);
    return res.end();
  }

  if (url.pathname.startsWith('/api/') && ['POST', 'PATCH', 'DELETE'].includes(method)) {
    return send(res, 200, { ok: true });
  }

  return send(res, 404, { error: 'UI preview mock endpoint not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BalhinBalay UI preview mock API listening on http://0.0.0.0:${PORT}`);
});
