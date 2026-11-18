/* Endterm / Week 9: fetch, async/await, JSON and a small localStorage cache.
   No key or geolocation is needed: only the four guide cities are requested. */
(() => {
    'use strict';
    const panel = document.querySelector('[data-weather]');
    if (!panel) return;

    const cities = {
        aktau: { name: 'Aktau', latitude: 43.65, longitude: 51.17 },
        astana: { name: 'Astana', latitude: 51.17, longitude: 71.43 },
        almaty: { name: 'Almaty', latitude: 43.24, longitude: 76.89 },
        shymkent: { name: 'Shymkent', latitude: 42.32, longitude: 69.59 }
    };
    const FRESH_MS = 10 * 60 * 1000;
    const MAX_CACHE_MS = 24 * 60 * 60 * 1000;
    const TIMEOUT_MS = 10000;
    const select = panel.querySelector('[data-weather-city]');
    const refresh = panel.querySelector('[data-weather-refresh]');
    const status = panel.querySelector('[data-weather-status]');
    const result = panel.querySelector('[data-weather-result]');
    const forecast = panel.querySelector('[data-weather-days]');
    const memory = new Map();
    const dayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', weekday: 'short', day: 'numeric', month: 'short' });
    const timeFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    let controller;
    let requestNumber = 0;
    let started = false;
    const iconPaths = {
        sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
        moon: 'M20.8 15.2A8.6 8.6 0 0 1 8.8 3.2a9 9 0 1 0 12 12Z',
        cloud: 'M7 17a4.5 4.5 0 1 1 .9-8.9A5 5 0 0 1 17 9a4 4 0 0 1 0 8H7Z',
        fog: 'M4 8h13m-10 4h13M3 16h14m-9 4h12',
        rain: 'M6 14a3.5 3.5 0 1 1 1.2-6.8 5 5 0 0 1 9.3.8H18a3 3 0 0 1 0 6H6Zm3 3-1 3m5-3-1 3m5-3-1 3',
        snow: 'M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3m-6 16 3-3 3 3M4.5 10l4.1-.9-.9-4.1m8.6 14.2-.9-4.1 4.1-.9m0-4-4.1-.9.9-4.1M7.7 19l.9-4.1-4.1-.9',
        storm: 'M8 14H6a3.5 3.5 0 1 1 1.2-6.8 5 5 0 0 1 9.3.8H18a3 3 0 0 1 0 6h-2m-4-3-3 6h5l-3 5',
        unavailable: 'M6 12h12'
    };

    function conditions(code, isDay = true) {
        if (code === 0) return { label: isDay ? 'Clear sky' : 'Clear night', icon: isDay ? 'sun' : 'moon' };
        if (code === 1) return { label: 'Mostly clear', icon: 'sun' };
        if (code === 2) return { label: 'Partly cloudy', icon: 'cloud' };
        if (code === 3) return { label: 'Overcast', icon: 'cloud' };
        if ([45, 48].includes(code)) return { label: 'Fog', icon: 'fog' };
        if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Drizzle', icon: 'rain' };
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Rain', icon: 'rain' };
        if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', icon: 'snow' };
        if ([95, 96, 99].includes(code)) return { label: 'Thunderstorms', icon: 'storm' };
        return { label: 'Conditions unavailable', icon: 'unavailable' };
    }
    function renderIcon(container, name) {
        const svgNamespace = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNamespace, 'svg');
        const path = document.createElementNS(svgNamespace, 'path');
        svg.setAttribute('viewBox', '0 0 24 24');
        path.setAttribute('d', iconPaths[name]);
        svg.append(path);
        container.replaceChildren(svg);
    }
    const numberInRange = (value, min, max) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
    const validTime = value => numberInRange(value, 1, 100000000000);
    const validCode = value => Number.isInteger(value) && numberInRange(value, 0, 99);

    function readForecast(data) {
        // Reject incomplete JSON rather than displaying null as 0 degrees.
        const current = data?.current;
        const daily = data?.daily;
        if (!current || !daily || !validTime(current.time) ||
            !numberInRange(current.temperature_2m, -100, 70) ||
            !numberInRange(current.apparent_temperature, -150, 100) ||
            !numberInRange(current.wind_speed_10m, 0, 500) || !validCode(current.weather_code) ||
            ![0, 1].includes(current.is_day) || data.current_units?.temperature_2m !== '°C' ||
            data.current_units?.wind_speed_10m !== 'km/h') throw new Error('Incomplete forecast');
        const fields = ['time', 'temperature_2m_max', 'temperature_2m_min', 'weather_code', 'precipitation_probability_max'];
        if (!fields.every(field => Array.isArray(daily[field]) && daily[field].length >= 3)) throw new Error('Incomplete daily forecast');
        const days = daily.time.slice(0, 3).map((time, index) => {
            const high = daily.temperature_2m_max[index];
            const low = daily.temperature_2m_min[index];
            const code = daily.weather_code[index];
            const rain = daily.precipitation_probability_max[index];
            if (!validTime(time) || !numberInRange(high, -100, 70) || !numberInRange(low, -100, 70) ||
                high < low || !validCode(code) || !numberInRange(rain, 0, 100) ||
                (index && time <= daily.time[index - 1])) throw new Error('Invalid daily forecast');
            return { time, high, low, code, rain };
        });
        return { current, days };
    }

    function readCache(id) {
        try {
            const entry = memory.get(id) || JSON.parse(localStorage.getItem('kz-weather-v1-' + id));
            const age = Date.now() - entry?.savedAt;
            if (!numberInRange(age, 0, MAX_CACHE_MS)) return null;
            readForecast(entry.data);
            return entry;
        } catch { return null; }
    }
    function saveCache(id, data) {
        const entry = { savedAt: Date.now(), data };
        memory.set(id, entry);
        try { localStorage.setItem('kz-weather-v1-' + id, JSON.stringify(entry)); }
        catch { /* The forecast also works when storage is blocked or full. */ }
    }
    function setText(selector, text) { panel.querySelector(selector).textContent = text; }
    const degrees = value => Math.round(value) + '°';

    function render(id, data, saved = false) {
        const { current, days } = readForecast(data);
        const weather = conditions(current.weather_code, current.is_day === 1);
        setText('[data-weather-name]', cities[id].name);
        setText('[data-weather-temperature]', degrees(current.temperature_2m) + 'C');
        setText('[data-weather-condition]', weather.label);
        renderIcon(panel.querySelector('[data-weather-icon]'), weather.icon);
        setText('[data-weather-feels]', 'Feels like ' + degrees(current.apparent_temperature) + 'C');
        setText('[data-weather-wind]', 'Wind ' + Math.round(current.wind_speed_10m) + ' km/h');
        const updated = panel.querySelector('[data-weather-time]');
        updated.dateTime = new Date(current.time * 1000).toISOString();
        updated.textContent = (saved ? 'Saved forecast · ' : 'Forecast updated · ') + timeFormat.format(current.time * 1000) + ' (UTC+5)';
        forecast.replaceChildren();
        days.forEach(day => {
            const card = panel.querySelector('template').content.cloneNode(true);
            const outlook = conditions(day.code);
            card.querySelector('time').dateTime = new Date(day.time * 1000).toISOString();
            card.querySelector('time').textContent = dayFormat.format(day.time * 1000);
            renderIcon(card.querySelector('[data-day-icon]'), outlook.icon);
            card.querySelector('[data-day-condition]').textContent = outlook.label;
            card.querySelector('[data-day-high]').textContent = degrees(day.high);
            card.querySelector('[data-day-low]').textContent = degrees(day.low);
            card.querySelector('[data-day-rain]').textContent = Math.round(day.rain) + '% chance of precipitation';
            forecast.append(card);
        });
        result.hidden = false;
    }

    async function loadForecast(force = false) {
        started = true;
        const id = select.value;
        if (!Object.hasOwn(cities, id)) return;
        const request = ++requestNumber;
        controller?.abort(); // A new city replaces the previous request.
        const cached = readCache(id);
        if (!force && cached && Date.now() - cached.savedAt < FRESH_MS) {
            render(id, cached.data, true);
            status.textContent = 'Recent forecast for ' + cities[id].name + '. Refresh for an update.';
            panel.dataset.weatherState = 'ready';
            refresh.disabled = false;
            refresh.textContent = 'Refresh forecast ↻';
            result.setAttribute('aria-busy', 'false');
            return;
        }
        const currentController = new AbortController();
        controller = currentController;
        let timedOut = false;
        const timeout = setTimeout(() => { timedOut = true; currentController.abort(); }, TIMEOUT_MS);
        // Keep the same city's previous forecast in place during a manual refresh.
        result.hidden = panel.querySelector('[data-weather-name]').textContent !== cities[id].name;
        result.setAttribute('aria-busy', 'true');
        refresh.disabled = true;
        refresh.textContent = 'Updating…';
        panel.dataset.weatherState = 'loading';
        status.textContent = 'Loading the forecast for ' + cities[id].name + '…';
        try {
            const city = cities[id];
            const url = new URL('https://api.open-meteo.com/v1/forecast');
            url.search = new URLSearchParams({
                latitude: city.latitude, longitude: city.longitude,
                current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
                timezone: 'Asia/Almaty', timeformat: 'unixtime', forecast_days: '3'
            }).toString();
            const response = await fetch(url, { signal: currentController.signal, credentials: 'omit' });
            if (!response.ok) throw new Error('Forecast HTTP ' + response.status);
            const data = await response.json();
            readForecast(data);
            if (request !== requestNumber) return; // Never render a late result for another city.
            saveCache(id, data);
            render(id, data);
            panel.dataset.weatherState = 'ready';
            status.textContent = 'Forecast ready for ' + city.name + '.';
        } catch {
            if (request !== requestNumber) return;
            if (cached) {
                render(id, cached.data, true);
                panel.dataset.weatherState = 'cached';
                status.textContent = 'Could not update ' + cities[id].name + '. Showing a saved forecast; check its date below.';
            } else {
                result.hidden = true;
                panel.dataset.weatherState = 'error';
                status.textContent = timedOut ? 'The weather service took too long. Try again.' :
                    'Forecast unavailable for ' + cities[id].name + '. Check your connection and try again.';
            }
        } finally {
            clearTimeout(timeout);
            if (request === requestNumber) {
                result.setAttribute('aria-busy', 'false');
                refresh.disabled = false;
                refresh.textContent = panel.dataset.weatherState === 'error' ? 'Try again ↻' : 'Refresh forecast ↻';
            }
        }
    }

    select.value = panel.dataset.defaultCity;
    select.disabled = false;
    refresh.disabled = false;
    select.addEventListener('change', () => loadForecast());
    refresh.addEventListener('click', () => loadForecast(true));
    // Request data only when the traveller reaches the forecast section.
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                if (!started) loadForecast();
            }
        }, { rootMargin: '160px' });
        observer.observe(panel);
    } else loadForecast();
})();
