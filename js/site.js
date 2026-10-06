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
