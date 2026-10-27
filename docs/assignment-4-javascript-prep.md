# Assignment 4 JavaScript defence preparation

Prepare to explain what the website does, point to the code that makes it work, and make a small change yourself. The priorities below are estimates based on the assignment and your actual project; they are not confirmed instructor questions.

For a short recap first, read the [quick JavaScript refresher](assignment-4-javascript-quick-review.md).

**Your recorded responsibility is the FAQ accordion.** Study that in the most detail, but be ready to explain all five features because the assignment requires familiarity with your teammates' work. Defence is worth **40%** of the assignment grade.

## What to study first

| Priority | What you should be able to do | Project file |
| --- | --- | --- |
| First | Explain every line of your accordion and demonstrate opening and closing | [js/accordion.js](../js/accordion.js) |
| First | Explain DOM selection, events, functions, variables, and conditions | All five scripts |
| Next | Explain required fields, email checks, password length, and confirmation | [js/forms.js](../js/forms.js) |
| Next | Explain popup opening and its three closing methods | [js/popup.js](../js/popup.js) |
| Next | Explain the colour array, its index, and `%` | [js/preferences.js](../js/preferences.js) |
| Next | Explain `Date`, formatting, and `setInterval` | [js/clock.js](../js/clock.js) |
| Finally | Practise small code changes and explain how you checked them | Practice tasks below |

## A short opening explanation

Use this as a model, then explain it in your own words:

> Our project is KZ Travel, a six-page travel guide. In Assignment 4 we added JavaScript form validation, an FAQ accordion, a contact popup, a background-colour button, and a live clock. My responsibility is the FAQ accordion. JavaScript listens for a question click and changes its expanded state and CSS class. CSS animates the answer opening and closing. I can also explain the other four components.

Only describe a component as something you personally implemented if that accurately describes your work. You can always explain your study responsibility and demonstrate your understanding.

## Likely basic JavaScript questions

### 1 What does JavaScript do in this website

**Short answer:** HTML provides the content and structure, CSS controls appearance, and JavaScript responds to actions and updates the page.

**Example:** An FAQ question is an HTML button. JavaScript handles its click and changes a class. CSS uses that class to reveal and animate the answer.

### 2 What is the DOM

**Short answer:** The Document Object Model is the browser's object representation of the HTML page. JavaScript uses it to find, read, and change elements.

```js
const button = document.querySelector('[data-background-button]');
```

`document` represents the page. This selector finds the first element with the `data-background-button` attribute.

### 3 What is the difference between the selection methods

| Method | Returns | If nothing matches |
| --- | --- | --- |
| `document.querySelector('.faq-item')` | The first matching element | `null` |
| `document.querySelectorAll('.faq-item')` | A NodeList of all matching elements | An empty NodeList |
| `document.getElementById('faq-answer-1')` | The element with that ID | `null` |

Selectors use `.` for a class, `#` for an ID, and `[...]` for an attribute. `getElementById` takes the ID text **without** `#`.

### 4 What are const let and var

- `const` creates a block-scoped binding that cannot be reassigned.
- `let` creates a block-scoped variable that can be reassigned.
- `var` is function-scoped rather than block-scoped. Our assignment scripts use `const` and `let`.

In the colour script, `backgroundIndex` uses `let` because its value changes. `backgroundColors` uses `const` because we do not assign a different array to that name.

**Common follow-up:** A `const` array or object can still have its contents changed. `const` prevents reassignment; it does not freeze the object.

### 5 Which data types appear in our code

| Type | Example |
| --- | --- |
| String | `'click'`, `'true'`, `'#e5f1f8'` |
| Number | `0`, `1000`, `backgroundColors.length` |
| Boolean | `true`, `false`, `open` |
| Object | A colour record such as `{ name: 'Sky', color: '#e5f1f8' }` |
| Array | `backgroundColors`, which contains colour records |

An array is a kind of object. DOM elements and `Date` instances are objects too. A missing element may be `null`; an absent return value is `undefined`.

### 6 What is a function and what is a callback

**Short answer:** A function groups instructions. A callback is a function passed to another function so that the other function can call it.

```js
button.addEventListener('click', function () {
    popup.showModal();
});
```

