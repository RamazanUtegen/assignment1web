// Assignment 4, Task 5. Team study responsibility: Ruzimuhammad.
// Show the zone rather than relying on the visitor's computer settings.
const clockBlocks = document.querySelectorAll('[data-live-clock]');
if (clockBlocks.length) {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Almaty', month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
    function updateClock() {
        const now = new Date();
        clockBlocks.forEach(function (clock) {
            clock.dateTime = now.toISOString();
            clock.textContent = dateFormatter.format(now);
        });
    }
    updateClock();
    setInterval(updateClock, 1000);
}
