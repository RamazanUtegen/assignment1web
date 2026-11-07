// Initialize manual carousels so arrow keys work before the first mouse click.
// The Bootstrap bundle must load before this file.
if (typeof bootstrap !== 'undefined') {
    document.querySelectorAll('.carousel').forEach(function (carousel) {
        bootstrap.Carousel.getOrCreateInstance(carousel, {
            interval: false,
            ride: false
        });
    });
}

// Close the mobile menu after an in-page link and return Escape focus to its toggle.
const navigation = document.getElementById('main-navigation');
const navigationToggle = document.querySelector('.navbar-toggler');
function closeNavigation() {
    const collapse = bootstrap.Collapse.getOrCreateInstance(navigation, { toggle: false });
    if (navigation.classList.contains('collapsing')) {
        navigation.addEventListener('shown.bs.collapse', () => collapse.hide(), { once: true });
    } else collapse.hide();
}
navigation?.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navigationToggle.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        closeNavigation();
        navigationToggle.focus();
    }
});
navigation?.addEventListener('click', function (event) {
    const link = event.target.closest('a[href]');
    if (!link || navigationToggle.getAttribute('aria-expanded') !== 'true') return;
    const target = new URL(link.href);
    if (target.pathname === location.pathname && target.hash) {
        closeNavigation();
    }
});
