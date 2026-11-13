/* Final project: explicit JavaScript rules, independent of HTML constraint validation. */
(() => {
    'use strict';
    function message(field, form) {
        const rules = (field.dataset.rules || '').split(' ');
        const raw = field.value;
        const value = raw.trim();
        if (rules.includes('required') && (field.type === 'checkbox' ? !field.checked : !value)) {
            return field.type === 'checkbox' ? 'Please tick this checkbox to continue.' : 'Please complete this field.';
        }
        if (!value && !rules.includes('required')) return '';
        if (rules.includes('name') && (value.length < 2 || value.length > 60)) return 'Use a name between 2 and 60 characters.';
        if (rules.includes('email') && (value.length > 254 || value.includes('..') ||
            !/^[^\s@<>]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(value))) {
            return 'Enter a valid email address, such as traveller@example.com.';
        }
        if (rules.includes('phone') && !/^\+?[1-9]\d{9,14}$/.test(value.replace(/[\s()-]/g, ''))) {
            return 'Use 10–15 digits, optionally starting with +. For example: +7 777 123 45 67.';
        }
        if (rules.includes('password') && (raw.length < 8 || raw.length > 64 ||
            !/[a-z]/.test(raw) || !/[A-Z]/.test(raw) || !/\d/.test(raw) || !/[^A-Za-z0-9\s]/.test(raw) || /\s/.test(raw))) {
            return 'Use 8–64 characters with an uppercase letter, lowercase letter, number and symbol, without spaces.';
        }
        if (rules.includes('confirm') && raw !== form.elements.namedItem('password').value) return 'Passwords must match.';
        if (rules.includes('message') && (value.length < 10 || value.length > 2000)) return 'Write a message between 10 and 2,000 characters.';
        return '';
    }

    function bind(form, onValid) {
        const fields = Array.from(form.querySelectorAll('[data-rules]'));
        const status = form.querySelector('.form-status');
        let attempted = false;
        form.noValidate = true;
        fields.forEach(field => {
            const error = document.createElement('span');
            error.id = field.id + '-error';
            error.className = 'field-error';
            field.insertAdjacentElement('afterend', error);
            field.setAttribute('aria-describedby', ((field.getAttribute('aria-describedby') || '') + ' ' + error.id).trim());
        });
        function validate(field, override) {
            if (field.disabled) return true;
            const text = override === undefined ? message(field, form) : override;
            document.getElementById(field.id + '-error').textContent = text;
            field.classList.toggle('is-invalid', Boolean(text));
            field.setAttribute('aria-invalid', String(Boolean(text)));
            return !text;
        }
        form.addEventListener('submit', event => {
            event.preventDefault();
            if (form.getAttribute('aria-busy') === 'true') return;
            attempted = true;
            const invalid = fields.filter(field => !validate(field));
            status.classList.toggle('form-status-error', invalid.length > 0);
            if (invalid.length) {
                status.textContent = `Please correct ${invalid.length} highlighted ${invalid.length === 1 ? 'field' : 'fields'}.`;
                invalid[0].focus();
                return;
            }
            const values = Object.fromEntries(fields.filter(field => field.name).map(field =>
                [field.name, field.type === 'password' ? field.value : field.value.trim()]));
            onValid(values);
        });
        function update(event) {
            if (form.getAttribute('aria-busy') === 'true') return;
            status.textContent = '';
            status.classList.remove('form-status-error');
            if (attempted && fields.includes(event.target)) {
                validate(event.target);
                fields.filter(field => (field.dataset.rules || '').includes('confirm')).forEach(field => validate(field));
            }
        }
        form.addEventListener('input', update);
        form.addEventListener('change', update);
        form.querySelector('button[type=submit]').disabled = false;
        return { invalidate(name, text) { const field = form.elements.namedItem(name); validate(field, text); field.focus(); } };
    }
    window.KZValidation = Object.freeze({ bind, message });
})();
