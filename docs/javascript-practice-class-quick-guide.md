# JavaScript practice class quick guide

Your screenshots focus on **DOM selection, text and style changes, loops, creating elements, and events**. Practise these first. Similar tasks are sensible defence preparation, though the exact questions are not confirmed.

## A small page for practice

Save this as a separate HTML file. Open it in a browser and run the following examples in Developer Tools → Console. Reload between exercises for a clean start.

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Practice</title></head>
<body>
    <h1 id="title">Hello, World!</h1>
    <h2>Another header</h2>
    <p id="message">Welcome to JavaScript.</p>
    <p>Another paragraph for practice.</p>
    <button id="btn" type="button">Click me</button>
</body>
</html>
```

## 1 Select elements and change text

```js
document.getElementById('title').textContent = 'Hello, Kazakhstan!';
document.querySelector('#message').textContent = 'Ready to travel';
document.querySelector('title').textContent = 'HELLO';
```

The first two change visible page text. The last changes the **browser tab title**. `document.title = 'HELLO'` is a shorter way to change the tab title.

| Selection | Result |
| --- | --- |
| `getElementById('title')` | One element by ID; no `#`. |
| `querySelector('p')` | First matching paragraph. |
| `querySelectorAll('p')` | A NodeList of all paragraphs. |
| `querySelectorAll('p')[1]` | Second paragraph; indexing starts at zero. |

`querySelector` returns `null` if nothing matches. `querySelectorAll` returns an empty NodeList.

## 2 Change styles

```js
document.body.style.backgroundColor = 'black';
document.body.style.color = 'white';
document.querySelectorAll('h1, h2').forEach((heading) => {
    heading.style.color = 'yellow';
});
```

CSS `background-color` becomes JavaScript `backgroundColor`. CSS `font-family` becomes `fontFamily`.

## 3 Change every paragraph using a loop

**With a for loop:**

```js
const paragraphs = document.querySelectorAll('p');

for (let i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.fontFamily = 'cursive';
}
```

`i = 0` starts at the first paragraph. `i < paragraphs.length` keeps the index in bounds. `i++` advances to the next one.

**With forEach, using the same `paragraphs` variable:**

```js
paragraphs.forEach((p) => {
    p.style.fontFamily = 'sans-serif';
    p.style.color = 'green';
});
```

`p` is the current paragraph element. You cannot set `paragraphs.style.color`: the collection itself is not an element.

## 4 Pass a named function as a callback

```js
function turnGreen(paragraph) {
    paragraph.style.color = 'green';
}

paragraphs.forEach(turnGreen);
```

`forEach` calls `turnGreen` for each paragraph. Pass the function **without parentheses**. The parameter name can be anything, but `paragraph` describes what it receives better than `array`.

These callback forms are both valid:

```js
paragraphs.forEach(function (p) { p.style.color = 'green'; });
paragraphs.forEach((p) => { p.style.color = 'green'; });
```

## 5 Respond to a click or double click

**Show an alert when the button is double-clicked:**

```js
document.getElementById('btn').addEventListener('dblclick', () => {
    alert('Button was double-clicked');
});
```

Use `'click'` for a single click and **`'dblclick'`** for a double click. `'dbclick'` is the wrong event name.

**Hide a paragraph when that paragraph is double-clicked:**

```js
document.querySelectorAll('p').forEach((p) => {
    p.addEventListener('dblclick', () => {
        p.style.display = 'none';
    });
});
```

The outer callback sets up each paragraph. The inner callback runs when that paragraph is double-clicked. To show them again:

```js
document.querySelectorAll('p').forEach((p) => {
    p.style.display = '';
});
```

## 6 Create and add a new element

```js
const newBtn = document.createElement('button');
newBtn.type = 'button';
newBtn.textContent = 'My Super Button';
document.body.append(newBtn);

newBtn.addEventListener('click', () => {
    document.getElementById('message').textContent = 'New button works!';
});
```

Remember **create → configure → append → attach behaviour**. `createElement` alone does not make the element visible on the page.

## Console results and common errors

| What you see | Meaning or fix |
| --- | --- |
| `undefined` after a declaration or `forEach` | Usually normal: that operation has no useful result to display. |
| `missing ) after argument list` | Check matching parentheses and braces. Both nested calls in the double-click example end with `});`. |
| `Cannot read properties of null` | The element was not found; check the selector and whether the HTML exists yet. |
| `Identifier has already been declared` | You declared the same `const` again in that console context. Reuse it or reload for a clean start. |
| Changes disappear after reload | Console edits change the current page. Save the code in an HTML/JS file to keep it. |

`console.log(paragraphs)` inspects the collection. `console.table(paragraphs)` displays it in a table; neither changes the page.

## Five tasks to rehearse before the defence

1. Change the tab title and the visible heading separately.
2. Make every paragraph green using both `for` and `forEach`.
3. Hide a paragraph on double click and restore it through the Console.
4. Create a new button and give it a working click listener.
5. Explain this sequence aloud: **select → listen → update**.

For the KZ Travel accordion, the same pattern is **select question buttons → listen for clicks → update attributes and the CSS class**. Then review form checks, the colour index, and the clock timer in the [assignment refresher](assignment-4-javascript-quick-review.md).
