// Render exact source excerpts prepared by prepare-assignment5-code-views.py.
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8765/';
(async () => {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
        const keys = JSON.parse(await fs.readFile('tmp/code/index.json', 'utf8'));
        for (const key of keys) {
            await page.goto(new URL('tmp/code/' + key + '.html', baseURL).href);
            await page.locator('body').screenshot({ path: path.resolve('docs/assignment-5/screenshots/code-' + key + '.png') });
        }
        console.log('Captured ' + keys.length + ' current code excerpts.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
