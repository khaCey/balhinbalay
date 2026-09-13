import fs from 'node:fs';

function read(path) { return fs.readFileSync(path, 'utf8'); }
function write(path, value) { fs.writeFileSync(path, value); }
function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Missing patch target: ${label}`);
  return source.replace(from, to);
}

// Results: do not count the default Any Price bounds as an active filter.
{
  const path = 'src/App.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `  const activeResultsFilterCount = useMemo(() => {\n    let count = 0;\n    if (propertyType) count += 1;\n    if (effectivePriceMin != null || effectivePriceMax != null) count += 1;`,
    `  const hasExplicitPriceFilter =\n    priceRangeIndex > 0 || priceMin != null || priceMax != null;\n  const activeResultsFilterCount = useMemo(() => {\n    let count = 0;\n    if (propertyType) count += 1;\n    if (hasExplicitPriceFilter) count += 1;`,
    'results explicit price filter',
  );
  s = replaceRequired(
    s,
    `  }, [propertyType, effectivePriceMin, effectivePriceMax, minBeds, minBaths, furnishedFilter, sizeRange.min, sizeRange.max, searchQuery, selectedSchoolId]);`,
    `  }, [propertyType, hasExplicitPriceFilter, minBeds, minBaths, furnishedFilter, sizeRange.min, sizeRange.max, searchQuery, selectedSchoolId]);`,
    'results filter deps',
  );
  s = replaceRequired(
    s,
    `{(effectivePriceMin != null || effectivePriceMax != null) ? criteriaPriceLabel : 'Price'} <i className="fas fa-chevron-down" aria-hidden />`,
    `{hasExplicitPriceFilter ? criteriaPriceLabel : 'Price'} <i className="fas fa-chevron-down" aria-hidden />`,
    'results price chip',
  );
  write(path, s);
}

// Comparison button can carry detail-page copy without changing card copy.
{
  const path = 'src/components/ui/Comparison.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `export function CompareButton({ property }) {`,
    `export function CompareButton({ property, label = 'Compare', selectedLabel = label, className = '' }) {`,
    'compare props',
  );
  s = replaceRequired(
    s,
    `      className="bb-compare-button"`,
    `      className={\`bb-compare-button ${className}\`.trim()}`,
    'compare class',
  );
  s = replaceRequired(
    s,
    `      Compare\n    </button>`,
    `      {selected ? selectedLabel : label}\n    </button>`,
    'compare label',
  );
  write(path, s);
}

// Property detail: restore accepted prototype cues that do not depend on unresolved privacy/backend decisions.
{
  const path = 'src/components/PropertyDetailContent.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `import { Icon } from './ui/Controls';`,
    `import { Icon } from './ui/Controls';\nimport { CompareButton } from './ui/Comparison';`,
    'detail compare import',
  );
  s = replaceRequired(
    s,
    `  showBackButton = false,\n  onBack,`,
    `  showBackButton = false,\n  onBack,\n  backLabel = 'Back',`,
    'detail back label prop',
  );
  s = replaceRequired(
    s,
    `  const owner = user && property.ownerId === user.id;`,
    `  const owner = user && property.ownerId === user.id;\n  const featureLabels = Array.isArray(property.features)\n    ? property.features\n    : Array.isArray(property.tags)\n      ? property.tags\n      : [];`,
    'detail feature labels',
  );
  s = replaceRequired(
    s,
    `            Back\n          </button>`,
    `            {backLabel}\n          </button>`,
    'detail back copy',
  );
  s = replaceRequired(
    s,
    `            <p className="bb-description">\n              {property.description || 'No description provided.'}\n            </p>`,
    `            <p className="bb-description">\n              {property.description || 'No description provided.'}\n            </p>\n            {featureLabels.length > 0 && (\n              <div className="bb-detail-chips" aria-label="Property features">\n                {featureLabels.map((feature) => (\n                  <span className="bb-detail-chip" key={feature}>\n                    <Icon name="check" />\n                    {feature}\n                  </span>\n                ))}\n              </div>\n            )}`,
    'detail feature chips',
  );
  s = replaceRequired(
    s,
    `            ) : (\n              <button\n                className="bb-text-button"\n                type="button"\n                onClick={() => {\n                  if (!user) {\n                    onLoginForChat?.();\n                    return;\n                  }\n                  setReportSubmitted(false);\n                  setReportReason('');\n                  setReportError('');\n                  setShowReport(true);\n                }}\n              >\n                Report listing\n              </button>\n            )}`,
    `            ) : (\n              <>\n                <CompareButton\n                  property={property}\n                  label="Add to comparison"\n                  selectedLabel="Added to comparison"\n                  className="bb-detail-compare"\n                />\n                <button\n                  className="bb-text-button bb-detail-report"\n                  type="button"\n                  onClick={() => {\n                    if (!user) {\n                      onLoginForChat?.();\n                      return;\n                    }\n                    setReportSubmitted(false);\n                    setReportReason('');\n                    setReportError('');\n                    setShowReport(true);\n                  }}\n                >\n                  Report listing\n                </button>\n              </>\n            )}`,
    'detail comparison action',
  );
  write(path, s);
}

