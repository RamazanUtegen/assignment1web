// Run with Playwright available in NODE_PATH. A local server is optional:
// KZ_TRAVEL_BASE_URL=http://127.0.0.1:8765/ node scripts/verify-improvements.cjs
// Set KZ_TRAVEL_CHROME_PATH when using a system Chromium installation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || pathToFileURL(path.resolve(__dirname, '../index.html')).href;

(async () => {
    const browser = await chromium.launch({ headless: true,
        ...(process.env.KZ_TRAVEL_CHROME_PATH ? { executablePath: process.env.KZ_TRAVEL_CHROME_PATH } : {}) });
    let failures = 0;
    async function check(name, viewport, run) {
        const page = await browser.newPage({ viewport });
        try {
            await page.goto(new URL('index.html', baseURL).href);
            await run(page);
            console.log('PASS ' + name);
        } catch (error) {
            failures += 1;
            console.error('FAIL ' + name + ': ' + error.message);
        } finally { await page.close(); }
    }
    const mobile = { width: 390, height: 844 };
    const desktop = { width: 1440, height: 1000 };
    try {
        await check('Mobile trip link closes the menu and reveals its target', mobile, async page => {
            await page.locator('.navbar-toggler').click();
            await page.waitForFunction(() => document.querySelector('#main-navigation').classList.contains('show'));
            await page.locator('.plan-link').click();
            assert.equal(await page.locator('.navbar-toggler').getAttribute('aria-expanded'), 'false');
            await page.locator('#main-navigation').waitFor({ state: 'hidden' });
            assert.equal(await page.evaluate(() => document.querySelector('#planner-title').getBoundingClientRect().top >=
                document.querySelector('#main-header').getBoundingClientRect().bottom), true, 'Planner heading remains visible below the sticky header');
            assert.equal(await page.locator('#trip-planner').evaluate(element => element === document.activeElement), true);
        });
        if (new URL(baseURL).protocol !== 'file:') {
            await check('Trip link from the root URL reveals the planner', mobile, async page => {
                await page.goto(new URL('./', baseURL).href);
                await page.locator('.navbar-toggler').click();
                await page.waitForFunction(() => document.querySelector('#main-navigation').classList.contains('show'));
                await page.locator('.plan-link').click();
                await page.waitForURL(url => url.hash === '#trip-planner');
                await page.locator('#main-navigation').waitFor({ state: 'hidden' });
                assert.equal(await page.evaluate(() => document.querySelector('#planner-title').getBoundingClientRect().top >=
                    document.querySelector('#main-header').getBoundingClientRect().bottom), true);
            });
        }
        for (const modifier of ['Control', 'Meta', 'Shift', 'Alt']) {
            await check('Modified trip click preserves browser behavior: ' + modifier, mobile, async page => {
                await page.locator('.navbar-toggler').click();
                await page.waitForFunction(() => document.querySelector('#main-navigation').classList.contains('show'));
                await page.locator('.plan-link').click({ modifiers: [modifier] });
                assert.equal(await page.locator('.navbar-toggler').getAttribute('aria-expanded'), 'true');
            });
        }
        await check('Middle trip click preserves browser behavior', mobile, async page => {
            await page.locator('.navbar-toggler').click();
            await page.waitForFunction(() => document.querySelector('#main-navigation').classList.contains('show'));
            await page.locator('.plan-link').click({ button: 'middle' });
            assert.equal(await page.locator('.navbar-toggler').getAttribute('aria-expanded'), 'true');
        });
        await check('Escape closes mobile navigation and returns focus', mobile, async page => {
            await page.locator('.navbar-toggler').click();
            await page.waitForFunction(() => document.querySelector('#main-navigation').classList.contains('show'));
            await page.locator('#main-navigation .nav-link').first().focus();
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('.navbar-toggler').getAttribute('aria-expanded'), 'false');
            await page.locator('#main-navigation').waitFor({ state: 'hidden' });
            assert.equal(await page.locator('.navbar-toggler').evaluate(element => element === document.activeElement), true);
        });
        await check('Navigation Escape handling preserves the contact dialog', mobile, async page => {
            await page.goto(new URL('about.html', baseURL).href);
            await page.locator('.navbar-toggler').click();
            await page.waitForFunction(() => document.querySelector('#main-navigation').classList.contains('show'));
            await page.locator('[data-popup-open]').click();
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('#contact-popup').isVisible(), false);
        });
        await check('Removing the last saved city keeps keyboard focus on Saved', desktop, async page => {
            await page.locator('[data-save="aktau"]').click();
            await page.locator('[data-filter="saved"]').click();
            await page.locator('[data-save="aktau"]').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-no-results]').isVisible(), true);
            assert.equal(await page.locator('[data-filter="saved"]').evaluate(element => element === document.activeElement), true);
        });
        await check('Removing one saved city focuses another visible saved city', desktop, async page => {
            await page.locator('[data-save="aktau"]').click();
            await page.locator('[data-save="astana"]').click();
            await page.locator('[data-filter="saved"]').click();
            await page.locator('[data-save="aktau"]').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-save="astana"]').evaluate(element => element === document.activeElement), true);
        });
        await check('Show all places returns focus to the cleared search', desktop, async page => {
            await page.locator('[data-destination-search]').fill('no-such-city');
            await page.locator('[data-clear-filters]').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-no-results]').isVisible(), false);
            assert.equal(await page.locator('.destination-column:not([hidden])').count(), 4);
            assert.equal(await page.locator('[data-destination-search]').inputValue(), '');
            assert.equal(await page.locator('[data-destination-search]').evaluate(element => element === document.activeElement), true);
        });
        await check('Saved empty states explain how to recover', mobile, async page => {
            await page.locator('[data-filter="saved"]').click();
            assert.equal(await page.locator('[data-no-results] h3').textContent(), 'No saved places yet.');
            assert.match(await page.locator('[data-no-results] p').textContent(), /heart button/);
            await page.locator('[data-clear-filters]').click();
            await page.locator('[data-save="aktau"]').click();
            await page.locator('[data-filter="saved"]').click();
            await page.locator('[data-destination-search]').fill('Almaty');
            assert.equal(await page.locator('[data-no-results] h3').textContent(), 'No saved places match.');
            assert.match(await page.locator('[data-no-results] p').textContent(), /Clear your search/);
        });
        await check('Typing cancels decorative card motion while preserving search results', desktop, async page => {
            await page.locator('[data-filter="nature"]').click();
            await page.locator('[data-destination-search]').fill('Almaty');
            assert.equal(await page.locator('.destination-column:not([hidden])').count(), 1);
            assert.equal(await page.locator('[data-destination="almaty"]').evaluate(card => card.getAnimations().length), 0);
            await page.locator('[data-destination-search]').fill('no-such-city');
            assert.equal(await page.locator('[data-no-results] h3').textContent(), 'No places found.');
        });
        await check('Keyboard filters, saves and ratings update without entry motion', desktop, async page => {
            await page.locator('[data-filter="nature"]').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-destination="almaty"]').evaluate(card => card.getAnimations().length), 0);
            await page.locator('[data-save="almaty"]').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-save="almaty"]').getAttribute('aria-pressed'), 'true');
            assert.equal(await page.locator('[data-save="almaty"]').evaluate(button => button.getAnimations().length), 0);
            await page.locator('[data-star="4"]').focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-star="4"]').getAttribute('aria-pressed'), 'true');
            assert.equal(await page.locator('[data-rating-message]').evaluate(message => message.getAnimations().length), 0);
        });
    } finally { await browser.close(); }
    if (failures) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
