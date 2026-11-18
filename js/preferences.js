// Assignment 4, Task 4. Team study responsibility: Ruzimuhammad.
(() => {
    const backgroundColors = new Map([
        ['sand', { day: '#ffffff', night: '#131c20' }],
        ['sky', { day: '#edf4fa', night: '#15252f' }],
        ['steppe', { day: '#eff4e8', night: '#1c2923' }]
    ]);
    const storageKey = 'kz-background';
    const picker = document.querySelector('[data-background-select]');
    let selected = 'sand';

    function applyBackground() {
        const colors = backgroundColors.get(selected);
        const theme = document.body.dataset.theme === 'night' ? 'night' : 'day';
        document.body.style.setProperty('--paper', colors[theme]);
    }

    function restoreBackground() {
        try {
            const saved = localStorage.getItem(storageKey);
            selected = backgroundColors.has(saved) ? saved : 'sand';
        } catch {}
        if (picker) picker.value = selected;
        applyBackground();
    }

    if (picker) {
        picker.addEventListener('change', () => {
            if (!backgroundColors.has(picker.value)) return;
            selected = picker.value;
            applyBackground();
            try {
                localStorage.setItem(storageKey, selected);
            } catch {
                // The choice still applies on this page if storage is unavailable.
            }
        });
        picker.disabled = false;
    }
    document.addEventListener('kz-theme-change', applyBackground);
    window.addEventListener('pageshow', event => {
        if (event.persisted) restoreBackground();
    });
    restoreBackground();
})();
