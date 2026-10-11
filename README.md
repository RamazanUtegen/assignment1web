# KZ Travel - Assignment 4

A six-page Kazakhstan tourist guide developed for Assignments 1-3 and the midterm, now extended with Assignment 4 JavaScript features. It introduces Aktau, Astana, Almaty, and Shymkent through destination cards, photo galleries, sample routes, and classroom enquiry forms.

**Group:** SE-2501

## Team and pages

| Team member | Pages |
| --- | --- |
| Ramazan Utegen | Home (`index.html`) and Aktau |
| Ziyadinkhan Kudaibergenuly | Astana and About Us |
| Ruzimuhammad | Almaty and Shymkent |

## Live website

[Open KZ Travel](https://ramazanutegen.github.io/assignment1web/)

## Implementation

- Semantic HTML includes headings, lists, tables, images with descriptions, forms, and team credits in every footer.
- Bootstrap 5.3.8 provides the main page layouts: containers, rows, responsive columns, spacing utilities, navigation, cards, buttons, button groups, tables, and forms.
- Each page includes two-column (`col-lg-6`) and three-column (`col-lg-4`) sections. The sidebar and main content also use Bootstrap columns.
- `css/style.css` contains shared branding, component appearance, focus styles, and image treatment. It is loaded after Bootstrap.
- `css/assignment3.css` contains responsive typography and the Assignment 3 Task 2 exception: an independent CSS-only card exercise that changes from one column on mobile to two at 768px and three at 992px.
- Five nine-image Bootstrap carousels have indicators, previous/next controls, and keyboard support. Slides change manually rather than automatically.
- `js/site.js` initializes manual Bootstrap carousels so keyboard navigation works before the first click.
- `js/forms.js` validates required fields, email format, a minimum eight-character signup password, and password confirmation. Errors appear beside fields and the first invalid field receives focus. All existing enquiry forms use the same validation.
- `js/accordion.js` opens and closes the four homepage FAQ answers with an animated transition and accessible expanded states.
- `js/popup.js` opens the About Us contact form in a modal dialog. Close it with its close button, an outside click, or Escape. Keyboard focus stays inside while open and returns to Contact Us after closing.
- `js/preferences.js` cycles the page background through Sand, Sky, and Steppe from a control on every page.
- `js/clock.js` displays the date and time in `Asia/Almaty` (UTC+5), updating every second on all six pages.
- `css/assignment4.css` styles these additions using the existing site theme and respects reduced-motion settings.
- Bootstrap CSS and JavaScript load from jsDelivr and require an internet connection. Destination images are stored locally.

Assignment 1 introduced custom HTML/CSS. Assignment 2 added Flexbox and named CSS Grid layouts. Assignment 3 replaces those main layouts with Bootstrap, while retaining the required CSS-only media-query exercise. `css/assignment2.css` and [Assignment 2 notes](docs/assignment-2.md) are historical references, not styles loaded by the final pages.

## Run locally

From this folder:

```bash
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000/). No build step or backend is needed.

## Forms

Forms are demonstrations. They display a confirmation in the browser and do not send or save entries, make bookings, or create subscriptions. Submission buttons remain disabled if the JavaScript handler cannot load.

## Assignment 4 responsibilities

| Team member | JavaScript responsibility |
| --- | --- |
| Ramazan Utegen | Task 1: form validation, including signup passwords |
| Ziyadinkhan Kudaibergenuly | Task 2: FAQ accordion |
| Ruzimuhammad | Tasks 3-5: contact popup, background colours, and live clock |

These are the team's responsibility and study assignments. Each member must review, practise, and understand their component and their teammates' work before defending it.

## Assignment 4 submission

All three members submit the same report and project ZIP individually in the LMS. The report contains the team/group details, objective, steps for every task, screenshots, live website URL, verification, and reflection. All six footers name all three members.

- Report: `output/pdf/KZ-Travel-Assignment-4-Report.pdf`
- ZIP: `output/KZ-Travel-Assignment-4.zip`
- [Task walkthrough and defence notes](docs/assignment-4.md)

Check the Assignment 4 deadline in the LMS; the assignment PDF supplies no exact date. Each member must attend the practice-lesson defence (40% of the grade).

The integration check in `scripts/verify-assignment4.cjs` requires Playwright with Chromium and Firefox installed and a local server on port 8000. It exercises every page at 1440px and 390px widths. Playwright is only used for verification; the website needs no build tools or backend.

The [midterm notes](docs/midterm.md) and [Assignment 2 notes](docs/assignment-2.md) remain available as historical study material.
