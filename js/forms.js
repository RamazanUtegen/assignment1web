// This classroom demo validates input and gives feedback; it sends no data.
document.querySelectorAll('[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const status = form.querySelector('.form-status');
        const name = form.elements.namedItem('name').value.trim();
        const message = form.elements.namedItem('message').value.trim();
        if (!name || !message) {
            status.textContent = 'Please enter a name and message containing more than spaces.';
            return;
        }
        status.textContent = 'Thank you, ' + name + '! Your demo form passed validation. Nothing was sent and no booking or subscription was created.';
    });
    form.addEventListener('input', function () {
        form.querySelector('.form-status').textContent = '';
    });
    // Only enable submission after the demo handler is attached.
    form.querySelector('button[type="submit"]').disabled = false;
});
