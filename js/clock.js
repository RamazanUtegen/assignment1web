// Assignment 4, Task 5. Team study responsibility: Ruzimuhammad.
// Show the zone rather than relying on the visitor's computer settings.
const clockBlocks = document.querySelectorAll('[data-live-clock]');
if (clockBlocks.length) {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Almaty', month: 'long', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
    });
    clockBlocks.forEach(clock => {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'text-button clock-toggle';
        toggle.setAttribute('data-clock-toggle', '');
        clock.after(toggle);
        let interval;

        function updateClock() {
            const now = new Date();
            clock.dateTime = now.toISOString();
            clock.textContent = dateFormatter.format(now);
        }
        function resumeClock() {
            updateClock();
            interval = setInterval(updateClock, 1000);
            toggle.textContent = 'Pause clock';
        }
        toggle.addEventListener('click', () => {
            if (interval === undefined) {
                resumeClock();
            } else {
                clearInterval(interval);
                interval = undefined;
                toggle.textContent = 'Resume clock';
            }
        });
        resumeClock();
    });
}
