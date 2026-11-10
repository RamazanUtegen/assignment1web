/* Assignment 5: DOM updates, events, callbacks, data structures and sound.
   Everything runs in the browser. No account or server is required. */
(() => {
    'use strict';

    const iconPaths = {
        moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
        sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
        soundOn: 'M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14',
        soundOff: 'M11 5 6 9H3v6h3l5 4V5Zm5 3 5 8',
        heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
        star: 'm12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9L12 3Z',
        search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',
        arrow: 'M4 12h16m-6-6 6 6-6 6'
    };
    function icon(name) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svg.setAttribute('class', 'ui-icon' + (name === 'star' ? ' icon-star' : ''));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.8');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        path.setAttribute('d', iconPaths[name]);
        svg.append(path);
        return svg;
    }
    document.querySelectorAll('.destination-search > span[aria-hidden]').forEach(span => span.replaceChildren(icon('search')));
    document.querySelectorAll('.plan-link > span[aria-hidden], .hero-cta > span[aria-hidden], .destination-link > span[aria-hidden]')
        .forEach(span => span.replaceChildren(icon('arrow')));

    const storage = {
        read(key, fallback) {
            try { return JSON.parse(localStorage.getItem('kz-' + key)) ?? fallback; }
            catch { return fallback; }
        },
        write(key, value) {
            try { localStorage.setItem('kz-' + key, JSON.stringify(value)); }
            catch { /* Keep controls usable when browser storage is unavailable. */ }
        }
    };

    // Objects group each destination's properties and its route-building method.
    const destinations = [
        { id: 'aktau', name: 'Aktau', category: 'nature', tags: 'sea coast desert canyons mangystau',
            description: 'A Caspian escape, with wide horizons and dramatic landscapes.',
            stops: ['Walk the Caspian waterfront and discover Aktau.', 'Explore Mangystau chalk formations with a local guide.', 'Make time for the Bozjyra landscapes and the open steppe.'] },
        { id: 'astana', name: 'Astana', category: 'city', tags: 'capital architecture city river',
            description: 'A fresh perspective on architecture, art and life on the steppe.',
            stops: ['Explore the Baiterek area and Nurzhol Boulevard.', 'Discover Khan Shatyr and the city architecture.', 'Take a slower walk beside the Ishim River.'] },
        { id: 'almaty', name: 'Almaty', category: 'nature', tags: 'mountains lakes hiking city',
            description: 'City culture and mountain air, with room to slow down.',
            stops: ['Discover central Almaty and its leafy streets.', 'Head towards Medeu and Shymbulak; check mountain conditions.', 'Explore an alpine landscape with suitable local transport.'] },
        { id: 'shymkent', name: 'Shymkent', category: 'culture', tags: 'food silk road parks bazaar history',
            description: 'Southern hospitality, green spaces and Silk Road stories.',
            stops: ['Wander through Shymkent parks and the city centre.', 'Explore local bazaars and southern Kazakh flavours.', 'Plan a day around the region’s Silk Road heritage.'] }
    ].map(destination => ({
        ...destination,
        getRoute(days) { return this.stops.slice(0, days); }
    }));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function animate(element, enabled = true) {
        if (!element) return;
        element.classList.remove('ui-enter');
        if (!enabled || reducedMotion.matches) return;
        // Restart the event-triggered CSS animation after the DOM update.
        void element.offsetWidth;
        element.classList.add('ui-enter');
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
    let toastTimer;
    function notify(message) {
        toast.textContent = message;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.textContent = ''; }, 2600);
    }

    // Web Audio synthesises a short chime: no downloads, autoplay or overlapping notes.
    let audioContext;
    let activeSound;
    let soundEnabled = false;
    let soundRequest = 0;
    const soundToggle = document.querySelector('[data-sound-toggle]');
    soundToggle?.replaceChildren(icon('soundOff'));
    function stopChime() {
        if (!activeSound) return;
        activeSound.stop();
        activeSound.disconnect();
        activeSound = null;
    }
    async function playChime() {
        if (!soundEnabled) return;
        const request = ++soundRequest;
        const AudioContextType = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextType) {
            notify('Sound is unavailable in this browser.');
            return;
        }
        try {
            audioContext ??= new AudioContextType();
            await audioContext.resume();
            // Resume can finish after muting or a newer discovery; discard stale requests.
            if (!soundEnabled || request !== soundRequest) return;
            stopChime();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const now = audioContext.currentTime;
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(660, now);
            oscillator.frequency.setValueAtTime(880, now + 0.09);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.23);
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            activeSound = oscillator;
            oscillator.onended = () => {
                oscillator.disconnect();
                gain.disconnect();
                if (activeSound === oscillator) activeSound = null;
            };
            oscillator.start(now);
            oscillator.stop(now + 0.24);
        } catch {
            if (soundEnabled && request === soundRequest) notify('Your browser could not play the sound.');
        }
    }
    soundToggle?.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
        soundToggle.setAttribute('aria-label', soundEnabled ? 'Disable sound effects' : 'Enable sound effects');
        soundToggle.replaceChildren(icon(soundEnabled ? 'soundOn' : 'soundOff'));
        notify(soundEnabled ? 'Sound on. A little chime for your discoveries.' : 'Sound off.');
        if (soundEnabled) playChime();
        else {
            soundRequest += 1;
            stopChime();
        }
    });

    const themeToggle = document.querySelector('[data-theme-toggle]');
    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        document.body.dataset.bsTheme = theme === 'night' ? 'dark' : 'light';
        themeToggle?.setAttribute('aria-pressed', String(theme === 'night'));
        themeToggle?.setAttribute('aria-label', theme === 'night' ? 'Switch to day theme' : 'Switch to night theme');
        themeToggle?.replaceChildren(icon(theme === 'night' ? 'sun' : 'moon'));
        document.dispatchEvent(new Event('kz-theme-change'));
    }
    applyTheme(storage.read('theme', 'day') === 'night' ? 'night' : 'day');
    themeToggle?.addEventListener('click', () => {
        const theme = document.body.dataset.theme === 'night' ? 'day' : 'night';
        applyTheme(theme);
        storage.write('theme', theme);
    });

    // Arrow keys move focus through the real navigation links without trapping Tab.
    const menuLinks = Array.from(document.querySelectorAll('#main-navigation .nav-link'));
    for (let index = 0; index < menuLinks.length; index += 1) {
        menuLinks[index].addEventListener('keydown', event => {
            let nextIndex;
            switch (event.key) {
                case 'ArrowRight': case 'ArrowDown': nextIndex = (index + 1) % menuLinks.length; break;
                case 'ArrowLeft': case 'ArrowUp': nextIndex = (index - 1 + menuLinks.length) % menuLinks.length; break;
                case 'Home': nextIndex = 0; break;
                case 'End': nextIndex = menuLinks.length - 1; break;
                default: return;
            }
            event.preventDefault();
            menuLinks[nextIndex].focus();
        });
    }

    const savedData = storage.read('saved', []);
    const saved = new Set(Array.isArray(savedData) ? savedData.filter(id => destinations.some(place => place.id === id)) : []);
    const search = document.querySelector('[data-destination-search]');
    const filterButtons = document.querySelectorAll('[data-filter]');
    let activeFilter = 'all';
    function matchesCategory(place) {
        switch (activeFilter) {
            case 'nature': return place.category === 'nature';
            case 'city': return place.category === 'city' || place.id === 'almaty';
            case 'culture': return place.category === 'culture';
            case 'saved': return saved.has(place.id);
            default: return true;
        }
    }
    function renderDestinations(withAnimation = true) {
        const query = search?.value.trim().toLowerCase() || '';
        // filter is a higher-order function; its callback combines two criteria.
        const visible = destinations.filter(place => matchesCategory(place) &&
            (place.name + ' ' + place.tags).toLowerCase().includes(query));
        const ids = new Set(visible.map(place => place.id));
        document.querySelectorAll('[data-destination]').forEach(card => {
            const show = ids.has(card.dataset.destination);
            card.closest('.destination-column').hidden = !show;
            if (show) animate(card, withAnimation);
            else card.classList.remove('ui-enter');
        });
        const count = document.querySelector('[data-results-count]');
        if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'place' : 'places'} to discover`;
        const empty = document.querySelector('[data-no-results]');
        if (empty) {
            empty.hidden = visible.length !== 0;
            if (!visible.length) {
                const nothingSaved = activeFilter === 'saved' && saved.size === 0;
                const savedSearch = activeFilter === 'saved' && saved.size > 0;
                empty.querySelector('h3').textContent = nothingSaved ? 'No saved places yet.' :
                    savedSearch ? 'No saved places match.' : 'No places found.';
                empty.querySelector('p').textContent = nothingSaved ?
                    'Use the heart button on a destination to save it here. Browse all places to choose your first.' :
                    savedSearch ? 'Clear your search to see your saved places, or browse all destinations.' :
                        'Try another city name, or show all places to explore the four destinations.';
            }
        }
        document.querySelectorAll('[data-saved-count]').forEach(label => { label.textContent = saved.size; });
        filterButtons.forEach(button => {
            const active = button.dataset.filter === activeFilter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }
    filterButtons.forEach(button => button.addEventListener('click', event => {
        activeFilter = button.dataset.filter;
        renderDestinations(event.detail > 0);
    }));
    search?.addEventListener('input', () => renderDestinations(false));
    document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
        activeFilter = 'all';
        if (search) search.value = '';
        renderDestinations(false);
        search?.focus();
    });
    document.querySelectorAll('[data-save]').forEach(button => {
        function updateButton() {
            const selected = saved.has(button.dataset.save);
            button.setAttribute('aria-pressed', String(selected));
            button.setAttribute('aria-label', `${selected ? 'Unsave' : 'Save'} ${button.dataset.save[0].toUpperCase() + button.dataset.save.slice(1)}`);
            const heart = icon('heart');
            heart.setAttribute('fill', selected ? 'currentColor' : 'none');
            button.querySelector('span').replaceChildren(heart);
        }
        updateButton();
        button.addEventListener('click', event => {
            const id = button.dataset.save;
            if (saved.has(id)) saved.delete(id); else saved.add(id);
            storage.write('saved', [...saved]);
            updateButton();
            button.classList.remove('is-pulsing');
            if (event.detail > 0 && !reducedMotion.matches) {
                void button.offsetWidth;
                button.classList.add('is-pulsing');
            }
            renderDestinations(false);
            if (activeFilter === 'saved' && !saved.has(id)) {
                const target = document.querySelector('.destination-column:not([hidden]) [data-save]') ||
                    document.querySelector('[data-filter="saved"]');
                target?.focus();
            }
            notify(saved.has(id) ? 'Saved for a little later.' : 'Removed from your saved places.');
            playChime();
        });
    });
    renderDestinations(false);

    // Thumbnails use Bootstrap's existing gallery, preserving previous/next/keyboard controls.
    document.querySelectorAll('[data-gallery-for]').forEach(thumbnails => {
        const carousel = document.getElementById(thumbnails.dataset.galleryFor);
        carousel?.addEventListener('slid.bs.carousel', event => {
            thumbnails.querySelectorAll('button').forEach((button, index) => {
                button.classList.toggle('is-active', index === event.to);
                button.setAttribute('aria-pressed', String(index === event.to));
            });
        });
    });

    document.querySelectorAll('[data-rating]').forEach(rating => {
        const stars = rating.querySelectorAll('[data-star]');
        stars.forEach(star => star.replaceChildren(icon('star')));
        const message = rating.querySelector('[data-rating-message]');
        const key = 'rating-' + rating.dataset.rating;
        let selected = Number(storage.read(key, 0));
        if (!Number.isInteger(selected) || selected < 0 || selected > 5) selected = 0;
        function renderRating() {
            stars.forEach(star => {
                star.classList.toggle('is-selected', Number(star.dataset.star) <= selected);
                star.setAttribute('aria-pressed', String(Number(star.dataset.star) === selected));
            });
            message.textContent = selected ? `Your rating: ${selected}/5. Thanks for exploring with us!` : 'Choose your rating';
        }
        stars.forEach(star => star.addEventListener('click', event => {
            selected = Number(star.dataset.star);
            storage.write(key, selected);
            renderRating();
            animate(message, event.detail > 0);
            playChime();
        }));
        renderRating();
    });

    const planner = document.querySelector('[data-trip-planner]');
    if (planner) {
        const steps = Array.from(planner.querySelectorAll('[data-planner-step]'));
        const result = planner.querySelector('[data-trip-result]');
        const back = planner.querySelector('[data-planner-back]');
        const next = planner.querySelector('[data-planner-next]');
        const error = planner.querySelector('[data-planner-error]');
        const fields = Array.from(planner.querySelectorAll('input, select'));
        const destinationFields = fields.filter(field => field.name === 'destination');
        const labels = ['Your destination', 'Your travel style', 'Your adventure'];
        let step = 0;
        let complete = false;

        function chosenDestination() {
            return destinations.find(place => place.id === planner.elements.destination.value);
        }
        function addText(container, tag, text) {
            const element = document.createElement(tag);
            element.textContent = text; // User input is never interpreted as HTML.
            container.append(element);
        }
        function clearError() {
            error.textContent = '';
            fields.forEach(field => {
                field.removeAttribute('aria-invalid');
                field.classList.remove('is-invalid');
            });
        }
        function validationIssue(current) {
            if (current === 0 && !chosenDestination()) {
                return { message: 'Choose a destination to start your journey.', fields: destinationFields };
            }
            if (current === 1) {
                const name = planner.elements.traveler.value.trim();
                if (!name || name.length > 60) {
                    return { message: 'Enter your first name using 1 to 60 characters, not just spaces.', fields: [planner.elements.traveler] };
                }
                if (!['1', '2', '3'].includes(planner.elements.days.value)) {
                    return { message: 'Choose a stay of 1, 2 or 3 days.', fields: [planner.elements.days] };
                }
            }
            return null;
        }
        function showError(issue) {
            clearError();
            error.textContent = issue.message;
            issue.fields.forEach(field => {
                field.setAttribute('aria-invalid', 'true');
                field.classList.add('is-invalid');
            });
            issue.fields[0].focus();
        }
        function focusStep() {
            const current = steps[step];
            const target = current.querySelector('input:checked') || current.querySelector('input, select') || current.querySelector('legend');
            target.focus();
        }
        function showStep(current) {
            steps.forEach((element, index) => {
                element.hidden = index !== current;
                element.disabled = index !== current;
            });
            result.hidden = true;
            next.hidden = false;
            back.hidden = current === 0;
            clearError();
            planner.querySelector('[data-step-label]').textContent = labels[current];
            planner.querySelector('[data-step-progress]').style.width = `${((current + 1) / steps.length) * 100}%`;
            next.textContent = current === 2 ? 'Build my route' : 'Next step';
            if (current === 2) {
                const review = planner.querySelector('[data-trip-review]');
                review.replaceChildren();
                addText(review, 'p', 'Destination: ' + chosenDestination().name);
                addText(review, 'p', 'Traveller: ' + planner.elements.traveler.value.trim());
                addText(review, 'p', 'Duration: ' + planner.elements.days.value + ' day(s)');
            }
        }
        // A higher-order function receives the display callback. Inputs stay in the DOM.
        function changeStep(direction, onStepChanged) {
            const issue = direction > 0 ? validationIssue(step) : null;
            if (issue) {
                showError(issue);
                return;
            }
            step = Math.max(0, Math.min(2, step + direction));
            onStepChanged(step);
            focusStep();
        }
        function buildRoute() {
            // Recheck every required value before producing the final result.
            for (let index = 0; index < 2; index += 1) {
                const issue = validationIssue(index);
                if (issue) {
                    step = index;
                    showStep(step);
                    showError(issue);
                    return;
                }
            }
            const place = chosenDestination();
            const days = Number(planner.elements.days.value);
            planner.querySelector('[data-trip-greeting]').textContent = `${planner.elements.traveler.value.trim()}, ${place.name} is calling.`;
            planner.querySelector('[data-trip-description]').textContent = place.description;
            const stops = planner.querySelector('[data-trip-stops]');
            stops.replaceChildren();
            // Explicit loop demonstrates array iteration while generating actual DOM nodes.
            const route = place.getRoute(days);
            for (let index = 0; index < route.length; index += 1) addText(stops, 'li', `Day ${index + 1}: ${route[index]}`);
            planner.querySelector('[data-trip-guide]').setAttribute('href', place.id + '.html');
            steps.forEach(element => {
                element.hidden = true;
                element.disabled = true;
            });
            result.hidden = false;
            complete = true;
            next.hidden = true;
            back.hidden = true;
            clearError();
            planner.querySelector('[data-step-label]').textContent = 'Your route is ready';
            result.focus();
            playChime();
        }
        back.addEventListener('click', () => changeStep(-1, showStep));
        planner.querySelector('[data-planner-reset]').addEventListener('click', () => {
            planner.reset();
            step = 0;
            complete = false;
            planner.querySelector('[data-trip-review]').replaceChildren();
            planner.querySelector('[data-trip-greeting]').textContent = '';
            planner.querySelector('[data-trip-description]').textContent = '';
            planner.querySelector('[data-trip-stops]').replaceChildren();
            planner.querySelector('[data-trip-guide]').setAttribute('href', 'aktau.html');
            showStep(step);
            focusStep();
        });
        planner.addEventListener('submit', event => {
            event.preventDefault();
            if (complete) return;
            if (step === 2) buildRoute(); else changeStep(1, showStep);
        });
        planner.addEventListener('input', clearError);
        planner.addEventListener('change', clearError);
        showStep(step);
    }
})();
