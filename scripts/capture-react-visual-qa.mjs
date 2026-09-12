import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BB_PREVIEW_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.BB_SCREENSHOT_DIR || 'visual-qa';

const svg = (label, bg = '#dce8f8') =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="42" fill="#607188">${label}</text></svg>`)}`;

const qaUser = {
  id: 'qa-user-1',
  email: 'alex.rivera@example.com',
  name: 'Alex Rivera',
  role: 'user',
  avatar_url: null,
  push_enabled: false,
};

const fixtures = [
  {
    id: 'qa-rent-1',
    title: 'Bright 2BR Condo near IT Park',
    price: 24000,
    size: '58 sqm',
    sizeSqm: 58,
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
    ownerId: 'qa-owner-2',
    status: 'approved',
    sold: false,
    currentlyRented: false,
    securityDeposit: 24000,
    advancePay: 24000,
    keyMoney: 0,
    brokerFee: 0,
    associationFee: 1800,
    reservationFee: 5000,
    utilitiesIncluded: false,
    features: ['Furnished', 'With parking', 'Near a mall'],
  },
  {
    id: 'qa-rent-2',
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
    ownerId: 'qa-owner-3',
    status: 'approved',
    sold: false,
    currentlyRented: false,
  },
  {
    id: 'qa-rent-3',
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
    ownerId: 'qa-owner-4',
    status: 'approved',
    sold: false,
    currentlyRented: false,
  },
  {
    id: 'qa-rent-4',
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
    contactInfo: { agentName: 'Alex Rivera', phone: '+63 917 000 0004', email: 'alex.rivera@example.com' },
    ownerName: 'Alex Rivera',
    ownerId: qaUser.id,
    status: 'approved',
    sold: false,
    currentlyRented: false,
    availableFrom: '2026-10-01',
  },
  {
    id: 'qa-sale-1',
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
    contactInfo: { agentName: 'Alex Rivera', phone: '+63 917 000 0005', email: 'alex.rivera@example.com' },
    ownerName: 'Alex Rivera',
    ownerId: qaUser.id,
    status: 'approved',
    sold: false,
    currentlyRented: false,
  },
];

const savedSearches = [
  {
    id: 'qa-search-1',
    name: 'Cebu two-bedroom rentals',
    listingType: 'rent',
    propertyType: 'Condo',
    priceRangeIndex: 0,
    priceMin: 12000,
    priceMax: 30000,
    selectedRegion: 'region-vii',
    selectedProvince: 'cebu',
    selectedCity: 'cebu-city',
    searchQuery: '',
    furnishedFilter: '',
    minBeds: 2,
    minBaths: 0,
    sizeRangeMin: 0,
    sizeRangeMax: null,
    sortBy: 'newest',
  },
];

const chatThreads = [
  {
    id: 'qa-thread-1',
    listingId: 'qa-rent-1',
    listingTitle: 'Bright 2BR Condo near IT Park',
    userId: qaUser.id,
    listingOwnerId: 'qa-owner-2',
    otherParticipantName: 'Ana Reyes',
    updatedAt: '2026-09-12T14:45:00.000Z',
    unreadCount: 1,
    lastMessage: {
      text: 'Saturday afternoon works for me.',
      createdAt: '2026-09-12T14:45:00.000Z',
      senderId: 'qa-owner-2',
    },
  },
];

const chatMessages = [
  {
    id: 'qa-msg-1',
    text: 'Hi, is this place still available?',
    timestamp: '2026-09-12T14:40:00.000Z',
    isFromUser: true,
    senderName: 'Alex Rivera',
  },
  {
    id: 'qa-msg-2',
    text: 'It is. Would you like to arrange a viewing?',
    timestamp: '2026-09-12T14:42:00.000Z',
    isFromUser: false,
    senderName: 'Ana Reyes',
  },
  {
    id: 'qa-msg-3',
    text: 'Saturday afternoon works for me.',
    timestamp: '2026-09-12T14:45:00.000Z',
    isFromUser: false,
    senderName: 'Ana Reyes',
  },
];

