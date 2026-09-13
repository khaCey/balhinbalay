import fs from 'node:fs';

const formFile = 'src/components/AddPropertyForm.js';
let form = fs.readFileSync(formFile, 'utf8');

form = form.replace("import MapPicker from './MapPicker';\n", '');
form = form.replace("  const [showMapPicker, setShowMapPicker] = useState(false);\n", '');
form = form.replace("      setShowMapPicker(false);\n", '');
form = form.replace(
  "      setSubmitError('Add a location/barangay or pin the exact spot on the map.');",
  "      setSubmitError('Add a barangay or neighbourhood.');",
);

const mapBlock = `            <div className="mb-2">\n              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowMapPicker((p) => !p)}>\n                <i className="fas fa-map-marker-alt me-1" aria-hidden />\n                {showMapPicker ? 'Hide map' : 'Pick location on map'}\n              </button>\n            </div>\n            {showMapPicker && (\n              <div className="mb-3">\n                <MapPicker\n                  center={\n                    (location.trim() && getBarangayCoordinates(location.trim(), getCityById(validCityId)?.displayName || 'Cebu City'))\n                    || getCityById(validCityId)?.coordinates\n                    || { lat: 10.3157, lng: 123.8854 }\n                  }\n                  markerPosition={\n                    manualLat && manualLng && !Number.isNaN(parseFloat(manualLat)) && !Number.isNaN(parseFloat(manualLng))\n                      ? { lat: parseFloat(manualLat), lng: parseFloat(manualLng) }\n                      : null\n                  }\n                  onPick={({ lat, lng }) => {\n                    setManualLat(lat.toFixed(6));\n                    setManualLng(lng.toFixed(6));\n                  }}\n                  height={240}\n                />\n              </div>\n            )}\n`;

if (form.includes(mapBlock)) {
  form = form.replace(mapBlock, '');
} else if (form.includes('Pick location on map')) {
  throw new Error('Owner map UI changed; refusing to remove an unknown block.');
}

fs.writeFileSync(formFile, form);

const qaFile = 'scripts/capture-owner-form-visual-qa.mjs';
let qa = fs.readFileSync(qaFile, 'utf8');
const oldQaBlock = `  await page.getByLabel('Barangay / neighbourhood').fill('Lahug');\n  await page.getByRole('button', { name: /Pick location on map/i }).click();\n  await page.waitForTimeout(900);\n  await capture(page, \`owner-new-step-2-map-state-\${suffix}\`);\n  await page.getByRole('button', { name: /Hide map/i }).click();\n  await page.getByRole('button', { name: 'Continue →' }).click();`;
const newQaBlock = `  await page.getByLabel('Barangay / neighbourhood').fill('Lahug');\n  const exactMapControls = await page.getByRole('button', { name: /Pick location on map|Hide map/i }).count();\n  if (exactMapControls !== 0) {\n    throw new Error('Exact map-pin input must stay hidden until IDE0068 has backend privacy enforcement.');\n  }\n  await page.getByRole('button', { name: 'Continue →' }).click();`;

if (qa.includes(oldQaBlock)) {
  qa = qa.replace(oldQaBlock, newQaBlock);
} else if (!qa.includes('Exact map-pin input must stay hidden')) {
  throw new Error('Could not find the expected owner QA map block.');
}
fs.writeFileSync(qaFile, qa);

console.log('Hidden unsupported exact-map input and updated owner-form QA.');
