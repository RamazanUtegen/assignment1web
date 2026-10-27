# KZ Travel - Assignment 5

A six-page Kazakhstan guide continuing Assignments 1-4. The new editorial design is inspired by Lonely Planet's large photographs and travel storytelling. All original photographs, city guides, forms, tables, FAQs and carousels are retained.

**Team:** KZ Travel · **Group:** SE-2501

| Member | Existing page ownership |
| --- | --- |
| Ramazan Utegen | Home and Aktau |
| Ziyadinkhan Kudaibergenuly | Astana and About Us |
| Ruzimuhammad | Almaty and Shymkent |

## Run locally

Open `index.html` directly, or run in this folder:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Visit [localhost:8000](http://127.0.0.1:8000/). No build, backend, package installation or internet connection is required. Bootstrap 5.3.8 and fonts are included locally.

## Assignment 5

- Search and category filters combine to find destinations; `switch` controls categories.
- Hearts save cities in the browser; Saved shows that collection.
- A three-step planner validates choices, preserves inputs on Back, reviews details and builds a route without reload. Step changes receive a rendering callback.
- Destination objects have a `getRoute()` method. Arrays, an explicit `for` loop, `map`, `filter` and `forEach` manage the UI.
- Arrows, Home and End move focus through the main navigation; Tab behaves normally.
- Day/night themes and per-page star ratings persist locally. Stars update styles, attributes and feedback.
- The music note enables and previews a Web Audio chime; save, rate or complete a route to hear it again. Sound starts off on each page and never autoplays.
- Event-triggered animations respect reduced-motion settings.
- Nine-image galleries retain controls and keyboard navigation and add thumbnails.

## Retained functions

All six pages retain navigation, content, credits, a live Kazakhstan clock (UTC+5) and the Sand/Sky/Steppe background button (now in the footer). Forms still validate required fields, emails and signup passwords. The homepage FAQ and About Us contact dialog retain keyboard/focus behaviour.

Forms are classroom demonstrations: no messages, bookings, accounts or subscriptions are created. Personal form data is not stored. Local storage holds only theme, saved city IDs and ratings.

## Submission and documentation

- [Task mapping and verification](docs/assignment-5.md).
- [Russian defence walkthrough](docs/assignment-5-defense-ru.md).
- [Preparation guide for all three teammates](docs/assignment-5-teammate-guide.md), with personal rehearsal tasks and the full requirement map.
- PDF: `output/pdf/KZ-Travel-Assignment-5-Report.pdf`.
- ZIP: `output/KZ-Travel-Assignment-5.zip`.
- New presentation: `css/editorial.css`; new behaviour: `js/experience.js`.

**Published and verified on 27 October 2026.** [Open KZ Travel](https://ramazanutegen.github.io/assignment1web/). [Deployment evidence](docs/assignment-5/deployment.json) records the verified source commit, Pages workflow and asset hashes. The report and ZIP are rebuilt after verifying the current publication.

Every member submits the same complete report and ZIP individually and defends the work. Check the exact deadline and time zone directly in the LMS; the assignment PDF does not specify a date.

## Verification and attribution

`python scripts/verify-assignment5.py` checks links, assets, IDs, semantics, credits and original image preservation against Assignment 4 commit `f1bfba5` (Beautiful Soup is needed for this developer check only). `python scripts/verify-deployment.py --commit <sha>` checks published HTML/assets against the checkout. Browser scenarios are in the task notes. Report generation uses ReportLab and Pillow; `python scripts/build-assignment5-report.py` reads the saved deployment evidence and creates the final published report. Run `python scripts/package-assignment5.py` afterwards to rebuild the ZIP.

`node scripts/verify-assignment5.cjs` provides repeatable browser tests using Playwright with Chromium and Firefox installed. It checks every page at 1440 x 1000 and 390 x 844, plus actual Web Audio nodes, cancellation during resume, storage restrictions and reduced motion. Start a local server on port 8765 or set `KZ_TRAVEL_BASE_URL`. Results are saved in `docs/assignment-5/browser-verification.json`. `python scripts/prepare-assignment5-code-views.py` followed by `node scripts/capture-assignment5-code.cjs` refreshes the report's source screenshots. Developer tools are not needed to use the site.

The final audit improves planner validation, keyboard Enter submission, error descriptions and focus; resets generated content; cancels pending sound on mute; synchronises Bootstrap dark controls; and improves night error contrast. The report generator now finds fonts on Linux, Windows and macOS.

Bootstrap retains its upstream licence header. DM Sans and Barlow Condensed use the SIL Open Font License; licences are in `fonts/`. Lonely Planet informed composition only; KZ Travel retains its own content and imagery.

[Assignment 4](docs/assignment-4.md), [midterm](docs/midterm.md) and [Assignment 2](docs/assignment-2.md) notes remain as historical material. Earlier check scripts target the earlier design.

## Earlier JavaScript study notes

- [JavaScript defence preparation guide](docs/assignment-4-javascript-prep.md): likely questions, short answers, the accordion explained, and live coding practice.
- [Quick JavaScript refresher](docs/assignment-4-javascript-quick-review.md): a 5 to 10 minute review before the defence.