// Property route: restore context-aware back copy.
{
  const path = 'src/pages/PropertyPage.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `  const handleOpenChat = async (p) => {`,
    `  const backLabel =\n    typeof location.state?.from === 'string' && location.state.from.startsWith('/saved')\n      ? 'Back to saved places'\n      : typeof location.state?.from === 'string' && location.state.from.startsWith('/search/map')\n        ? 'Back to map'\n        : 'Back to results';\n\n  const handleOpenChat = async (p) => {`,
    'property back label',
  );
  s = replaceRequired(
    s,
    `            showBackButton\n            onBack={handleBack}\n            isPropertyPageLayout`,
    `            showBackButton\n            onBack={handleBack}\n            backLabel={backLabel}\n            isPropertyPageLayout`,
    'property back label prop',
  );
  write(path, s);
}

// Add-property flow: keep mobile nav visible and use the approved owner-entry hierarchy.
{
  const path = 'src/components/MainLayout.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `  const hideBottomNav =\n    path.startsWith('/chat/') ||\n    path.startsWith('/add-property') ||\n    path === '/admin';`,
    `  const hideBottomNav =\n    path.startsWith('/chat/') ||\n    path === '/admin';`,
    'add-property bottom nav',
  );
  write(path, s);
}

{
  const path = 'src/pages/AddPropertyPage.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `  const handleBack = () => {\n    navigate(-1);\n  };`,
    `  const handleBack = () => {\n    navigate('/my-properties');\n  };`,
    'owner back destination',
  );
  s = replaceRequired(
    s,
    `  return (\n    <div className="add-property-page page-with-header minimal-page">\n      <PageHeader\n        title={isEdit ? 'Edit property' : 'Add property'}\n        onBack={handleBack}\n      />\n      <main className="page-content">\n        <div className="page-section add-property-page-form">\n          <AddPropertyForm\n            key={id || 'new'}\n            initialListing={initialListing}\n            initialStep={\n              isEdit && searchParams.get('section') === 'availability' ? 3 : 0\n            }\n            onSuccess={handleSuccess}\n          />\n        </div>\n      </main>\n    </div>\n  );`,
    `  return (\n    <div className="add-property-page page-with-header minimal-page">\n      <main className="page-content">\n        <button type="button" className="bb-text-button bb-owner-back" onClick={handleBack}>\n          <span aria-hidden="true">←</span> My properties\n        </button>\n        <div className="page-section add-property-page-form">\n          <AddPropertyForm\n            key={id || 'new'}\n            initialListing={initialListing}\n            initialStep={\n              isEdit && searchParams.get('section') === 'availability' ? 3 : 0\n            }\n            onSuccess={handleSuccess}\n            onCancel={handleBack}\n          />\n        </div>\n      </main>\n    </div>\n  );`,
    'owner page hierarchy',
  );
  write(path, s);
}