The anonymous function is a callback. The browser calls it when a click happens; the body does not run just because we registered it.

`return` gives a value back to the caller and ends that function call. In our validation code, `return ''` means there is no validation error. Logging a value with `console.log` does not return it.

### 7 What is an event listener

**Short answer:** It runs a callback when a specified event occurs.

Our project listens for `click`, `submit`, `input`, `change`, `pointerdown`, `keydown`, and dialog `close` events.

When the form listener runs, its `event` parameter describes the event. `event.target` identifies the element where it originated. This lets the form listener know which input the user edited.

### 8 What does preventDefault do

**Short answer:** It cancels an event's default browser action when that action can be cancelled.

Our submit handler uses `event.preventDefault()` to stop normal form submission/navigation and show validation results on the page. It does **not** stop other statements from executing or stop the event from bubbling. `stopPropagation()` serves a different purpose: stopping propagation to other elements.

### 9 How are input change and submit different

- `input` usually fires as a user edits a value, such as typing in a text box.
- `change` fires when a user commits a change, with behaviour depending on the control.
- `submit` fires when a form is submitted, including submission through its submit button or applicable keyboard interaction.

Listening on the form's `submit` event covers more submission methods than only listening for a button click. Editing events can bubble from a field to its form.

### 10 What do strict equality and logical operators mean

| Operator | Meaning | Project use |
| --- | --- | --- |
| `===` | Equal without type coercion | `field.type === 'email'` |
| `!==` | Not equal without type coercion | `value !== password.value` |
| `!` | Boolean negation | `!open` |
| `&&` | Evaluate the right side only if the left side is truthy | Required **and** empty checks |
| `\|\|` | Evaluate the right side only if the left side is falsy | Either email check reports an error |

`==` can convert types before comparing; `===` does not. For example, the string `'8'` and the number `8` are different with strict equality.

`&&` and `||` return an operand value, which is why `description || ''` supplies an empty-string fallback. In `if` conditions, that result is interpreted as truthy or falsy.

### 11 Why does the HTML script tag use defer

```html
<script defer src="js/accordion.js"></script>
```

**Short answer:** For these external classic scripts, the browser can download them while parsing HTML, then run them after parsing completes, in document order. Our elements exist when the scripts select them.

This also lets the Bootstrap bundle load before `js/site.js` initializes the carousels. `async` does not provide the same document-order guarantee.

### 12 What is the difference between value textContent and innerHTML

- `input.value` reads or sets the current value of a form control.
- `element.textContent` reads or sets text without interpreting it as HTML.
- `element.innerHTML` reads or replaces HTML markup.

Our feedback uses `textContent`, so a name entered by the user is treated as text. It should not be inserted as executable HTML.

### 13 What do forEach filter and Array.from do

**Short answer:** `forEach` runs a callback for each item. `filter` returns a new array containing items whose callback returned a truthy result. `Array.from` creates an array from an iterable or array-like value.

Our `querySelectorAll` results support `forEach`. The form code converts its field NodeList to an array because it also uses array methods such as `filter`.

```js
const invalid = fields.filter(function (field) {
    return !validate(field);
});
```

`validate(field)` returns `true` for valid input. Negation makes invalid fields pass the filter, so `invalid` contains only the fields needing correction.

## Your FAQ accordion explained

Open [the actual accordion script](../js/accordion.js), [the FAQ HTML](../index.html), and [the FAQ CSS](../css/assignment4.css).

```js
document.querySelectorAll('[data-accordion-trigger]').forEach(function (button) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    button.addEventListener('click', function () {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        panel.setAttribute('aria-hidden', String(!open));
        panel.inert = !open;
        button.closest('.faq-item').classList.toggle('is-open', open);
    });
});
```

### Explain the code in order

