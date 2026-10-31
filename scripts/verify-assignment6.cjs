// Integration tests against real pages. Run a static server on port 8765 first.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8765/';
const live = process.env.KZ_TRAVEL_LIVE === '1';
const root = path.resolve(__dirname, '..');
const shots = path.join(root, 'docs/assignment-6/screenshots');
const results = [];

async function run(browserType, viewport, channel) {
    const browser = await browserType.launch({ headless: true, ...(channel ? { channel } : {}) });
    const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
    if (browserType === chromium) await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const page = await context.newPage();
    const errors = [], logs = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
    page.on('console', message => { if (message.type() === 'log') logs.push(message.text()); });
    page.on('request', request => requests.push(request.url()));
    const capture = !channel && viewport.width === 1440;
    async function ready(filename = 'index.html') {
        await page.goto(new URL(filename, baseURL).href, { waitUntil: 'load' });
        await page.locator('[data-jquery-ready=true]').waitFor();
        await page.evaluate(() => document.fonts.ready);
    }
    async function toggleTheme() {
        if (viewport.width < 992) await page.locator('.navbar-toggler').click();
        await page.locator('[data-theme-toggle]').click();
        if (viewport.width < 992) await page.locator('.navbar-toggler').click();
    }
    async function shot(name, selector) {
        if (!capture) return;
        if (selector) {
            const area = page.locator(selector);
            await area.scrollIntoViewIfNeeded();
            await page.waitForTimeout(220);
            await area.locator('img:not([data-src])').evaluateAll(images => Promise.all(images.map(image => image.decode().catch(() => {}))));
            await area.screenshot({ path: path.join(shots, name + '.png') });
        } else await page.screenshot({ path: path.join(shots, name + '.png') });
    }
    try {
        await ready();
        assert.equal(await page.evaluate(() => jQuery.fn.jquery), '4.0.0');
        assert.ok(logs.includes('jQuery is ready!'));
        assert.ok(await page.locator('img[data-src]').count() > 5, 'offscreen images are deferred');
        assert.ok(!requests.some(url => url.includes('/images/rocktrail.jpg')), 'offscreen carousel image was not fetched');
        await shot(live ? 'live-home' : 'home');
        if (!channel && viewport.width === 390) await page.screenshot({ path: path.join(shots, 'mobile-home.png') });
        const search = page.locator('[data-destination-search]');
        await search.fill('almaty');
        assert.equal(await page.locator('.destination-column:visible').count(), 1);
        assert.ok(await page.locator('[data-destination=almaty] mark').count() > 0);
        assert.equal(await page.locator('[role=option]').innerText(), 'Almaty');
        await shot('task-1-search', '#destinations');
        await search.fill('a');
        await search.press('ArrowUp');
        assert.equal(await search.getAttribute('aria-activedescendant'), 'destination-option-3');
        await search.press('Escape');
        await search.press('ArrowDown');
        assert.equal(await search.getAttribute('aria-activedescendant'), 'destination-option-0');
        await search.press('Escape');
        await search.press('ArrowDown');
        assert.equal(await search.getAttribute('aria-activedescendant'), 'destination-option-0');
        await shot('task-2-autocomplete', '#destinations');
        await search.press('Enter');
        assert.equal(await search.inputValue(), 'Aktau');
        assert.equal(await search.getAttribute('aria-expanded'), 'false');
        await search.fill('[');
        assert.equal(await page.locator('.destination-column:visible').count(), 0);
        await search.fill('<img src=x onerror=alert(1)>');
        assert.equal(await page.locator('img[src=x]').count(), 0);
        await page.locator('[data-clear-filters]').click();
        await page.locator('[data-filter=nature]').click();
        assert.equal(await page.locator('.destination-column:visible').count(), 2);
        await search.fill('astana');
        assert.equal(await page.locator('.destination-column:visible').count(), 0);
        await page.locator('[data-clear-filters]').click();
        await page.locator('[data-save=aktau]').click();
        assert.match(await page.locator('.toast-message').innerText(), /Saved/);
        await shot('task-7-toast');
        await page.locator('[data-filter=saved]').click();
        assert.equal(await page.locator('.destination-column:visible').count(), 1);
        await page.locator('[data-save=aktau]').click();
        assert.equal(await page.locator('.destination-column:visible').count(), 0);
        await page.locator('[data-clear-filters]').click();
        await page.locator('.guide-stats').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll('[data-counter]')].every(n => n.textContent === n.dataset.counter));
        assert.equal(await page.locator('[data-counted=true]').count(), 3);
        await shot('task-5-counters', '.guide-stats');

        const faq = page.locator('[data-faq-search]');
        await faq.fill('guide');
        assert.ok(await page.locator('.faq-item:visible').count() >= 2);
        assert.ok(await page.locator('.faq-panel mark.search-match').count() >= 2);
        await shot('task-3-highlight', '.faq-list');
        await faq.fill('[');
        assert.equal(await page.locator('.faq-item:visible').count(), 0);
        await faq.fill('');
        assert.equal(await page.locator('.faq-item:visible').count(), 4);
        assert.equal(await page.locator('#faq mark').count(), 0);
        await page.locator('[data-accordion-trigger]').first().click();
        await faq.fill('trip');
        await faq.fill('');
        assert.equal(await page.locator('[data-accordion-trigger]').first().getAttribute('aria-expanded'), 'true');
        await toggleTheme();
        await faq.fill('guide');
        await shot('night-faq', '#faq');
        await faq.fill('');
        await toggleTheme();

        const form = page.locator('[data-demo-form]');
        await form.locator('button[type=submit]').click();
        assert.ok(await form.locator('[aria-invalid=true]').count() >= 3);
        assert.notEqual(await form.getAttribute('aria-busy'), 'true');
        for (const [name, value] of Object.entries({ name: 'Demo Traveller', email: 'traveller@example.com', password: 'SamplePass1', confirmPassword: 'SamplePass1', message: 'I would like to explore Kazakhstan.' })) {
            await form.locator(`[name=${name}]`).fill(value);
        }
        await form.locator('button[type=submit]').click();
        assert.equal(await form.locator('button[type=submit]').isDisabled(), true);
        assert.match(await form.locator('button[type=submit]').innerText(), /Please wait/);
        await form.evaluate(node => { node.requestSubmit(); node.requestSubmit(); });
        await shot('task-6-spinner', '[data-demo-form]');
        await page.waitForFunction(() => document.querySelector('[data-demo-form]').getAttribute('aria-busy') === 'false');
        assert.match(await form.locator('.form-status').innerText(), /passed validation/);
        assert.equal(await form.locator('[name=password]').inputValue(), '');
        assert.equal(await form.locator('button[type=submit]').isDisabled(), false);
        await shot('form-success', '#community');

        await page.locator('[data-trip-planner] [name=destination][value=almaty]').check();
        await page.locator('[data-planner-next]').click();
        await page.locator('[name=traveler]').fill('Demo');
        await page.locator('[name=days]').selectOption('3');
        await page.locator('[data-planner-next]').click();
        await page.locator('[data-planner-next]').click();
        await page.locator('[data-copy=route-copy-text]').click();
        await page.locator('#route-copy-tooltip').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#route-copy-tooltip').isVisible(), true);
        assert.match(await page.locator('[data-copy=route-copy-text]').innerText(), /Copied/);
        if (browserType === chromium) {
            const clipboard = await page.evaluate(() => navigator.clipboard.readText());
            assert.match(clipboard, /Day 1:.*Almaty/);
            assert.match(clipboard, /Day 3:/);
        }
        await shot('task-8-copy', '[data-trip-result]');
        await page.waitForTimeout(2400);
        assert.match(await page.locator('[data-copy=route-copy-text]').innerText(), /Copy my route/);

        await page.locator('#gallery').scrollIntoViewIfNeeded();
        await page.locator('.carousel-control-next').first().click();
        await page.waitForFunction(() => document.querySelector('.carousel-item.active img').getAttribute('data-lazy-state') === 'loaded');
        assert.ok(requests.some(url => url.includes('/images/rocktrail.jpg')));
        await shot('task-9-lazy', '.carousel');
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(300);
        assert.equal(await page.locator('[data-scroll-progress]').getAttribute('aria-valuenow'), '100');
        await shot('task-4-progress');
        await page.locator('[data-copy=guide-share-text]').click();
        await page.locator('#guide-copy-tooltip').waitFor({ state: 'visible' });
        if (browserType === chromium) assert.match(await page.evaluate(() => navigator.clipboard.readText()), /https:\/\/ramazanutegen.github.io\/assignment1web\//);
        await page.waitForTimeout(3600);
        assert.equal(await page.locator('.toast-message').innerText(), '');

        for (const filename of ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html']) {
            await ready(filename);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, filename + ' fits viewport');
            assert.equal(await page.locator('[data-scroll-progress]').count(), 1);
            assert.equal(await page.locator('[data-copy=guide-share-text]').count(), 1);
            const height = await page.evaluate(() => document.documentElement.scrollHeight);
            for (let y = 0; y < height; y += viewport.height - 100) {
                await page.evaluate(y => window.scrollTo(0, y), y);
                await page.waitForTimeout(35);
            }
            await page.waitForTimeout(150);
            assert.equal(await page.locator('img[data-lazy-state=error]').count(), 0, filename + ' image loading');
            const footer = await page.locator('footer').innerText();
            for (const member of ['Ramazan Utegen', 'Ziyadinkhan Kudaibergenuly', 'Ruzimuhammad', 'SE-2501']) assert.ok(footer.includes(member));
            if (filename === 'about.html') {
                await page.locator('[data-popup-open]').click();
                assert.equal(await page.locator('dialog').isVisible(), true);
                await page.keyboard.press('Escape');
                assert.equal(await page.locator('dialog').isVisible(), false);
            }
        }
        assert.deepEqual(errors, []);
        results.push({ browser: channel || browserType.name(), viewport, status: 'passed', pageErrors: errors, jqueryReadyMessages: logs.length,
            scenarios: ['all six pages', 'live search and category/saved combination', 'keyboard autocomplete', 'literal/HTML search safety', 'FAQ highlight and state restore', 'night theme', 'counters', 'validated submit and duplicate guard', 'toast fade', 'actual clipboard copy and reset', 'planner', 'lazy network requests and carousel', 'scroll 100%', 'mobile width', 'dialog Escape'] });
        console.log('PASS', channel || browserType.name(), viewport.width);
    } finally { await browser.close(); }
}

