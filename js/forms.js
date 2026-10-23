// Assignment 4, Task 1. Team study responsibility: Ramazan Utegen.
// Validate in the browser; this static classroom project sends no form data.
document.querySelectorAll('[data-demo-form]').forEach(function (form) {
    const fields = Array.from(form.querySelectorAll('input, textarea, select'));
    const status = form.querySelector('.form-status');
    status.textContent = '';
    let submitted = false;

    // Custom messages replace browser bubbles after our handler is ready.
    form.noValidate = true;
    fields.filter(function (field) {
        return field.required || field.type === 'email';
    }).forEach(function (field) {
        const error = document.createElement('span');
        error.id = field.id + '-error';
        error.className = 'field-error';
        field.insertAdjacentElement('afterend', error);
        const description = field.getAttribute('aria-describedby') || '';
        field.setAttribute('aria-describedby', (description + ' ' + error.id).trim());
    });

    function validationMessage(field) {
        const value = field.value;
        if (field.type === 'checkbox') {
            return field.required && !field.checked ? 'Please tick this checkbox to continue.' : '';
        }
        if (field.required && !value.trim()) {
            return 'This field is required. Please enter more than spaces.';
        }
        if (field.type === 'email' && value && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
            return 'Enter a valid email address, such as name@example.com.';
        }
        if (field.minLength > 0 && value.length < field.minLength) {
            return 'Use at least ' + field.minLength + ' characters.';
        }
        if (field.hasAttribute('data-confirm-for')) {
            const password = document.getElementById(field.dataset.confirmFor);
            if (value !== password.value) {
                return 'Passwords must match.';
            }
        }
        return '';
    }

    function validate(field) {
        const error = document.getElementById(field.id + '-error');
        if (!error) return true;
        const message = validationMessage(field);
        error.textContent = message;
        field.classList.toggle('is-invalid', Boolean(message));
        field.setAttribute('aria-invalid', String(Boolean(message)));
        return !message;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitted = true;
        const invalid = fields.filter(function (field) { return !validate(field); });
        status.classList.toggle('form-status-error', invalid.length > 0);
        if (invalid.length) {
            status.textContent = 'Please correct ' + invalid.length + ' highlighted field' + (invalid.length === 1 ? '.' : 's.');
            invalid[0].focus();
            return;
        }
        status.textContent = 'Thank you, ' + form.elements.namedItem('name').value.trim() +
            '! Your form passed validation. This is a demo; no account, booking, subscription or message was created.';
        // Passwords are only compared in memory and are cleared after success.
        fields.filter(function (field) { return field.type === 'password'; }).forEach(function (field) {
            field.value = '';
        });
        submitted = false;
    });

    function updateFeedback(event) {
        status.textContent = '';
        status.classList.remove('form-status-error');
        if (submitted) {
            validate(event.target);
            // Recheck confirmation when the original password changes.
            form.querySelectorAll('[data-confirm-for]').forEach(validate);
        }
    }
    form.addEventListener('input', updateFeedback);
    form.addEventListener('change', updateFeedback);
    form.querySelector('button[type="submit"]').disabled = false;
});
