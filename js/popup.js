// Assignment 4, Task 3. Team study responsibility: Ruzimuhammad.
document.querySelectorAll('[data-popup-open]').forEach(function (button) {
    const popup = document.getElementById(button.dataset.popupOpen);
    let backdropPress = false;

    button.addEventListener('click', function () {
        popup.showModal();
        document.body.classList.add('popup-open');
    });
    popup.querySelector('[data-popup-close]').addEventListener('click', function () {
        popup.close();
    });
    function outsideContent(event) {
        const bounds = popup.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    popup.addEventListener('pointerdown', function (event) {
        backdropPress = outsideContent(event);
    });
    popup.addEventListener('click', function (event) {
        if (backdropPress && outsideContent(event)) popup.close();
        backdropPress = false;
    });
    popup.addEventListener('keydown', function (event) {
        if (event.key !== 'Tab') return;
        const controls = popup.querySelectorAll('button:not(:disabled), input:not(:disabled), select, textarea');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
    // Native dialog also closes with Escape.
    popup.addEventListener('close', function () {
        document.body.classList.remove('popup-open');
        button.focus();
    });
    button.disabled = false;
});
