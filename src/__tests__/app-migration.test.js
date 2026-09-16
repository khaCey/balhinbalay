import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import App from '../App';

jest.mock('../utils/analytics', () => ({ trackEvent: jest.fn(), trackPageView: jest.fn(), initAnalytics: jest.fn(), getStoredConsent: () => false, setAnalyticsConsent: jest.fn() }));

const listing = { id: 'test-home', title: 'Test Cebu home', cityId: 'cebu-city', city: 'Cebu City', listingType: 'rent', status: 'approved', price: 25000, beds: 1, baths: 1, size: '42 sqm', type: 'Condo', images: [], description: 'A test listing', datePosted: '2026-09-01' };
let container, root;
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); window.history.replaceState({}, '', '/');
  window.scrollTo = jest.fn();
  global.fetch = jest.fn(async url => ({ ok: true, text: async () => JSON.stringify(String(url).includes('/api/listings') ? [listing] : []) }));
  container = document.createElement('div'); document.body.append(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); delete global.fetch; });
const clickText = async text => {
  const button = [...container.querySelectorAll('button')].find(item => item.textContent.trim() === text);
  expect(button).toBeTruthy();
  await act(async () => { button.click(); await Promise.resolve(); });
};

test('real providers and routes connect Home → city results → favourite → Saved', async () => {
  await act(async () => { root.render(<App />); });
  expect(container.textContent).toContain('Where do you');
  await clickText('Cebu');
  await act(async () => { Simulate.submit(container.querySelector('.bb-search-card')); });
  expect(window.location.pathname).toBe('/rent');
  expect(container.textContent).toContain('Test Cebu home');
  const requested = global.fetch.mock.calls.map(([url]) => String(url));
  expect(requested.some(url => url.includes('listingType=rent') && url.includes('cityId=cebu-city'))).toBe(true);
  await act(async () => { container.querySelector('[aria-label="Add to favorites"]').click(); });
  const savedLink = [...container.querySelectorAll('a')].find(link => link.getAttribute('href') === '/saved');
  await act(async () => { savedLink.click(); });
  expect(window.location.pathname).toBe('/saved');
  expect(container.textContent).toContain('Your shortlist.');
  expect(container.textContent).toContain('Test Cebu home');
});
