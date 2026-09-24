# KZ Travel - Assignment 1

KZ Travel is a simple guide to four cities in Kazakhstan. This project was made for the first HTML and CSS assignment.

Group: SE-2501

## Team and pages

| Team member | Pages |
| --- | --- |
| Ramazan Utegen | Home and Aktau |
| Ziyadinkhan | Astana and About Us |
| Ruzimuhammad | Almaty and Shymkent |

## Live website

https://ramazanutegen.github.io/assignment1web/

## Project files

- Six HTML pages are in the main folder.
- Shared styles are in `css/style.css`.
- Images are in the `images` folder.
- Form behaviour is in `js/forms.js`.
- No CSS framework or external UI library is used.

## Main features

- Navigation links connect all six pages.
- Every page has headings, text, images, and a footer with all team members.
- The site includes ordered and unordered lists.
- Tables use three columns or more.
- Forms include name, email, options, a message area, and a button.
- The same CSS file controls the colours, spacing, cards, tables, forms, and mobile layout.
- The About Us page contains information about all three team members.

## Run locally

Open `index.html` in a browser. You can also run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Form note

The forms are classroom demonstrations. They check the entered information and show a confirmation message. They do not send or save personal data.

## Submission

Each team member should submit:

1. A ZIP file with the HTML files and the `css`, `images`, and `js` folders.
2. The project report PDF with all six page screenshots and the live website link.

The team should also be ready to explain the HTML structure, CSS selectors, box model, navigation, tables, forms, and responsive layout during the lesson.

## Assignment 2: Advanced CSS (Flexbox & Grid)
 
Assignment 2 is fully implemented across:
- **Home and Aktau** by Ramazan Utegen
- **Astana and About Us** by Ziyadinkhan
- **Almaty and Shymkent** by Ruzimuhammad

Features implemented across these pages:
- **Task 1 (Navigation Bar via Flexbox)**: Centered items, logo on left, nav group on right, neat `gap` spacing, and mobile wrapping.
- **Task 2 (Card Row via Flexbox)**: Equal-height cards using `display: flex`, `flex-wrap: wrap`, column card flow, bottom-aligned buttons with `margin-top: auto`, and hover lift / shadow animations.
- **Task 3 (Page Layout with Grid Areas)**: Named CSS Grid areas (`header`, `sidebar`, `main`, `footer`) with functional sidebar section links and responsive mobile stacking at 850px.
- **Task 4 (Image Gallery via Grid)**: CSS Grid galleries with equal-width columns (`repeat(3, minmax(0, 1fr))`), uniform row heights, consistent gaps, image zoom on hover, and smooth caption overlays.
- **Stylesheets**: Home, Aktau, Astana, and About Us use `css/assignment2.css` on top of `css/style.css`; Almaty and Shymkent use the Assignment 2 rules in `css/style.css`.

See [the implementation and defense notes](docs/assignment-2.md) for full details, task checklists, and image credits.
