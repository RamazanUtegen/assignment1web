# KZ Travel midterm preparation and defence

Group SE-2501. Deadline shown in the supplied LMS screenshot: 8 October 2026, 4:00 PM.

## What each member submits

Upload `KZ-Travel-Midterm.zip` and paste `https://ramazanutegen.github.io/assignment1web/` into the LMS online text section. Every member submits the same complete team project. The screenshot does not explicitly require a new report PDF.

The project is worth 60 points: responsiveness (15), hosting and README (10), design quality (20), and theme cohesion (15). Defence is worth 40 points. Students who cannot explain or modify their code receive zero for defence, according to the screenshot.

## Assignment requirements in the final site

| Requirement | Where to demonstrate it |
| --- | --- |
| Semantic headings, links, lists, images | All six HTML pages |
| Team biographies and circular image | About Us; guide credits on assigned pages |
| Three-column data tables | City tables and Home quick facts |
| Forms with text, email, options, message and submit | Home, Aktau, About Us, Almaty and Shymkent |
| Element, class, ID, descendant CSS selectors | `body`, `.card`, `#main-header`, `.navbar .nav-link.active` in `css/style.css` |
| Bootstrap main layout | `container-fluid > row > aside/main` on all pages |
| Two-column Bootstrap section | `col-12 col-lg-6` sections on all pages |
| Three-column Bootstrap section | `col-12 col-md-6 col-lg-4` attraction cards or `col-sm-6 col-lg-4` gallery/team sections |
| Responsive spacing | `p-3 p-lg-4`, `px-3 px-md-4`, `g-4`, `py-4 py-lg-5` |
| CSS-only three/two/one cards | `.css-tip-grid` on every page, styled in `css/assignment3.css` |
| Mobile/tablet/desktop typography | Media queries at 768px and 992px in `css/assignment3.css` |
| Bootstrap cards | Image, title, description and link button in `.card` / `.card-body` |
| Collapsing navbar and buttons | Shared header; `.navbar-toggler`, `.btn`, `.btn-group` |
| Nine-photo carousel | Home, Aktau, About Us, Almaty and Shymkent |
| Accessible components | Semantic landmarks, skip link, labels, alt text, focus outlines, manual carousels |

## What changed between assignments

Assignment 1 forbade frameworks and introduced custom CSS. Assignment 2 used Flexbox for navigation/cards and CSS Grid for page areas and galleries. Assignment 3 explicitly asks to replace main layouts with Bootstrap. The final pages therefore load Bootstrap, `css/style.css`, and `css/assignment3.css`; they no longer load the historical `css/assignment2.css`.

Bootstrap's standard grid itself uses Flexbox. Our card bodies use `d-flex flex-column`, with `mt-auto` pushing the action to the bottom. The CSS-only exercise uses CSS Grid with media queries. These provide current examples for explaining both Flexbox and Grid without keeping conflicting old page layouts.

## Member walkthroughs

### Ramazan: Home and Aktau

Open `index.html` and `aktau.html`. Explain the sidebar/main Bootstrap columns, the two-column overview, attraction cards and photo grid, and the nine-slide carousel. Show the separate CSS-only travel-tip cards. Explain name/email validation and the confirmation handler using `js/forms.js`.

### Ziyadinkhan: Astana and About Us

Open `astana.html` and `about.html`. Explain Astana's two-column highlights, three-column attraction cards, ordered itinerary and table. On About Us, show the circular image, team cards, nine-photo carousel/gallery, Bootstrap contact form and its labels. Explain why the CSS-only exercise is separate from Bootstrap cards.

### Ruzimuhammad: Almaty and Shymkent

Open `almaty.html` and `shymkent.html`. Explain the two-column region information, Bootstrap attraction cards, separate CSS-only travel tips, nine-image carousel indicators, responsive schedule table and enquiry form. Demonstrate a valid submission and an invalid email.

## Short explanations to practise

- **HTML and CSS:** HTML describes meaning and content; CSS controls presentation. Bootstrap supplies reusable CSS classes and component behaviour.
- **The box model:** content, padding, border and margin. Bootstrap's `p-*` changes inner space, `m-*` changes outer space, and `g-*` changes row gutters.
- **Selectors:** `body` selects an element, `.card` a class, `#main-header` one ID, and `.navbar .nav-link.active` matching descendants.
- **Flexbox and Grid:** Flexbox arranges items along a main axis. Grid controls rows and columns. Bootstrap's grid uses Flexbox; our independent tip section uses CSS Grid.
- **Bootstrap columns:** a row has 12 units. `col-lg-6` takes half at 992px and above; `col-lg-4` takes a third. `col-12` stacks the item at smaller widths.
- **Breakpoints:** the CSS-only exercise has one column by default, two at 768px, and three at 992px. Media queries also change heading sizes.
- **Navbar:** the toggler's `data-bs-target` matches the collapse element's ID. The Bootstrap bundle handles opening and closing it.
- **Carousel:** each indicator names a slide index. Previous/next controls target the carousel ID. Automatic playback is disabled so the reader controls changes. `js/site.js` initializes each carousel so keyboard control works immediately.
- **Forms:** HTML checks required fields and email format. JavaScript prevents navigation, rejects whitespace-only names/messages, and writes feedback with `textContent`. No data leaves the browser.
- **Hosting:** GitHub Pages serves the static files from `main` at the repository root. Relative paths keep images and links working under `/assignment1web/`.

## Live modification practice

Make these changes locally, explain the result, then undo the practice change:

1. Change one heading and a card description on your assigned page.
2. Change the primary button colour variables in `css/style.css`; explain hover and active states.
3. Change `p-3` to `p-4` on one panel and explain the box model.
4. Change one Bootstrap card row from thirds to halves by changing its column classes from `col-lg-4` to `col-lg-6`.
5. Temporarily change the CSS-only desktop rule from three columns to two in `css/assignment3.css`.
6. Add a carousel slide and its matching indicator; explain why indexes and targets must agree.

## Verification

Local Chromium checks passed on all six pages at 320, 390, 768, 1024 and 1440 pixels (30 page/viewport combinations): no page-level overflow, all images decoded, Bootstrap loaded, section anchors existed, and the CSS-only cards showed one/two/three columns correctly. All five carousels passed nine indicator checks and previous/next wraparound. Forms rejected empty fields, invalid emails and whitespace-only names, and displayed confirmation for valid entries. Keyboard checks passed for skip links and carousel arrow keys; desktop card heights matched within their rows.

The submission ZIP passed its archive integrity check; all 48 extracted files matched their source bytes. Twelve additional browser checks (all six extracted pages at 390 and 1440 pixels) passed for Bootstrap loading, images, overflow, initially hidden form feedback, and hidden skip links. Hosted verification is performed after deployment. Earlier Assignment 2 checks apply only to the historical version.
