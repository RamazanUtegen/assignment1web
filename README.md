# KZ Travel - Assignment 1

Team: Ramazan Utegen, Ziyadinkhan, and Ruzimuhammad. Group: SE-2501.

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` from this folder and visit `http://localhost:8000`.

## Page allocation

| Member | Assigned pages |
| --- | --- |
| Ramazan Utegen | `index.html`, `aktau.html` |
| Ziyadinkhan | `astana.html`, `about.html` |
| Ruzimuhammad | `almaty.html`, `shymkent.html` |

All six pages use `css/style.css`. Images are in `images/`. No CSS frameworks or UI libraries are used.

## Understanding your contribution

- `astana.html` uses `header`, `nav`, `main`, `section`, and `footer` to describe the purpose of each part. One `h1` names the page; `h2` and `h3` organize its sections.
- An `ol` gives the Astana itinerary a meaningful sequence. A `ul` groups attractions without implying an order. Tables use header cells to identify their columns.
- `about.html` introduces both team members. `.feature-circle` combines equal width and height with `border-radius: 50%` and `object-fit: cover` to crop the existing landscape into a circle.
- The shared stylesheet demonstrates element (`body`), class (`.about-card`), ID (`#main-header`), and descendant (`.nav-menu a`) selectors.
- Margin creates space outside an element, padding creates space inside it, and border surrounds it. `box-sizing: border-box` includes padding and borders in the declared width.
- Flexbox and grid arrange content; the media query at 700px stacks layouts on smaller screens. `aria-current="page"` marks the current navigation link.
- Each image has alternative text. Inputs have visible labels. Links and controls have keyboard focus styles.

## Form limitation

The two forms are explicitly classroom demos. HTML validates required fields and email format. `js/forms.js` prevents navigation, rejects whitespace-only names/messages, and displays a confirmation using `textContent`. It does not send or store personal data, subscribe users, or book tours.

The brief asks for a functional form. Confirm whether a working client-side demonstration meets the instructor's expectation. Actual delivery still needs a real form endpoint/contact service supplied by the team; GitHub Pages alone does not process form submissions. Include `js/` in the submission ZIP.

## Before submission

1. Confirm member names and page allocations and personalize the team biographies with your own accurate details.
2. Review all four pages on desktop and mobile, including navigation, images, keyboard focus, and form validation.
3. Publish the complete project with GitHub Pages and verify every page and asset at the live URL.
4. Create the PDF report: objective, team/group/roles, steps for each requirement, screenshots of all four pages, live URL, and final reflection.
5. ZIP the HTML files and the `css/`, `images/`, and `js/` folders. Each member submits the ZIP and PDF through LMS before its deadline.
6. Prepare to explain the code: the practice-lesson defense is worth 30 points.

Deployment, a submission ZIP, and the PDF report have not been produced by this implementation.
