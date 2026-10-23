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
- PDF: `output/pdf/KZ-Travel-Assignment-5-Report.pdf`.
- ZIP: `output/KZ-Travel-Assignment-5.zip`.
- New presentation: `css/editorial.css`; new behaviour: `js/experience.js`.

**Published and verified on 23 October 2026.** [Open KZ Travel](https://ramazanutegen.github.io/assignment1web/). Website source commit: `80fff147d8546481087b88beaf03fe9432ded336`. The GitHub Pages workflow completed successfully; all 54 checked HTML/assets matched the checkout. All six pages and the main interactions were checked in the live browser, with no console errors. [Deployment evidence](docs/assignment-5/deployment.json) records the workflow, hashes and browser results. The PDF and ZIP have been rebuilt after publication.

Every member submits the report and ZIP individually and defends the work. Deadline supplied from the LMS: **29 October 2026, 14:00**; follow its displayed time zone.

## Verification and attribution

`python scripts/verify-assignment5.py` checks links, assets, IDs, semantics, credits and original image preservation against Assignment 4 commit `f1bfba5` (Beautiful Soup is needed for this developer check only). `python scripts/verify-deployment.py --commit <sha>` checks published HTML/assets against the checkout. Browser scenarios are in the task notes. Report generation uses ReportLab and Pillow; `python scripts/build-assignment5-report.py` reads the saved deployment evidence and creates the final published report. Run `python scripts/package-assignment5.py` afterwards to rebuild the ZIP.

Bootstrap retains its upstream licence header. DM Sans and Barlow Condensed use the SIL Open Font License; licences are in `fonts/`. Lonely Planet informed composition only; KZ Travel retains its own content and imagery.

[Assignment 4](docs/assignment-4.md), [midterm](docs/midterm.md) and [Assignment 2](docs/assignment-2.md) notes remain as historical material. Earlier check scripts target the earlier design.
