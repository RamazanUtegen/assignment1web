# KZ Travel - Final Project

Team KZ Travel, SE-2501: Ramazan Utegen, Ziyadinkhan Kudaibergenuly and Ruzimuhammad.

Purpose: help first-time visitors and students compare four Kazakhstan destinations, explore their sights, plan a short route and check city weather. There are nine connected pages: Home, Aktau, Astana, Almaty, Shymkent, Our Story, Sign Up, Log In and Profile.

Live: https://ramazanutegen.github.io/assignment1web/

Repository: https://github.com/RamazanUtegen/assignment1web

## Final requirements map

| Criterion | Implementation | Evidence / demonstration |
| --- | --- | --- |
| Responsive layout | Bootstrap, Flexbox and Grid; navbar collapses below 1200 px | All nine pages at desktop, tablet and phone widths |
| Hosting | Existing GitHub Pages site and shared main branch | `deployment.json` and asset hash checks |
| Light/dark | Shared CSS variables, toggle, localStorage | Switch theme and navigate from Home to Login and Profile |
| Design/purpose | Consistent Kazakhstan travel guide with original photographs | Six original guide pages plus matching account pages |
| Signup/login/profile | `js/auth.js`; local account collection, salted password verifier, session and profile guard | Register, log in, reload Profile, log out |
| JS form validation | `js/validation.js`; explicit rules and inline errors | Invalid email, weak/mismatched password, short phone and missing fields |
| No HTML validation mechanism | All forms have novalidate; no required/pattern/minlength/maxlength/min/max/type=email | Static check in `scripts/verify-final.py` |
| Search/filter | jQuery destination filters, autocomplete, safe highlights, saved cities | Filter, save and view the same city on Profile |
| Animated UI | Button hover/press, counters, toasts, spinner, carousel | Reduced-motion setting is respected |
| Topic-related API | Open-Meteo current weather and three-day outlook | Loading, success, cache, error and retry states |
| Cohesion | Accounts are travel notebooks, profile links to saved guides and routes | No unrelated dashboards or decorative buttons |
| Presentation | Seven-slide deck plus 4:45 rehearsal script and screenshots | `presentation-script.md`, screenshots and slide backups |
| Organization | Shared CSS, validation/auth/weather modules and repeatable checks | File map in root README |

## Account simulation

Registration stores name, normalized email, phone and a password verifier in `kz-users-v1`. Password verification uses Web Crypto PBKDF2 with a fresh random salt per account. Plaintext passwords are not written to localStorage. Successful login writes `kz-session-v1` and redirects to Profile. The profile displays name, email and phone, plus cities saved on the browser. Logout removes the session; another open profile tab responds to the storage event.

This is a browser-only teaching simulation. LocalStorage can be edited in developer tools, so it is not real server authorisation. Use sample details and sample passwords. Run accounts on the hosted HTTPS site or localhost. File URLs have browser-dependent storage behaviour.

Validation is written in JavaScript, not native constraints. Email is checked for a usable address format; phone accepts 10-15 digits with an optional + and common separators; passwords require 8-64 characters, upper/lowercase letters, a number and a symbol, without spaces. Confirmation must match. Empty and whitespace-only required values are rejected. Enquiries require a 10-2,000 character message. Password rules apply to account forms; enquiries ask for contact details rather than a password. The route planner validates its destination, traveller name and duration in JavaScript.

## Work division and rehearsal

Original source credits establish page ownership: Ramazan - Home and Aktau, Ziyadinkhan - Astana and Our Story, Ruzimuhammad - Almaty and Shymkent. The final account, validation, weather and testing modules are shared project work, available for every member to review. The report distinguishes original contributions from the proposed presentation roles; it does not invent individual authorship for shared additions.

Recommended speaking roles: Ramazan introduces the purpose/design and concludes; Ziyadinkhan demonstrates accounts and validation; Ruzimuhammad demonstrates discovery, routes and weather. Follow the timed script and rehearse with a stopwatch. The final guidelines ask for a finished-product demonstration, not live code editing.

## Submission

Submit all three files together in the Final Exam folder, individually for every team member:

1. `KZTravel_SE2501_FinalProject.zip`
2. `KZTravel_SE2501_Report.pdf`
3. `KZTravel_SE2501_Links.txt`

The supplied guideline contains a conflicting `.docx` example filename, but explicitly requires PDF and lists DOCX among rejected formats. The submitted report therefore uses `.pdf`.

Deadline supplied in the assignment: 18 November 2026 at 23:59. Verify the LMS time display before uploading. The stated cutoff is nine hours later; submit by the actual deadline.

## Verification and backup evidence

`python scripts/verify-final.py` checks page connectivity, resources, fragments, IDs, native-validation prohibition and shared controls. `node scripts/verify-final.cjs` runs account and site journeys in Chromium and Edge at 1440, 1024 and 390 px. `KZ_WEATHER_LIVE=1` adds a real weather check. `KZ_FINAL_EVIDENCE` changes the evidence output folder; `KZ_TRAVEL_BASE_URL` selects localhost or the published site.

The main layout tests use a documented weather fixture; screenshots named `weather-real*` use the real Open-Meteo API. Browser evidence is saved as `browser-verification.json` and `live-browser-verification.json`. `screenshots/` and `presentation-slides/` provide an offline backup for the presentation. Earlier endterm API tests cover timeout, malformed responses, stale requests and storage failure; those modules remain unchanged.

Sources: the two Final Project PDFs supplied by the team, [Open-Meteo documentation](https://open-meteo.com/en/docs), [MDN Web Crypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits), and [MDN Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). Existing Bootstrap, jQuery and font licences remain in their original folders.
