import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ChatPage from '../pages/ChatPage';
import SearchModule from '../components/SearchModule';
import SavedPage from '../pages/SavedPage';
import AddPropertyForm from '../components/AddPropertyForm';
import PropertyCosts, { moveInFees } from '../components/ui/PropertyCosts';
import ComparisonProvider, { CompareButton } from '../components/ui/Comparison';
import SearchMapPage from '../pages/SearchMapPage';
import { searchRequest } from '../utils/searchRequest';

const mockNavigate = jest.fn();
const mockSubmitSearch = jest.fn();
const mockFetchSearch = jest.fn();
const mockAddListing = jest.fn().mockResolvedValue({ id: 'new' });
const mockUpdateListing = jest.fn().mockResolvedValue({});
let mockListings, mockSearch, mockSaved, mockUser, mockChat;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
jest.mock('../context/ListingsContext', () => ({
  useListings: () => mockListings,
}));
jest.mock('../context/SearchContext', () => ({ useSearch: () => mockSearch }));
jest.mock('../context/ChatContext', () => ({ useChat: () => mockChat }));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));
jest.mock('../context/SavedSearchesContext', () => ({
  useSavedSearches: () => mockSaved,
}));
jest.mock('../context/FavoritesContext', () => ({
  useFavorites: () => ({
    favorites: ['r1'],
    isFavorite: () => false,
    toggleFavorite: jest.fn(),
  }),
}));
jest.mock('../context/RecentlyViewedContext', () => ({
  useRecentlyViewed: () => ({ recentIds: ['r2'] }),
}));
jest.mock('../context/UserListingsContext', () => ({
  useUserListings: () => ({
    addListing: mockAddListing,
    updateListing: mockUpdateListing,
  }),
}));
jest.mock('../utils/analytics', () => ({ trackEvent: jest.fn() }));
jest.mock('../components/MapPicker', () => () => <div>Map picker</div>);
jest.mock('../components/MapView', () => ({ properties, onSelectProperty }) => (
  <div data-testid="map">
    {properties.map((item) => (
      <button key={item.id} onClick={() => onSelectProperty(item)}>
        {item.title}
      </button>
    ))}
  </div>
));
jest.mock('../components/Seo', () => () => null);

