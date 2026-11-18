/* Assignment 6. jQuery handles discovery, feedback and viewport enhancements. */
(() => {
    'use strict';

    function initialise() {
        const $ = window.jQuery;
        // Task 0: wait for the DOM before binding any jQuery handlers.
        $(document).ready(function () {
            console.log('jQuery is ready!');
            const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
            const duration = milliseconds => motion.matches ? 0 : milliseconds;

            // Task 7: one notification channel, shared with earlier features.
            const $toast = $('.toast-message');
            let toastTimer;
            function notify(message) {
                clearTimeout(toastTimer);
                $toast.stop(true, true).text(message).fadeIn(duration(180));
                toastTimer = setTimeout(() => {
                    $toast.fadeOut(duration(350), function () { $(this).empty(); });
                }, 2800);
            }
            $(document).on('kz:notify', function (event) {
                notify(event.originalEvent.detail.message);
            });

            // Task 3: escape regex syntax and build marks from text nodes only.
            function highlight($containers, query) {
                $containers.find('mark.search-match').each(function () {
                    const parent = this.parentNode;
                    $(this).replaceWith($(this).contents());
                    parent.normalize();
                });
                if (!query) return;
                const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                $containers.each(function () {
                    const walker = document.createTreeWalker(this, NodeFilter.SHOW_TEXT);
                    const nodes = [];
                    while (walker.nextNode()) nodes.push(walker.currentNode);
                    nodes.forEach(node => {
                        pattern.lastIndex = 0;
                        const matches = [...node.textContent.matchAll(pattern)];
                        if (!matches.length) return;
                        const fragment = document.createDocumentFragment();
                        let offset = 0;
                        matches.forEach(match => {
                            fragment.append(node.textContent.slice(offset, match.index));
                            fragment.append($('<mark>', { class: 'search-match', text: match[0] })[0]);
                            offset = match.index + match[0].length;
                        });
                        fragment.append(node.textContent.slice(offset));
                        node.replaceWith(fragment);
                    });
                });
            }

            const queryText = $input => String($input.val() || '').trim().slice(0, 80).toLowerCase();

            function bindSuggestions($input, getLabels, updateResults) {
                if (!$input.length) return;
                const listId = $input.attr('aria-controls');
                const $suggestions = $(document.getElementById(listId));
                const optionPrefix = listId.replace(/-suggestions$/, '');
                let activeSuggestion = -1;

                function close() {
                    $suggestions.prop('hidden', true).empty();
                    $input.attr('aria-expanded', 'false').removeAttr('aria-activedescendant');
                    activeSuggestion = -1;
                }
                function open() {
                    close();
                    const query = queryText($input);
                    if (!query) return;
                    const labels = getLabels(query);
                    if (!labels.length) return;
                    labels.forEach((label, index) => {
                        $('<li>', { role: 'option', id: `${optionPrefix}-option-${index}`,
                            'aria-selected': 'false', text: label
                        }).appendTo($suggestions);
                    });
                    $suggestions.prop('hidden', false);
                    $input.attr('aria-expanded', 'true');
                }
                function choose($option) {
                    $input.val($option.text());
                    updateResults();
                    $input.trigger('focus');
                    close();
                }
                $suggestions.on('pointerdown', event => event.preventDefault());
                $suggestions.on('click', '[role=option]', function () { choose($(this)); });
                $input.on('input', () => { updateResults(); open(); });
                $input.on('focus', open);
                $input.on('blur', close);
                $input.on('keydown', function (event) {
                    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
                    if (event.key === 'Enter' && activeSuggestion >= 0) {
                        event.preventDefault();
                        choose($suggestions.children().eq(activeSuggestion));
                        return;
                    }
                    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
                    if ($suggestions.prop('hidden')) open();
                    const $options = $suggestions.children();
                    if (!$options.length) return;
                    event.preventDefault();
                    const direction = event.key === 'ArrowDown' ? 1 : -1;
                    activeSuggestion = activeSuggestion < 0 ? (direction === 1 ? 0 : $options.length - 1) :
                        (activeSuggestion + direction + $options.length) % $options.length;
                    $options.attr('aria-selected', 'false').eq(activeSuggestion).attr('aria-selected', 'true');
                    $input.attr('aria-activedescendant', $options.eq(activeSuggestion).attr('id'));
                });
                return close;
            }

            const $search = $('[data-destination-search]');
            const $cards = $('[data-destination]');
            const $filters = $('[data-filter]');
            const $emptyDestinations = $('[data-no-results]');
            const cardTitle = card => $(card).find('.card-title').text().trim();
            let category = 'all';
            function inCategory(card) {
                if (category === 'saved') return $(card).find('[data-save]').attr('aria-pressed') === 'true';
                return category === 'all' || $(card).attr('data-categories').split(' ').includes(category);
            }
            function matchingDestinations(query) {
                return $cards.filter(function () {
                    const description = $(this).find('.card-text').text();
                    const searchableText = `${this.dataset.searchText} ${cardTitle(this)} ${description}`.toLowerCase();
                    return inCategory(this) && searchableText.includes(query);
                });
            }
            // Tasks 1 and 2: live filtering and matching suggestions share criteria.
            function renderDestinations() {
                const query = queryText($search);
                const focusedColumn = document.activeElement.closest('.destination-column');
                const $matches = matchingDestinations(query);
                $cards.each(function () {
                    $(this).closest('.destination-column').prop('hidden', !$matches.is(this));
                });
                $('[data-results-count]').text(`${$matches.length} ${$matches.length === 1 ? 'place' : 'places'} to discover`);
                $emptyDestinations.prop('hidden', $matches.length !== 0);
                if ($cards.length && !$matches.length) {
                    const noSaved = category === 'saved' && !$cards.find('[data-save][aria-pressed=true]').length;
                    const term = String($search.val() || '').trim().slice(0, 80);
                    $emptyDestinations.find('h3').text(noSaved ? 'No saved places yet' : 'No cities found');
                    $emptyDestinations.find('p').text(noSaved
                        ? 'Select Save on a city to add it to this list.'
                        : term ? `No cities match “${term}” with these filters. Try a different search or show all cities.`
                            : 'Choose a different filter or show all cities.');
                }
                $filters.each(function () {
                    const active = $(this).attr('data-filter') === category;
                    $(this).toggleClass('is-active', active).attr('aria-pressed', String(active));
                });
                highlight($cards.find('.card-title, .card-text'), query);
                closeDestinationSuggestions?.();
                if (focusedColumn?.hidden) {
                    const next = $(focusedColumn).nextAll('.destination-column:not([hidden])').first();
                    const nearby = next.length ? next : $(focusedColumn).prevAll('.destination-column:not([hidden])').first();
                    const target = nearby.find('[data-save]')[0] || $filters.filter('.is-active')[0];
                    target?.focus();
                }
                scheduleViewport();
            }
            const closeDestinationSuggestions = bindSuggestions($search, query =>
                matchingDestinations(query).get()
                    .sort((first, second) => Number(second.dataset.destination.startsWith(query)) - Number(first.dataset.destination.startsWith(query)))
                    .map(cardTitle), renderDestinations);
            $filters.on('click', function () {
                category = $(this).attr('data-filter');
                renderDestinations();
            });
            $('[data-clear-filters]').on('click', function () {
                category = 'all';
                $search.val('');
                renderDestinations();
                $search.trigger('focus');
            });
            $(document).on('kz:destinations-change', () => renderDestinations());

            // Task 3 also searches full FAQ answers, including collapsed text.
            const $faqSearch = $('[data-faq-search]');
            const $faqItems = $('.faq-item');
            const cityNames = $cards.get().map(cardTitle);
            let faqState;
            function renderFaq() {
                const query = queryText($faqSearch);
                if (!query && !faqState) return;
                if (query && !faqState) faqState = $faqItems.map(function () {
                    return $(this).find('[data-accordion-trigger]').attr('aria-expanded') === 'true';
                }).get();
                highlight($faqItems.find('.faq-question-text, .faq-panel p'), query);
                let count = 0;
                $faqItems.each(function (index) {
                    const $item = $(this);
                    const matches = !query || $item.text().toLowerCase().includes(query);
                    $item.prop('hidden', !matches);
                    if (matches) count += 1;
                    const open = query ? matches : Boolean(faqState?.[index]);
                    $item.toggleClass('is-open', open);
                    $item.find('[data-accordion-trigger]').attr('aria-expanded', String(open));
                    $item.find('.faq-panel').attr('aria-hidden', String(!open)).prop('inert', !open);
                });
                if (!query) faqState = undefined;
                $('[data-faq-results]').text(query ? `${count} matching ${count === 1 ? 'question' : 'questions'}` : 'Search questions and answers.');
                scheduleViewport();
            }
            bindSuggestions($faqSearch, query => cityNames.filter(name => name.toLowerCase().startsWith(query)), renderFaq);

            // Task 6: run only after the existing form validator accepts inputs.
            $(document).on('kz:form-loading', '[data-demo-form]', function (event) {
                event.preventDefault();
                const $form = $(this);
                if ($form.attr('aria-busy') === 'true') return;
                const $button = $form.find('button[type=submit]');
                // Freeze the validated values until the simulated request completes.
                const $editable = $form.find('input:enabled, textarea:enabled, select:enabled');
                const original = $button.contents().detach();
                $form.attr('aria-busy', 'true');
                $editable.prop('disabled', true);
                $form.find('.form-status').text('Please wait… Checking your demo form.');
                $button.prop('disabled', true).empty()
                    .append($('<span>', { class: 'submit-spinner', 'aria-hidden': 'true' }))
                    .append(document.createTextNode('Please wait…'));
                $form.find('.form-status').attr('tabindex', '-1')[0].focus({ preventScroll: true });
                setTimeout(() => {
                    $editable.prop('disabled', false);
                    $button.empty().append(original).prop('disabled', false);
                    $form.attr('aria-busy', 'false');
                    event.originalEvent.detail.complete();
                    notify('Form checked successfully. Demo only; no information was sent.');
                }, 1400);
            });

            // Task 8: copy actual guide/route text; acknowledge only real success.
            $('[data-copy]').on('click', async function () {
                const $button = $(this);
                if ($button.prop('disabled') || $button.attr('aria-disabled') === 'true') return;
                const $feedback = $('#' + $button.attr('aria-describedby'));
                const target = document.getElementById($button.attr('data-copy'));
                $button.attr('aria-disabled', 'true');
                $feedback.empty();
                try {
                    const text = target.innerText.trim();
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        const focused = document.activeElement;
                        const $buffer = $('<textarea>', { text, class: 'visually-hidden', readonly: true }).appendTo('body');
                        try {
                            $buffer[0].select();
                            if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
                        } finally {
                            $buffer.remove();
                            focused?.focus({ preventScroll: true });
                        }
                    }
                    $feedback.text('Copied to clipboard.');
                } catch {
                    $feedback.text('Copy unavailable. Select and copy the text.');
                } finally {
                    $button.removeAttr('aria-disabled');
                }
            });

            // Tasks 4, 5 and 9 share a single throttled viewport update.
            const $progress = $('[data-scroll-progress]');
            const $counters = $('[data-counter]');
            let $pendingImages = $('img[data-src]');
            let viewportFrame = 0;
            function nearViewport(element, margin = 0) {
                if (!$(element).is(':visible')) return false;
                const bounds = element.getBoundingClientRect();
                return bounds.top < window.innerHeight + margin && bounds.bottom > -margin;
            }
            function loadImage(image) {
                const source = image.dataset.src;
                if (!source) return;
                const $image = $(image);
                $image.one('load', function () { $(this).attr('data-lazy-state', 'loaded'); scheduleViewport(); });
                $image.one('error', function () { $(this).attr('data-lazy-state', 'error'); });
                $image.attr({ 'data-lazy-state': 'loading', loading: 'eager' });
                if (image.dataset.srcset) {
                    image.sizes = image.dataset.sizes;
                    image.srcset = image.dataset.srcset;
                }
                $image.attr('src', source).removeAttr('data-src data-srcset data-sizes');
            }
            function updateViewport() {
                viewportFrame = 0;
                const distance = document.documentElement.scrollHeight - window.innerHeight;
                const percent = distance > 0 ? Math.max(0, Math.min(100, $(window).scrollTop() / distance * 100)) : 100;
                $progress.attr('aria-valuenow', Math.round(percent)).find('span').css('width', percent + '%');
                $counters.filter(function () { return !$(this).attr('data-counted') && nearViewport(this); }).each(function () {
                    const $counter = $(this).attr('data-counted', 'true');
                    const target = Number($counter.attr('data-counter'));
                    $({ value: 0 }).animate({ value: target }, {
                        duration: duration(1400), easing: 'swing',
                        step(value) { $counter.text(Math.floor(value)); },
                        complete() { $counter.text(target); }
                    });
                });
                $pendingImages.filter(function () { return nearViewport(this, 120); }).each(function () { loadImage(this); });
                $pendingImages = $pendingImages.filter('[data-src]');
            }
            function scheduleViewport() {
                if (!viewportFrame) viewportFrame = requestAnimationFrame(updateViewport);
            }
            $(window).on('scroll resize load', scheduleViewport);
            // Dialog content is invisible during the initial viewport pass.
            $(document).on('kz:popup-open', scheduleViewport);
            // Load the next slide before Bootstrap's transition begins.
            $('.carousel').on('slide.bs.carousel', function (event) {
                $(event.relatedTarget).find('img[data-src]').each(function () { loadImage(this); });
            }).on('slid.bs.carousel', scheduleViewport);
            if ('ResizeObserver' in window) new ResizeObserver(scheduleViewport).observe(document.body);
            renderDestinations();
            scheduleViewport();
            $('body').attr('data-jquery-ready', 'true');
        });
    }

    if (window.jQuery) initialise();
    else {
        // The required CDN is primary; the identical local build enables offline use.
        const fallback = document.createElement('script');
        fallback.src = 'vendor/jquery-4.0.0.min.js';
        fallback.onload = initialise;
        document.head.append(fallback);
    }
})();
