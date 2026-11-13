# KZ Travel - Final Project

A responsive Kazakhstan travel guide with nine connected pages: Home, four city guides, Our Story, Sign Up, Log In and Profile. It helps first-time visitors and students compare destinations, build a short itinerary and check local weather. Continues the same team project and Assignments 1-6.

**Team:** KZ Travel · **Group:** SE-2501

| Member | Original page ownership |
| --- | --- |
| Ramazan Utegen | Home and Aktau |
| Ziyadinkhan Kudaibergenuly | Astana and About Us |
| Ruzimuhammad | Almaty and Shymkent |

[Open the website](https://ramazanutegen.github.io/assignment1web/) · [Final requirement map](docs/final/README.md) · [4:45 presentation script](docs/final/presentation-script.md)

## Run

Open `index.html` directly, or serve the project folder:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Then open [localhost:8765](http://127.0.0.1:8765/). No build, backend or package installation is needed to use the site. Use localhost or the hosted HTTPS site for the account demo; file-URL storage behaviour depends on the browser. Bootstrap and fonts are local. The jQuery 4.0.0 CDN has an identical bundled fallback. Weather needs an internet connection.

## What works

- Destination search combines with category and Saved filters; keyboard/touch autocomplete and safe match highlighting.
- FAQ search checks questions and answers, highlights all matches and restores accordion state on clear.
- A three-step route planner validates input, keeps choices on Back and generates a copyable itinerary.
- Day/night theme, saved places and per-page ratings persist in the browser. Optional sound starts only after a click.
- Gallery controls, keyboard navigation, thumbnails and viewport lazy loading preserve the original photographs.
- Scroll progress, animated counters, fading notifications and copy buttons with success/error feedback.
- Demo forms validate before showing a spinner; lock validated fields during processing and prevent duplicate submits. No data is sent.
- Current weather and a three-day outlook for all four cities, on Home and each city guide.
- Registration stores name, email, phone and a salted password verifier in localStorage. Login checks credentials and opens Profile. Logout clears the local session.
- Profile displays stored contact details and cities saved on this browser. Theme and session persist between pages; logout also updates another open profile tab.
- All forms use novalidate and explicit JavaScript rules. No native required, pattern, length, range or email-type constraint is used for validation.

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
| `js/auth.js` | Local account persistence, PBKDF2 password verifier, login, profile and logout |
| `js/validation.js` | Shared required, email, phone, password, confirmation and message rules |
| `js/forms.js`, `js/popup.js`, `js/site.js` | Validation, dialog focus and navigation |
| `css/editorial.css`, `css/assignment6.css`, `css/endterm.css`, `css/final.css` | Shared design and enhancements |
| `css/no-js.css` | Static fallback when JavaScript is disabled |

Developer checks need Python with Beautiful Soup and Node with Playwright/Chromium. With the server running:

```sh
python scripts/verify-final.py
node scripts/verify-final.cjs
```

Set `KZ_WEATHER_LIVE=1` to include an actual Open-Meteo smoke test. Final journeys cover Chromium and Edge at desktop, tablet and phone sizes: signup, inline validation, wrong credentials, duplicate email, profile, reload, logout, cross-tab session handling, search, filters, saved cities, route clipboard, gallery and enquiries. Results and backup screenshots are in `docs/final/`. Earlier endterm API evidence covers malformed data, expired cache, timeout and stale responses. Deployment checks include every root page and referenced local asset, including lazy image URLs.

The final submission is in `output/final/`: `KZTravel_SE2501_FinalProject.zip`, `KZTravel_SE2501_Report.pdf` and `KZTravel_SE2501_Links.txt`. Every member submits all three individually in the Final Exam folder. `scripts/package-final.py` builds the clean project ZIP without previous submissions, temporary files or Git metadata. The timed presentation script and backup screenshots are included.

## Data and attribution

Enquiry forms and route plans send no messages and create no bookings. Account forms intentionally store sample contact details and salted password verifiers locally for the final authentication simulation. LocalStorage also holds the local session, theme, saved city IDs, ratings and weather cache. This is not server authentication; use sample details and a sample password. Weather requests contain only a selected guide city's coordinates and forecast options, with no geolocation or form data.

Weather: [Open-Meteo](https://open-meteo.com/), [API documentation](https://open-meteo.com/en/docs), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This student project uses the non-commercial endpoint without an API key. Bootstrap and jQuery retain their upstream licences (`vendor/jquery-LICENSE.txt`). Fonts use the SIL Open Font License in `fonts/`. Original project photographs remain unchanged.

Earlier documentation and historical submission files remain in the [repository archive](https://github.com/RamazanUtegen/assignment1web/tree/main/docs). The current endterm ZIP is separate.
