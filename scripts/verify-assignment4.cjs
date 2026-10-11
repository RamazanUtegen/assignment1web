// Integration checks for the actual Assignment 4 pages.
// With Playwright installed: node scripts/verify-assignment4.cjs
const { chromium, firefox } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8000/';
const screenshots = path.resolve('docs/assignment-4/screenshots');
const pages = ['index.html', 'aktau.html', 'astana.html', 'almaty.html', 'shymkent.html', 'about.html'];

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
    const phoneCapture = browserType.name() === 'chromium' && viewport.width === 390;
    try {
        for (const filename of pages) {
            await page.goto(new URL(filename, baseURL).href, { waitUntil: 'networkidle' });
            if (filename === 'index.html' && capture) {
                await page.locator('.travel-tools').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-4-background-sand.png') });
            }
            assert.equal(await page.locator('[data-live-clock]').count(), 1);
            assert.match(await page.locator('[data-live-clock]').innerText(), /\d{4}.*\d+:\d+:\d+\s[AP]M/);
            const iso = await page.locator('[data-live-clock]').getAttribute('datetime');
            const expected = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Almaty', month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
            }).format(new Date(iso));
            assert.equal(await page.locator('[data-live-clock]').innerText(), expected);
            const before = await page.locator('[data-live-clock]').getAttribute('datetime');
            await page.waitForFunction(previous => document.querySelector('[data-live-clock]').dateTime !== previous, before);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, filename + ' must fit viewport');
            const footer = await page.locator('footer').innerText();
            for (const name of ['Ramazan Utegen', 'Ziyadinkhan Kudaibergenuly', 'Ruzimuhammad', 'SE-2501']) assert.ok(footer.includes(name));
            const original = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
            for (const color of ['Sky', 'Steppe', 'Sand']) {
                await page.getByRole('button', { name: 'Change background' }).click();
                assert.equal(await page.locator('[data-background-name]').innerText(), color);
            }
            await page.waitForTimeout(400);
            assert.equal(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), original);
            if (filename !== 'astana.html' && filename !== 'about.html') {
                const form = page.locator('[data-demo-form]');
                await form.locator('button[type="submit"]').click();
                assert.ok(await form.locator('.is-invalid').count() >= 3);
                await form.locator('[name="name"]').fill('   ');
                await form.locator('[name="email"]').fill('invalid-email');
                await form.locator('[name="message"]').fill('   ');
                if (filename === 'index.html') {
                    await form.locator('[name="password"]').fill('short');
                    await form.locator('[name="confirmPassword"]').fill('different');
                }
                await form.locator('button[type="submit"]').click();
                assert.match(await form.locator('[id$="email-error"]').innerText(), /valid email/);
                for (const email of ['name@example..com', 'name@.com', 'name@example', 'name@@example.com']) {
                    await form.locator('[name="email"]').fill(email);
                    assert.match(await form.locator('[id$="email-error"]').innerText(), /valid email/);
                }
                await form.locator('[name="email"]').fill('invalid-email');
                if (filename === 'index.html') {
                    assert.match(await page.locator('#index-password-error').innerText(), /at least 8/);
                    assert.match(await page.locator('#index-confirm-password-error').innerText(), /must match/);
                    if (capture) await page.locator('#community form').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-1-validation-errors.png') });
                    await form.locator('[name="password"]').fill('Sample123!');
                    await form.locator('[name="confirmPassword"]').fill('Sample123!');
                    // Editing the original after confirmation must invalidate the match.
                    await form.locator('[name="password"]').fill('Changed123!');
                    assert.match(await page.locator('#index-confirm-password-error').innerText(), /must match/);
                    await form.locator('[name="confirmPassword"]').fill('Changed123!');
                }
                await form.locator('[name="name"]').fill('Demo Traveller');
                await form.locator('[name="email"]').fill('traveller@example.com');
                await form.locator('[name="message"]').fill('I would like to explore Kazakhstan.');
                await form.locator('button[type="submit"]').click();
                assert.equal(await form.locator('.is-invalid').count(), 0);
                assert.match(await form.locator('.form-status').innerText(), /passed validation/);
                if (filename === 'index.html') {
                    assert.equal(await form.locator('[name="password"]').inputValue(), '');
                    assert.equal(await form.locator('[name="confirmPassword"]').inputValue(), '');
                    if (capture) await page.locator('#community form').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-1-validation-success.png') });
                    const triggers = page.locator('[data-accordion-trigger]');
                    const count = await triggers.count();
                    assert.equal(count, 4);
                    for (let i = 0; i < count; i++) {
                        const trigger = triggers.nth(i);
                        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
                        const panel = page.locator('#' + await trigger.getAttribute('aria-controls'));
                        assert.equal((await panel.boundingBox()).height, 0);
                        await trigger.click();
                        assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
                        await page.waitForTimeout(350);
                        assert.ok((await panel.boundingBox()).height > 0);
                        await trigger.focus();
                        await page.keyboard.press('Enter');
                        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
                        await page.waitForTimeout(350);
                        assert.equal((await panel.boundingBox()).height, 0);
                    }
                    if (capture) {
                        await page.locator('#faq').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-2-faq-closed.png') });
                        await triggers.first().click();
                        await page.waitForTimeout(350);
                        await page.locator('#faq').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-2-faq-open.png') });
                        await page.getByRole('button', { name: 'Change background' }).click();
                        await page.waitForTimeout(400);
                        await page.locator('.travel-tools').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-4-background-sky.png') });
                        await page.locator('.travel-tools').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-5-live-clock.png') });
                    }
                }
            }
            if (filename === 'about.html') {
                const popup = page.locator('#contact-popup');
                const open = page.getByRole('button', { name: 'Contact Us', exact: true });
                assert.equal(await popup.isVisible(), false);
                await open.click();
                assert.equal(await popup.isVisible(), true);
                if (capture) {
                    const box = await popup.boundingBox();
                    await page.screenshot({
                        clip: { x: box.x - 24, y: box.y - 24, width: box.width + 48, height: box.height + 48 },
                        path: path.join(screenshots, 'task-3-contact-popup.png')
                    });
                }
                if (phoneCapture) await page.screenshot({ path: path.join(screenshots, 'mobile-contact-popup.png') });
                // Keyboard focus stays inside the modal.
                for (let i = 0; i < 16; i++) {
                    await page.keyboard.press('Tab');
                    assert.equal(await popup.evaluate(dialog => dialog.contains(document.activeElement)), true);
                }
                await page.getByRole('button', { name: 'Close contact form' }).click();
                await page.waitForFunction(() => !document.querySelector('#contact-popup').open);
                assert.equal(await open.evaluate(button => button === document.activeElement), true);
                await open.click();
                await page.keyboard.press('Escape');
                await page.waitForFunction(() => !document.querySelector('#contact-popup').open);
                await open.click();
                await page.mouse.click(5, 5);
                await page.waitForFunction(() => !document.querySelector('#contact-popup').open);
                await open.click();
                const form = popup.locator('form');
                await form.locator('button[type="submit"]').click();
                assert.ok(await form.locator('.is-invalid').count() >= 4);
                await form.locator('[name="name"]').fill('Demo Traveller');
                await form.locator('[name="email"]').fill('traveller@example.com');
                await form.locator('[name="message"]').fill('I would like to explore Aktau.');
                await page.locator('#demo-notice').check();
                await form.locator('button[type="submit"]').click();
                assert.match(await form.locator('.form-status').innerText(), /passed validation/);
                await page.getByRole('button', { name: 'Close contact form' }).click();
                await page.waitForFunction(() => !document.body.classList.contains('popup-open'));
                if (capture) await page.locator('#contact').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'task-3-contact-closed.png') });
            }
        }
        if (phoneCapture) {
            await page.goto(new URL('index.html#faq', baseURL).href);
            await page.locator('[data-accordion-trigger]').first().click();
            await page.waitForTimeout(350);
            await page.locator('#faq').screenshot({ style: '#main-header { visibility: hidden !important; }', path: path.join(screenshots, 'mobile-faq.png') });
        }
        assert.deepEqual(errors, [], 'No JavaScript errors or failed HTTP assets');
        console.log('PASS ' + browserType.name() + ' ' + viewport.width + 'x' + viewport.height + ': all six pages and five features');
    } finally {
        await browser.close();
    }
}

(async function () {
    await fs.mkdir(screenshots, { recursive: true });
    if (process.env.KZ_TRAVEL_CAPTURE_ONLY) {
        await run(chromium, { width: 1440, height: 1100 });
        return;
    }
    for (const browserType of [chromium, firefox]) {
        for (const viewport of [{ width: 1440, height: 1100 }, { width: 390, height: 844 }]) {
            await run(browserType, viewport);
        }
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
