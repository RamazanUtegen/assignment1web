# Assignment 5 - implementation and defence

Team: KZ Travel. Group: SE-2501. Members: Ramazan Utegen, Ziyadinkhan Kudaibergenuly, Ruzimuhammad.

## Requirement mapping

| PDF requirement | Implementation | Demonstration |
| --- | --- | --- |
| Select and modify elements | `querySelector`, `querySelectorAll`, `getElementById`; rating, filters, route output | Select stars and filter a city |
| Dynamic content and styles | `textContent`, `hidden`, `classList`, progress `style.width` | Build a route and watch progress |
| Day/night theme | `applyTheme`, CSS variables, body `data-theme` | Moon button; reload; switch back |
| Attribute manipulation (chosen option: rating stars) | Selected colours, `aria-pressed`, feedback; local persistence | Rate 4/5, reload, choose 2/5 |
| Click listeners | Heart, theme, filters, rating, Next, Back, Reset | Save a city; inspect Saved tab |
| Keyboard navigation | `keydown` switch handles all four arrows, Home, End | Focus Explore; press arrows, End, Home |
| Callback (chosen option: multi-step form) | `changeStep(direction, onStepChanged)` calls `showStep`; input elements retain values | Next, type a name, Back, Next |
| Switch statements | `matchesCategory` and menu key logic | Into nature / Culture & food |
| Objects and methods | Destination objects and `getRoute(days)`; storage object | Build a 2-day and a 3-day route |
| Arrays and loops | Destination/stop arrays; explicit `for` loop creates route `li` nodes | Generated day-by-day list |
| Higher-order functions | `filter`, `map`, `forEach`, step callback | Search and category filtering together |
| Sound | User-enabled Web Audio oscillator and gain envelope | Music note, then rate/save/build |
| Event-triggered animations | `animate`, `is-pulsing`, progress transition, gallery and FAQ | Filter; save; advance a step |
| Separation of concerns | HTML structure, external CSS, deferred external JS | Inspect page head and source files |
| Theme, engagement, UX | Kazakhstan content, destination filtering, routes, saved cities | Browse all six pages at narrow widths |
| Deployment | Deferred explicitly at the team's request | Commit/push/deploy only after approval |

## Steps to reproduce

1. Use Into nature: Aktau and Almaty remain. Enter `almaty`: one city remains. Enter a nonexistent place: an empty state appears. Show all places restores discovery.
2. Save Aktau and open Saved. Reload: it stays saved. Unsave it: the empty state appears.
3. Switch to night mode. Open another city or reload: night mode remains. The footer background button cycles Sand, Sky and Steppe in both themes.
4. Press Next without a destination: an error appears. Choose Almaty, Next, enter a first name, choose 2 days. Back and Next preserve input. Review and Build generate two day items and a link to Almaty. Start over resets everything.
5. Focus a main navigation link. Use all four arrow keys, Home and End. Focus wraps; Enter follows the link and Tab continues normal navigation.
6. Select a guide star. Colour, `aria-pressed` and the message update. Reload to confirm persistence. Other pages have independent ratings.
7. Enable sound with the note button. A preview chime plays; save or rate to trigger another. Rapid clicks replace the previous note. Switch sound off and repeat. Sound starts off after page navigation.
8. Use a gallery thumbnail, indicator, Previous/Next and arrow keys. The active image and selected thumbnail agree.
9. Submit empty legacy forms, then valid sample data. Test password length and confirmation. Open and close the FAQ and contact popup, including Escape and keyboard focus return.

## Browser verification - 23 October 2026

Review environment: Codex in-app Chromium on Windows, desktop 1280 x 720. Responsive layouts are checked in actual same-origin iframes at 360, 390 and 768 CSS-pixel frame widths (inner width excludes scrollbars). These are layout checks, not physical-device or Firefox tests.

Screenshots: `docs/assignment-5/screenshots/`. The static check compares original image references with Git HEAD and validates all local links and resources. Historical Assignment 4 checks describe the older version.

## Defence discussion

- A callback is a function passed to another function. `changeStep` validates and changes state; its `onStepChanged` argument displays the new step.
- A method belongs to an object. `getRoute` uses `this.stops` and returns a slice for the selected number of days.
- `filter` returns a subset; `map` transforms items; `forEach` applies side effects. The explicit `for` loop creates DOM nodes for each route day.
- `textContent` prevents HTML entered as a traveller name from becoming markup.
- `aria-pressed` communicates toggle state, `aria-expanded` communicates FAQ/menu state, and `hidden` removes inactive steps from navigation.
- Sound begins only after a click, with one active oscillator. A gain envelope avoids a harsh click; the ended callback disconnects audio nodes.
- Browser storage can fail; the helper catches errors so controls still work during the current visit.
- Animations restart after interaction, and CSS disables them for reduced-motion users.

Suggested rehearsal split: Ramazan explains discovery/DOM; Ziyadinkhan explains navigation/themes/ratings; Ruzimuhammad explains planner/data/sound. This is a rehearsal suggestion, not a claim of individual authorship. Every member should understand the complete implementation.

## Challenges and reflection

1. Preserving earlier work: the new stylesheet changes presentation while retaining Bootstrap, forms, FAQ and dialog scripts. Original image references are checked automatically.
2. Consistent themes: semantic CSS variables recolour every page. The background-cycle feature uses matching day/night palettes.
3. Input continuity: planner steps hide existing fieldsets instead of rebuilding inputs, preserving values on Back.
4. Safe feedback: status text explains errors; `textContent` displays user values; invalid controls receive focus.
5. Portable preview: Bootstrap and fonts are local, removing external runtime requests.

## Publication and submission

Existing deployment address: https://ramazanutegen.github.io/assignment1web/. These changes have not been committed, pushed or deployed, following the explicit request to review first. The report is a review draft until publication is complete.

After approval: review the diff, commit, push, wait for GitHub Pages, test the deployed version, update the report publication status, rebuild PDF/ZIP, and have every member submit both. No automatic publication or LMS submission is performed here.
