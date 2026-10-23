// Assignment 4, Task 4. Team study responsibility: Ruzimuhammad.
const backgroundColors = [
    { name: 'Sand', color: '#ffffff', night: '#131c20' },
    { name: 'Sky', color: '#edf4fa', night: '#15252f' },
    { name: 'Steppe', color: '#eff4e8', night: '#1c2923' }
];
let backgroundIndex = 0;
function applyBackground() {
    const background = backgroundColors[backgroundIndex];
    const night = document.body.dataset.theme === 'night';
    document.body.style.setProperty('--paper', night ? background.night : background.color);
    document.querySelectorAll('[data-background-name]').forEach(function (label) {
        label.textContent = background.name;
    });
}
document.addEventListener('kz-theme-change', applyBackground);
document.querySelectorAll('[data-background-button]').forEach(function (button) {
    button.addEventListener('click', function () {
        backgroundIndex = (backgroundIndex + 1) % backgroundColors.length;
        applyBackground();
    });
    button.disabled = false;
});
