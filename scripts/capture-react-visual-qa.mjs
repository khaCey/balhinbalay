import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BB_PREVIEW_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.BB_SCREENSHOT_DIR || 'visual-qa';

const svg = (label, bg = '#dce8f8') =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><rect width="900" height="600" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="42" fill="#607188">${label}</text></svg>`)}`;

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
    description: 'A bright furnished condo close to everyday essentials and transport.',
    coordinates: { lat: 10.331, lng: 123.906 },
    contactInfo: { agentName: 'Ana Reyes', phone: '+63 917 000 0001', email: 'ana@example.com' },
    ownerName: 'Ana Reyes',
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
    description: 'A practical one-bedroom apartment in a quiet residential area.',
    coordinates: { lat: 10.344, lng: 123.913 },
    contactInfo: { agentName: 'Marco Lim', phone: '+63 917 000 0002', email: 'marco@example.com' },
    ownerName: 'Marco Lim',
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
    description: 'A simple furnished room with shared cooking space.',
    coordinates: { lat: 10.522, lng: 124.027 },
    contactInfo: { agentName: 'Mia Cruz', phone: '+63 917 000 0003', email: 'mia@example.com' },
    ownerName: 'Mia Cruz',
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
    description: 'A compact island studio near shops and coastal areas.',
    coordinates: { lat: 10.289, lng: 124.0 },
    contactInfo: { agentName: 'Leo Tan', phone: '+63 917 000 0004', email: 'leo@example.com' },
    ownerName: 'Leo Tan',
    status: 'approved',
    sold: false,
    currentlyRented: false,
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
    description: 'A family house with practical indoor and outdoor space.',
    coordinates: { lat: 10.37, lng: 123.91 },
    contactInfo: { agentName: 'Rina Santos', phone: '+63 917 000 0005', email: 'rina@example.com' },
    ownerName: 'Rina Santos',
    status: 'approved',
    sold: false,
    currentlyRented: false,
  },
];

async function mockApi(page) {
  // Playwright checks matching route handlers in reverse registration order.
  // Register the broad fallback first so the listings fixture route below wins.
  await page.route('**/api/**', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'QA mock endpoint' }) });
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
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) });
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

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of [
    { suffix: '390', width: 390, height: 844 },
    { suffix: '1440', width: 1440, height: 1000 },
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    await context.addInitScript(() => {
      window.localStorage.setItem('bb_consent_v1', JSON.stringify({ analytics: false }));
      window.localStorage.removeItem('balhinbalay_auth');
    });

    const page = await stablePage(context, viewport.width, viewport.height);

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

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Visual QA screenshots written to ${outputDir}`);
