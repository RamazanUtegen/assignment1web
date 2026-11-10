// Run with Playwright in NODE_PATH and a local server at KZ_TRAVEL_BASE_URL.
// KZ_TRAVEL_CHROME_PATH optionally selects an installed Chromium browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8765/';

(async () => {
    const browser = await chromium.launch({ headless: true,
        ...(process.env.KZ_TRAVEL_CHROME_PATH ? { executablePath: process.env.KZ_TRAVEL_CHROME_PATH } : {}) });
    let failures = 0;
    async function check(name, viewport, run) {
        const page = await browser.newPage({ viewport });
        try {
            await run(page);
            console.log('PASS ' + name);
        } catch (error) {
            failures += 1;
            console.error('FAIL ' + name + ': ' + error.message);
        } finally { await page.close(); }
    }
    try {
        // 720 × 450 CSS pixels is the reflow viewport of a 1440 × 900 window at 200% zoom.
        for (const viewport of [{ width: 390, height: 844 }, { width: 720, height: 450 }]) {
            for (const [rail, controls] of [['.page-subnav', '.section-links a'], ['.gallery-thumbnails', '.gallery-thumb']]) {
                await check('Keyboard focus fully reveals ' + rail + ' at ' + viewport.width + 'px', viewport, async page => {
                    await page.goto(new URL('index.html', baseURL).href, { waitUntil: 'networkidle' });
                    const targets = page.locator(controls);
                    await targets.first().focus();
                    const issues = [];
                    for (let index = 0; index < await targets.count(); index += 1) {
                        if (index) await page.keyboard.press('Tab');
                        assert.equal(await targets.nth(index).evaluate(element => element === document.activeElement), true);
                        const visible = await targets.nth(index).evaluate((element, railSelector) => {
                            const rect = element.getBoundingClientRect();
                            const bounds = element.closest(railSelector).getBoundingClientRect();
                            const style = getComputedStyle(element);
                            const extent = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset));
                            return {
                                label: element.getAttribute('aria-label') || element.textContent.trim(),
                                fullTarget: rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1,
                                fullOutline: rect.left - extent >= bounds.left - 1 && rect.right + extent <= bounds.right + 1,
                                clearHeader: rect.top >= document.querySelector('#main-header').getBoundingClientRect().bottom,
                                inViewport: rect.bottom <= innerHeight + 1
                            };
                        }, rail);
                        if (!visible.fullTarget || !visible.fullOutline || !visible.clearHeader || !visible.inViewport) issues.push(visible);
                    }
                    assert.deepEqual(issues, [], 'Clipped or obscured keyboard focus: ' + JSON.stringify(issues));
                });
            }
            await check('Checkbox error preserves its readable label at ' + viewport.width + 'px', viewport, async page => {
                await page.goto(new URL('about.html', baseURL).href, { waitUntil: 'networkidle' });
                await page.locator('[data-popup-open]').click();
                await page.locator('dialog button[type="submit"]').click();
                const geometry = await page.locator('#demo-notice').evaluate(checkbox => {
                    const label = checkbox.labels[0].getBoundingClientRect();
                    const error = document.getElementById('demo-notice-error').getBoundingClientRect();
                    return { labelWidth: label.width, errorTop: error.top, labelBottom: label.bottom,
                        described: checkbox.getAttribute('aria-describedby') };
                });
                assert.ok(geometry.labelWidth > 200, 'The checkbox label was squeezed beside its error');
                assert.ok(geometry.errorTop >= geometry.labelBottom, 'The checkbox error should follow the full checkbox/label row');
                assert.match(geometry.described, /demo-notice-error/);
                assert.equal(await page.locator('#contact-name').evaluate(element => element === document.activeElement), true);
                await page.locator('#contact-name').fill('Sam');
                await page.locator('#contact-email').fill('sam@example.com');
                await page.locator('#contact-message').fill('Tell me about Almaty.');
                await page.locator('#demo-notice').check();
                await page.locator('dialog button[type="submit"]').click();
                assert.match(await page.locator('dialog .form-status').textContent(), /passed validation/);
                await page.keyboard.press('Escape');
                assert.equal(await page.locator('[data-popup-open]').evaluate(element => element === document.activeElement), true);
            });
        }
    } finally { await browser.close(); }
    if (failures) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
