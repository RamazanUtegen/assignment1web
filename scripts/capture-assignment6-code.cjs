const { chromium } = require('playwright');
const path = require('node:path');
const fs = require('node:fs/promises');
(async () => {
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ viewport: { width: 1180, height: 1000 }, deviceScaleFactor: 1.5 });
        const output = path.resolve('docs/assignment-6/screenshots');
        await fs.mkdir(output, { recursive: true });
        for (let i = 0; i <= 9; i += 1) {
            await page.goto('http://127.0.0.1:8765/tmp/assignment6-code/' + i + '.html');
            await page.locator('body').screenshot({ path: path.join(output, 'code-' + i + '.png') });
        }
        console.log('Captured all 10 source screenshots.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
