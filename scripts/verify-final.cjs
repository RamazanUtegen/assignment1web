// Final-project browser journeys and backup screenshots. Start a local server first.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const baseURL = process.env.KZ_TRAVEL_BASE_URL || 'http://127.0.0.1:8765/';
const output = path.resolve(process.env.KZ_FINAL_EVIDENCE || 'docs/final');
const shots = path.join(output, 'screenshots');
const results = [];
const password = 'TravelPass9!';
const email = 'demo.traveller@example.com';
const pages = ['index.html','aktau.html','astana.html','almaty.html','shymkent.html','about.html','signup.html','login.html','profile.html'];
const api = 'https://api.open-meteo.com/v1/forecast**';
const viewports = [{width:1440,height:1000},{width:1024,height:900},{width:768,height:900},{width:390,height:844}];
const fixture = {
    current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
    current: { time: Math.floor(Date.now()/1000), temperature_2m: 8, apparent_temperature: 5, weather_code: 2, wind_speed_10m: 12, is_day: 1 },
    daily: { time: [0,1,2].map(i=>Math.floor(Date.now()/1000)+i*86400), weather_code:[2,61,0], temperature_2m_max:[12,10,13], temperature_2m_min:[3,2,4], precipitation_probability_max:[10,70,0] }
};
async function ready(page, name) {
    await page.goto(new URL(name,baseURL).href);
    await page.locator('[data-jquery-ready=true]').waitFor();
    await page.locator('[data-auth-ready=true]').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>scrollTo(0,0));
    await page.locator('img').evaluateAll(images=>Promise.all(images.filter(image=>{
        const bounds=image.getBoundingClientRect();
        return !image.hasAttribute('data-src') && bounds.top<innerHeight && bounds.bottom>0;
    }).map(image=>image.decode().catch(()=>{}))));
}
async function fillSignup(page, overrides={}) {
    const values={name:'Demo Traveller',email,phone:'+7 777 123 45 67',password,confirmPassword:password,...overrides};
    for(const [name,value] of Object.entries(values)) await page.locator(`[name=${name}]`).fill(value);
    await page.locator('[name=consent]').check();
}
async function theme(page) {
    const mobile=await page.locator('.navbar-toggler').isVisible();
    if(mobile) { await page.locator('.navbar-toggler').click(); await page.locator('#main-navigation.show').waitFor(); }
    await page.locator('[data-theme-toggle]').click();
    if(mobile) { await page.locator('.navbar-toggler').click(); await page.locator('#main-navigation.show').waitFor({state:'hidden'}); }
}
function launch(channel) {
    const executablePath = channel === 'msedge' ? process.env.KZ_EDGE_EXECUTABLE : process.env.KZ_CHROMIUM_EXECUTABLE;
    return chromium.launch({ headless:true, channel, executablePath });
}
async function keyboardNavigation(page) {
    // A same-page fragment navigation can leave the previous control focused.
    await page.evaluate(() => {
        document.body.tabIndex = -1;
        document.body.focus();
        document.body.removeAttribute('tabindex');
    });
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('.skip-link').evaluate(link=>link===document.activeElement),true);
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#main-content').evaluate(main=>main===document.activeElement),true);
    const toggle = page.locator('.navbar-toggler');
    const links = page.locator('#main-navigation .nav-link');
    if (await toggle.isVisible()) {
        await toggle.focus();
        await page.keyboard.press('Space');
        await links.first().waitFor();
        await links.first().focus();
        await page.keyboard.press('Escape');
        await links.first().waitFor({state:'hidden'});
        assert.equal(await toggle.evaluate(button=>button===document.activeElement),true);
        assert.ok((await toggle.boundingBox()).height>=44);
    } else {
        await links.first().focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await links.nth(1).evaluate(link=>link===document.activeElement),true);
    }
}
async function run(channel,viewport) {
    const browser=await launch(channel);
    const mobile=viewport.width===390;
    const context=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile,timezoneId:'America/New_York',reducedMotion:'reduce'});
    await context.grantPermissions(['clipboard-read','clipboard-write']);
    await context.route(api,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)}));
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`);});
    const capture=!channel&&viewport.width===1440;
    const layoutChecks=[];
    async function shot(name,selector) {
        if(!capture) return;
        if(selector) {
            const area=page.locator(selector); await area.scrollIntoViewIfNeeded();
            await area.locator('img').evaluateAll(images=>Promise.all(images.filter(im=>!im.hasAttribute('data-src')).map(im=>im.decode().catch(()=>{}))));
            await area.screenshot({path:path.join(shots,name+'.png'),style:'#main-header { visibility:hidden !important; }'});
        } else await page.screenshot({path:path.join(shots,name+'.png')});
    }
    try {
        await ready(page,'profile.html'); await page.waitForURL('**/login.html?next=profile');
        await ready(page,'index.html');
        assert.equal(await page.locator('.gallery-thumb img[data-src]').count(),9,'Gallery thumbnails stay deferred on page open');
        const search=page.locator('[data-destination-search]');
        await search.fill('a'); await search.press('ArrowDown'); await search.press('Enter');
        assert.equal(await search.inputValue(),'Aktau');
        await search.fill('al'); await search.press('ArrowDown'); await search.press('Enter');
        assert.equal(await search.inputValue(),'Almaty','City-name prefixes rank ahead of description matches');
        await search.fill('');
        await page.locator('[data-filter=nature]').click();
        assert.equal(await page.locator('.destination-column:visible').count(),2);
        await search.fill('almaty');
        assert.equal(await page.locator('.destination-column:visible').count(),1);
        assert.ok(await page.locator('[data-destination=almaty] mark').count()>0);
        const save=page.locator('[data-save=almaty]');
        if(capture) {
            await page.emulateMedia({reducedMotion:'no-preference'});
            assert.equal(await save.evaluate(button=>getComputedStyle(button).transitionDuration),'0.12s, 0.18s, 0.18s, 0.18s');
            await page.emulateMedia({reducedMotion:'reduce'});
            assert.equal(await save.evaluate(button=>getComputedStyle(button).transitionDuration),'0s');
        }
        if(mobile) await save.tap(); else await save.click();
        assert.equal(await save.getAttribute('aria-pressed'),'true');
        assert.match(await save.innerText(),/Saved/);
        await page.locator('[data-filter=saved]').click();
        await shot('search','#destinations');
        if(capture) {
            await save.focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('[data-filter=saved]').evaluate(filter=>filter===document.activeElement),true);
            assert.match(await page.locator('[data-no-results]').innerText(),/No saved places yet/);
            await page.locator('[data-clear-filters]').click();
            await search.fill('almaty'); await save.click();
        }
        await page.reload();
        assert.equal(await save.getAttribute('aria-pressed'),'true');
        const menu=page.locator('.navbar-toggler');
        if(await menu.isVisible()) await menu.click();
        await page.locator('[data-account-link]').click();
        await page.locator('.account-link-row a[href="signup.html"]').click();
        await page.locator('[data-auth-ready=true]').waitFor();
        await page.locator('button[type=submit]').click();
        assert.equal(await page.locator('[aria-invalid=true]').count(),6);
        await fillSignup(page,{email:'invalid-email',phone:'123',password:'short',confirmPassword:'different'});
        await page.locator('button[type=submit]').click();
        assert.match(await page.locator('#account-email-error').innerText(),/valid email/);
        assert.match(await page.locator('#account-phone-error').innerText(),/10–15/);
        assert.match(await page.locator('#account-password-error').innerText(),/uppercase/);
        assert.match(await page.locator('#account-confirm-error').innerText(),/match/);
        assert.equal(await page.locator('#account-password').evaluate(field=>getComputedStyle(field).backgroundImage),'none');
        await shot('signup-validation','.account-form');
        await page.locator('[data-password-toggle=account-password]').click();
        assert.equal(await page.locator('#account-password').getAttribute('type'),'text');
        await page.locator('[data-password-toggle=account-password]').click();
        await fillSignup(page,{email:'  DEMO.TRAVELLER@example.com  '});
        await shot('signup','.account-layout');
        await page.locator('button[type=submit]').click();
        await page.waitForURL('**/login.html?registered=1');
        const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('kz-users-v1')));
        assert.equal(stored.length,1); assert.equal(stored[0].email,email);
        assert.equal(stored[0].phone,'+7 777 123 45 67');
        assert.equal(typeof stored[0].password.hash,'string');
        assert.ok(!JSON.stringify(stored).includes(password),'Password is not stored as plaintext');
        await page.locator('[name=email]').fill(email);
        await page.locator('[name=password]').fill('WrongPass8!');
        await page.locator('button[type=submit]').click();
        await page.waitForFunction(()=>document.querySelector('.form-status').textContent.includes('incorrect'));
        assert.ok(page.url().includes('login.html'));
        assert.equal(await page.locator('.account-form .form-status').evaluate(status=>status===document.activeElement),true);
        await shot('login-error','.account-form');
        await page.locator('[name=password]').fill(password);
        await page.locator('button[type=submit]').click(); await page.waitForURL('**/profile.html');
        assert.equal(await page.locator('[data-profile-name]').innerText(),'Demo Traveller');
        assert.equal(await page.locator('[data-profile-email]').innerText(),email);
        assert.equal(await page.locator('[data-profile-phone]').innerText(),'+7 777 123 45 67');
        assert.equal(await page.locator('[data-profile-saved] a').getAttribute('href'),'almaty.html');
        await page.reload(); await page.locator('[data-profile-content]:visible').waitFor();
        assert.match(await page.locator('[data-profile-saved]').innerText(),/Almaty/);
        await shot('profile');
        await ready(page,'signup.html'); await fillSignup(page);
        await page.locator('button[type=submit]').click();
        await page.waitForFunction(()=>document.querySelector('#account-email-error').textContent.includes('already exists'));
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('kz-users-v1')).length),1);
        await ready(page,'profile.html');
        await theme(page); assert.equal(await page.locator('body').getAttribute('data-theme'),'night');
        await ready(page,'login.html'); assert.equal(await page.locator('body').getAttribute('data-theme'),'night');
        await shot('login-night','.account-layout');
        await ready(page,'profile.html'); await shot('profile-night');
        await theme(page);
        await page.locator('.profile-actions a[href="index.html#trip-planner"]').click();
        await page.locator('[data-jquery-ready=true]').waitFor();
        const faq=page.locator('[data-faq-search]');
        const faqSuggestions=page.locator('#faq-search-suggestions');
        const astana=faqSuggestions.getByRole('option',{name:'Astana',exact:true});
        await faq.fill('As');
        await astana.waitFor();
        await faq.press('Escape');
        assert.equal(await faqSuggestions.isVisible(),false);
        assert.equal(await faq.inputValue(),'As');
        await faq.press('ArrowDown');
        assert.equal(await astana.getAttribute('aria-selected'),'true');
        await faq.press('Enter');
        assert.equal(await faq.inputValue(),'Astana');
        assert.equal(await faqSuggestions.isVisible(),false);
        assert.equal(await page.locator('[data-faq-results]').innerText(),'1 matching question');
        assert.equal(await page.locator('.faq-panel mark:visible').innerText(),'Astana');
        if (mobile) {
            await faq.fill('As'); await astana.tap();
            assert.equal(await faq.inputValue(),'Astana');
        }
        await faq.fill('guide'); assert.ok(await page.locator('#faq mark').count()>0);
        await faq.fill('['); assert.equal(await page.locator('.faq-item:visible').count(),0);
        await faq.fill('');
        const next=page.locator('[data-planner-next]');
        await next.click();
        assert.match(await page.locator('#trip-planner-error').innerText(),/Choose a destination/);
        await page.locator('[data-trip-planner] [value=almaty]').check();
        await next.click();
        if(capture) {
            const step=page.locator('[data-planner-step="1"]');
            assert.equal(await step.evaluate(node=>getComputedStyle(node).animationName),'none');
            await page.emulateMedia({reducedMotion:'no-preference'});
            assert.equal(await step.evaluate(node=>getComputedStyle(node).animationDuration),'0.18s');
            await page.emulateMedia({reducedMotion:'reduce'});
        }
        await next.click();
        assert.match(await page.locator('#trip-name-error').innerText(),/Enter your first name/);
        assert.equal(await page.locator('#trip-name').getAttribute('aria-invalid'),'true');
        await page.locator('[name=traveler]').fill('Demo');
        await page.locator('[name=days]').selectOption('2');
        await next.click(); await next.click();
        assert.equal(await page.locator('[data-trip-stops] li').count(),2);
        const copyRoute=page.locator('[data-copy=route-copy-text]');
        await copyRoute.focus();
        await page.keyboard.press('Enter');
        await page.locator('#route-copy-tooltip').filter({hasText:'Copied to clipboard.'}).waitFor();
        assert.equal(await copyRoute.evaluate(button=>button===document.activeElement),true);
        assert.ok(await copyRoute.evaluate(button=>{
            const {color,backgroundColor}=getComputedStyle(button);
            return color!==backgroundColor;
        }), 'Focused copy label remains visible');
        assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Day 2:/);
        await shot('planner','[data-trip-planner]');
        await page.locator('#weather').scrollIntoViewIfNeeded();
        await page.locator('[data-weather-state=ready]').waitFor();
        assert.equal(await page.locator('[data-weather-name]').innerText(),'Almaty');
        assert.equal(await page.locator('[data-weather-days] li').count(),3);
        assert.equal(await page.locator('[data-weather-result] svg').count(),4);
        if(capture) {
            const refresh=page.locator('[data-weather-refresh]');
            await refresh.hover();
            assert.ok(await refresh.evaluate(button=>{
                const {color,backgroundColor}=getComputedStyle(button);
                return color!==backgroundColor;
            }), 'Hovered weather refresh label remains visible');
        }
        await shot('weather-fixture','#weather');
        await page.locator('#gallery').scrollIntoViewIfNeeded(); await page.locator('.carousel-control-next').click();
        await page.waitForFunction(()=>document.querySelector('.carousel-item.active img').getAttribute('data-lazy-state')==='loaded');
        assert.match(await page.locator('.carousel-item.active img').evaluate(image=>image.currentSrc),/\/images\/responsive\/aktau-coast-\d+\.webp$/);
        await page.locator('.gallery-thumbnails').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>[...document.querySelectorAll('.gallery-thumb img')].every(image=>image.dataset.lazyState==='loaded'));
        assert.ok(await page.locator('.gallery-thumb img').evaluateAll(images=>images.every(image=>image.currentSrc.endsWith('-thumb.webp'))));
        await page.locator('[data-star="4"]').click(); assert.match(await page.locator('[data-rating-message]').innerText(),/4\/5/);
        await page.locator('.guide-stats').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>[...document.querySelectorAll('[data-counter]')].every(node=>node.textContent===node.dataset.counter));
        const clock=page.locator('[data-live-clock]');
        const before=await clock.getAttribute('datetime');
        await page.waitForFunction(value=>document.querySelector('[data-live-clock]').dateTime!==value,before);
        if(capture) {
            const toggle=page.locator('[data-clock-toggle]');
            await toggle.click();
            const frozen=await clock.getAttribute('datetime');
            await page.waitForTimeout(1100);
            assert.equal(await clock.getAttribute('datetime'),frozen);
            await toggle.click();
            assert.notEqual(await clock.getAttribute('datetime'),frozen);
        }
        await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
        await page.waitForFunction(()=>document.querySelector('[data-scroll-progress]').getAttribute('aria-valuenow')==='100');
        const sound=page.locator('[data-sound-toggle]');
        if(await menu.isVisible()) await menu.click();
        await sound.click(); assert.equal(await sound.getAttribute('aria-pressed'),'true');
        await sound.click(); assert.equal(await sound.getAttribute('aria-pressed'),'false');
        if(await menu.isVisible()) await menu.click();

        const background=page.getByRole('combobox',{name:'Background colour',exact:true});
        assert.deepEqual(await background.locator('option').allTextContents(),['Sand','Sky','Steppe']);
        await background.selectOption('steppe');
        await page.waitForFunction(()=>getComputedStyle(document.body).backgroundColor==='rgb(239, 244, 232)');
        await ready(page,'aktau.html');
        assert.equal(await background.inputValue(),'steppe');
        await theme(page);
        await page.waitForFunction(()=>getComputedStyle(document.body).backgroundColor==='rgb(28, 41, 35)');
        await page.reload();
        assert.equal(await background.inputValue(),'steppe');
        await background.selectOption('sky');
        await page.waitForFunction(()=>getComputedStyle(document.body).backgroundColor==='rgb(21, 37, 47)');
        await background.selectOption('sand');
        await theme(page);

        for(const mode of ['day','night']) {
          if(mode==='night') await theme(page);
          for(const filename of pages) {
            await ready(page,filename);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,filename+' width '+viewport.width);
            assert.equal(await page.locator('h1:visible').count(),1,filename+' one visible heading');
            assert.equal(await page.locator('body').getAttribute('data-theme'),mode,filename+' persisted theme');
            assert.equal((await page.locator('[data-account-link]').innerText()).trim(),'My profile',filename+' '+(channel||'chromium')+' '+viewport.width);
            const lead = page.locator('img[fetchpriority=high]');
            if(await lead.count()) {
                await lead.evaluate(image=>image.decode());
                assert.match(await lead.evaluate(image=>image.currentSrc), /\/images\/responsive\/.+\.webp$/);
                if(filename==='index.html') {
                    assert.equal(await lead.evaluate(image=>image.currentSrc.includes('-portrait-')),mobile);
                }
            }
            if(filename==='index.html') {
                assert.equal(await page.locator('.destination-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length),mobile?1:2);
                const hitArea=await page.locator('[data-save=almaty]').boundingBox();
                assert.ok(hitArea.height>=44&&hitArea.width>=44,'Save target is at least 44px');
            }
            if(!channel && (capture||mobile)) {
                const name=filename.replace('.html','');
                const device=mobile?'mobile':'desktop';
                if(mode==='day' || filename==='index.html') {
                    await page.screenshot({path:path.join(shots,`${name}-${device}${mode==='night'?'-night':''}.png`)});
                }
                if(filename==='index.html') {
                    const cards=page.locator('#destinations');
                    await cards.evaluate(node=>node.scrollIntoView());
                    await page.waitForFunction(()=>[...document.querySelectorAll('#destinations img[data-src]')]
                        .every(image=>image.getBoundingClientRect().top>=innerHeight));
                    await cards.locator('.destination-photo').evaluateAll(images=>Promise.all(images
                        .filter(image=>image.getBoundingClientRect().top<innerHeight)
                        .map(image=>image.decode())));
                    await page.screenshot({path:path.join(shots,`destinations-${device}${mode==='night'?'-night':''}.png`)});
                    await page.evaluate(()=>scrollTo(0,0));
                }
            }
            await keyboardNavigation(page);
            layoutChecks.push({ page:filename, theme:mode });
            if(mode==='day' && ['aktau.html','almaty.html','shymkent.html','about.html'].includes(filename)) {
                if(filename==='about.html') await page.locator('[data-popup-open]').click();
                const form=page.locator('[data-demo-form]');
                await form.locator('button[type=submit]').click();
                assert.ok(await form.locator('[aria-invalid=true]').count()>=4);
                await form.locator('[name=name]').fill('Demo Traveller');
                await form.locator('[name=email]').fill('bad'); await form.locator('[name=phone]').fill('123');
                await form.locator('[name=message]').fill('A sample travel enquiry.');
                const checkbox=form.locator('input[type=checkbox]'); if(await checkbox.count()) await checkbox.check();
                await form.locator('button[type=submit]').click();
                assert.match(await form.locator('[id$="phone-error"]').innerText(),/10–15/);
                await form.locator('[name=email]').fill(email); await form.locator('[name=phone]').fill('+7 (777) 123-45-67');
                await form.locator('button[type=submit]').click(); assert.equal(await form.locator('[name=phone]').isDisabled(),true);
                await form.evaluate(node=>{node.requestSubmit();node.requestSubmit();});
                await page.waitForFunction(()=>document.querySelector('[data-demo-form]').getAttribute('aria-busy')==='false');
                assert.match(await form.locator('.form-status').innerText(),/passed validation/);
                assert.equal(await form.locator('[name=phone]').isEnabled(),true);
                if(filename==='about.html') { await shot('contact-form','dialog'); await page.keyboard.press('Escape'); }
            }
          }
        }
        const second=await context.newPage(); await ready(second,'profile.html');
        await Promise.all([
            page.waitForURL('**/login.html?loggedOut=1',{waitUntil:'domcontentloaded'}),
            second.waitForURL('**/login.html?next=profile',{waitUntil:'domcontentloaded'}),
            page.locator('[data-logout]').click()
        ]);
        await ready(page,'profile.html'); await page.waitForURL('**/login.html?next=profile');
        assert.deepEqual(errors,[]);
        results.push({browser:channel||'chromium',viewport,status:'passed',pageErrors:errors,layoutChecks,
            scenarios:['Almaty search, keyboard autocomplete, filters and saved state after reload','registration and salted local verifier','empty or invalid email, password, phone and confirmation','password visibility','duplicate email','wrong credentials','profile redirect and saved Almaty after reload','two-day route, field errors and clipboard','current Almaty weather and three-day fixture outlook','FAQ city suggestions, keyboard selection and literal query','deferred WebP carousel photos and compact gallery thumbnails','ratings, optional sound, live clock, counters and reading progress','background colour selection across themes, navigation and reload','nine pages in both themes, keyboard navigation, responsive photos and no horizontal overflow','custom validation on all enquiries','busy form lock and duplicate-submit guard','logout and cross-tab profile guard']});
        console.log('PASS',channel||'chromium',viewport.width);
    } catch(error) {
        console.error('STATE',channel||'chromium',viewport.width,page.url(),await page.evaluate(()=>({session:localStorage.getItem('kz-session-v1'),jquery:document.body.dataset.jqueryReady,authScripts:[...document.scripts].filter(s=>s.src.includes('auth.js')).length})).catch(()=>null),errors);
        throw error;
    } finally { await browser.close(); }
}
async function restricted() {
    const browser=await launch();
    try {
        const context=await browser.newContext();
        await context.route('https://code.jquery.com/**',route=>route.abort());
        await context.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});
        const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await ready(page,'index.html');
        const save=page.locator('[data-save=almaty]');
        await save.click();
        assert.equal(await save.getAttribute('aria-pressed'),'false');
        assert.match(await page.locator('[data-destination=almaty] [data-save-error]').innerText(),/Couldn’t save Almaty/);
        assert.equal(await page.evaluate(()=>localStorage.getItem('kz-saved')),null);
        await ready(page,'signup.html'); await fillSignup(page);await page.locator('button[type=submit]').click();
        await page.waitForFunction(()=>document.querySelector('.form-status').textContent.includes('storage is unavailable'));
        assert.equal(await page.locator('button[type=submit]').isEnabled(),true);
        assert.equal(await page.locator('[name=password]').inputValue(),'');
        assert.deepEqual(errors,[]); await context.close();
        const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
        const staticPage=await nojs.newPage();await staticPage.goto(baseURL);
        assert.equal(await staticPage.locator('#main-navigation').isVisible(),true);
        assert.equal(await staticPage.locator('.faq-panel').first().isVisible(),true);
        const photo=staticPage.locator('[data-destination=aktau] img:not([data-src])');
        await photo.evaluate(image=>image.decode());
        assert.match(await photo.evaluate(image=>image.currentSrc),/\/images\/responsive\/aktau-coast-\d+\.webp$/);
        await staticPage.goto(new URL('signup.html',baseURL).href);
        assert.equal(await staticPage.locator('[data-auth-form]').isVisible(),false);
        assert.equal(await staticPage.locator('.auth-noscript').isVisible(),true);
        await nojs.close();
        results.push({status:'passed',scenarios:['CDN fallback','storage-denied signup restores controls','no plaintext password on failure','no-JavaScript readable navigation and FAQ','account no-JavaScript explanation']});
    } finally {await browser.close();}
}
async function weatherRecovery() {
    const browser = await launch();
    try {
        const page = await browser.newPage();
        let shouldFail = true;
        let requests = 0;
        await page.route(api, route => {
            requests += 1;
            if (shouldFail) return route.fulfill({ status:503, body:'' });
            return route.fulfill({ json:fixture });
        });
        await ready(page,'index.html');
        await page.locator('#weather').scrollIntoViewIfNeeded();
        await page.locator('[data-weather-state=error]').waitFor();
        assert.equal(await page.locator('[data-weather-result]').isVisible(),false);
        const retry = page.locator('[data-weather-refresh]');
        assert.match(await retry.innerText(),/Try again/);
        shouldFail = false;
        await retry.focus();
        await page.keyboard.press('Enter');
        await page.locator('[data-weather-state=ready]').waitFor();
        assert.equal(await retry.evaluate(button=>button===document.activeElement),true);
        assert.equal(await page.locator('[data-weather-days] li').count(),3);
        await page.reload();
        await page.locator('#weather').scrollIntoViewIfNeeded();
        await page.locator('[data-weather-state=ready]').waitFor();
        assert.equal(requests,2,'Reload uses the saved forecast');
        shouldFail = true;
        await retry.click();
        await page.locator('[data-weather-state=cached]').waitFor();
        assert.match(await page.locator('[data-weather-status]').innerText(),/saved forecast/);
        assert.equal(await page.locator('[data-weather-days] li').count(),3);
        results.push({status:'passed',scenarios:['weather HTTP failure and successful retry','fresh forecast survives reload','failed refresh falls back to a dated cached forecast']});
        console.log('PASS weather failure, retry and cache');
    } finally { await browser.close(); }
}
async function realWeather() {
    const browser=await launch();
    try {
        const page=await browser.newPage({viewport:{width:1440,height:1000}});
        await ready(page,'index.html'); await page.locator('#weather').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>document.querySelector('[data-weather]').dataset.weatherState==='ready');
        assert.equal(await page.locator('[data-weather-days] li').count(),3);
        await page.locator('#weather').screenshot({path:path.join(shots,'weather-real.png')});
        await theme(page);await page.locator('#weather').screenshot({path:path.join(shots,'weather-real-night.png')});
        results.push({status:'passed',scenarios:['real Open-Meteo forecast, three days, light/dark renders']});
        console.log('PASS live Open-Meteo');
    } finally {await browser.close();}
}
(async()=>{
    await fs.mkdir(shots,{recursive:true});
    for(const channel of [undefined,'msedge']) for(const viewport of viewports) {
        if(process.env.KZ_FINAL_WIDTH && String(viewport.width)!==process.env.KZ_FINAL_WIDTH) continue;
        if(process.env.KZ_FINAL_CHANNEL && (channel||'chromium')!==process.env.KZ_FINAL_CHANNEL) continue;
        await run(channel,viewport);
    }
    await restricted();
    await weatherRecovery();
    if(process.env.KZ_WEATHER_LIVE==='1') await realWeather();
    await fs.writeFile(path.join(output,process.env.KZ_TRAVEL_LIVE==='1'?'live-browser-verification.json':'browser-verification.json'),JSON.stringify({checkedAtUTC:new Date().toISOString(),baseURL,fixtureWeather:'Only deterministic layout scenarios use fixture weather. weather-real screenshots use the real API.',results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