| Code | What you can say aloud |
| --- | --- |
| `querySelectorAll('[data-accordion-trigger]')` | Find all FAQ question buttons marked with this attribute. |
| `.forEach(function (button) { ... })` | Set up each button separately. `button` is the current element, not a special JavaScript keyword. |
| `button.getAttribute('aria-controls')` | Read the ID of the answer controlled by this button. |
| `getElementById(...)` | Find that answer panel and keep a reference to it. |
| `addEventListener('click', ...)` | Wait for a click on this question. |
| `getAttribute('aria-expanded') !== 'true'` | Compute the next state: open if it is currently closed, otherwise close. |
| `setAttribute('aria-expanded', String(open))` | Tell assistive technology whether the question is expanded. |
| `setAttribute('aria-hidden', String(!open))` | Set the answer's accessible hidden state to the opposite of open. |
| `panel.inert = !open` | Make the closed answer inactive, including removing its descendants from keyboard focus. |
| `closest('.faq-item')` | Find this question's containing FAQ article. |
| `classList.toggle('is-open', open)` | Add the class when `open` is true and remove it when false. CSS uses the class to show or hide the panel. |

### How the question finds the correct answer

The button has `aria-controls="faq-answer-1"`. Its panel has `id="faq-answer-1"`. Those values must match exactly, and the ID must be unique on the page.

The click callback remembers the `button` and `panel` from its setup. This is a **closure**: a function retains access to variables in its surrounding lexical scope. Each button's callback therefore updates its own answer.

### What happens on two clicks

| Step | Current `aria-expanded` | New `open` value | Result |
| --- | --- | --- | --- |
| Page loads | `'false'` | No click yet | Answer starts hidden |
| First click | `'false'` | `true` | Add `is-open`; show the answer |
| Second click | `'true'` | `false` | Remove `is-open`; hide the answer |

**Why compare with `'true'` in quotes?** `getAttribute` returns a string or `null`, not a JavaScript boolean. The string `'false'` is truthy because it is not empty. Do not use `Boolean('false')` to interpret the attribute.

**Does setting `aria-expanded` animate the answer?** No. It communicates state. The `.is-open` class selects the CSS rule that changes the grid row from `0fr` to `1fr` over 0.3 seconds.

**Can multiple answers stay open?** Yes. Our current code toggles each item independently. It does not close its siblings.

**Why use a button instead of a paragraph?** A button has built-in keyboard activation and focus behaviour. A clickable paragraph would require extra accessibility work.

## Questions about the other four tasks

### Form validation

**What rules do we check?** Required values must contain more than spaces. Email must pass the browser's email syntax check and our additional pattern. The signup password must contain at least eight characters and match confirmation. The contact acknowledgement must be checked.

**Why use `trim()`?** `'   '` is not an empty string, but `'   '.trim()` is. We use the trimmed result to reject whitespace-only required input. `trim()` returns a new string; it does not change the original input value.

**Where is the password length set?** The homepage has `minlength="8"`. JavaScript reads `field.minLength` and compares it with `value.length`. If the instructor asks for ten characters, update the HTML attribute and its help text; the script already reads the rule from HTML.

**How does confirmation find the password?** `data-confirm-for="index-password"` becomes `field.dataset.confirmFor`. Its value is the original password input's ID. JavaScript finds that input and compares the two `.value` strings. Changing the original password also rechecks confirmation.

