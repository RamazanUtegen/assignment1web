// Assignment 4, Task 4. Team study responsibility: Ruzimuhammad.
const backgroundColors = [
    { name: 'Sand', color: '#fbeec1' },
    { name: 'Sky', color: '#e5f1f8' },
    { name: 'Steppe', color: '#e7f0df' }
];
let backgroundIndex = 0;
document.querySelectorAll('[data-background-button]').forEach(function (button) {
    button.addEventListener('click', function () {
        backgroundIndex = (backgroundIndex + 1) % backgroundColors.length;
        const background = backgroundColors[backgroundIndex];
        document.body.style.backgroundColor = background.color;
        document.querySelectorAll('[data-background-name]').forEach(function (label) {
            label.textContent = background.name;
        });
    });
    button.disabled = false;
});