{
  const path = 'src/components/AddPropertyForm.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `const PROPERTY_TYPES = ['House', 'Apartment', 'Condo', 'Land', 'Boarding House', 'Room'];`,
    `const PROPERTY_TYPES = ['Condo', 'Apartment', 'House', 'Room', 'Boarding House', 'Land'];`,
    'owner property type order',
  );
  s = replaceRequired(
    s,
    `function AddPropertyForm({ initialListing, onSuccess, initialStep = 0 }) {`,
    `function AddPropertyForm({ initialListing, onSuccess, onCancel, initialStep = 0 }) {`,
    'owner cancel prop',
  );
  s = replaceRequired(s, `  const [listingType, setListingType] = useState('sale');`, `  const [listingType, setListingType] = useState('rent');`, 'owner default listing type');
  s = replaceRequired(s, `  const [propertyType, setPropertyType] = useState('House');`, `  const [propertyType, setPropertyType] = useState('Condo');`, 'owner default property type');
  s = replaceRequired(
    s,
    `        <form ref={formRef} onSubmit={handleSubmit} className="bb-owner-form">\n          <div className="bb-step-heading"><span>Step {step + 1} of 6</span><strong>{stepNames[step]}</strong></div>\n          <div className="bb-step-progress" aria-hidden="true">{stepNames.map((name, index) => <span key={name} className={index <= step ? 'active' : ''} />)}</div>`,
    `        <div className="bb-owner-editor">\n          <div className="bb-step-heading">\n            <div className="bb-step-heading-meta">\n              <span className="bb-owner-eyebrow">{isEdit ? 'EDIT' : 'LIST'} YOUR PROPERTY</span>\n              <span>{step + 1} of 6</span>\n            </div>\n            <strong>{stepNames[step]}</strong>\n          </div>\n          <div className="bb-step-progress" aria-hidden="true">{stepNames.map((name, index) => <span key={name} className={index <= step ? 'active' : ''} />)}</div>\n          <form ref={formRef} onSubmit={handleSubmit} className="bb-owner-form">`,
    'owner heading outside panel',
  );
  s = replaceRequired(s, `Title *</label>`, `Give your place a name</label>`, 'owner title label');
  s = replaceRequired(s, `placeholder="e.g. Modern 2BR House in Cebu City"`, `placeholder="A bright home in Lahug"`, 'owner title placeholder');
  s = replaceRequired(s, `>Listing type</label>`, `>Listing for</label>`, 'owner listing label');
  s = replaceRequired(
    s,
    `                  <option value="sale">For Sale</option>\n                  <option value="rent">For Rent</option>`,
    `                  <option value="rent">Rent</option>\n                  <option value="sale">Buy</option>`,
    'owner listing options',
  );
  s = replaceRequired(
    s,
    `<label className="form-label" htmlFor="listing-field-4">Price (₱) *</label>`,
    `<label className="form-label" htmlFor="listing-field-4">{listingType === 'rent' ? 'Monthly rent (₱)' : 'Asking price (₱)'}</label>`,
    'owner price label',
  );
  s = replaceRequired(s, `>Location / Barangay</label>`, `>Barangay / neighbourhood</label>`, 'owner area label');
  s = replaceRequired(s, `placeholder="e.g. Barangay Lahug"`, `placeholder="e.g. Lahug"`, 'owner area placeholder');
  s = replaceRequired(s, `Size (sqm)`, `Floor area (m²)`, 'owner size label');
  s = replaceRequired(s, `>Furnished</label>`, `>Furnishing</label>`, 'owner furnishing label');
  s = replaceRequired(s, `placeholder="Describe the property..."`, `placeholder="Tell someone what living here feels like…"`, 'owner description placeholder');
  s = replaceRequired(
    s,
    `          <div className="bb-form-navigation">{step > 0 && <button type="button" className="bb-button bb-secondary" onClick={() => setStep(value => value - 1)} disabled={submitting}>Back</button>}\n          <button type="submit" className="bb-button" disabled={submitting}>{step < 5 ? 'Continue' : submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit listing'}</button></div>\n        </form>`,
    `          <div className="bb-form-navigation">\n            {step > 0 ? (\n              <button type="button" className="bb-button bb-secondary" onClick={() => setStep(value => value - 1)} disabled={submitting}>Back</button>\n            ) : (\n              <button type="button" className="bb-button bb-secondary" onClick={() => onCancel?.()} disabled={submitting}>Cancel</button>\n            )}\n            <button type="submit" className="bb-button" disabled={submitting}>\n              {step < 5 ? 'Continue →' : submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for review'}\n            </button>\n          </div>\n        </form>\n        </div>`,
    'owner form navigation',
  );
  write(path, s);
}

