import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function write(path, value) {
  fs.writeFileSync(path, value);
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Missing patch target: ${label}`);
  return source.replace(from, to);
}

// Results: do not treat the default Any Price bounds as an active filter or API cap.
{
  const path = 'src/App.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `  const effectivePriceMin = priceMin != null ? priceMin : (currentPriceRange?.min ?? 0);\n  const effectivePriceMax = priceMax != null ? priceMax : (currentPriceRange?.max === Infinity ? (priceSliderConfig[listingType]?.max ?? 10000000) : (currentPriceRange?.max ?? (priceSliderConfig[listingType]?.max ?? 10000000)));`,
    `  const hasExplicitPriceFilter = priceRangeIndex > 0 || priceMin != null || priceMax != null;\n  const effectivePriceMin = priceMin != null ? priceMin : (currentPriceRange?.min ?? 0);\n  const effectivePriceMax = priceMax != null ? priceMax : (currentPriceRange?.max === Infinity ? (priceSliderConfig[listingType]?.max ?? 10000000) : (currentPriceRange?.max ?? (priceSliderConfig[listingType]?.max ?? 10000000)));\n  const requestedPriceMin = hasExplicitPriceFilter ? effectivePriceMin : undefined;\n  const requestedPriceMax = hasExplicitPriceFilter ? effectivePriceMax : undefined;`,
    'explicit price state',
  );
  s = s.replaceAll('priceMin: effectivePriceMin,\n      priceMax: effectivePriceMax,', 'priceMin: requestedPriceMin,\n      priceMax: requestedPriceMax,');
  s = s.replace(
    'listingType, effectivePriceMin, effectivePriceMax, requestedCityParams, propertyType, furnishedFilter, minBeds, minBaths, sizeRange.min, sizeRange.max, searchQuery, sortBy',
    'listingType, requestedPriceMin, requestedPriceMax, requestedCityParams, propertyType, furnishedFilter, minBeds, minBaths, sizeRange.min, sizeRange.max, searchQuery, sortBy',
  );
  s = s.replace(
    'listingType, effectivePriceMin, effectivePriceMax, requestedCityParams, searchQuery, sortBy',
    'listingType, requestedPriceMin, requestedPriceMax, requestedCityParams, searchQuery, sortBy',
  );
  s = replaceRequired(
    s,
    `  const criteriaPriceLabel = useMemo(\n    () => formatSearchPriceRangeLine(effectivePriceMin, effectivePriceMax, listingType, sliderMaxForCriteria),\n    [effectivePriceMin, effectivePriceMax, listingType, sliderMaxForCriteria]\n  );`,
    `  const criteriaPriceLabel = useMemo(\n    () => hasExplicitPriceFilter\n      ? formatSearchPriceRangeLine(effectivePriceMin, effectivePriceMax, listingType, sliderMaxForCriteria)\n      : 'Any price',\n    [hasExplicitPriceFilter, effectivePriceMin, effectivePriceMax, listingType, sliderMaxForCriteria]\n  );`,
    'criteria price label',
  );
  s = replaceRequired(
    s,
    `    if (effectivePriceMin != null || effectivePriceMax != null) count += 1;`,
    `    if (hasExplicitPriceFilter) count += 1;`,
    'results filter count',
  );
  s = s.replace(
    `  }, [propertyType, effectivePriceMin, effectivePriceMax, minBeds, minBaths, furnishedFilter, sizeRange.min, sizeRange.max, searchQuery, selectedSchoolId]);`,
    `  }, [propertyType, hasExplicitPriceFilter, minBeds, minBaths, furnishedFilter, sizeRange.min, sizeRange.max, searchQuery, selectedSchoolId]);`,
  );
  s = replaceRequired(
    s,
    `{(effectivePriceMin != null || effectivePriceMax != null) ? criteriaPriceLabel : 'Price'} <i className="fas fa-chevron-down" aria-hidden />`,
    `{hasExplicitPriceFilter ? criteriaPriceLabel : 'Price'} <i className="fas fa-chevron-down" aria-hidden />`,
    'results price chip',
  );
  s = s.replace(
    'fetchSearchListings({ listingType, priceMin: effectivePriceMin, priceMax: effectivePriceMax, ...requestedCityParams,',
    'fetchSearchListings({ listingType, priceMin: requestedPriceMin, priceMax: requestedPriceMax, ...requestedCityParams,',
  );
  write(path, s);
}

// Add Property: align the real six-step form with the approved first-step hierarchy and copy.
{
  const path = 'src/components/AddPropertyForm.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `const PROPERTY_TYPES = ['House', 'Apartment', 'Condo', 'Land', 'Boarding House', 'Room'];`,
    `const PROPERTY_TYPES = ['Condo', 'Apartment', 'House', 'Room', 'Boarding House', 'Land'];`,
    'property type order',
  );
  s = replaceRequired(
    s,
    `function AddPropertyForm({ initialListing, onSuccess, initialStep = 0 }) {`,
    `function AddPropertyForm({ initialListing, onSuccess, onCancel, initialStep = 0 }) {`,
    'cancel callback',
  );
  s = replaceRequired(s, `  const [listingType, setListingType] = useState('sale');`, `  const [listingType, setListingType] = useState('rent');`, 'default rent');
  s = replaceRequired(s, `  const [propertyType, setPropertyType] = useState('House');`, `  const [propertyType, setPropertyType] = useState('Condo');`, 'default condo');
  s = replaceRequired(
    s,
    `        <form ref={formRef} onSubmit={handleSubmit} className="bb-owner-form">\n          <div className="bb-step-heading"><span>Step {step + 1} of 6</span><strong>{stepNames[step]}</strong></div>\n          <div className="bb-step-progress" aria-hidden="true">{stepNames.map((name, index) => <span key={name} className={index <= step ? 'active' : ''} />)}</div>`,
    `        <div className="bb-owner-editor">\n          <div className="bb-step-heading">\n            <div className="bb-step-heading-meta">\n              <span className="bb-owner-eyebrow">{isEdit ? 'EDIT' : 'LIST'} YOUR PROPERTY</span>\n              <span>{step + 1} of 6</span>\n            </div>\n            <strong>{stepNames[step]}</strong>\n          </div>\n          <div className="bb-step-progress" aria-hidden="true">{stepNames.map((name, index) => <span key={name} className={index <= step ? 'active' : ''} />)}</div>\n          <form ref={formRef} onSubmit={handleSubmit} className="bb-owner-form">`,
    'owner heading hierarchy',
  );
  s = replaceRequired(s, `Title *</label>`, `Give your place a name</label>`, 'title label');
  s = replaceRequired(s, `placeholder="e.g. Modern 2BR House in Cebu City"`, `placeholder="A bright home in Lahug"`, 'title placeholder');
  s = replaceRequired(s, `>Listing type</label>`, `>Listing for</label>`, 'listing label');
  s = replaceRequired(
    s,
    `                  <option value="sale">For Sale</option>\n                  <option value="rent">For Rent</option>`,
    `                  <option value="rent">Rent</option>\n                  <option value="sale">Buy</option>`,
    'listing options',
  );
  s = replaceRequired(
    s,
    `<label className="form-label" htmlFor="listing-field-4">Price (₱) *</label>`,
    `<label className="form-label" htmlFor="listing-field-4">{listingType === 'rent' ? 'Monthly rent (₱)' : 'Asking price (₱)'}</label>`,
    'price label',
  );
  s = replaceRequired(s, `>Location / Barangay</label>`, `>Barangay / neighbourhood</label>`, 'location label');
  s = replaceRequired(s, `placeholder="e.g. Barangay Lahug"`, `placeholder="e.g. Lahug"`, 'location placeholder');
  s = replaceRequired(s, `Size (sqm)`, `Floor area (m²)`, 'size label');
  s = replaceRequired(s, `>Furnished</label>`, `>Furnishing</label>`, 'furnishing label');
  s = replaceRequired(s, `placeholder="Describe the property..."`, `placeholder="Tell someone what living here feels like…"`, 'description placeholder');
  s = replaceRequired(
    s,
    `          <div className="bb-form-navigation">{step > 0 && <button type="button" className="bb-button bb-secondary" onClick={() => setStep(value => value - 1)} disabled={submitting}>Back</button>}\n          <button type="submit" className="bb-button" disabled={submitting}>{step < 5 ? 'Continue' : submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit listing'}</button></div>\n        </form>`,
    `          <div className="bb-form-navigation">\n            {step > 0 ? (\n              <button type="button" className="bb-button bb-secondary" onClick={() => setStep(value => value - 1)} disabled={submitting}>Back</button>\n            ) : (\n              <button type="button" className="bb-button bb-secondary" onClick={() => onCancel?.()} disabled={submitting}>Cancel</button>\n            )}\n            <button type="submit" className="bb-button" disabled={submitting}>\n              {step < 5 ? 'Continue →' : submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for review'}\n            </button>\n          </div>\n        </form>\n        </div>`,
    'owner navigation',
  );
  write(path, s);
}

// Keep migration tests aligned with the accepted owner-form copy.
{
  const path = 'src/__tests__/migration.test.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `'input[placeholder="e.g. Modern 2BR House in Cebu City"]'`,
    `'input[placeholder="A bright home in Lahug"]'`,
    'owner test placeholder',
  );
  s = replaceRequired(s, `'Step 6 of 6'`, `'6 of 6'`, 'owner test final step');
  s = replaceRequired(s, `'Step 1 of 6'`, `'1 of 6'`, 'owner test first step');
  write(path, s);
}

