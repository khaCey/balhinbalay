import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BB_PREVIEW_URL || 'http://127.0.0.1:3000';
const outputDir = process.env.BB_OWNER_QA_DIR || 'owner-form-visual-qa';

const qaUser = {
  id: 'qa-user-1',
  email: 'alex.rivera@example.com',
  name: 'Alex Rivera',
  role: 'user',
  avatar_url: null,
  push_enabled: false,
};

const svg = (label, bg = '#dce8f8') =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="42" fill="#607188">${label}</text></svg>`)}`;

const ownerListing = {
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
  furnished: 'furnished',
  description: 'A compact island studio near shops and coastal areas.',
  coordinates: { lat: 10.289, lng: 124.0 },
  contactInfo: {
    agentName: 'Alex Rivera',
    phone: '+63 917 000 0004',
    email: 'alex.rivera@example.com',
  },
  ownerName: 'Alex Rivera',
  ownerId: qaUser.id,
  status: 'approved',
  sold: false,
  currentlyRented: false,
  availableFrom: 'October 2026',
  securityDeposit: 19000,
  advancePay: 19000,
  associationFee: 1800,
};

async function json(route, body, status = 200) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function mockApi(page) {
  // Register fallback first because Playwright evaluates routes in reverse order.
  await page.route('**/api/**', async (route) => {
    await json(route, { error: 'Owner-form QA mock endpoint' }, 404);
  });

  await page.route('**/api/listings**', async (route) => {
    await json(route, [ownerListing]);
  });
  await page.route('**/api/auth/me', async (route) => json(route, qaUser));
  await page.route('**/api/users/me', async (route) => json(route, qaUser));
  await page.route('**/api/favorites**', async (route) => json(route, []));
  await page.route('**/api/saved-searches**', async (route) => json(route, []));
  await page.route('**/api/recently-viewed**', async (route) => json(route, []));
  await page.route('**/api/chat/threads**', async (route) => json(route, []));
  await page.route('**/api/chat/events', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
}

async function createPage(browser, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
  });
  await context.addInitScript(({ user }) => {
    window.localStorage.setItem('bb_consent_v1', JSON.stringify({ analytics: false }));
    window.localStorage.setItem(
      'balhinbalay_auth',
      JSON.stringify({ user, token: 'qa-token' }),
    );
  }, { user: qaUser });
  const page = await context.newPage();
  await mockApi(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  return { context, page };
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function capture(page, label) {
  await settle(page);
  await page.screenshot({ path: path.join(outputDir, `${label}.png`), fullPage: true });
}

async function fillNewListingAndCapture(page, suffix) {
  await page.goto(`${baseUrl}/add-property`);
  await capture(page, `owner-new-step-1-basics-${suffix}`);

  await page.getByLabel('Give your place a name').fill('A bright home in Lahug');
  await page.getByLabel('Monthly rent (₱)').fill('22000');
  await page.getByRole('button', { name: 'Continue →' }).click();
  await capture(page, `owner-new-step-2-location-${suffix}`);

  await page.getByLabel('Barangay / neighbourhood').fill('Lahug');
  await page.getByRole('button', { name: /Pick location on map/i }).click();
  await page.waitForTimeout(900);
  await capture(page, `owner-new-step-2-map-state-${suffix}`);
  await page.getByRole('button', { name: /Hide map/i }).click();
  await page.getByRole('button', { name: 'Continue →' }).click();
  await capture(page, `owner-new-step-3-space-${suffix}`);

  await page.getByLabel('Bedrooms').fill('2');
  await page.getByLabel('Bathrooms').fill('1');
  await page.getByLabel('Floor area in square metres').fill('48');
  await page.getByLabel('Furnishing').selectOption('furnished');
  await page.getByLabel('Description').fill('Bright, practical and close to everyday transport.');
  await page.getByRole('button', { name: 'Continue →' }).click();
  await capture(page, `owner-new-step-4-costs-${suffix}`);

  await page.getByLabel('Security deposit (optional) ₱').fill('22000');
  await page.getByLabel('Advance pay (optional) ₱').fill('22000');
  await page.getByRole('button', { name: 'Continue →' }).click();
  await capture(page, `owner-new-step-5-photos-empty-${suffix}`);

  const onePixelPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZIR0AAAAASUVORK5CYII=',
    'base64',
  );
  await page.getByLabel('Upload property images').setInputFiles({
    name: 'qa-property.png',
    mimeType: 'image/png',
    buffer: onePixelPng,
  });
  await page.waitForTimeout(500);
  await capture(page, `owner-new-step-5-photos-uploaded-${suffix}`);

  await page.getByRole('button', { name: 'Continue →' }).click();
  await capture(page, `owner-new-step-6-review-${suffix}`);
}

async function captureEditStates(page, suffix) {
  await page.goto(`${baseUrl}/add-property/${ownerListing.id}`);
  await capture(page, `owner-edit-step-1-prefilled-${suffix}`);

  await page.goto(`${baseUrl}/add-property/${ownerListing.id}?section=availability`);
  await capture(page, `owner-edit-step-4-availability-${suffix}`);
}

await fs.rm(outputDir, { recursive: true, force: true });
await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewports = [
  { suffix: '390', width: 390, height: 844 },
  { suffix: '1440', width: 1440, height: 1000 },
];

try {
  for (const viewport of viewports) {
    const { context, page } = await createPage(browser, {
      width: viewport.width,
      height: viewport.height,
    });
    await fillNewListingAndCapture(page, viewport.suffix);
    await captureEditStates(page, viewport.suffix);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Owner-form QA screenshots written to ${outputDir}`);