// Make QA screenshots exercise the approved five-card Cebu rental grid.
{
  const path = 'scripts/capture-react-visual-qa.mjs';
  let s = read(path);
  s = replaceRequired(s, `title: 'Bright 2BR Condo near IT Park'`, `title: 'A bright little home near IT Park'`, 'qa first title');
  s = replaceRequired(s, `price: 24000`, `price: 25000`, 'qa first price');
  s = replaceRequired(s, `size: '58 sqm'`, `size: '42 sqm'`, 'qa first size');
  s = replaceRequired(s, `sizeSqm: 58`, `sizeSqm: 42`, 'qa first sqm');
  s = replaceRequired(s, `beds: 2,\n    baths: 1,`, `beds: 1,\n    baths: 1,`, 'qa first beds');
  s = replaceRequired(s, `description: 'A bright furnished condo close to everyday essentials and transport.'`, `description: 'A light-filled condo in Lahug, with comfortable living space and an easy everyday layout.'`, 'qa first description');
  s = replaceRequired(s, `contactInfo: { agentName: 'Ana Reyes', phone: '+63 917 000 0001', email: 'ana@example.com' },\n    ownerName: 'Ana Reyes',`, `contactInfo: { agentName: 'Maria Santos', phone: '+63 917 000 0001', email: 'maria@example.com' },\n    ownerName: 'Maria Santos',`, 'qa first owner');
  const marker = `  {\n    id: 'qa-rent-2',`;
  const extra = `  {\n    id: 'qa-rent-5',\n    title: 'Slow mornings in Talamban',\n    price: 32000,\n    size: '64 sqm',\n    sizeSqm: 64,\n    location: 'Talamban',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 2,\n    baths: 2,\n    type: 'Apartment',\n    images: [svg('Talamban apartment', '#e8edf7')],\n    listingType: 'rent',\n    furnishing: 'Furnished',\n    furnished: 'Furnished',\n    description: 'A calm two-bedroom apartment with room for slower mornings.',\n    coordinates: { lat: 10.357, lng: 123.914 },\n    contactInfo: { agentName: 'Andrea Lim', phone: '+63 917 000 0005', email: 'andrea@example.com' },\n    ownerName: 'Andrea Lim',\n    ownerId: 'qa-owner-5',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n    features: ['Furnished', 'Pet-friendly', 'With parking'],\n  },\n  {\n    id: 'qa-rent-6',\n    title: 'Your own space, close to campus',\n    price: 14000,\n    size: '25 sqm',\n    sizeSqm: 25,\n    location: 'Lahug',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 0,\n    baths: 1,\n    type: 'Studio',\n    images: [svg('Campus studio', '#e4ebf7')],\n    listingType: 'rent',\n    furnishing: 'Furnished',\n    furnished: 'Furnished',\n    description: 'A compact studio close to campus and everyday essentials.',\n    coordinates: { lat: 10.32, lng: 123.9 },\n    contactInfo: { agentName: 'Maria Santos', phone: '+63 917 000 0006', email: 'maria@example.com' },\n    ownerName: 'Maria Santos',\n    ownerId: 'qa-owner-2',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n    features: ['Furnished', 'Near a mall'],\n  },\n  {\n    id: 'qa-rent-7',\n    title: 'Light-filled living in Banilad',\n    price: 35000,\n    size: '68 sqm',\n    sizeSqm: 68,\n    location: 'Banilad',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 2,\n    baths: 2,\n    type: 'Condo',\n    images: [svg('Banilad condo', '#ece9e2')],\n    listingType: 'rent',\n    furnishing: 'Furnished',\n    furnished: 'Furnished',\n    description: 'A light-filled two-bedroom condo in Banilad.',\n    coordinates: { lat: 10.34, lng: 123.912 },\n    contactInfo: { agentName: 'Andrea Lim', phone: '+63 917 000 0007', email: 'andrea@example.com' },\n    ownerName: 'Andrea Lim',\n    ownerId: 'qa-owner-5',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n    features: ['Furnished', 'Pet-friendly', 'Near a mall'],\n  },\n  {\n    id: 'qa-rent-8',\n    title: 'Simple living near the university',\n    price: 6500,\n    size: '16 sqm',\n    sizeSqm: 16,\n    location: 'Talamban',\n    city: 'Cebu City',\n    cityId: 'cebu-city',\n    beds: 1,\n    baths: 1,\n    type: 'Boarding House',\n    images: [svg('University room', '#e6efe8')],\n    listingType: 'rent',\n    furnishing: 'Furnished',\n    furnished: 'Furnished',\n    description: 'A simple furnished room near the university.',\n    coordinates: { lat: 10.359, lng: 123.911 },\n    contactInfo: { agentName: 'Andrea Lim', phone: '+63 917 000 0008', email: 'andrea@example.com' },\n    ownerName: 'Andrea Lim',\n    ownerId: 'qa-owner-5',\n    status: 'approved',\n    sold: false,\n    currentlyRented: false,\n    features: ['Furnished'],\n  },\n`;
  if (!s.includes(`id: 'qa-rent-5'`)) {
    if (!s.includes(marker)) throw new Error('Missing QA insertion marker');
    s = s.replace(marker, extra + marker);
  }
  write(path, s);
}