// Make Results QA exercise an actual multi-card Cebu grid rather than a one-card happy path.
{
  const path = 'scripts/capture-react-visual-qa.mjs';
  let s = read(path);
  const marker = `  {\n    id: 'qa-sale-1',`;
  const extra = `  {\n    id: 'qa-rent-5',\n    title: 'Sunny 1BR Condo in Lahug',\n    price: 18000,\n    size: '36 sqm',\n    sizeSqm: 36,\n    location: 'Lahug',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 1,\n    baths: 1,\n    type: 'Condo',\n    images: [svg('Lahug condo', '#e6edf8')],\n    listingType: 'rent',\n    description: 'A compact one-bedroom home close to everyday essentials.',\n    coordinates: { lat: 10.329, lng: 123.904 },\n    contactInfo: { agentName: 'Nina Santos', phone: '+63 917 000 0006', email: 'nina@example.com' },\n    ownerName: 'Nina Santos',\n    ownerId: 'qa-owner-6',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n  },\n  {\n    id: 'qa-rent-6',\n    title: '2BR Apartment near Fuente',\n    price: 22000,\n    size: '55 sqm',\n    sizeSqm: 55,\n    location: 'Capitol Site',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 2,\n    baths: 1,\n    type: 'Apartment',\n    images: [svg('Fuente apartment', '#e8eef5')],\n    listingType: 'rent',\n    description: 'A practical two-bedroom apartment with easy city access.',\n    coordinates: { lat: 10.317, lng: 123.893 },\n    contactInfo: { agentName: 'Leo Yu', phone: '+63 917 000 0007', email: 'leo@example.com' },\n    ownerName: 'Leo Yu',\n    ownerId: 'qa-owner-7',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n  },\n  {\n    id: 'qa-rent-7',\n    title: 'Studio near Cebu Business Park',\n    price: 15000,\n    size: '28 sqm',\n    sizeSqm: 28,\n    location: 'Luz',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 1,\n    baths: 1,\n    type: 'Condo',\n    images: [svg('Business Park studio', '#edf0f5')],\n    listingType: 'rent',\n    description: 'A simple studio for city living near major offices.',\n    coordinates: { lat: 10.323, lng: 123.906 },\n    contactInfo: { agentName: 'Bea Go', phone: '+63 917 000 0008', email: 'bea@example.com' },\n    ownerName: 'Bea Go',\n    ownerId: 'qa-owner-8',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n  },\n  {\n    id: 'qa-rent-8',\n    title: 'Family Apartment in Talamban',\n    price: 28000,\n    size: '72 sqm',\n    sizeSqm: 72,\n    location: 'Talamban',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 3,\n    baths: 2,\n    type: 'Apartment',\n    images: [svg('Talamban apartment', '#e2eaf4')],\n    listingType: 'rent',\n    description: 'A larger apartment with room for a family or home office.',\n    coordinates: { lat: 10.37, lng: 123.91 },\n    contactInfo: { agentName: 'Carlo Tan', phone: '+63 917 000 0009', email: 'carlo@example.com' },\n    ownerName: 'Carlo Tan',\n    ownerId: 'qa-owner-9',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n  },\n`;
  if (!s.includes("id: 'qa-rent-5'")) {
    if (!s.includes(marker)) throw new Error('Missing QA sale fixture marker');
    s = s.replace(marker, `${extra}${marker}`);
  }
  write(path, s);
}

console.log('Applied remaining Results and owner-form parity corrections.');
