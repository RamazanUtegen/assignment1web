# Assignment 6 - jQuery

KZ Travel continues the original six-page Kazakhstan guide with the same team: Ramazan Utegen, Ziyadinkhan Kudaibergenuly and Ruzimuhammad; group SE-2501.

| Task | Implementation | Where to demonstrate |
| --- | --- | --- |
| 0. Setup | jQuery 4.0.0 CDN in every head, integrity hash, identical local fallback; `$(document).ready()` logs `jQuery is ready!` | DevTools console on any page |
| 1. Live search | jQuery `.on('input')`, `.filter()`, `.prop('hidden')`; search combines with category and Saved filters | Home > Featured cities; type Almaty |
| 2. Autocomplete | Matching names in a listbox; click, arrows, Enter, Escape and blur; ARIA active descendant | Type a in destination search |
| 3. Highlighting | All literal matches in destination titles/descriptions and FAQ questions/answers; escaped regex; safe text nodes and mark elements | Home > FAQ; search guide; clear to restore previous accordion state |
| 4. Scroll progress | Fixed blue/teal/lime bar; jQuery scroll/resize listeners, requestAnimationFrame, clamped width and ARIA value | Scroll any page to the bottom |
| 5. Counter | `.animate()` counts to 4 city destinations, 6 pages, 9 home-gallery photos once on entering view; no invented visitor metrics | Stats between destinations and planner |
| 6. Submit spinner | Existing validator hands successful forms to jQuery; Please wait, spinner, disabled button, duplicate-submit guard; restores after 1.4 s | Community signup, city forms or About contact dialog |
| 7. Notifications | One toast shared by save, copy and valid forms; `.stop()`, `.fadeIn()`, `.fadeOut()` and timer cancellation | Save a city; toast disappears automatically |
| 8. Clipboard | Guide link on all pages, generated route on Home; Clipboard API and legacy fallback; checkmark and tooltip only on success | Build a route and press Copy my route |
| 9. Lazy images | Existing photos use data-src and a local placeholder; jQuery viewport checks and `.attr('src')`; carousel preloading and noscript images | Network panel with cache disabled: scroll to gallery, then Next |
| Part 4. Deploy | Normal commits and push to main; existing GitHub Pages publication | https://ramazanutegen.github.io/assignment1web/ |

## Run and verify

No build or backend is required. Open index.html, or serve the folder with `python -m http.server 8765 --bind 127.0.0.1`. jQuery uses the required CDN and falls back to the bundled identical version if it is unavailable. Forms are simulations; no personal data is sent.

Developer checks need Python with beautifulsoup4, plus Node with Playwright and Chromium/Edge installed:

```sh
python scripts/verify-assignment5.py
node scripts/verify-assignment6.cjs
python scripts/prepare-assignment6-code.py
node scripts/capture-assignment6-code.cjs
```

Browser evidence is saved in `docs/assignment-6/browser-verification.json`; screenshots are in its screenshots subfolder. Browser tests cover all six pages in Chromium and Microsoft Edge at 1440 x 1000 and 390 x 844, actual clipboard contents in Chromium, denied clipboard permission, blocked CDN fallback, reduced motion, literal regex characters, safe HTML-like queries, combined filters, duplicate submission, image network deferral and carousel loading. Source screenshots show exact file contents and original line numbers, rendered in the browser for legibility.

After verifying publication, run `python scripts/build-assignment6-report.py`, then `python scripts/package-assignment6.py`. The report reads saved publication evidence and requires successful local/live verification. ZIP packaging includes project sources, original images, local dependencies, documentation, evidence and the final report; it excludes Git metadata, temporary files and previous submission archives.

## Design and integration decisions

- The original topic, six pages, team credits, photographs and earlier features remain. Assignment 6 owns search/filter rendering; the earlier save handler dispatches a change event so two handlers do not compete.
- The existing validator rejects invalid input before the spinner starts. A cancelable custom event hands valid forms to the jQuery loading handler. Without that enhancement, the original validation completion still works.
- A single notification function receives events from the older controls. Clearing its timer and animation queue prevents rapid actions from showing stale messages.
- Search strings are escaped before compiling a regex. Matches are wrapped in mark elements built from text nodes, so HTML-like input cannot create elements or event handlers.
- Lazy images keep their original files, alt text and dimensions. Hidden slides load before transition. Scroll work is throttled to one update per animation frame. No-JavaScript image copies are retained.
- Counters and fades respect reduced-motion preference. Clipboard denial produces an accurate error message and never a false success icon.

## Submission

Every team member submits the same complete ZIP and PDF individually and defends the implementation. Check the deadline directly in the LMS: the assignment PDF does not state a deadline. The Russian defence notes are in `docs/assignment-6-defense-ru.md`.

## References

- Assignment 6 jQuery.pdf supplied by the user, Tasks 0-9 and Part 4.
- [jQuery ready](https://api.jquery.com/ready/), [filter](https://api.jquery.com/filter/), [on](https://api.jquery.com/on/), [animate](https://api.jquery.com/animate/), [fadeOut](https://api.jquery.com/fadeOut/).
- jQuery is distributed under MIT; licence in `vendor/jquery-LICENSE.txt`. Earlier Bootstrap and font licences remain.