**What does the email pattern mean?** In `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, `^` and `$` anchor the whole value, `[^\s@]+` requires one or more characters other than whitespace or `@`, and `\.` matches a literal dot. `.test(value)` returns a boolean. This checks a format; it does not prove an address exists.

**Why set `form.noValidate = true`?** Once our handler is ready, we turn off automatic browser submission validation bubbles and display custom inline messages instead. We can still inspect properties such as `field.validity.typeMismatch` ourselves.

**How are errors displayed?** We create error spans, set their `textContent`, toggle `is-invalid`, update `aria-invalid`, and focus the first invalid field. `validate` returns `true` or `false`; `validationMessage` returns an error string or `''`.

**What is `submitted` for?** It starts false. After an attempted submission, editing a field rechecks its errors. We avoid showing all errors before the user has tried to submit.

**Are passwords stored or accounts created?** No. The static demo only checks inputs and shows feedback. It clears passwords after success. Real account creation would also need server-side processing and validation.

### Popup contact form

**How does it open?** `data-popup-open="contact-popup"` gives the dialog ID through `button.dataset.popupOpen`. Clicking the button calls `popup.showModal()`.

**How does it close?** The close button calls `popup.close()`. Our outside-click handler also calls it. The native dialog supports Escape dismissal.

**How do we recognize an outside click?** `getBoundingClientRect()` gives the dialog's edges in viewport coordinates. We compare them with the pointer's `clientX` and `clientY`. A point beyond any edge is outside. We check both the initial press and the click so dragging from inside does not dismiss the popup accidentally.

**What does the keyboard handler do?** It handles Tab and Shift+Tab at the ends of the control list, wrapping focus inside the dialog. The close handler restores focus to Contact Us and removes the body class that blocks background scrolling.

### Background colour button

**Why an array of objects?** Each array item keeps a colour's name and CSS value together. For example, `backgroundColors[1].name` is `'Sky'` and its `.color` is `'#e5f1f8'`.

**Why use `%`?** The remainder keeps the index within the array. With three colours, `(0 + 1) % 3` is 1, then the index becomes 2, then `(2 + 1) % 3` is 0. Array indexes start at zero.

**Which line changes the appearance?** `document.body.style.backgroundColor = background.color` sets an inline CSS property. JavaScript uses `backgroundColor` for CSS's `background-color`.

**Will the chosen colour survive a reload?** No. The current implementation stores its index in a variable for that page visit. It does not use persistent storage.

### Current date and time

**What does `new Date()` do?** It creates a Date object for the current moment. A new object is created inside each update so the displayed time advances.

**Why use a formatter?** `Intl.DateTimeFormat` controls the readable language, date parts, time parts, and timezone. We specify `Asia/Almaty`, so the result does not silently follow a visitor's computer timezone.

**What does `setInterval(updateClock, 1000)` mean?** Ask the browser to call `updateClock` repeatedly with a delay of 1,000 milliseconds. We pass the function itself. `setInterval(updateClock(), 1000)` would call it immediately and pass its return value instead.

**Why call `updateClock()` before `setInterval`?** It fills the clock immediately rather than waiting for the first timer callback. Browser timers can be delayed, especially in background tabs, so each update reads the actual current time again.

**Why set both `dateTime` and `textContent`?** `dateTime` supplies the machine-readable timestamp on the HTML `time` element. `textContent` supplies the readable date and time for the visitor.

## Likely live coding tasks

These are worked implementations for practice. Tasks 1 to 6 show changes to the existing project; task 7 and the three examples after it run on their own. Practise in a copy of the project. When an example says **replace**, replace the old code instead of adding another event listener beside it.

For each task, read the solution, close it, and try to write it yourself. Then explain the important statement and check the result in the browser.

### 1 Add one FAQ question

**Instructor request:** “Add another question to your accordion.”

**Where:** In `index.html`, insert this article inside the existing `<div class="faq-list">`, after the other four articles.

```html
<article class="faq-item">
    <h3>
        <button class="faq-question" type="button"
                id="faq-question-5" data-accordion-trigger
                aria-controls="faq-answer-5" aria-expanded="false">
            Which guide includes mountain scenery?
        </button>
    </h3>
    <div class="faq-panel" id="faq-answer-5" role="region"
         aria-labelledby="faq-question-5" aria-hidden="true" inert>
        <div>
            <p>Open the Almaty guide to explore mountain scenery.</p>
        </div>
    </div>
</article>
```

**Say aloud:** “The button's `aria-controls` matches the answer ID. The answer's `aria-labelledby` matches the question ID. Our script selects every marked button, so it includes the fifth question when the page loads.”

**Check:** Reload. The new answer starts hidden, opens on the first click, and closes on the second. Questions 1 to 4 still work. This version adds markup before script setup; adding elements dynamically after setup would also require registering their listeners.

### 2 Change the FAQ animation speed

**Instructor request:** “Make the accordion open and close more slowly.”

**Where:** Replace the existing `.faq-panel` rule in `css/assignment4.css` with this rule. Keep the other FAQ rules.

```css
.faq-panel {
    display: grid;
    grid-template-rows: 0fr;
    visibility: hidden;
    transition: grid-template-rows .6s ease, visibility .6s;
}
```

**Say aloud:** “I changed the transition duration from 0.3 seconds to 0.6 seconds. JavaScript still toggles the class; CSS controls the animation speed.”

**Check:** Open and close a question. Both transitions take the new duration. The existing reduced-motion rule can disable these transitions when that preference is enabled.

### 3 Keep only one FAQ answer open

**Instructor request:** “When I open another question, close the previous answer.”

**Where:** Replace the contents of `js/accordion.js` with this version in your practice copy.

```js
const faqButtons = document.querySelectorAll('[data-accordion-trigger]');

