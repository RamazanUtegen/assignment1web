# KZ Travel final project

KZ Travel helps first-time visitors compare Aktau, Astana, Almaty and Shymkent, save places and plan a short trip. Team SE-2501 includes Ramazan Utegen, Ziyadinkhan Kudaibergenuly and Ruzimuhammad.

GitHub Pages serves the redesign from `main`. The deployment records include the published source commit, workflow result and hosted asset hashes. [Live site](https://ramazanutegen.github.io/assignment1web/) · [Main branch](https://github.com/RamazanUtegen/assignment1web/tree/main) · [Deployment evidence](deployment.json)

From a checkout or an extracted project ZIP, run `python3 -m http.server 8765 --bind 127.0.0.1` to test locally. Localhost gives the account and clipboard features a secure context. [Local preview](http://127.0.0.1:8765/)

## Review evidence

| Area | Desktop | Phone |
| --- | --- | --- |
| Home | [Homepage](screenshots/index-desktop.png), [cities](screenshots/destinations-desktop.png), [night cities](screenshots/destinations-desktop-night.png) | [Homepage](screenshots/index-mobile.png), [cities](screenshots/destinations-mobile.png), [night cities](screenshots/destinations-mobile-night.png) |
| City guides | [Aktau](screenshots/aktau-desktop.png), [Astana](screenshots/astana-desktop.png), [Almaty](screenshots/almaty-desktop.png), [Shymkent](screenshots/shymkent-desktop.png) | [Aktau](screenshots/aktau-mobile.png), [Astana](screenshots/astana-mobile.png), [Almaty](screenshots/almaty-mobile.png), [Shymkent](screenshots/shymkent-mobile.png) |
| Our Story | [Desktop](screenshots/about-desktop.png) | [Phone](screenshots/about-mobile.png) |
| Account | [Sign Up](screenshots/signup-desktop.png), [Log In](screenshots/login-desktop.png), [Profile](screenshots/profile-desktop.png) | [Sign Up](screenshots/signup-mobile.png), [Log In](screenshots/login-mobile.png), [Profile](screenshots/profile-mobile.png) |

The complete review journey starts by finding and saving Almaty. Register with sample details, log in, reload Profile and follow **Build a route**. Select Almaty and two days, copy the itinerary, then check the forecast. Evidence includes [validation](screenshots/signup-validation.png), [wrong credentials](screenshots/login-error.png), [saved Almaty](screenshots/profile-desktop.png), [the two-day route](screenshots/planner.png) and [the live forecast](screenshots/weather-published.png). The [tablet screenshot](screenshots/destinations-tablet.png) shows the city directory at 1024 px.

## Rubric results

| Course criterion | Points available | Review evidence |
| --- | ---: | --- |
| Responsiveness | 10 | All nine pages fit 390, 768, 1024 and 1440 px in both themes. The browser checks cover touch Save, the grid and lead-image sources. |
| Hosting | 5 | GitHub Pages and repository URLs are in the required TXT. The GitHub Pages build succeeded and every checked page and asset matched the published source. [Hosted asset check](http-verification.json) |
| Light and dark modes | 5 | The browser checks switch the theme and verify it persists across pages. Screenshots show both themes. |
| Design and user experience | 20 | A river-valley hero leads directly into discovery. Each city has a reason to visit, a guide link and a Save button. The account pages lead with the form or saved places. |
| JavaScript | 25 | Browser checks cover local registration, the salted verifier, login, invalid input, wrong credentials, reload, saved Almaty, autocomplete and links to the planner. |
| Motion and feedback | 5 | The browser checks confirm 120 ms press feedback, 180 ms planner motion and the reduced-motion state. |
| External API | 10 | Open-Meteo returns current conditions and three forecast days. Browser checks exercise loading, HTTP errors, retry and cache. |
| Theme and feature cohesion | 10 | The traveller journey connects city guides, the notebook, a copyable route and local weather. |
| Presentation | 5 | The script allocates 4:45 across three speakers. Seven backup slides support the live walkthrough. |
| Code quality and organization | 5 | Shared CSS, local dependencies, explicit validation and asset and navigation checks. |

The [interface review](interface-review.md) ranks the fixes for keyboard focus, narrow layouts, saving and recovery. The [browser results](browser-verification.json) list the tested widths, pages and themes. The [capture checks](capture-verification.json) record contrast and image loading. The [published browser results](live-browser-verification.json) cover the traveller journey on the hosted site. The course instructor assesses design and presentation.

## Build the submission

With the preview server running, run `python3 scripts/verify-final.py` and `KZ_WEATHER_LIVE=1 node scripts/verify-final.cjs`. The browser script uses Playwright, Chromium and Edge. Optional `KZ_CHROMIUM_EXECUTABLE` and `KZ_EDGE_EXECUTABLE` point it to locally installed browsers. Use `KZ_FINAL_EVIDENCE` to put a test run in a separate folder.

Run `python3 scripts/build-final-report.py` and `python3 scripts/package-final.py` for the submission files in `output/final/`. The PDF uses ReportLab and Pillow and checks the hosted asset hashes and browser results recorded with the project.

Each student submits these three files together in Moodle’s **Final Exam** folder by **18 November 2026 at 23:59**.

- `KZTravel_SE2501_FinalProject.zip`
- `KZTravel_SE2501_Report.pdf`
- `KZTravel_SE2501_Links.txt`

The [three-speaker script](presentation-script.md), backup screenshots and course rubric map are included in the project ZIP.

The original page credits assign Home and Aktau to Ramazan, Astana and Our Story to Ziyadinkhan, and Almaty and Shymkent to Ruzimuhammad. The shared modules support the entire site. The report lists the work division and separate rehearsal roles.

Design and motion references are [Visit Finland](https://www.visitfinland.com/en/places-to-go/) and [Emil Kowalski’s animation guidance](https://emilkowal.ski/ui/7-practical-animation-tips). The forecast uses [Open-Meteo](https://open-meteo.com/en/docs).
