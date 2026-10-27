# Assignment 5: preparation for all three teammates

Team: **KZ Travel**. Group: **SE-2501**.

Members: **Ramazan Utegen**, **Ziyadinkhan Kudaibergenuly**, and **Ruzimuhammad**.

Each member uses the same complete project ZIP and PDF report. The sections below divide rehearsal, not authorship or completed individual contributions. Every member should understand the full project and be able to perform the common demonstration. The original page assignments remain Home/Aktau for Ramazan, Astana/About Us for Ziyadinkhan, and Almaty/Shymkent for Ruzimuhammad.

## What the assignment actually requires

The document offers alternatives in several places. The project chooses a working day/night switch for dynamic styling, a five-star rating for attribute manipulation, and a multi-step form for callback handling. It also includes gallery thumbnails as an extra enhancement. A separate Read More feature, a server POST, and every alternative example are not required by those option groups.

| Requirement | Actual implementation | Visible evidence |
| --- | --- | --- |
| Select elements and update content | `querySelector`, `querySelectorAll`, `getElementById`, `textContent`, `classList`, `hidden` in `js/experience.js` | Results count, rating feedback, route output |
| Dynamic styling | `applyTheme`, body `data-theme`, CSS variables in `css/editorial.css`; planner progress width | Day/night button and planner progress |
| Attribute manipulation | `renderRating` changes each star's `aria-pressed`; selected classes change colour | Five stars and selected value on every page |
| Button listeners | `addEventListener('click', ...)` for filters, hearts, theme, sound, stars and planner | All controls respond without page reload |
| Keyboard menu | `keydown` listeners and a `switch` for arrows, Home and End | Focus moves between main navigation links |
| Callback | `changeStep(direction, onStepChanged)` invokes the passed `showStep` function | Next/Back change steps and preserve inputs |
| Switch statement | `matchesCategory` selects nature/city/culture/saved logic | Combined category and search results |
| Objects and methods | Destination objects expose `getRoute(days)`; the storage object has `read` and `write` methods | Selected city and number of route days |
| Arrays and explicit loop | Destination and stops arrays; `for` creates route list items | One, two or three day items |
| Higher-order functions | `map`, `filter`, `forEach`, and `changeStep` accepting a function | Filtering, rendering and callback flow |
| Sound | User-enabled Web Audio chime, oscillator/gain envelope and cleanup | Toggle sound, then save/rate/build |
| Event-triggered animation | `animate`, `ui-enter`, saved-heart pulse and CSS transitions | Filter cards, select stars or advance planner |
| File separation | HTML structure, external CSS and deferred external JavaScript | No inline event handlers or style attributes |
| Theme and engagement | Kazakhstan destinations, city guides, saved places, galleries and itinerary | All six pages |
| Deployment and report | Shared repository, GitHub Pages, PDF with code/results screenshots | [Deployed website](https://ramazanutegen.github.io/assignment1web/), `docs/assignment-5.md` and generated PDF |

## Ramazan Utegen: discovery and DOM rehearsal

Start on Home and use the destination cards; finish on the Aktau guide.

1. Show all four cities. Click **Into nature**: Aktau and Almaty remain. Search for `almaty`: one result remains. Search for `not-a-place`: show the empty state, then use **Show all places**.
2. Save Aktau with its heart and open **Saved**. Reload to demonstrate local persistence. Remove it and explain why the saved list can become empty.
3. Open `renderDestinations`. Trace the user's input to `matchesCategory`, `destinations.filter`, a set of visible IDs, each card's `hidden` state and the `textContent` results count.
4. Show `querySelector` for a unique control and `querySelectorAll` for groups. Explain that a selector finds elements; a listener responds later when an event occurs.
5. Open Aktau. Select a gallery thumbnail, then use the previous/next controls. The `slid.bs.carousel` callback updates which thumbnail is active. This gallery switches existing slides; it does not fetch an image from a server.

Explain these distinctions:

- `filter` returns a new array containing matches. It does not delete destinations from the original array.
- `hidden` removes a card from display and keyboard navigation while keeping its element in the DOM.
- The saved `Set` contains destination IDs, avoiding duplicate entries. `JSON.stringify([...saved])` stores a serializable array.
- `textContent` treats a string as text. It does not interpret a traveller's input as HTML.

Practice tasks: add a searchable keyword to a destination's `tags`; predict the result of a combined category/query; change the empty-state wording. For each task, identify the data, logic or markup that should change before editing.

## Ziyadinkhan Kudaibergenuly: navigation, themes and ratings rehearsal

Start on the main menu; show the Astana guide and About Us page.

1. Use Tab to focus a main navigation link. Press Right/Down and Left/Up. Use Home/End to reach the first/last link. Explain the modulo operation that wraps indices and `preventDefault()` stopping the arrow key's normal scrolling action.
2. Toggle day/night, reload, and open Astana. Explain `applyTheme`, the body `data-theme` attribute and CSS variables. The stored value is read safely and reduced to the supported day/night choices.
3. Rate the Astana guide 4/5. Show four coloured stars, the feedback text and the single pressed star button. Reload to restore the rating, then choose 2/5. Ratings use separate keys for separate pages.
4. Inspect `renderRating`: a loop changes classes, `aria-pressed` communicates the chosen button, and `textContent` communicates the value.
5. On About Us, open the contact dialog and close it with Escape. Demonstrate focus returning to its opener. Show that the classroom contact form validates locally and does not send a message.

Explain these distinctions:

- `classList` changes presentation state; CSS specifies the colours and transitions.
- `aria-pressed` communicates a toggle button's state. `aria-expanded` communicates whether collapsible content is open.
- `localStorage` persists across reloads for this site. The helper catches errors so blocked storage does not prevent current-page controls from working.
- The keyboard handler moves focus between links; Enter still activates the focused link and Tab still works normally.

Practice tasks: add a theme colour through its existing CSS variable; explain how the first menu item wraps to the last; change rating feedback text without changing rating calculation.

## Ruzimuhammad: planner, data and sound rehearsal

Start on the Home planner; show the Almaty and Shymkent guides afterward.

1. Press Next without choosing a destination and explain the validation feedback. Choose Almaty, proceed, enter a first name and choose two days. Use Back and Next to demonstrate the inputs remain intact.
2. Review and build the route. Show the greeting, two generated day items and the city guide link. Start over and verify the initial step returns.
3. Trace `changeStep(1, showStep)`: the function `showStep` is passed as a value, validation and state changes occur, then `onStepChanged(step)` invokes the callback.
4. Find a destination object, its `stops` array and `getRoute(days)`. Explain how `this.stops.slice(0, days)` returns a route without mutating the stored stops.
5. Find the explicit `for` loop in `buildRoute`. For each route item it creates a list element and appends text. Explain why a two-day selection produces exactly two items.
6. Enable sound using the music-note button, then rate/save/build. Disable it. Explain the oscillator, gain envelope, user activation and cleanup. Browser testing can verify audio nodes are created and stopped; listen to the chime during the actual defence to confirm the device's output.
7. Show the event-triggered planner animation. Explain that the CSS reduced-motion preference disables unnecessary movement.

Explain these distinctions:

- A method is a function attached to an object. A callback is a function passed to another function for invocation.
- `map` transforms items; `filter` selects items; `forEach` performs an action for each item. These are higher-order functions because they receive functions.
- Hiding existing steps preserves inputs. Reset deliberately restores the initial form state.
- Sound starts after a user action. Stopping the previous sound and disconnecting completed nodes avoids overlap and unnecessary resources.

Practice tasks: add a stop to a destination and predict its effect on allowed route lengths; change a review label safely; trace where to alter a chime's frequency or duration while retaining cleanup.

## Common five-minute demonstration for every member

1. Introduce KZ Travel, the three members and group SE-2501. State the assignment objective.
2. Filter, search, save a destination and show the empty state.
3. Demonstrate arrow-key navigation, the day/night switch and a persisted page rating.
4. Complete the multi-step planner, show Back preserving inputs, and explain the callback and generated route loop.
5. Enable sound, trigger a chime, demonstrate an animation and show a gallery thumbnail.
6. Open the source files and connect each behaviour to its listener, data, DOM update and CSS.
7. Open the deployed URL and identify the final report and project ZIP for submission.

## Individual submission checklist

| Member | Use the complete PDF and ZIP | Check personal LMS submission | Attend and explain the full project |
| --- | --- | --- | --- |
| Ramazan Utegen | Required | To be completed by the member | Required |
| Ziyadinkhan Kudaibergenuly | Required | To be completed by the member | Required |
| Ruzimuhammad | Required | To be completed by the member | Required |

The PDF requires all team details, every task with code/result screenshots, step-by-step explanations and the deployed URL. The ZIP contains the runnable project and report. The repository contains the shared implementation. Preparing these files does not submit them to LMS or replace the individual practice-lesson defence. Check the current LMS deadline directly.

## Reflection prompts

Each member should prepare a short answer, using the actual implementation:

1. How did hiding fieldsets preserve input while going Back?
2. How do category and search conditions combine without losing the original destination data?
3. Why is traveller input rendered with `textContent`?
4. How are the old Bootstrap gallery, FAQ, forms and dialog kept working with the new features?
5. How does the sound code avoid overlap, and how does reduced-motion CSS respect user preferences?
6. What was verified in the browser, and what must still be done personally in LMS and during the defence?