// Final CSS for the safe detail/editor parity work.
write('src/styles/detail-owner-final-parity.css', `/* Final property-detail and owner-editor parity corrections. */\n.bb-detail-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.bb-detail-chip{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:7px 11px;border:1px solid var(--bb-line);border-radius:999px;background:#fff;color:var(--bb-muted);font-size:12px}.bb-detail-chip svg{width:14px;height:14px;color:var(--bb-blue)}.bb-detail .bb-detail-tools:last-of-type{display:flex;align-items:center;justify-content:space-between;gap:16px}.bb-detail-compare{border:0;background:transparent;color:var(--bb-blue-hover);padding:8px 0;font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:5px}.bb-detail-compare svg{width:14px;height:14px}.bb-detail-report{color:var(--bb-muted)!important}.add-property-page{max-width:700px}.add-property-page .page-content{padding-top:0}.bb-owner-back{margin:14px 0 16px;color:var(--bb-muted)}.bb-owner-editor{width:100%}.bb-step-heading{margin:0 0 10px}.bb-step-heading-meta{display:flex;align-items:center;justify-content:space-between;gap:16px;color:var(--bb-muted);font-size:12px}.bb-owner-eyebrow{color:var(--bb-blue-hover);font-weight:700;letter-spacing:1.3px}.bb-step-heading>strong{display:block;margin-top:7px;color:var(--bb-ink);font-size:30px;line-height:1.15;letter-spacing:-.8px}.bb-step-progress{margin:0 0 18px}.bb-owner-form{padding:20px}.bb-form-step{margin:0;padding:0;border:0;min-inline-size:0}.bb-form-step>legend{display:none}.bb-owner-form .form-label{color:var(--bb-ink);font-size:13px;font-weight:600}.bb-owner-form .form-control,.bb-owner-form .form-select{min-height:46px;border:1px solid #ccd9e7;border-radius:10px;background:#fff}.bb-owner-form textarea.form-control{min-height:112px}.bb-form-navigation{margin-top:22px;padding-top:18px}.bb-form-navigation .bb-button{min-width:112px}.bb-form-navigation .bb-button:last-child{margin-left:auto}@media(min-width:760px){.bb-step-heading>strong{font-size:34px}.bb-owner-form{padding:24px}}\n`);

{
  const path = 'src/index.js';
  let s = read(path);
  s = replaceRequired(
    s,
    `import './styles/search-final-parity.css';`,
    `import './styles/search-final-parity.css';\nimport './styles/detail-owner-final-parity.css';`,
    'final parity css import',
  );
  write(path, s);
}

console.log('Applied Results, detail, owner-flow, and QA-fixture parity continuation.');
