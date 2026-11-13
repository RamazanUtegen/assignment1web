/* Enquiry forms share the same explicit rules as account forms. No data is sent. */
document.querySelectorAll('[data-demo-form]').forEach(function (form) {
    KZValidation.bind(form, function (values) {
        const status = form.querySelector('.form-status');
        const complete = function () {
            status.textContent = 'Thank you, ' + values.name + '! Your enquiry passed validation. This classroom demo sends no message and makes no booking.';
        };
        const loading = new CustomEvent('kz:form-loading', {
            bubbles: true, cancelable: true, detail: { complete: complete }
        });
        if (form.dispatchEvent(loading)) complete();
    });
});
