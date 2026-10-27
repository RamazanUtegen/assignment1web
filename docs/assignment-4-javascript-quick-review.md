# JavaScript quick review for Assignment 4

Use this for a **5 to 10 minute refresh** before your defence. For full implementations, open the [live coding examples](assignment-4-javascript-prep.md#likely-live-coding-tasks).

The pattern behind the assignment is: **select an element, listen for an event, check or change a value, update the page.**

## Basic syntax

```js
const city = 'Astana';                       // String
let clicks = 0;                             // Number that can change
const isOpen = false;                       // Boolean
const cities = ['Aktau', 'Astana', 'Almaty']; // Array
const destination = { name: 'Almaty' };      // Object

clicks = clicks + 1;
console.log(cities[0]);                     // Aktau: indexes start at 0
console.log(destination.name);              // Almaty

function makeGreeting(name) {
    return 'Hello, ' + name;
}
console.log(makeGreeting('Ziyadinkhan'));
```

- **`const`:** cannot reassign the variable. An object's or array's contents can still change.
- **`let`:** use when you need to reassign the value, such as a colour index.
- **Function:** reusable instructions. A parameter receives an argument when you call it.
- **`return`:** sends a result back and ends that function call. `console.log` only prints.

## DOM selection and events

The **DOM** is the browser's object representation of the HTML page.

| Code | Meaning |
| --- | --- |
| `document.getElementById('message')` | Find one element by ID, without `#`. |
| `document.querySelector('#message')` | Find the first element matching a CSS selector. |
| `document.querySelectorAll('.faq-item')` | Find all matching elements as a NodeList. |
| `input.value` | Read or set a form control's current value. |
| `paragraph.textContent` | Read or set text. |
| `element.classList.add('is-open')` | Add a CSS class. |
| `element.classList.remove('is-open')` | Remove a CSS class. |
| `element.classList.toggle('is-open', open)` | Add if `open` is true; remove if false. |

**The event pattern to remember:**

```html
<button id="ready" type="button">Click me</button>
<p id="message"></p>
<script>
    const button = document.getElementById('ready');
    const message = document.getElementById('message');

    button.addEventListener('click', function () {
        message.textContent = 'Ready to travel';
    });
</script>
```

The function passed to `addEventListener` is a **callback**. It runs when the click happens. Here the script is below its elements; our project instead uses external scripts with **`defer`** so they run after HTML parsing.

## Operators and methods you will see

| Expression | Meaning or result |
| --- | --- |
| `value === 'email'` | Strict equality, without converting types. |
| `password !== confirmation` | Values do not match. |
| `!open` | Negate the boolean state. |
| `required && empty` | In a condition: both must be truthy. |
| `missingName \|\| missingEmail` | In a condition: at least one must be truthy. |
| `text.trim()` | Return text without leading/trailing whitespace. |
| `password.length < 8` | Check whether the password has fewer than eight characters. |
| `items.length` | Number of items. |
| `items.forEach(callback)` | Run the callback for each item. |
| `items.filter(callback)` | Return an array of items the callback accepts. |
| `(index + 1) % items.length` | Advance an index and wrap back to zero. |

`&&` and `||` short-circuit and return operand values. `if` interprets their result as truthy or falsy.

## Your accordion in one minute

This is the actual handler from [js/accordion.js](../js/accordion.js):

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

Remember the sequence:

1. Find every question button.
2. Read `aria-controls` to find that question's answer ID.
3. On click, calculate the opposite expanded state.
4. Update the accessibility attributes and `inert`.
5. Add or remove `is-open`; **CSS creates the smooth transition**.

First click: `'false'` becomes `'true'`; answer opens. Second click: `'true'` becomes `'false'`; answer closes.

`getAttribute` returns a **string or `null`**, so compare with `'true'`, not boolean `true`. The nonempty string `'false'` is truthy. Each callback remembers its own button and panel through a **closure**.

## The other four features

### Form validation

**Flow:** submit event → `event.preventDefault()` → validate inputs → show errors or success.

| Check | Key expression |
| --- | --- |
| Missing or whitespace-only value | `!input.value.trim()` |
| Email syntax | `email.validity.typeMismatch` and the project's email pattern |
| Too short | `password.value.length < password.minLength` |
| Confirmation differs | `password.value !== confirmation.value` |
| Checkbox not ticked | `!checkbox.checked` |

`preventDefault()` stops normal form submission/navigation. It does not stop the callback from continuing; **`return`** ends the callback early.

The project uses `noValidate` for custom feedback. `validate(field)` returns a boolean; `validationMessage(field)` returns an error string or `''`. The form displays feedback using `textContent` and focuses the first invalid field.

### Popup

- `popup.showModal()` opens the dialog.
- `popup.close()` closes it.
- Close button, outside click, and native Escape dismissal are supported.
- `getBoundingClientRect()` gives the dialog's edges; pointer coordinates tell us whether the click is outside.
- The project keeps keyboard focus inside while open and returns focus to Contact Us after closing.

### Background colours

The colour array contains objects with a `name` and `color`. The important statements are:

```js
backgroundIndex = (backgroundIndex + 1) % backgroundColors.length;
const background = backgroundColors[backgroundIndex];
document.body.style.backgroundColor = background.color;
```

With three colours the index cycles **0 → 1 → 2 → 0**. CSS `background-color` becomes JavaScript `style.backgroundColor`. Add another object to add another colour; the length-based expression still works.

### Live clock

```js
const clock = document.querySelector('[data-live-clock]');

function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleString('en-GB', {
        timeZone: 'Asia/Almaty'
    });
}

updateClock();
setInterval(updateClock, 1000);
```

This is a compact equivalent for review. The project's fuller version also sets a machine-readable timestamp and specifies the display options.

`new Date()` reads the current moment on each call. Call once immediately, then request repeated updates every **1,000 milliseconds**. Pass `updateClock` to the timer, **without parentheses**. `hour12: false` requests 24-hour formatting.

## Mistakes to catch quickly

- **Nothing happens:** check the selector, script path, and Console errors.
- **Cannot read a property of `null`:** the selected element was not found.
- **Double click handlers:** replace an old handler when changing its behaviour; do not attach both versions.
- **FAQ always opens:** calculate its next state before resetting other answers.
- **Form reloads:** check the submit listener and `preventDefault`.
- **Clock stops:** create `new Date()` inside the update function and pass a function reference to `setInterval`.
- **An ARIA value changes but the answer stays hidden:** check the `is-open` class and CSS. ARIA communicates state; it does not itself show the answer.

## Five answers to recall before entering

1. **What did JavaScript add?** Validation, expandable FAQs, a contact popup, background changes, and a live clock.
2. **How do I make a button work?** Select it, attach a click callback, update the page inside the callback.
3. **What is my accordion doing?** Finding the matching answer, toggling state, and changing a CSS class.
4. **What should I explain while coding?** Which element I selected, which event I handle, which value changes, and how I will check the result.
5. **What are these forms doing?** Checking data in the browser and showing feedback; they do not create accounts or send messages.
