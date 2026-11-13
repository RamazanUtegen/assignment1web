/* Browser-local authentication simulation. The password is a salted verifier,
   never plaintext. This does not replace server authentication or authorisation. */
(() => {
    'use strict';
    const USERS_KEY = 'kz-users-v1';
    const SESSION_KEY = 'kz-session-v1';
    const ITERATIONS = 120000;
    const toHex = bytes => Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
    function users() {
        let value;
        try { value = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
        catch (error) {
            if (error.name === 'SecurityError') throw error;
            throw new Error('Local account data could not be read. Use another browser profile or restore your browser storage.');
        }
        if (!Array.isArray(value)) throw new Error('Account data could not be read in this browser.');
        return value.filter(user => user && typeof user.name === 'string' && typeof user.email === 'string' && typeof user.phone === 'string' &&
            /^[a-f0-9]{32}$/.test(user.password?.salt) && /^[a-f0-9]{64}$/.test(user.password?.hash) && user.password.iterations === ITERATIONS);
    }
    function currentUser() {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
        return session && users().find(user => user.email === session.email);
    }
    async function passwordHash(password, salt) {
        if (!window.crypto?.subtle) throw new Error('Open the hosted HTTPS website or use localhost to use accounts.');
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const bytes = await crypto.subtle.deriveBits({
            name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS,
            salt: Uint8Array.from(salt.match(/../g), value => parseInt(value, 16))
        }, key, 256);
        return toHex(new Uint8Array(bytes));
    }
    function updateNavigation(user) {
        document.querySelectorAll('[data-account-link]').forEach(link => {
            link.href = user ? 'profile.html' : 'login.html';
            link.textContent = user ? 'My profile' : 'Log in';
        });
    }
    function showProfile(user) {
        const content = document.querySelector('[data-profile-content]');
        if (!content) return;
        if (!user) { location.replace('login.html?next=profile'); return; }
        const text = (selector, value) => { content.querySelector(selector).textContent = value; };
        text('[data-profile-name]', user.name);
        text('[data-profile-email]', user.email);
        text('[data-profile-phone]', user.phone);
        text('[data-profile-initials]', user.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase());
        const list = content.querySelector('[data-profile-saved]');
        list.replaceChildren();
        let saved;
        try { saved = JSON.parse(localStorage.getItem('kz-saved') || '[]'); } catch { saved = []; }
        const names = { aktau: 'Aktau', astana: 'Astana', almaty: 'Almaty', shymkent: 'Shymkent' };
        const valid = Array.isArray(saved) ? [...new Set(saved.filter(id => Object.hasOwn(names, id)))] : [];
        valid.forEach(id => {
            const link = document.createElement('a');
            link.href = id + '.html'; link.textContent = names[id] + ' ↗'; link.className = 'saved-guide-link';
            const item = document.createElement('li'); item.append(link); list.append(item);
        });
        content.querySelector('[data-profile-empty]').hidden = valid.length > 0;
        document.querySelector('[data-profile-locked]').hidden = true;
        content.hidden = false;
    }
    function refreshSession() {
        try { const user = currentUser(); updateNavigation(user); showProfile(user); }
        catch {
            updateNavigation(null);
            const locked = document.querySelector('[data-profile-locked]');
            if (locked) {
                document.querySelector('[data-profile-content]').hidden = true;
                locked.hidden = false;
                locked.querySelector('p').textContent = 'Browser storage is unavailable or account data could not be read. Allow site storage and try signing in again.';
            }
        }
    }
    refreshSession();
    window.addEventListener('storage', event => {
        if ([USERS_KEY, SESSION_KEY, 'kz-saved', null].includes(event.key)) refreshSession();
    });
    document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', () => {
        try { localStorage.removeItem(SESSION_KEY); location.replace('login.html?loggedOut=1'); }
        catch { document.querySelector('[data-profile-status]').textContent = 'Could not access browser storage. Please try again.'; }
    }));
    document.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
        const field = document.getElementById(button.dataset.passwordToggle);
        const show = field.type === 'password';
        field.type = show ? 'text' : 'password';
        button.textContent = show ? 'Hide' : 'Show';
        button.setAttribute('aria-pressed', String(show));
        button.setAttribute('aria-label', (show ? 'Hide ' : 'Show ') + (field.name === 'confirmPassword' ? 'password confirmation' : 'password'));
    }));
    document.querySelectorAll('[data-auth-form]').forEach(form => {
        const status = form.querySelector('.form-status');
        if (form.dataset.authForm === 'login' && new URLSearchParams(location.search).has('loggedOut')) status.textContent = 'You are logged out. Your local account is still saved.';
        const validator = KZValidation.bind(form, async values => {
            const email = values.email.toLowerCase();
            const controls = Array.from(form.querySelectorAll('input:enabled, button:enabled'));
            const submit = form.querySelector('button[type=submit]');
            const originalLabel = submit.textContent;
            form.setAttribute('aria-busy', 'true');
            controls.forEach(control => { control.disabled = true; });
            submit.replaceChildren();
            const spinner = document.createElement('span'); spinner.className = 'submit-spinner'; spinner.setAttribute('aria-hidden', 'true');
            submit.append(spinner, document.createTextNode('Please wait…'));
            status.classList.remove('form-status-error');
            status.textContent = form.dataset.authForm === 'signup' ? 'Saving your local demo account…' : 'Checking your details…';
            let fieldError;
            try {
                const accounts = users();
                if (form.dataset.authForm === 'signup') {
                    if (accounts.some(user => user.email === email)) { fieldError = ['email', 'An account with this email already exists on this browser. Log in instead.']; throw new Error('Please use another email or log in.'); }
                    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
                    const hash = await passwordHash(values.password, salt);
                    // Read again after await so two open signup tabs do not overwrite accounts.
                    const latest = users();
                    if (latest.some(user => user.email === email)) throw new Error('This email has just been registered. Please log in.');
                    latest.push({ name: values.name, email, phone: values.phone, password: { salt, hash, iterations: ITERATIONS }, createdAt: new Date().toISOString() });
                    localStorage.setItem(USERS_KEY, JSON.stringify(latest));
                    status.textContent = 'Account created on this browser. Opening login…';
                    location.assign('login.html?registered=1');
                } else {
                    const user = accounts.find(account => account.email === email);
                    if (!user || await passwordHash(values.password, user.password.salt) !== user.password.hash) throw new Error('Email or password is incorrect. Please try again.');
                    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, loggedInAt: new Date().toISOString() }));
                    status.textContent = 'Welcome back. Opening your travel notebook…';
                    location.assign('profile.html');
                }
            } catch (error) {
                status.classList.add('form-status-error');
                status.textContent = error.name === 'SecurityError' || error.name === 'QuotaExceededError' ? 'Browser storage is unavailable. Allow site storage and try again.' : error.message;
            } finally {
                controls.forEach(control => { control.disabled = false; });
                submit.textContent = originalLabel;
                form.setAttribute('aria-busy', 'false');
                form.querySelectorAll('input[data-rules~="password"], input[data-rules~="confirm"]').forEach(field => { field.value = ''; });
                if (fieldError) validator.invalidate(...fieldError);
            }
        });
        if (form.dataset.authForm === 'login' && new URLSearchParams(location.search).has('registered')) status.textContent = 'Your local account is ready. Log in to open your profile.';
    });
    document.body.dataset.authReady = 'true';
})();
