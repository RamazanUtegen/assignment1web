// Deterministic integration tests; a separate live API smoke check uses real data.
// Start: python -m http.server 8765 --bind 127.0.0.1
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8765/';
const output = path.resolve(process.env.KZ_ENDTERM_EVIDENCE || 'docs/endterm');
const apiPattern = 'https://api.open-meteo.com/v1/forecast**';
const checks = [];
const fixtureTime = Date.UTC(2026, 10, 7, 23, 15) / 1000;
function fixture(temperature = 12) {
    return {
        current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
        current: { time: fixtureTime, temperature_2m: temperature, apparent_temperature: temperature - 2,
            weather_code: 2, wind_speed_10m: 8, is_day: 1 },
        daily: { time: [0, 1, 2].map(day => Date.UTC(2026, 10, 7 + day, 19) / 1000),
            weather_code: [0, 63, 71], temperature_2m_max: [15, 14, 10], temperature_2m_min: [6, 5, 2],
            precipitation_probability_max: [0, 70, 85] }
    };
}
const respond = (route, data = fixture(), status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
async function visit(page, filename = 'index.html') {
    await page.goto(new URL(filename, baseURL).href);
    await page.locator('[data-jquery-ready=true]').waitFor();
    await page.evaluate(() => document.fonts.ready);
}
async function weatherState(page, state) {
    await page.waitForFunction(state => document.querySelector('[data-weather]').dataset.weatherState === state, state);
}
async function weatherTests(browser) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'America/New_York' });
    const errors = [];
    context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
    const requests = [];
    await context.route(apiPattern, route => {
        requests.push(new URL(route.request().url()));
        return respond(route);
    });
    const page = await context.newPage();
    await visit(page);
    assert.equal(requests.length, 0, 'Weather is deferred below the fold');
    await page.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(page, 'ready');
    assert.equal(requests.length, 1);
    assert.equal(requests[0].searchParams.get('forecast_days'), '3');
    assert.equal(requests[0].searchParams.get('timezone'), 'Asia/Almaty');
    assert.equal(requests[0].searchParams.has('apikey'), false);
    assert.equal(await page.locator('[data-weather-days] li').count(), 3);
    assert.equal(await page.locator('[data-weather-temperature]').innerText(), '12°C');
    assert.match(await page.locator('[data-weather-time]').innerText(), /8 Nov, 04:15 \(UTC\+5\)/);
    assert.equal(await page.locator('[data-day-condition]').allTextContents().then(v => v.join(',')), 'Clear sky,Rain,Snow');
    await page.locator('#weather').screenshot({ path: path.join(output, 'screenshots/weather-desktop.png') });
    await page.locator('[data-theme-toggle]').click();
    await page.locator('#weather').screenshot({ path: path.join(output, 'screenshots/weather-night.png') });
    const count = requests.length;
    await page.reload();
    await page.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(page, 'ready');
    assert.equal(requests.length, count, 'Fresh cache avoids another request after reload');
    assert.match(await page.locator('[data-weather-time]').innerText(), /Saved forecast/);
    await page.locator('[data-weather-refresh]').click();
    await weatherState(page, 'ready');
    assert.equal(requests.length, count + 1, 'Refresh bypasses fresh cache');
    await context.unroute(apiPattern);
    await context.route(apiPattern, route => respond(route, {}, 503));
    await page.locator('[data-weather-refresh]').click();
    await weatherState(page, 'cached');
    assert.equal(await page.locator('[data-weather-result]').isVisible(), true);
    assert.match(await page.locator('[data-weather-status]').innerText(), /saved forecast/);
    await page.locator('[data-weather-city]').selectOption('aktau');
    await weatherState(page, 'error');
    assert.equal(await page.locator('[data-weather-result]').isVisible(), false);
    assert.equal(await page.locator('[data-weather-refresh]').isEnabled(), true);
    assert.match(await page.locator('[data-weather-status]').innerText(), /Aktau/);
    await context.unroute(apiPattern);
    const corrupt = fixture(); corrupt.current.temperature_2m = null;
    await context.route(apiPattern, route => respond(route, corrupt));
    await page.locator('[data-weather-refresh]').click();
    await weatherState(page, 'error');
    assert.equal(await page.locator('[data-weather-result]').isVisible(), false, 'Malformed data is never shown as zero');
    await context.unroute(apiPattern);
    await context.route(apiPattern, route => respond(route, fixture(-4)));
    await page.locator('[data-weather-refresh]').click();
    await weatherState(page, 'ready');
    assert.equal(await page.locator('[data-weather-temperature]').innerText(), '-4°C');
    assert.equal(await page.locator('[data-weather-name]').innerText(), 'Aktau');
    assert.deepEqual(errors, []);
    checks.push({ status: 'passed', scenarios: ['lazy API request', 'three-day JSON forecast', 'Kazakhstan time in another timezone', 'fresh cache after reload', 'refresh bypass', 'HTTP failure with saved data', 'HTTP failure without cache', 'null data rejected', 'retry recovery', 'day/night layout'], pageErrors: errors });
    await context.close();
}
async function raceAndTimeout(browser) {
    const context = await browser.newContext();
    const page = await context.newPage();
    let releaseOld;
    const old = new Promise(resolve => { releaseOld = resolve; });
    // Simulate a transport that does not cancel, so the stale-response guard is tested too.
    await context.addInitScript(() => {
        const fetchOriginal = window.fetch;
        window.fetch = (url, options = {}) => fetchOriginal(url, { ...options, signal: undefined });
    });
    await context.route(apiPattern, async route => {
        if (new URL(route.request().url()).searchParams.get('latitude') === '43.24') {
            await old; await respond(route, fixture(29));
        } else await respond(route, fixture(-7));
    });
    await visit(page);
    await page.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(page, 'loading');
    await page.locator('[data-weather-city]').selectOption('astana');
    await weatherState(page, 'ready');
    assert.equal(await page.locator('[data-weather-name]').innerText(), 'Astana');
    releaseOld();
    await page.waitForTimeout(200);
    assert.equal(await page.locator('[data-weather-name]').innerText(), 'Astana');
    assert.equal(await page.locator('[data-weather-temperature]').innerText(), '-7°C');
    await context.close();

    const timeoutContext = await browser.newContext();
    const timeoutPage = await timeoutContext.newPage();
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    await timeoutContext.route(apiPattern, async route => { await pending; await respond(route).catch(() => {}); });
    await visit(timeoutPage);
    await timeoutPage.clock.install();
    await timeoutPage.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(timeoutPage, 'loading');
    await timeoutPage.clock.fastForward(11000);
    await weatherState(timeoutPage, 'error');
    assert.match(await timeoutPage.locator('[data-weather-status]').innerText(), /too long/);
    assert.equal(await timeoutPage.locator('[data-weather-result]').getAttribute('aria-busy'), 'false');
    assert.equal(await timeoutPage.locator('[data-weather-refresh]').isEnabled(), true);
    release();
    await timeoutContext.close();
    checks.push({ status: 'passed', scenarios: ['out-of-order requests cannot replace the selected city', 'timeout abort restores controls and shows retry'] });
}
async function offlineAndStorage(browser) {
    const context = await browser.newContext();
    await context.route(apiPattern, route => route.abort());
    const page = await context.newPage();
    await visit(page);
    await page.evaluate(data => localStorage.setItem('kz-weather-v1-almaty', JSON.stringify({ savedAt: Date.now() - 86400001, data })), fixture());
    await page.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(page, 'error');
    assert.equal(await page.locator('[data-weather-result]').isVisible(), false, 'Over 24 hours old is not a fallback');
    await page.evaluate(() => localStorage.setItem('kz-weather-v1-aktau', '{bad json'));
    await page.locator('[data-weather-city]').selectOption('aktau');
    await weatherState(page, 'error');
    await context.close();
    const restricted = await browser.newContext();
    await restricted.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new Error('Blocked storage'); };
        Storage.prototype.setItem = () => { throw new Error('Blocked storage'); };
    });
    await restricted.route(apiPattern, route => respond(route));
    const restrictedPage = await restricted.newPage();
    await visit(restrictedPage);
    await restrictedPage.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(restrictedPage, 'ready');
    await restrictedPage.locator('[data-weather-city]').selectOption('aktau');
    await weatherState(restrictedPage, 'ready');
    assert.equal(await restrictedPage.locator('[data-weather-name]').innerText(), 'Aktau');
    await restricted.close();
    checks.push({ status: 'passed', scenarios: ['offline without data', 'expired cache ignored', 'corrupt cache ignored', 'blocked localStorage does not break forecast'] });
}
async function formAndMobile(browser) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await context.route(apiPattern, route => respond(route));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await visit(page);
    await page.locator('[data-destination-search]').fill('al');
    await page.locator('#destination-suggestions').getByRole('option', { name: 'Almaty' }).tap();
    assert.equal(await page.locator('[data-destination-search]').inputValue(), 'Almaty');
    await page.locator('.navbar-toggler').click();
    await page.locator('[data-theme-toggle]').focus();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.getElementById('main-navigation').className === 'navbar-collapse collapse' ||
        document.getElementById('main-navigation').className === 'collapse navbar-collapse');
    assert.equal(await page.locator('.navbar-toggler').evaluate(n => n === document.activeElement), true);
    await page.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(page, 'ready');
    await page.locator('#weather').screenshot({ path: path.join(output, 'screenshots/weather-mobile.png') });
    for (const filename of ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html']) {
        await visit(page, filename);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, filename + ' fits phone');
        if (filename !== 'about.html') {
            await page.locator('#weather').scrollIntoViewIfNeeded();
            await weatherState(page, 'ready');
            assert.equal(await page.locator('[data-weather-city]').inputValue(), filename === 'index.html' ? 'almaty' : filename.replace('.html', ''));
        }
    }
    await page.locator('[data-popup-open]').click();
    const form = page.locator('dialog [data-demo-form]');
    await form.locator('[name=name]').fill('Demo Traveller');
    await form.locator('[name=email]').fill('demo@example.com');
    await form.locator('[name=message]').fill('A sample travel enquiry.');
    await form.locator('input[type=checkbox][required]').check();
    await form.locator('button[type=submit]').click();
    assert.equal(await form.locator('[name=name]').isDisabled(), true);
    assert.equal(await form.locator('[name=email]').isDisabled(), true);
    assert.equal(await form.locator('[name=message]').isDisabled(), true);
    await form.evaluate(node => { node.requestSubmit(); node.requestSubmit(); });
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('[data-popup-close]').evaluate(n => n === document.activeElement), true, 'Busy dialog skips disabled fields');
    await page.waitForFunction(() => document.querySelector('dialog form').getAttribute('aria-busy') === 'false');
    assert.match(await form.locator('.form-status').innerText(), /Thank you, Demo Traveller/);
    assert.equal(await form.locator('[name=email]').isEnabled(), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-popup-open]').evaluate(n => n === document.activeElement), true);
    assert.deepEqual(errors, []);
    await context.close();
    checks.push({ status: 'passed', scenarios: ['touch autocomplete', 'mobile menu Escape and focus', 'weather defaults on five pages', 'phone width on six pages', 'validated fields locked while busy', 'duplicate submission guard', 'dialog focus trap while busy', 'fields restored on completion', 'dialog Escape restores focus'], pageErrors: errors });
}
async function noJavascript(browser) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(baseURL);
    assert.equal(await page.locator('img[data-src]:visible').count(), 0);
    assert.equal(await page.locator('.trip-planner').isVisible(), false);
    assert.equal(await page.locator('#main-navigation').isVisible(), true);
    assert.equal(await page.locator('[data-weather-city]').isVisible(), false);
    assert.equal(await page.locator('.faq-panel').first().isVisible(), true);
    assert.notEqual(await page.locator('.faq-panel').first().getAttribute('aria-hidden'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await context.close();
    checks.push({ status: 'passed', scenarios: ['no-JavaScript guide remains readable', 'no duplicate placeholders', 'static FAQ answers visible and accessible', 'navigation visible on phone', 'inactive enhancements hidden'] });
}
async function liveAPI(browser) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const responses = [];
    page.on('response', response => { if (response.url().startsWith('https://api.open-meteo.com/')) responses.push(response.status()); });
    await visit(page);
    await page.locator('#weather').scrollIntoViewIfNeeded();
    await weatherState(page, 'ready');
    assert.ok(responses.includes(200), 'Real weather API returns 200');
    assert.equal(await page.locator('[data-weather-name]').innerText(), 'Almaty');
    assert.equal(await page.locator('[data-weather-days] li').count(), 3);
    await page.locator('#weather').screenshot({ path: path.join(output, 'screenshots/weather-live.png') });
    checks.push({ status: 'passed', scenarios: ['real Open-Meteo GET, HTTP 200', 'real forecast rendered without a key'], httpStatuses: responses });
    await page.close();
}
(async () => {
    await fs.mkdir(path.join(output, 'screenshots'), { recursive: true });
    const browser = await chromium.launch();
    try {
        await weatherTests(browser); console.log('PASS weather, cache, errors and retry');
        await raceAndTimeout(browser); console.log('PASS async race and timeout');
        await offlineAndStorage(browser); console.log('PASS offline and storage');
        await formAndMobile(browser); console.log('PASS mobile, forms and dialog');
        await noJavascript(browser); console.log('PASS no-JavaScript fallback');
        if (process.env.KZ_WEATHER_LIVE === '1') { await liveAPI(browser); console.log('PASS real weather API'); }
        const filename = process.env.KZ_TRAVEL_LIVE === '1' ? 'live-verification.json' : 'verification.json';
        await fs.writeFile(path.join(output, filename), JSON.stringify({ checkedAtUTC: new Date().toISOString(), baseURL, results: checks }, null, 2) + '\n');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