function setFaqState(button, open) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));

    button.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    button.closest('.faq-item').classList.toggle('is-open', open);
}

faqButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const shouldOpen = button.getAttribute('aria-expanded') !== 'true';

        faqButtons.forEach(function (otherButton) {
            setFaqState(otherButton, false);
        });

        setFaqState(button, shouldOpen);
    });
});
```

**Say aloud:** “I remember whether the clicked question should open, close all questions, then apply that remembered state to the clicked question. The helper function keeps the class and accessibility attributes consistent.”

**Check:** Open question 1, then question 2. Only question 2 stays open. Click question 2 again; all answers close.

**Important detail:** Calculate `shouldOpen` **before** closing all questions. Otherwise the clicked question would always appear closed when you read its state, and you could not toggle it shut.

### 4 Change the password minimum to ten characters

**Instructor request:** “Require a password with at least ten characters.”

**Where:** In `index.html`, replace the existing password input and its help paragraph with these elements. Keep the existing label and confirmation input.

```html
<input aria-describedby="password-help" autocomplete="new-password"
       class="form-control px-3 py-2" id="index-password"
       minlength="10" name="password" required type="password">
<p class="form-text mb-0" id="password-help">
    Use at least 10 characters. Use a sample password for this demo.
</p>
```

The existing JavaScript already reads the HTML rule:

```js
if (field.minLength > 0 && value.length < field.minLength) {
    return 'Use at least ' + field.minLength + ' characters.';
}
```

**Say aloud:** “The minimum is stored in HTML. JavaScript reads `field.minLength`, so I do not need to hard-code another ten in the script.”

**Check:** Fill every required field correctly. Matching passwords of nine characters fail; matching passwords of ten characters pass. A ten-character password with a different confirmation still fails.

### 5 Add a fourth background colour

**Instructor request:** “Add another colour to the background button.”

**Where:** Replace only the `backgroundColors` array in `js/preferences.js`. Keep the remaining code.

```js
const backgroundColors = [
    { name: 'Sand', color: '#fbeec1' },
    { name: 'Sky', color: '#e5f1f8' },
    { name: 'Steppe', color: '#e7f0df' },
    { name: 'Rose', color: '#f8e5eb' }
];
```

The existing click handler still uses:

```js
backgroundIndex = (backgroundIndex + 1) % backgroundColors.length;
const background = backgroundColors[backgroundIndex];
document.body.style.backgroundColor = background.color;
```

**Say aloud:** “The array now contains four objects. The remainder uses the array's length, so the index wraps correctly without changing the handler.”

**Check:** Starting from Sand, successive clicks show Sky, Steppe, Rose, and Sand. The displayed colour name must match the page background.

### 6 Display a clock in 24 hour format

**Instructor request:** “Show the time without AM and PM.”

**Where:** Inside the existing `if` block in `js/clock.js`, replace the `dateFormatter` declaration with this version. Keep `updateClock` and `setInterval`.

```js
const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Almaty',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});
```

**Say aloud:** “`hour12: false` requests a 24-hour clock. The timezone and one-second update stay the same.”

**Check:** Reload. No AM or PM appears, and the seconds continue advancing. If using a sample date at 18:30, its hour displays as 18 rather than 6 PM.

### 7 Change text when a button is clicked

**Instructor request:** “Write JavaScript that changes a paragraph when I click a button.”

**Where:** Save this complete example as a separate `practice.html` file and open it in the browser. The script appears after the elements it selects.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Button practice</title>
</head>
<body>
    <button id="travel-button" type="button">Get ready</button>
    <p id="travel-message" role="status">Waiting for your click.</p>

    <script>
        const button = document.getElementById('travel-button');
        const message = document.getElementById('travel-message');

        button.addEventListener('click', function () {
            message.textContent = 'Ready to travel';
        });
    </script>
</body>
</html>
```

