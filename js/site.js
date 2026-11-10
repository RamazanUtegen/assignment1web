// Reveal the full keyboard target in horizontal rails; native focus scrolling
// may stop as soon as only part of a link or thumbnail is visible.
document.querySelectorAll('.page-subnav, .gallery-thumbnails').forEach(function (rail) {
    rail.addEventListener('focusin', function (event) {
        if (!event.target.matches('a:focus-visible, button:focus-visible')) return;
        event.target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    });
});

// Initialize manual carousels so arrow keys work before the first mouse click.
// The Bootstrap bundle must load before this file.
if (typeof bootstrap !== 'undefined') {
    document.querySelectorAll('.carousel').forEach(function (carousel) {
        bootstrap.Carousel.getOrCreateInstance(carousel, {
            interval: false,
            ride: false
        });
    });

    const navigation = document.getElementById('main-navigation');
    const navigationToggle = document.querySelector('[data-bs-target="#main-navigation"]');
    if (navigation && navigationToggle) {
        navigation.addEventListener('click', function (event) {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            const link = event.target.closest('a[href]');
            if (!link || !navigation.classList.contains('show') || !navigationToggle.getClientRects().length) return;
            const url = new URL(link.href);
            if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
            const target = document.getElementById(url.hash.slice(1));
            if (!target) return;
            // Wait for the sticky header to shrink before positioning the destination.
            navigation.addEventListener('hidden.bs.collapse', function () {
                if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
                target.focus({ preventScroll: true });
                target.scrollIntoView({ block: 'start' });
            }, { once: true });
            bootstrap.Collapse.getOrCreateInstance(navigation, { toggle: false }).hide();
        });
        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !navigation.classList.contains('show') || !navigationToggle.getClientRects().length) return;
            if (!navigation.contains(event.target) && event.target !== navigationToggle) return;
            event.preventDefault();
            bootstrap.Collapse.getOrCreateInstance(navigation, { toggle: false }).hide();
            navigationToggle.focus();
        });
    }
}
