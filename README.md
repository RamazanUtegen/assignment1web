# KZ Travel - Endterm Project

A responsive, six-page guide to Aktau, Astana, Almaty and Shymkent. Continues the original team project and Assignments 1-6 with a real weather API and a cleanup of forms, keyboard navigation and progressive fallbacks.

**Team:** KZ Travel · **Group:** SE-2501

| Member | Original page ownership |
| --- | --- |
| Ramazan Utegen | Home and Aktau |
| Ziyadinkhan Kudaibergenuly | Astana and About Us |
| Ruzimuhammad | Almaty and Shymkent |

[Open the website](https://ramazanutegen.github.io/assignment1web/) · [Endterm changes and defence notes in Russian](docs/endterm/README.md)

## Run

Open `index.html` directly, or serve the project folder:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Then open [localhost:8765](http://127.0.0.1:8765/). No build, backend or package installation is needed to use the site. Bootstrap and fonts are local. The required jQuery 4.0.0 CDN has an identical bundled fallback. Weather needs an internet connection; the rest of the guide works offline.

## What works

- Destination search combines with category and Saved filters; keyboard/touch autocomplete and safe match highlighting.
- FAQ search checks questions and answers, highlights all matches and restores accordion state on clear.
- A three-step route planner validates input, keeps choices on Back and generates a copyable itinerary.
- Day/night theme, saved places and per-page ratings persist in the browser. Optional sound starts only after a click.
- Gallery controls, keyboard navigation, thumbnails and viewport lazy loading preserve the original photographs.
- Scroll progress, animated counters, fading notifications and copy buttons with success/error feedback.
- Demo forms validate before showing a spinner; lock validated fields during processing and prevent duplicate submits. No data is sent.
- Current weather and a three-day outlook for all four cities, on Home and each city guide.

## Endterm / Week 9

`js/weather.js` demonstrates `async/await`, `fetch`, HTTP status checks, JSON validation and `try/catch/finally`. It cancels superseded requests, ignores late responses and restores controls after a 10-second timeout. Weather loads only when its section approaches the viewport.

Successful forecasts are cached for 10 minutes with `JSON.stringify`/`JSON.parse`. A failed update can show a clearly dated saved forecast up to 24 hours old; older or corrupt data is ignored. A failed request never fabricates weather. Storage restrictions do not break the controls.

The cleanup fixes editing after form validation, focus in a busy contact dialog and mobile-menu Escape. It corrects city coordinates, removes conflicting spacing classes, prioritises hero images, and keeps navigation, photographs and FAQ answers readable without JavaScript. Existing Assignment 6 features remain.

## Code and checks

| File | Responsibility |
| --- | --- |
| `script.js` | jQuery search, suggestions, highlights, loading feedback, toast, clipboard and lazy images |
| `js/weather.js` | Weather requests, response validation, cache and weather UI |
| `js/experience.js` | Route planner, saved cities, theme, ratings and Web Audio |
| `js/forms.js`, `js/popup.js`, `js/site.js` | Validation, dialog focus and navigation |
| `css/editorial.css`, `css/assignment6.css`, `css/endterm.css` | Shared design and enhancements |
| `css/no-js.css` | Static fallback when JavaScript is disabled |

Developer checks need Python with Beautiful Soup and Node with Playwright/Chromium. With the server running:

```sh
python scripts/verify-endterm.py
node scripts/verify-endterm.cjs
```

Set `KZ_WEATHER_LIVE=1` to include an actual Open-Meteo smoke test. Tests cover success, HTTP/network errors, malformed JSON values, cache expiry, blocked storage, timeout, responses arriving out of order, touch controls, form locking, dialog focus and no-JavaScript mode. Results are in `docs/endterm/verification.json`; screenshots distinguish fixture data from the real API capture. The earlier regression suite also runs on Chromium and Microsoft Edge at desktop and phone sizes; `KZ_TRAVEL_EVIDENCE` selects its output folder. Deployment checks compare every referenced local asset, including lazy image URLs.

`python scripts/package-endterm.py` creates `output/KZ-Travel-Endterm.zip` with the runnable site, local dependencies, defence notes and verification scripts. It excludes previous assignments' PDF/ZIP submissions, temporary files, Git metadata and unrelated documents. Every member submits the cleaned project individually and prepares to explain and modify the code.

## Data and attribution

Forms are demonstrations: no accounts, bookings, subscriptions or messages are created. Personal form input is not stored. Local Storage holds theme, saved city IDs, ratings and weather cache entries. Weather requests contain only a selected guide city's coordinates and forecast options, with no geolocation or form data.

Weather: [Open-Meteo](https://open-meteo.com/), [API documentation](https://open-meteo.com/en/docs), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This student project uses the non-commercial endpoint without an API key. Bootstrap and jQuery retain their upstream licences (`vendor/jquery-LICENSE.txt`). Fonts use the SIL Open Font License in `fonts/`. Original project photographs remain unchanged.

Earlier documentation and historical submission files remain in the [repository archive](https://github.com/RamazanUtegen/assignment1web/tree/main/docs). The current endterm ZIP is separate.
