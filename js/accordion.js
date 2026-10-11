// Assignment 4, Task 2. Team study responsibility: Ziyadinkhan Kudaibergenuly.
document.querySelectorAll('[data-accordion-trigger]').forEach(function (button) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', function () {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        panel.setAttribute('aria-hidden', String(!open));
        panel.inert = !open;
        button.closest('.faq-item').classList.toggle('is-open', open);
    });
});
