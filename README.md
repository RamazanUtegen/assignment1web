# KZ Travel - Assignment 5

A six-page Kazakhstan guide continuing Assignments 1-4. The current design uses calm teal and cool-white surfaces, DM Sans typography, generous landscape photographs and a responsive split opening. All original photographs, city guides, forms, tables, FAQs and carousels are retained.

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

## Full visual redesign

The user-selected calm, modern and light direction now covers all six pages: new first screens, sentence-case headings, rounded destination cards and galleries, a cohesive teal palette, updated forms, inline SVG controls and a matching night theme. The shared stylesheet was simplified to one consistent presentation. Design tokens and responsive rules are recorded in [DESIGN.md](DESIGN.md); product constraints are in [PRODUCT.md](PRODUCT.md).

Chromium and Firefox passed the full six-page suite at desktop and mobile sizes; the 12 focused interaction regressions also passed. Layout checks cover 320–1440px. Evidence lives in `output/redesign/verification/` and `output/redesign/`. The independent screenshot/source review returned `ship` with no material fixes. These remain local source changes; the published site, report and ZIP have not been rebuilt or deployed.

## Site improvements — 9 November 2026

The current source improves text readability, search visibility, touch targets and form controls across all six pages. Mobile filters remain visible, navigation closes before revealing the planner, and removing saved places or clearing filters preserves keyboard focus. Homepage section links follow the reading order; Almaty and Shymkent schedules have accessible scroll regions and table captions.

Photos use responsive WebP copies in `assets/optimized/`, with accurate dimensions, priority hero loading and lazy loading below the fold. The largest copies total 5.35 MB versus 20.82 MB for their original sources (74.3% smaller); the homepage hero is 110 KB instead of 2.72 MB. Hero selection accounts for the portrait crop on phones. Original photos and fallback paths are preserved.

Developer checks (the site itself needs none of these dependencies):

```sh
python scripts/optimize-images.py --check
python scripts/verify-assignment5.py
python scripts/verify-seo.py
node scripts/verify-improvements.cjs
node scripts/verify-accessibility.cjs
KZ_TRAVEL_OUTPUT_DIR=output/improvements-verification node scripts/verify-assignment5.cjs
```

The image check needs Pillow; browser checks need Playwright and installed browsers. Run `python scripts/optimize-images.py` to rebuild derivatives after changing a photo. The deployment checker also verifies every responsive image. Keep the local server running for the full browser suite; the focused regression script also supports opening local files directly.

These improvements are local source changes. The existing publication, report, ZIP and historical verification evidence remain from the previous submission.

## Ten-skill improvement pass — 10 November 2026

The ten skills installed in `.agents/skills/` were applied to the existing calm design. The pass keeps the six-page static architecture and all assignment demonstrations.

| Skill | Applied improvement or review |
| --- | --- |
| accessibility | Keyboard focus fully reveals horizontal links and thumbnails. Checkbox errors follow the whole label row. Form borders remain visible in all six theme/palette combinations. |
| codebase-design | Responsive image geometry stays in the shared `image_sizes()` generator rather than separate page-specific edits. No new runtime abstraction or dependency was needed. |
| design-taste-frontend | Reviewed the existing photographic composition, restrained palette, typography and real-browser screenshots against the selected calm direction. |
| emil-design-eng | Removed entry motion while typing, using keyboard filters, saving or rating with the keyboard, and moving through planner steps. Pointer feedback and reduced-motion support remain. |
| frontend-design | Empty search and empty Saved now explain the actual state and the next useful action. |
| impeccable | Added semantic control-border tokens and recorded the contrast and motion rules in `DESIGN.md`. |
| performance | Corrected responsive image sizes to match the actual card, gallery and carousel widths; supplied small thumbnail variants while preserving original photos. |
| seo | Added accurate descriptions, canonical URLs, social preview metadata and `sitemap.xml`; added a local metadata validator. |
| web-design-guidelines | Reviewed focus visibility, input feedback, mobile reflow and touch controls; fixed the clipped focus and checkbox layout findings. |
| webapp-testing | Added focused browser regressions for empty states, motion, horizontal keyboard focus and checkbox validation. |

Three cold homepage-to-gallery journeys per viewport at DPR2 measured 13.7% less total transfer on mobile (1,462,815 → 1,262,738 bytes) and 11.6% less on desktop (1,732,062 → 1,531,985 bytes), with unchanged request counts. These are local lab measurements at 1.6Mbps/150ms latency, not field speed or deployed Core Web Vitals claims. All 93 previous WebP copies and original images remain byte-identical; the 60 new files are small thumbnail candidates. Geometry checks cover six pages at eleven widths.

The complete six-page suite passed in Chromium and Firefox at 1440×1000 and 390×844, including sound, restricted storage and reduced motion. The focused checks cover 15 interaction scenarios over HTTP and six accessibility regressions at 390px and 720px. Automated axe checks reported zero violations in 24 page/theme/viewport combinations and eight invalid-form states; this is not a claim of full WCAG conformance. Actual screen readers and physical mobile devices were not tested. Screenshots and local audit measurements are in `output/skills-pass/`.

## Assignment 5

- Search and category filters combine to find destinations; `switch` controls categories.
- Hearts save cities in the browser; Saved shows that collection.
- A three-step planner validates choices, preserves inputs on Back, reviews details and builds a route without reload. Step changes receive a rendering callback.
- Destination objects have a `getRoute()` method. Arrays, an explicit `for` loop, `map`, `filter` and `forEach` manage the UI.
- Arrows, Home and End move focus through the main navigation; Tab behaves normally.
- Day/night themes and per-page star ratings persist locally. Stars update styles, attributes and feedback.
- The sound control enables and previews a Web Audio chime; save, rate or complete a route to hear it again. Sound starts off on each page and never autoplays.
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
