import fs from 'node:fs';

// One-shot migration patch. Delete this helper after the branch commit is applied.
const file = 'src/components/AddPropertyForm.js';
let source = fs.readFileSync(file, 'utf8');

const oldConstants = "const REGIONS_OPTIONS = philippineRegions.filter((r) => r.id !== 'all');\nconst REGIONS_WITH_CITIES = getRegionIdsWithCities();\nconst DEFAULT_REGION = REGIONS_WITH_CITIES[0] || 'region-vii';";
const newConstants = "const REGIONS_OPTIONS = philippineRegions.filter((r) => r.id !== 'all');\nconst REGIONS_WITH_CITIES = getRegionIdsWithCities();\nconst DEFAULT_CITY_ID = 'cebu-city';\nconst DEFAULT_CITY = getCityById(DEFAULT_CITY_ID);\nconst DEFAULT_REGION =\n  DEFAULT_CITY?.regionId ||\n  (REGIONS_WITH_CITIES.includes('region-vii') ? 'region-vii' : (REGIONS_WITH_CITIES[0] || 'region-vii'));\nconst DEFAULT_PROVINCE =\n  DEFAULT_CITY?.province || getProvincesByRegion(DEFAULT_REGION)[0] || '';";

const oldState = "  const [regionId, setRegionId] = useState(DEFAULT_REGION);\n  const [province, setProvince] = useState(() => {\n    const p = getProvincesByRegion(DEFAULT_REGION);\n    return p[0] || '';\n  });\n  const [cityId, setCityId] = useState('cebu-city');";
const newState = "  const [regionId, setRegionId] = useState(DEFAULT_REGION);\n  const [province, setProvince] = useState(DEFAULT_PROVINCE);\n  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);";

if (!source.includes(oldConstants)) {
  if (source.includes("const DEFAULT_CITY_ID = 'cebu-city';")) {
    console.log('Default-location fix already applied.');
    process.exit(0);
  }
  throw new Error('Could not find the expected default-region block.');
}
if (!source.includes(oldState)) {
  throw new Error('Could not find the expected default province/city state block.');
}

source = source.replace(oldConstants, newConstants).replace(oldState, newState);
fs.writeFileSync(file, source);
console.log('Owner form now defaults consistently to Cebu City / Cebu / Region VII.');
