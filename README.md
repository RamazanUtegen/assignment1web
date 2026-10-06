# KZ Travel - Midterm Project

A six-page Kazakhstan tourist guide developed for Assignments 1, 2, and 3 and polished for the midterm. It introduces Aktau, Astana, Almaty, and Shymkent through destination cards, photo galleries, sample routes, and classroom enquiry forms.

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
- `js/forms.js` handles classroom form feedback. Native HTML validation checks required fields and email syntax; JavaScript also rejects whitespace-only names and messages.
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

## Midterm submission

All three members must submit the cleaned project files. Package the six HTML pages, `css`, `images`, `js`, README, and supporting notes into one ZIP. Each member uploads the same ZIP and pastes the live URL in the LMS online text section.

The supplied midterm screenshot gives the deadline as **8 October 2026, 4:00 PM**. It does not explicitly require a new PDF report. Reports were separate requirements of Assignments 1-3.

See [midterm preparation and defence notes](docs/midterm.md) for code examples and practice tasks.