**Say aloud:** “I select the two elements, register a click listener, and change the paragraph's text inside its callback.”

**Check:** Before clicking, the paragraph says “Waiting for your click.” After clicking, it says “Ready to travel”.

## Writing the main features from scratch

An instructor may ask you to build a small version rather than edit an existing feature. These three complete examples cover form validation, a popup, and a clock. Together with the accordion script above and the background script in the project, they cover all five assignment tasks.

Save **one example at a time** as a separate HTML file. They are independent practice pages; do not paste them inside your existing project forms or scripts.

### Validate a small signup form

**Instructor request:** “Check required values, email, password length, and matching passwords using JavaScript.”

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Validation practice</title>
</head>
<body>
    <form id="signup-form" novalidate>
        <p><label>Name <input id="name" type="text" required></label></p>
        <p><label>Email <input id="email" type="email" required></label></p>
        <p><label>Password <input id="password" type="password" required></label></p>
        <p><label>Confirm password <input id="confirm" type="password" required></label></p>
        <button type="submit">Check signup</button>
        <p id="form-feedback" role="status"></p>
    </form>

    <script>
        const form = document.getElementById('signup-form');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirm');
        const feedback = document.getElementById('form-feedback');

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            if (!nameInput.value.trim() || !emailInput.value.trim() ||
                !passwordInput.value.trim() || !confirmInput.value.trim()) {
                feedback.textContent = 'Fill in every field.';
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput.validity.typeMismatch || !emailPattern.test(emailInput.value)) {
                feedback.textContent = 'Enter a valid email address.';
                return;
            }

            if (passwordInput.value.length < 8) {
                feedback.textContent = 'Use at least 8 characters for the password.';
                return;
            }

            if (passwordInput.value !== confirmInput.value) {
                feedback.textContent = 'Passwords must match.';
                return;
            }

            feedback.textContent = 'Validation passed. This is a demo.';
            passwordInput.value = '';
            confirmInput.value = '';
        });
    </script>
</body>
</html>
```

**Say aloud:** “`novalidate` lets my submit handler show custom messages. Each invalid condition sets feedback and returns, so execution stops before success. `preventDefault` keeps the browser on the page.”

**Check:** Try empty values, spaces for the name, an invalid email, a short password, mismatched passwords, and then valid entries. This small example shows one error at a time; the project version displays errors beside all invalid fields.

### Open and close a contact popup

**Instructor request:** “Show a hidden contact form when a button is clicked, and allow it to close.”

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Popup practice</title>
    <style>
        dialog { width: min(400px, 80vw); }
        dialog::backdrop { background: rgb(0 0 0 / 60%); }
    </style>
</head>
<body>
    <button id="open-popup" type="button">Contact Us</button>

    <dialog id="contact-popup" aria-labelledby="popup-title">
        <h2 id="popup-title">Contact the team</h2>
        <button id="close-popup" type="button" autofocus>Close</button>
        <form id="contact-form">
            <p><label>Email <input type="email" required></label></p>
            <p><label>Message <textarea required></textarea></label></p>
            <button type="submit">Check message</button>
            <p id="popup-feedback" role="status"></p>
        </form>
    </dialog>

    <script>
        const popup = document.getElementById('contact-popup');
        const openButton = document.getElementById('open-popup');
        const closeButton = document.getElementById('close-popup');
        let pressedOutside = false;

        openButton.addEventListener('click', function () {
            popup.showModal();
        });

        closeButton.addEventListener('click', function () {
            popup.close();
        });

        function isOutside(event) {
            const box = popup.getBoundingClientRect();
            return event.clientX < box.left || event.clientX > box.right ||
                   event.clientY < box.top || event.clientY > box.bottom;
        }

        popup.addEventListener('pointerdown', function (event) {
            pressedOutside = isOutside(event);
        });

        popup.addEventListener('click', function (event) {
            if (pressedOutside && isOutside(event)) popup.close();
            pressedOutside = false;
        });

        popup.addEventListener('close', function () {
            openButton.focus();
        });

        document.getElementById('contact-form').addEventListener('submit', function (event) {
            event.preventDefault();
            document.getElementById('popup-feedback').textContent = 'Demo message checked.';
        });
    </script>
</body>
</html>
```

