/* Assignment 5: DOM updates, events, callbacks, data structures and sound.
   Everything runs in the browser. No account or server is required. */
(() => {
    'use strict';

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

    function animate(element) {
        if (!element) return;
        element.classList.remove('ui-enter');
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
    const soundToggle = document.querySelector('[data-sound-toggle]');
    async function playChime() {
        if (!soundEnabled) return;
        const AudioContextType = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextType) {
            notify('Sound is unavailable in this browser.');
            return;
        }
        try {
            audioContext ??= new AudioContextType();
            await audioContext.resume();
            if (activeSound) {
                activeSound.stop();
                activeSound.disconnect();
            }
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
            notify('Your browser could not play the sound.');
        }
    }
    soundToggle?.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.setAttribute('aria-pressed', String(soundEnabled));
        soundToggle.setAttribute('aria-label', soundEnabled ? 'Disable sound effects' : 'Enable sound effects');
        notify(soundEnabled ? 'Sound on. A little chime for your discoveries.' : 'Sound off.');
        if (soundEnabled) playChime();
    });

    const themeToggle = document.querySelector('[data-theme-toggle]');
    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        themeToggle?.setAttribute('aria-pressed', String(theme === 'night'));
        themeToggle?.setAttribute('aria-label', theme === 'night' ? 'Switch to day theme' : 'Switch to night theme');
        if (themeToggle) themeToggle.textContent = theme === 'night' ? '☀' : '☾';
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
            if (show && withAnimation) animate(card);
        });
        const count = document.querySelector('[data-results-count]');
        if (count) count.textContent = `${visible.length} ${visible.length === 1 ? 'place' : 'places'} to discover`;
        const empty = document.querySelector('[data-no-results]');
        if (empty) empty.hidden = visible.length !== 0;
        document.querySelectorAll('[data-saved-count]').forEach(label => { label.textContent = saved.size; });
        filterButtons.forEach(button => {
            const active = button.dataset.filter === activeFilter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
    }
    filterButtons.forEach(button => button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        renderDestinations();
    }));
    search?.addEventListener('input', () => renderDestinations());
    document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
        activeFilter = 'all';
        if (search) search.value = '';
        renderDestinations();
    });
    document.querySelectorAll('[data-save]').forEach(button => {
        function updateButton() {
            const selected = saved.has(button.dataset.save);
            button.setAttribute('aria-pressed', String(selected));
            button.setAttribute('aria-label', `${selected ? 'Unsave' : 'Save'} ${button.dataset.save[0].toUpperCase() + button.dataset.save.slice(1)}`);
            button.querySelector('span').textContent = selected ? '♥' : '♡';
        }
        updateButton();
        button.addEventListener('click', () => {
            const id = button.dataset.save;
            if (saved.has(id)) saved.delete(id); else saved.add(id);
            storage.write('saved', [...saved]);
            updateButton();
            button.classList.remove('is-pulsing');
            void button.offsetWidth;
            button.classList.add('is-pulsing');
            renderDestinations(false);
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
        stars.forEach(star => star.addEventListener('click', () => {
            selected = Number(star.dataset.star);
            storage.write(key, selected);
            renderRating();
            animate(message);
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
        const labels = ['01 / YOUR DESTINATION', '02 / YOUR TRAVEL STYLE', '03 / YOUR ADVENTURE'];
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
        function showStep(current) {
            steps.forEach((element, index) => { element.hidden = index !== current; });
            result.hidden = true;
            next.hidden = false;
            back.hidden = current === 0;
            error.textContent = '';
            planner.querySelector('[data-step-label]').textContent = labels[current];
            planner.querySelector('[data-step-progress]').style.width = `${((current + 1) / steps.length) * 100}%`;
            next.textContent = current === 2 ? 'Build my route ↗' : 'Next step ↗';
            if (current === 2) {
                const review = planner.querySelector('[data-trip-review]');
                review.replaceChildren();
                addText(review, 'p', 'Destination: ' + chosenDestination().name);
                addText(review, 'p', 'Traveller: ' + planner.elements.traveler.value.trim());
                addText(review, 'p', 'Duration: ' + planner.elements.days.value + ' day(s)');
            }
            animate(steps[current]);
        }
        // A higher-order function receives the display callback. Inputs stay in the DOM.
        function changeStep(direction, onStepChanged) {
            if (direction > 0 && step === 0 && !chosenDestination()) {
                error.textContent = 'Choose a destination to start your journey.';
                planner.querySelector('[name=destination]').focus();
                return;
            }
            if (direction > 0 && step === 1 && !planner.elements.traveler.value.trim()) {
                error.textContent = 'Enter your first name before continuing.';
                planner.elements.traveler.focus();
                return;
            }
            step = Math.max(0, Math.min(2, step + direction));
            onStepChanged(step);
            steps[step].querySelector('input,select')?.focus();
        }
        function buildRoute() {
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
            steps.forEach(element => { element.hidden = true; });
            result.hidden = false;
            complete = true;
            next.hidden = true;
            back.hidden = true;
            error.textContent = '';
            planner.querySelector('[data-step-label]').textContent = 'YOUR ROUTE IS READY';
            animate(result);
            result.focus();
            playChime();
        }
        next.addEventListener('click', () => {
            if (step === 2) buildRoute(); else changeStep(1, showStep);
        });
        back.addEventListener('click', () => changeStep(-1, showStep));
        planner.querySelector('[data-planner-reset]').addEventListener('click', () => {
            planner.reset();
            step = 0;
            complete = false;
            showStep(step);
            planner.querySelector('[name=destination]').focus();
        });
        planner.addEventListener('submit', event => {
            event.preventDefault();
            if (complete) return;
            if (step === 2) buildRoute(); else changeStep(1, showStep);
        });
        showStep(step);
    }
})();