const listings = [
  {
    id: 'r1',
    title: 'Cebu home',
    cityId: 'cebu-city',
    city: 'Cebu City',
    listingType: 'rent',
    price: 25000,
    beds: 1,
    baths: 1,
    size: '42 sqm',
    type: 'Condo',
    coordinates: { lat: 10.32, lng: 123.9 },
  },
  {
    id: 'r2',
    title: 'Mandaue home',
    cityId: 'mandaue-city',
    city: 'Mandaue City',
    listingType: 'rent',
    price: 32000,
    beds: 2,
    baths: 2,
    type: 'Apartment',
    coordinates: { lat: 10.35, lng: 123.93 },
  },
  {
    id: 'r3',
    title: 'Third home',
    cityId: 'cebu-city',
    listingType: 'rent',
    price: 18000,
  },
  {
    id: 'r4',
    title: 'Fourth home',
    cityId: 'cebu-city',
    listingType: 'rent',
    price: 15000,
  },
];
let container, root;
beforeEach(() => {
  jest.clearAllMocks();
  mockChat = {
    getThreads: () => [
      { id: 't1', listingId: 'r1', otherParticipantName: 'Owner' },
    ],
    getMessagesByThreadId: () => [],
    loadMessagesForThreadId: jest.fn(),
    sendMessageByThreadId: jest.fn().mockResolvedValue({ ok: true }),
  };
  mockUser = { id: 'owner', name: 'Test Owner', email: 'owner@example.test' };
  mockListings = {
    listings,
    searchResults: listings,
    loading: false,
    searchLoading: false,
    fetchSearchListings: mockFetchSearch,
  };
  mockSearch = {
    submitSearch: mockSubmitSearch,
    currentResultsState: {},
    defaultSearchState: {},
    mapStates: {},
    updateMapState: jest.fn(),
  };
  mockSaved = {
    savedSearches: [],
    getSearch: jest.fn(),
    deleteSearch: jest.fn(),
  };
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
const render = (node, path = '/') =>
  act(() =>
    root.render(<MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>),
  );
const button = (text) =>
  [...document.querySelectorAll('button')].find(
    (item) => item.textContent.trim() === text,
  );
const click = (node) =>
  act(() => {
    expect(node).toBeTruthy();
    node.click();
  });
const change = (node, value) =>
  act(() => Simulate.change(node, { target: { value } }));
const submit = async (form) =>
  act(async () => {
    Simulate.submit(form);
    await Promise.resolve();
  });

test('city search submits multiple locations using the existing state contract', async () => {
  render(<SearchModule />);
  click(button('Cebu'));
  click(button('Mandaue'));
  await submit(container.querySelector('form'));
  expect(mockSubmitSearch).toHaveBeenCalledWith(
    expect.objectContaining({
      listingType: 'rent',
      view: 'city',
      selectedCityIds: ['cebu-city', 'mandaue-city'],
      selectedCity: 'cebu-province',
    }),
  );
  expect(mockNavigate).toHaveBeenCalledWith('/rent');
});

test('editing a search retains advanced filters and numeric price boundaries', async () => {
  render(
    <SearchModule
      initialState={{
        listingType: 'rent',
        view: 'city',
        selectedCityIds: ['cebu-city'],
        priceRangeIndex: 0,
        priceMin: 17000,
        priceMax: 29000,
        minBaths: 2,
        furnishedFilter: 'furnished',
        sizeRange: { min: 40, max: 90 },
        sortBy: 'price-low',
      }}
    />,
  );
  await submit(container.querySelector('form'));
  expect(mockSubmitSearch).toHaveBeenCalledWith(
    expect.objectContaining({
      priceMin: 17000,
      priceMax: 29000,
      minBaths: 2,
      furnishedFilter: 'furnished',
      sizeRange: { min: 40, max: 90 },
      sortBy: 'price-low',
    }),
  );
});

test('keyword and school methods retain their existing independent search meanings', async () => {
  render(<SearchModule />);
  click(button('Keyword'));
  change(container.querySelector('input[type=search]'), '  furnished  ');
  await submit(container.querySelector('form'));
  expect(mockSubmitSearch).toHaveBeenLastCalledWith(
    expect.objectContaining({
      view: 'keyword',
      searchQuery: 'furnished',
      selectedCityIds: [],
    }),
  );
  click(button('School'));
  change(container.querySelector('select'), 'usc-cebu');
  await submit(container.querySelector('form'));
  expect(mockSubmitSearch).toHaveBeenLastCalledWith(
    expect.objectContaining({
      view: 'school',
      selectedSchoolId: 'usc-cebu',
      searchQuery: '',
    }),
  );
});

test('city sheet cancellation leaves selected cities unchanged', async () => {
  render(<SearchModule />);
  click(button('Cebu'));
  click(container.querySelector('.bb-city-field'));
  click(
    [...document.querySelectorAll('.bb-city-options button')].find((item) =>
      item.textContent.includes('Mandaue'),
    ),
  );
  click(document.querySelector('[aria-label="Close dialog"]'));
  await submit(container.querySelector('form'));
  expect(mockSubmitSearch).toHaveBeenCalledWith(
    expect.objectContaining({ selectedCityIds: ['cebu-city'] }),
  );
});

test('saved tabs use existing favourites, recent IDs and saved-search deserialisation', () => {
  mockSaved = {
    savedSearches: [{ id: 's1', name: 'Near work', listingType: 'rent' }],
    getSearch: jest.fn(() => ({
      listingType: 'rent',
      searchQuery: 'studio',
      minBaths: 2,
    })),
    deleteSearch: jest.fn(),
  };
  render(<SavedPage />);
  expect(container.textContent).toContain('Cebu home');
  click(button('Recently viewed'));
  expect(container.textContent).toContain('Mandaue home');
  click(button('Searches'));
  click(button('Resume search'));
  expect(mockSaved.getSearch).toHaveBeenCalledWith('s1');
  expect(mockSubmitSearch).toHaveBeenCalledWith(
    expect.objectContaining({
      view: 'keyword',
      searchQuery: 'studio',
      minBaths: 2,
    }),
  );
});

test('fee display safely sums numeric API strings without adding rent twice', () => {
  const property = {
    listingType: 'rent',
    price: 25000,
    securityDeposit: '50000',
    advancePay: '25000',
    associationFee: '1500',
    extraFees: 'Confirm cleaning fee',
  };
  expect(moveInFees(property)).toBe(76500);
  render(<PropertyCosts property={property} />);
  expect(container.textContent).toContain('₱76,500');
  expect(container.textContent).toContain('Not specified');
  expect(container.textContent).toContain('Confirm cleaning fee');
});

test('comparison is capped at three real listings', () => {
  render(
    <ComparisonProvider>
      {listings.map((property) => (
        <CompareButton key={property.id} property={property} />
      ))}
    </ComparisonProvider>,
  );
  const buttons = [...container.querySelectorAll('.bb-compare-button')];
  buttons.forEach(click);
  expect(
    container.querySelectorAll('.bb-compare-button[aria-pressed=true]'),
  ).toHaveLength(3);
  expect(container.textContent).toContain('You can compare up to three places');
});

test('map requests preserve price, furnishing, space, location and sort filters', () => {
  expect(
    searchRequest(
      {
        selectedCityIds: ['cebu-city', 'mandaue-city'],
        priceMin: 10000,
        priceMax: 30000,
        minBaths: 2,
        minBeds: 1,
        furnishedFilter: 'furnished',
        sizeRange: { min: 30, max: 80 },
        sortBy: 'price-low',
      },
      'rent',
    ),
  ).toEqual(
    expect.objectContaining({
      cityIds: ['cebu-city', 'mandaue-city'],
      priceMin: 10000,
      priceMax: 30000,
      minBaths: 2,
      minBeds: 1,
      furnished: 'furnished',
      sizeMin: 30,
      sizeMax: 80,
      sort: 'price-asc',
    }),
  );
});

test('empty map search never falls back to unrelated listings', () => {
  mockListings.searchResults = [];
  mockSearch.currentResultsState.rent = {
    listingType: 'rent',
    view: 'city',
    selectedCityIds: ['cebu-city'],
  };
  render(<SearchMapPage />, '/search/map?listingType=rent');
  expect(container.querySelector('[data-testid=map]').textContent).toBe('');
  expect(container.textContent).toContain(
    'No mapped listings match this search',
  );
});

test('owner wizard retains edits across steps and sends the original listing payload', async () => {
  const initial = {
    ...listings[0],
    ownerId: 'owner',
    location: 'Lahug',
    description: 'A real listing description',
    securityDeposit: 50000,
    advancePay: 25000,
    furnished: 'furnished',
    contactInfo: {
      agentName: 'Test Owner',
      email: 'owner@example.test',
      phone: '+630000000',
    },
  };
  render(<AddPropertyForm initialListing={initial} />);
  change(
    container.querySelector(
      'input[placeholder="e.g. Modern 2BR House in Cebu City"]',
    ),
    'Edited Cebu home',
  );
  for (let i = 0; i < 5; i++) await submit(container.querySelector('form'));
  expect(container.textContent).toContain('Step 6 of 6');
  expect(mockUpdateListing).not.toHaveBeenCalled();
  await submit(container.querySelector('form'));
  expect(mockUpdateListing).toHaveBeenCalledWith(
    'r1',
    expect.objectContaining({
      title: 'Edited Cebu home',
      ownerId: 'owner',
      listingType: 'rent',
      securityDeposit: 50000,
      advancePay: 25000,
      furnished: 'furnished',
      description: 'A real listing description',
    }),
  );
});

test('chat sends through the existing thread API handler and preserves failed drafts', async () => {
  render(
    <Routes>
      <Route path="/chat/:threadId" element={<ChatPage />} />
    </Routes>,
    '/chat/t1',
  );
  const input = container.querySelector('textarea');
  change(input, 'Could I view this on Saturday?');
  mockChat.sendMessageByThreadId.mockResolvedValueOnce({
    ok: false,
    error: 'Connection lost',
  });
  await submit(container.querySelector('form'));
  expect(mockChat.sendMessageByThreadId).toHaveBeenCalledWith(
    't1',
    'Could I view this on Saturday?',
    mockUser,
  );
  expect(input.value).toBe('Could I view this on Saturday?');
  expect(container.textContent).toContain('Connection lost');
  await submit(container.querySelector('form'));
  expect(input.value).toBe('');
  expect(container.querySelector('.bb-chat-property').textContent).toContain(
    'Cebu home',
  );
});

test('an incomplete owner form cannot advance or create a listing', async () => {
  render(<AddPropertyForm />);
  await submit(container.querySelector('form'));
  expect(container.querySelector('.bb-step-heading').textContent).toContain(
    'Step 1 of 6',
  );
  expect(mockAddListing).not.toHaveBeenCalled();
});