async function fallbackChecks() {
    const browser = await chromium.launch();
    try {
        const context = await browser.newContext({ reducedMotion: 'reduce' });
        await context.route('https://code.jquery.com/**', route => route.abort());
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(baseURL);
        await page.locator('[data-jquery-ready=true]').waitFor();
        assert.equal(await page.evaluate(() => jQuery.fn.jquery), '4.0.0');
        await page.locator('[data-destination-search]').fill('almaty');
        assert.equal(await page.locator('.destination-column:visible').count(), 1);
        await page.locator('.guide-stats').scrollIntoViewIfNeeded();
        await page.waitForTimeout(150);
        assert.deepEqual(await page.locator('[data-counter]').allTextContents(), ['4', '6', '9']);
        await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { value: () => Promise.reject(new Error('denied')) }));
        await page.locator('[data-copy=guide-share-text]').click();
        assert.match(await page.locator('#guide-copy-tooltip').innerText(), /unavailable/);
        assert.doesNotMatch(await page.locator('[data-copy=guide-share-text]').innerText(), /Copied/);
        assert.deepEqual(errors, []);
        results.push({ browser: 'chromium', status: 'passed', scenarios: ['CDN blocked: local fallback', 'reduced motion: final counters', 'clipboard permission failure: honest feedback'], pageErrors: errors });
    } finally { await browser.close(); }
}

(async () => {
    await fs.mkdir(shots, { recursive: true });
    for (const channel of [undefined, 'msedge']) {
        for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) await run(chromium, viewport, channel);
    }
    await fallbackChecks();
    const output = path.join(root, 'docs/assignment-6', live ? 'live-browser-verification.json' : 'browser-verification.json');
    await fs.writeFile(output, JSON.stringify({ checkedAtUTC: new Date().toISOString(), baseURL, results }, null, 2));
    console.log('PASS all Assignment 6 browser scenarios');
})().catch(error => { console.error(error); process.exitCode = 1; });
