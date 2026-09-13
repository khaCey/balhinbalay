import fs from 'node:fs';

const path = 'scripts/capture-react-visual-qa.mjs';
let s = fs.readFileSync(path, 'utf8');
const from = `    const mapButton = page.locator('.minimal-results-map-btn');\n    if (await mapButton.count()) {\n      await mapButton.click();\n      await page.waitForURL(/\\/search\\/map/, { timeout: 15000 });\n      await capture(page, \`react-map-${'${viewport.suffix}'}\`);\n    }`;
const to = `    await page.goto(\`${'${baseUrl}'}/search/map?listingType=rent\`);\n    await capture(page, \`react-map-${'${viewport.suffix}'}\`);`;
if (!s.includes(from)) throw new Error('Visual QA map navigation target not found');
s = s.replace(from, to);
fs.writeFileSync(path, s);