**Say aloud:** “A dialog starts closed when it has no `open` attribute. I call `showModal` on the trigger click and `close` on the close-button or outside click. The native dialog also supports Escape.”

**Check:** Open it. Clicking inside the form keeps it open. The close button, outside click, and Escape each close it. Fill the form correctly and submit; feedback appears without navigation. The contact form uses native required/email checks, unlike the custom validation exercise above.

### Display a date and a clock that updates

**Instructor request:** “Show the current date and time and update it every second.”

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Clock practice</title>
</head>
<body>
    <p>Time in Kazakhstan: <time id="clock"></time></p>

    <script>
        const clock = document.getElementById('clock');
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Almaty',
            dateStyle: 'long',
            timeStyle: 'medium'
        });

        function updateClock() {
            const now = new Date();
            clock.textContent = formatter.format(now);
            clock.dateTime = now.toISOString();
        }

        updateClock();
        setInterval(updateClock, 1000);
    </script>
</body>
</html>
```

**Say aloud:** “The first call displays the time immediately. The timer calls the same function repeatedly. Each call creates a new Date for the current moment.”

**Check:** The page displays a date and time as soon as it opens, and the seconds advance. The callback is `updateClock`, without parentheses, in `setInterval`.

## What to practise writing first

1. Select a button and change a paragraph on click without looking at a solution.
2. Recreate your original accordion click handler, then change it to allow only one open answer.
3. Write the small validation example, including all four failure cases and `preventDefault`.
4. Write a colour array and the remainder expression from memory.
5. Write the popup open/close listeners and the clock update function.

During the defence, build one working step at a time: select the element, attach the event, make one visible change, then add the remaining conditions. Reload after edits and check the Console if it fails.

## Likely debugging questions

| Symptom | What to inspect first |
| --- | --- |
| Clicking a question does nothing | Check Console errors, the script path, `data-accordion-trigger`, and whether the script ran after HTML parsing. |
| An error says it cannot read a property of `null` | A selector or ID lookup found no element. Compare the requested ID with the actual HTML ID. |
| A question reports expanded but no answer appears | Check that the containing article gets `is-open`, the CSS file is loaded, and the answer has the expected class. ARIA alone does not show content. |
| The form reloads the page instead of showing feedback | Check that the submit listener loaded and reached `event.preventDefault()`. |
| The clock shows one time and stays there | Check `setInterval`, ensure the callback receives a function reference, and ensure `new Date()` runs on every update. |

Open browser Developer Tools and use **Console** for JavaScript errors and **Network** for failed JS/CSS requests. Inspect the FAQ element while clicking and watch `aria-expanded` and `is-open` change. Explain what evidence you see before editing code.

## A forty five minute study session

1. **First 10 minutes:** Read the basic questions aloud. Explain DOM selection, events, `const` versus `let`, functions, and `preventDefault` without reading the answers.
2. **Next 15 minutes:** Open `accordion.js` beside the homepage. Explain every line, click twice, and inspect the changed attributes and class.
3. **Next 10 minutes:** Demonstrate the other four features. Explain one important statement from each script.
4. **Final 10 minutes:** Add a fifth FAQ in a practice copy, then try one unfamiliar change from the live coding table. Verify the result in the browser.

If time is short, prioritize your accordion, DOM selection, event listeners, the form checks, and one successful live code change.

## Mock oral defence

Close this guide and answer aloud:

1. What does your JavaScript component do, and where is its script linked?
2. How does each FAQ button find its answer?
3. Why is `'true'` a string in the comparison, but `open` a boolean?
4. What happens to the class and attributes on the first and second clicks?
5. Which part creates the smooth animation?
6. Why does the submit handler call `preventDefault`, and what inputs does it reject?
7. How does the colour index return to zero?
8. Why does the clock need both an immediate update and a timer?
9. How can a user close the popup?
10. If asked to add one more FAQ, which HTML values must be unique and match each other?

You are ready when you can explain the behaviour in your own words, point to the relevant statements, and make and verify a small change independently. Reading the answers once is the starting point; doing this without them is the useful check.