async function json(route, body, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockApi(page) {
  // Playwright checks matching route handlers in reverse registration order.
  // Register the broad fallback first so the specific fixture routes below win.
  await page.route('**/api/**', async (route) => {
    await json(route, { error: 'QA mock endpoint' }, 404);
  });

  await page.route('**/api/listings**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const type = requestUrl.searchParams.get('listingType');
    const cityIds = (requestUrl.searchParams.get('cityIds') || requestUrl.searchParams.get('cityId') || '')
      .split(',')
      .filter(Boolean);
    let result = fixtures;
    if (type) result = result.filter((item) => item.listingType === type);
    if (cityIds.length) result = result.filter((item) => cityIds.includes(item.cityId));
    await json(route, result);
  });

  await page.route('**/api/auth/me', async (route) => json(route, qaUser));
  await page.route('**/api/users/me', async (route) => json(route, qaUser));
  await page.route('**/api/favorites**', async (route) => {
    if (route.request().method() === 'GET') await json(route, ['qa-rent-1', 'qa-rent-2']);
    else await json(route, { ok: true });
  });
  await page.route('**/api/saved-searches**', async (route) => {
    if (route.request().method() === 'GET') await json(route, savedSearches);
    else await json(route, { id: 'qa-search-new', ok: true });
  });
  await page.route('**/api/recently-viewed**', async (route) => {
    if (route.request().method() === 'GET') await json(route, ['qa-rent-2', 'qa-rent-1']);
    else await json(route, { ok: true });
  });
  await page.route('**/api/chat/threads/qa-thread-1/messages', async (route) => {
    if (route.request().method() === 'GET') await json(route, chatMessages);
    else await json(route, { ok: true });
  });
  await page.route('**/api/chat/threads/qa-thread-1/read', async (route) => json(route, { ok: true }));
  await page.route('**/api/chat/threads', async (route) => {
    if (route.request().method() === 'GET') await json(route, chatThreads);
    else await json(route, { id: 'qa-thread-1', ok: true });
  });
  await page.route('**/api/chat/events', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
}

async function stablePage(context, width, height) {
  const page = await context.newPage();
  await mockApi(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width, height });
  return page;
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function capture(page, label) {
  await settle(page);
  await page.screenshot({ path: path.join(outputDir, `${label}.png`), fullPage: true });
}

async function createContext(browser, viewport, authenticated = false) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  await context.addInitScript(({ user, authenticated }) => {
    window.localStorage.setItem('bb_consent_v1', JSON.stringify({ analytics: false }));
    if (authenticated) {
      window.localStorage.setItem(
        'balhinbalay_auth',
        JSON.stringify({ user, token: 'qa-token' }),
      );
    } else {
      window.localStorage.removeItem('balhinbalay_auth');
    }
  }, { user: qaUser, authenticated });
  return context;
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { suffix: '390', width: 390, height: 844 },
    { suffix: '1440', width: 1440, height: 1000 },
  ]) {
    const guestContext = await createContext(browser, viewport, false);
    const page = await stablePage(guestContext, viewport.width, viewport.height);

    await page.goto(`${baseUrl}/`);
    await capture(page, `react-home-${viewport.suffix}`);

    await page.goto(`${baseUrl}/search?listingType=rent`);
    await capture(page, `react-search-${viewport.suffix}`);

    await page.goto(`${baseUrl}/`);
    await settle(page);
    await page.getByRole('button', { name: 'Cebu', exact: true }).click();
    await page.getByRole('button', { name: /Find a place/i }).click();
    await page.waitForURL(/\/rent(?:\?|$)/, { timeout: 15000 });
    await capture(page, `react-results-${viewport.suffix}`);

    const mapButton = page.locator('.minimal-results-map-btn');
    if (await mapButton.count()) {
      await mapButton.click();
      await page.waitForURL(/\/search\/map/, { timeout: 15000 });
      await capture(page, `react-map-${viewport.suffix}`);
    }

    await page.goto(`${baseUrl}/property/qa-rent-1`);
    await capture(page, `react-property-${viewport.suffix}`);
    await guestContext.close();

    const authContext = await createContext(browser, viewport, true);
    const authPage = await stablePage(authContext, viewport.width, viewport.height);

    for (const [label, route] of [
      ['saved', '/saved'],
      ['messages', '/messages'],
      ['chat', '/chat/qa-thread-1'],
      ['my-properties', '/my-properties'],
      ['menu', '/menu'],
      ['profile', '/profile'],
      ['settings', '/settings'],
      ['add-property', '/add-property'],
    ]) {
      await authPage.goto(`${baseUrl}${route}`);
      await capture(authPage, `react-${label}-${viewport.suffix}`);
    }

    await authContext.close();
  }
} finally {
  await browser.close();
}

console.log(`Visual QA screenshots written to ${outputDir}`);
