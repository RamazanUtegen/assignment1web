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
async function run(channel,viewport) {
    const browser=await chromium.launch({headless:true,...(channel?{channel}:{})});
    const context=await browser.newContext({viewport,timezoneId:'America/New_York',reducedMotion:'reduce'});
    await context.grantPermissions(['clipboard-read','clipboard-write']);
    await context.route(api,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)}));
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`);});
    const capture=!channel&&viewport.width===1440;
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
        await ready(page,'signup.html');
        await page.locator('button[type=submit]').click();
        assert.equal(await page.locator('[aria-invalid=true]').count(),6);
        await fillSignup(page,{email:'invalid-email',phone:'123',password:'short',confirmPassword:'different'});
        await page.locator('button[type=submit]').click();
        assert.match(await page.locator('#account-email-error').innerText(),/valid email/);
        assert.match(await page.locator('#account-phone-error').innerText(),/10–15/);
        assert.match(await page.locator('#account-password-error').innerText(),/uppercase/);
        assert.match(await page.locator('#account-confirm-error').innerText(),/match/);
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
        await shot('login-error','.account-form');
        await page.locator('[name=password]').fill(password);
        await page.locator('button[type=submit]').click(); await page.waitForURL('**/profile.html');
        assert.equal(await page.locator('[data-profile-name]').innerText(),'Demo Traveller');
        assert.equal(await page.locator('[data-profile-email]').innerText(),email);
        await page.reload(); await page.locator('[data-profile-content]:visible').waitFor();
        await shot('profile');
        await ready(page,'signup.html'); await fillSignup(page);
        await page.locator('button[type=submit]').click();
        await page.waitForFunction(()=>document.querySelector('#account-email-error').textContent.includes('already exists'));
        assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('kz-users-v1')).length),1);
        await ready(page,'index.html');
        await page.locator('[data-destination-search]').fill('almaty');
        assert.equal(await page.locator('.destination-column:visible').count(),1);
        assert.ok(await page.locator('[data-destination=almaty] mark').count()>0);
        await page.locator('[data-destination-search]').fill('a');
        await page.locator('[data-destination-search]').press('ArrowDown');
        await page.locator('[data-destination-search]').press('Enter');
        assert.equal(await page.locator('[data-destination-search]').inputValue(),'Aktau');
        await page.locator('[data-destination-search]').fill('');
        await page.locator('[data-filter=nature]').click(); assert.equal(await page.locator('.destination-column:visible').count(),2);
        await page.locator('[data-save=aktau]').click();
        await shot('search','#destinations');
        await ready(page,'profile.html'); assert.equal(await page.locator('[data-profile-saved] a').innerText(),'Aktau ↗');
        await theme(page); assert.equal(await page.locator('body').getAttribute('data-theme'),'night');
        await ready(page,'login.html'); assert.equal(await page.locator('body').getAttribute('data-theme'),'night');
        await shot('login-night','.account-layout');
        await ready(page,'profile.html'); await shot('profile-night');
        await theme(page);
        await ready(page,'index.html');
        await page.locator('[data-faq-search]').fill('guide'); assert.ok(await page.locator('#faq mark').count()>0);
        await page.locator('[data-faq-search]').fill('['); assert.equal(await page.locator('.faq-item:visible').count(),0);
        await page.locator('[data-faq-search]').fill('');
        await page.locator('[data-trip-planner] [value=almaty]').check();
        await page.locator('[data-planner-next]').click(); await page.locator('[name=traveler]').fill('Demo');
        await page.locator('[name=days]').selectOption('3');
        await page.locator('[data-planner-next]').click(); await page.locator('[data-planner-next]').click();
        await page.locator('[data-copy=route-copy-text]').click();
        await page.locator('#route-copy-tooltip').waitFor({state:'visible'});
        assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/Day 3:/);
        await shot('planner','[data-trip-planner]');
        await page.locator('#gallery').scrollIntoViewIfNeeded(); await page.locator('.carousel-control-next').click();
        await page.waitForFunction(()=>document.querySelector('.carousel-item.active img').getAttribute('data-lazy-state')==='loaded');
        await page.locator('[data-star="4"]').click(); assert.match(await page.locator('[data-rating-message]').innerText(),/4\/5/);

        for(const filename of pages) {
            await ready(page,filename);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,filename+' width '+viewport.width);
            assert.equal(await page.locator('h1:visible').count(),1,filename+' one visible heading');
            assert.equal((await page.locator('[data-account-link]').innerText()).trim(),'My profile',filename+' '+(channel||'chromium')+' '+viewport.width);
            if(capture) await shot(filename.replace('.html','')+'-desktop');
            if(!channel&&viewport.width===390&&['index.html','signup.html','profile.html'].includes(filename)) {
                await page.screenshot({path:path.join(shots,filename.replace('.html','')+'-mobile.png')});
            }
            if(['aktau.html','almaty.html','shymkent.html','about.html'].includes(filename)) {
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
        const second=await context.newPage(); await ready(second,'profile.html');
        await page.locator('[data-logout]').click(); await page.waitForURL('**/login.html?loggedOut=1');
        await second.waitForURL('**/login.html?next=profile');
        await ready(page,'profile.html'); await page.waitForURL('**/login.html?next=profile');
        assert.deepEqual(errors,[]);
        results.push({browser:channel||'chromium',viewport,status:'passed',pageErrors:errors,
            scenarios:['registration and hashed local persistence','empty/invalid email, password, phone and confirmation','password visibility','duplicate email','wrong credentials','login redirect and profile','persistent session','cross-page light/dark','saved city in profile','search/filter/autocomplete/highlight','FAQ literal query','route builder and actual clipboard','carousel lazy loading','ratings','nine connected responsive pages','custom validation on all enquiries','busy form lock and duplicate-submit guard','logout and cross-tab profile guard']});
        console.log('PASS',channel||'chromium',viewport.width);
    } catch(error) {
        console.error('STATE',channel||'chromium',viewport.width,page.url(),await page.evaluate(()=>({session:localStorage.getItem('kz-session-v1'),jquery:document.body.dataset.jqueryReady,authScripts:[...document.scripts].filter(s=>s.src.includes('auth.js')).length})).catch(()=>null),errors);
        throw error;
    } finally { await browser.close(); }
}
async function restricted() {
    const browser=await chromium.launch();
    try {
        const context=await browser.newContext();
        await context.route('https://code.jquery.com/**',route=>route.abort());
        await context.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Blocked','SecurityError');};});
        const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await ready(page,'signup.html'); await fillSignup(page);await page.locator('button[type=submit]').click();
        await page.waitForFunction(()=>document.querySelector('.form-status').textContent.includes('storage is unavailable'));
        assert.equal(await page.locator('button[type=submit]').isEnabled(),true);
        assert.equal(await page.locator('[name=password]').inputValue(),'');
        assert.deepEqual(errors,[]); await context.close();
        const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
        const staticPage=await nojs.newPage();await staticPage.goto(baseURL);
        assert.equal(await staticPage.locator('#main-navigation').isVisible(),true);
        assert.equal(await staticPage.locator('.faq-panel').first().isVisible(),true);
        await staticPage.goto(new URL('signup.html',baseURL).href);
        assert.equal(await staticPage.locator('[data-auth-form]').isVisible(),false);
        assert.equal(await staticPage.locator('.auth-noscript').isVisible(),true);
        await nojs.close();
        results.push({status:'passed',scenarios:['CDN fallback','storage-denied signup restores controls','no plaintext password on failure','no-JavaScript readable navigation and FAQ','account no-JavaScript explanation']});
    } finally {await browser.close();}
}
async function realWeather() {
    const browser=await chromium.launch();
    try {
        const page=await browser.newPage({viewport:{width:1440,height:1000}});
        await ready(page,'index.html'); await page.locator('#weather').scrollIntoViewIfNeeded();
        await page.waitForFunction(()=>document.querySelector('[data-weather]').dataset.weatherState==='ready');
        assert.equal(await page.locator('[data-weather-days] li').count(),3);
        await page.locator('#weather').screenshot({path:path.join(shots,'weather-real.png')});
        await theme(page);await page.locator('#weather').screenshot({path:path.join(shots,'weather-real-night.png')});
        results.push({status:'passed',scenarios:['real Open-Meteo forecast, three days, light/dark renders']});
    } finally {await browser.close();}
}
(async()=>{
    await fs.mkdir(shots,{recursive:true});
    for(const channel of [undefined,'msedge']) for(const viewport of [{width:1440,height:1000},{width:1024,height:900},{width:390,height:844}]) {
        if(process.env.KZ_FINAL_WIDTH && String(viewport.width)!==process.env.KZ_FINAL_WIDTH) continue;
        if(process.env.KZ_FINAL_CHANNEL && (channel||'chromium')!==process.env.KZ_FINAL_CHANNEL) continue;
        await run(channel,viewport);
    }
    await restricted();
    if(process.env.KZ_WEATHER_LIVE==='1') await realWeather();
    await fs.writeFile(path.join(output,process.env.KZ_TRAVEL_LIVE==='1'?'live-browser-verification.json':'browser-verification.json'),JSON.stringify({checkedAtUTC:new Date().toISOString(),baseURL,fixtureWeather:'Only deterministic layout scenarios use fixture weather. weather-real screenshots use the real API.',results},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
