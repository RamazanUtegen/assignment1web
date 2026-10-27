// Browser verification and report evidence. Install Playwright and its browsers first.
// Run a local server, then: KZ_TRAVEL_BASE_URL=http://127.0.0.1:8765/ node scripts/verify-assignment5.cjs
const { chromium, firefox } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8765/';
const output = path.resolve('docs/assignment-5');
const shots = path.join(output, 'screenshots');
const filenames = ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html'];

async function run(browserType, viewport) {
    const browser = await browserType.launch({ headless: true });
    const context = await browser.newContext({ viewport, timezoneId: 'America/New_York' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
        if (response.status() >= 400) errors.push(response.status() + ': ' + response.url());
    });
    const capture = browserType.name() === 'chromium' && viewport.width === 1440;
    async function prepareCapture(selector) {
        // Network-idle and naturalWidth alone do not guarantee decoded photo pixels.
        const images = selector ? page.locator(selector).locator('img') : page.locator('img');
        await images.evaluateAll((images, inSection) => Promise.all(images.filter(image => {
            const rect = image.getBoundingClientRect();
            return rect.width && rect.height && (inSection || rect.bottom > 0 && rect.top < innerHeight);
        }).map(image => {
            image.loading = 'eager';
            return image.decode().catch(() => {});
        })), Boolean(selector));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    }
    async function toggleTheme() {
        const button = page.locator('[data-theme-toggle]');
        const openMenu = !await button.isVisible();
        if (openMenu) await page.locator('.navbar-toggler').click();
        await button.click();
        if (openMenu) await page.locator('.navbar-toggler').click();
    }
    const screenshot = async (selector, name) => {
        if (!capture) return;
        await prepareCapture(selector);
        await page.locator(selector).screenshot({ path: path.join(shots, name + '.png'),
            animations: 'disabled',
            style: '#main-header { visibility: hidden !important; }' });
    };
    try {
        for (const filename of filenames) {
            await page.goto(new URL(filename, baseURL).href, { waitUntil: 'networkidle' });
            await page.evaluate(async () => {
                await Promise.all(Array.from(document.images, image => {
                    image.loading = 'eager';
                    return image.decode().catch(() => {});
                }));
            });
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, filename + ' overflows');
            assert.deepEqual(await page.locator('img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.src)), []);
            for (const name of ['Ramazan Utegen', 'Ziyadinkhan Kudaibergenuly', 'Ruzimuhammad', 'SE-2501']) {
                assert.ok((await page.locator('footer').innerText()).includes(name));
            }
            const clock = page.locator('[data-live-clock]');
            const iso = await clock.getAttribute('datetime');
            const expected = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Almaty', month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(iso));
            assert.equal(await clock.innerText(), expected);
            await page.waitForFunction(previous => document.querySelector('[data-live-clock]').dateTime !== previous, iso);
            assert.equal(await page.locator('[data-sound-toggle]').getAttribute('aria-pressed'), 'false');
            await toggleTheme();
            assert.equal(await page.locator('body').getAttribute('data-theme'), 'night');
            assert.equal(await page.locator('body').getAttribute('data-bs-theme'), 'dark');
            await page.reload({ waitUntil: 'networkidle' });
            assert.equal(await page.locator('body').getAttribute('data-theme'), 'night');
            for (const label of ['Sky', 'Steppe', 'Sand']) {
                await page.locator('[data-background-button]').click();
                assert.equal(await page.locator('[data-background-name]').innerText(), label);
            }
            await toggleTheme();
            assert.equal(await page.locator('body').getAttribute('data-theme'), 'day');
            const rating = page.locator('[data-rating]');
            await rating.locator('[data-star="4"]').click();
            assert.equal(await rating.locator('.is-selected').count(), 4);
            assert.match(await rating.locator('[data-rating-message]').innerText(), /4\/5/);
            if (filename === 'index.html') await screenshot('.rating-section', 'rating');
            await page.reload({ waitUntil: 'networkidle' });
            assert.equal(await rating.locator('[data-star="4"]').getAttribute('aria-pressed'), 'true');
            const toggler = page.locator('.navbar-toggler');
            if (await toggler.isVisible()) await toggler.click();
            const links = page.locator('#main-navigation .nav-link');
            await links.first().focus();
            for (const [key, index] of [['ArrowRight', 1], ['ArrowDown', 2], ['ArrowUp', 1], ['ArrowLeft', 0], ['ArrowLeft', await links.count() - 1], ['Home', 0], ['End', await links.count() - 1]]) {
                await page.keyboard.press(key);
                assert.equal(await links.nth(index).evaluate(link => link === document.activeElement), true, key);
            }
            if (await toggler.isVisible()) await toggler.click();
            if (await page.locator('.carousel').count()) {
                const carousel = page.locator('.carousel');
                const thumbs = page.locator('[data-gallery-for] button');
                assert.equal(await thumbs.count(), 9);
                await thumbs.nth(2).click();
                await page.waitForFunction(() => document.querySelector('.carousel-item.active') === document.querySelectorAll('.carousel-item')[2]);
                await page.waitForFunction(() => document.querySelectorAll('[data-gallery-for] button')[2].getAttribute('aria-pressed') === 'true');
                await carousel.focus();
                await page.keyboard.press('ArrowRight');
                await page.waitForFunction(() => document.querySelectorAll('[data-gallery-for] button')[3].getAttribute('aria-pressed') === 'true');
                if (filename === 'index.html') await screenshot('#gallery', 'gallery');
            }
            if (capture) {
                await page.evaluate(() => scrollTo(0, 0));
                await prepareCapture();
                await page.screenshot({ path: path.join(shots, filename.replace('.html', '-desktop.png')), animations: 'disabled' });
            }
        }

        await page.goto(new URL('index.html', baseURL).href, { waitUntil: 'networkidle' });
        const filter = category => page.locator('[data-filter="' + category + '"]');
        const visibleIds = () => page.locator('.destination-column:not([hidden]) [data-destination]').evaluateAll(cards => cards.map(card => card.dataset.destination));
        await filter('nature').click();
        assert.deepEqual(await visibleIds(), ['aktau', 'almaty']);
        await page.locator('[data-destination-search]').fill('almaty');
        assert.deepEqual(await visibleIds(), ['almaty']);
        await screenshot('#destinations', 'discovery');
        await page.locator('[data-destination-search]').fill('no-such-city');
        assert.equal(await page.locator('[data-no-results]').isVisible(), true);
        await page.locator('[data-clear-filters]').click();
        assert.equal((await visibleIds()).length, 4);
        await filter('city').click();
        assert.deepEqual(await visibleIds(), ['astana', 'almaty']);
        await filter('culture').click();
        assert.deepEqual(await visibleIds(), ['shymkent']);
        await filter('all').click();
        await page.locator('[data-save="aktau"]').click();
        await filter('saved').click();
        assert.deepEqual(await visibleIds(), ['aktau']);
        await page.reload({ waitUntil: 'networkidle' });
        await filter('saved').click();
        assert.deepEqual(await visibleIds(), ['aktau']);
        await page.locator('[data-save="aktau"]').click();
        assert.equal(await page.locator('[data-no-results]').isVisible(), true);
        await page.locator('[data-clear-filters]').click();

        const planner = page.locator('[data-trip-planner]');
        const next = planner.locator('[data-planner-next]');
        await next.click();
        assert.match(await planner.locator('[data-planner-error]').innerText(), /Choose a destination/);
        assert.equal(await planner.locator('[name=destination]').first().getAttribute('aria-invalid'), 'true');
        await planner.locator('[name=destination][value=almaty]').check();
        await next.click();
        assert.equal(await planner.locator('[name=traveler]').evaluate(field => field === document.activeElement), true);
        await planner.locator('[name=traveler]').fill('   ');
        await next.click();
        assert.equal(await planner.locator('[name=traveler]').getAttribute('aria-invalid'), 'true');
        const userName = '<img src=x onerror=alert(1)>';
        await planner.locator('[name=traveler]').fill(userName);
        await planner.locator('[name=days]').selectOption('2');
        await planner.locator('[data-planner-back]').click();
        await next.click();
        assert.equal(await planner.locator('[name=traveler]').inputValue(), userName);
        await page.keyboard.press('Enter');
        assert.equal(await planner.locator('[data-planner-step="2"]').isVisible(), true);
        assert.ok((await planner.locator('[data-trip-review]').innerText()).includes(userName));
        assert.equal(await planner.locator('[data-trip-review] img').count(), 0);
        await planner.locator('[data-planner-back]').click();
        await planner.locator('[name=traveler]').fill('Demo Traveller');
        await next.click();
        await screenshot('#trip-planner', 'planner-review');
        await next.click();
        assert.equal(await planner.locator('[data-trip-stops] li').count(), 2);
        assert.equal(await planner.locator('[data-trip-guide]').getAttribute('href'), 'almaty.html');
        assert.equal(await planner.locator('[data-trip-result]').evaluate(result => result === document.activeElement), true);
        await screenshot('#trip-planner', 'planner-result');
        await planner.locator('[data-planner-reset]').click();
        assert.equal(await planner.locator('[name=traveler]').inputValue(), '');
        assert.equal(await planner.locator('[name=destination]:checked').count(), 0);
        assert.equal(await planner.locator('[data-trip-stops] li').count(), 0);
        for (const days of ['1', '3']) {
            await planner.locator('[name=destination][value=aktau]').check();
            await next.click();
            await planner.locator('[name=traveler]').fill('Traveller');
            await planner.locator('[name=days]').selectOption(days);
            await next.click();
            await next.click();
            assert.equal(await planner.locator('[data-trip-stops] li').count(), Number(days));
            await planner.locator('[data-planner-reset]').click();
        }

        const faq = page.locator('[data-accordion-trigger]').first();
        await faq.click();
        assert.equal(await faq.getAttribute('aria-expanded'), 'true');
        await toggleTheme();
        await screenshot('#faq', 'night-faq');
        await toggleTheme();
        await faq.focus();
        await page.keyboard.press('Enter');
        assert.equal(await faq.getAttribute('aria-expanded'), 'false');
        const signup = page.locator('[data-demo-form]');
        await signup.locator('[type=submit]').click();
        assert.ok(await signup.locator('.is-invalid').count() >= 5);
        await signup.locator('[name=name]').fill('Demo Traveller');
        await signup.locator('[name=email]').fill('invalid-email');
        assert.match(await page.locator('#index-email-error').innerText(), /valid email/);
        await signup.locator('[name=email]').fill('traveller@example.com');
        await signup.locator('[name=password]').fill('short');
        await signup.locator('[name=confirmPassword]').fill('different');
        assert.match(await page.locator('#index-password-error').innerText(), /at least 8/);
        assert.match(await page.locator('#index-confirm-password-error').innerText(), /must match/);
        await signup.locator('[name=password]').fill('Sample123!');
        await signup.locator('[name=confirmPassword]').fill('Sample123!');
        await signup.locator('[name=message]').fill('I would like to explore Kazakhstan.');
        await signup.locator('[type=submit]').click();
        assert.match(await signup.locator('.form-status').innerText(), /passed validation/);
        await screenshot('#community form', 'legacy-form');
        if (browserType.name() === 'chromium' && viewport.width === 390) {
            await page.evaluate(() => scrollTo(0, 0));
            await prepareCapture();
            await page.screenshot({ path: path.join(shots, 'mobile-home.png'), animations: 'disabled' });
        }
        await page.goto(new URL('about.html', baseURL).href, { waitUntil: 'networkidle' });
        const open = page.locator('[data-popup-open]');
        await open.click();
        assert.equal(await page.locator('#contact-popup').isVisible(), true);
        await screenshot('#contact-popup', 'contact-popup');
        for (let i = 0; i < 15; i++) {
            await page.keyboard.press('Tab');
            assert.equal(await page.locator('#contact-popup').evaluate(dialog => dialog.contains(document.activeElement)), true);
        }
        await page.keyboard.press('Escape');
        assert.equal(await open.evaluate(button => button === document.activeElement), true);
        assert.deepEqual(errors, [], 'No page errors or failed assets');
        const result = { browser: browserType.name(), viewport, pages: filenames.length, result: 'passed', scenarios: 'Assets, layouts, clock/timezone, credits, day/night and persistence, ratings, menu keys, gallery sync, combined filters, saved persistence, planner validation/callbacks/Enter/reset/safe text, 1/2/3-day routes, legacy signup, FAQ, dialog focus.' };
        console.log('PASS ' + result.browser + ' ' + viewport.width + 'x' + viewport.height);
        return result;
    } finally { await browser.close(); }
}

async function soundAndStorage() {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.addInitScript(() => {
            const NativeAudio = window.AudioContext;
            window.audioEvidence = { created: 0, connected: 0, maxConnected: 0, started: 0 };
            window.AudioContext = class extends NativeAudio {
                async resume() {
                    await new Promise(resolve => setTimeout(resolve, 120));
                    return super.resume();
                }
                createOscillator() {
                    const oscillator = super.createOscillator();
                    const evidence = window.audioEvidence;
                    evidence.created += 1;
                    const connect = oscillator.connect.bind(oscillator);
                    const disconnect = oscillator.disconnect.bind(oscillator);
                    const start = oscillator.start.bind(oscillator);
                    let connected = false;
                    oscillator.connect = (...args) => {
                        connected = true;
                        evidence.connected += 1;
                        evidence.maxConnected = Math.max(evidence.maxConnected, evidence.connected);
                        return connect(...args);
                    };
                    oscillator.disconnect = (...args) => {
                        if (connected) { evidence.connected -= 1; connected = false; }
                        return disconnect(...args);
                    };
                    oscillator.start = (...args) => { evidence.started += 1; return start(...args); };
                    return oscillator;
                }
            };
        });
        await page.goto(baseURL, { waitUntil: 'networkidle' });
        assert.equal(await page.evaluate(() => audioEvidence.started), 0, 'No autoplay');
        await page.evaluate(() => { const toggle = document.querySelector('[data-sound-toggle]'); toggle.click(); toggle.click(); });
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(() => audioEvidence.started), 0, 'Muting during resume cancels chime');
        await page.locator('[data-sound-toggle]').click();
        await page.waitForTimeout(160);
        assert.ok(await page.evaluate(() => audioEvidence.started > 0));
        await page.evaluate(() => { for (let i = 0; i < 8; i++) document.querySelector('[data-star="4"]').click(); });
        await page.waitForTimeout(160);
        await page.locator('[data-sound-toggle]').click();
        assert.equal(await page.evaluate(() => audioEvidence.connected), 0, 'Mute disconnects immediately');
        await page.waitForTimeout(350);
        const audio = await page.evaluate(() => audioEvidence);
        assert.equal(audio.maxConnected, 1, 'Never overlaps oscillators');
        await page.locator('[data-sound-toggle]').click();
        await page.waitForTimeout(160);
        await page.evaluate(() => scrollTo(0, 0));
        await page.locator('.hero-bg-img').evaluate(image => image.decode());
        await page.screenshot({ path: path.join(shots, 'sound-route.png'), animations: 'disabled' });
        const context = await browser.newContext();
        await context.addInitScript(() => {
            Storage.prototype.getItem = () => { throw new Error('Storage disabled for test'); };
            Storage.prototype.setItem = () => { throw new Error('Storage disabled for test'); };
        });
        const restricted = await context.newPage();
        const errors = [];
        restricted.on('pageerror', error => errors.push(error.message));
        await restricted.goto(baseURL, { waitUntil: 'networkidle' });
        await restricted.locator('[data-theme-toggle]').click();
        await restricted.locator('[data-star="3"]').click();
        await restricted.locator('[data-save="aktau"]').click();
        assert.equal(await restricted.locator('[data-save="aktau"]').getAttribute('aria-pressed'), 'true');
        assert.deepEqual(errors, []);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await page.locator('[data-star="4"]').evaluate(star => getComputedStyle(star.closest('[data-rating]').querySelector('[data-rating-message]')).animationName), 'none');
        console.log('PASS Web Audio: no autoplay, mute race, immediate mute, rapid clicks; disabled storage; reduced motion');
        return { audio, mutedDuringResume: 'passed', disabledStorage: 'passed', reducedMotion: 'passed' };
    } finally { await browser.close(); }
}

(async () => {
    await fs.mkdir(shots, { recursive: true });
    if (process.env.KZ_TRAVEL_CAPTURE_ONLY) {
        await run(chromium, { width: 1440, height: 1000 });
        await run(chromium, { width: 390, height: 844 });
        await soundAndStorage();
        return;
    }
    const results = [];
    for (const browserType of [chromium, firefox]) {
        for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) results.push(await run(browserType, viewport));
    }
    const extra = await soundAndStorage();
    const evidence = { checkedAtUTC: new Date().toISOString(), timezone: 'Asia/Almaty', baseURL, results, extra };
    await fs.writeFile(path.join(output, 'browser-verification.json'), JSON.stringify(evidence, null, 2) + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
