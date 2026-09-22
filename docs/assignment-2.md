# Assignment 2 - Ziyadinkhan's contribution

Team: KZ Travel. Group: SE-2501.

| Member | Assigned pages |
| --- | --- |
| Ramazan Utegen | Home and Aktau |
| Ziyadinkhan | Astana and About Us |
| Rizamukahmanjan | Almaty and Shymkent |

## Scope and implementation

This update implements Assignment 2 on **Astana and About Us only**. Other members remain responsible for updating and documenting their pages. The shared Assignment 1 stylesheet is preserved; only these two pages load `css/assignment2.css`.

1. Navigation: `.nav-menu` and its list use Flexbox, with `space-between`, `align-items: center`, `gap`, and wrapping on narrow screens.
2. Cards: three image/title/text/link-button cards on each assigned page. `.feature-cards` stretches the cards to equal row heights. Cards and their content use column Flexbox; `margin-top: auto` aligns buttons. Cards lift on hover or keyboard focus. On small screens they stack naturally.
3. Page layout: the body defines `header`, `sidebar`, `main`, and `footer` Grid areas. Header/footer span both columns. Sidebars contain working section links. At 850px and below, sections stack in one column.
4. Gallery: About Us contains nine distinct existing project images with three equal Grid columns, equal-height rows, gaps, and caption overlays. Captions expand on hover and keyboard focus and stay visible on touch devices. Each image links to its city guide. The gallery changes to two columns at 620px and one at 380px.
5. Consistency: original palette and navigation retained. Three team profiles show destination photographs, not invented portraits. Skip links, image descriptions, focus outlines, and reduced-motion handling support accessibility.

## Verification

Chromium checks at 1440, 1024, 768, 390, and 320 pixels: no horizontal overflow; all images decode; all section targets exist; desktop cards have equal heights; mobile cards remain visible; gallery contains nine images; hover/focus captions work; skip links focus main content. Other members' pages do not load the new stylesheet.

Screenshots and a PDF report for this contribution are provided in the local `output` directory. The submission ZIP includes the full website so navigation to teammates' pages works.

## Deployment and submission

Existing website: https://ramazanutegen.github.io/assignment1web/

- Astana: https://ramazanutegen.github.io/assignment1web/astana.html
- About Us: https://ramazanutegen.github.io/assignment1web/about.html

Before team submission, combine this report with the other two members' Assignment 2 work and screenshots if a complete team report is required. All three members must submit a PDF report, project ZIP, and live URL before the LMS deadline, then defend the work at the practice lesson. The deadline is not specified in the assignment PDF.

## Defense notes

- Flexbox arranges items primarily along one axis; Grid arranges rows and columns together.
- `justify-content` distributes items on the main axis; `align-items` controls the cross axis.
- `gap` adds consistent space between children without outer margins.
- `minmax(0, 1fr)` allows the main content column to shrink without forcing horizontal overflow.
- Named Grid areas connect the layout template to semantic HTML elements.
- `margin-top: auto` uses spare vertical space to push card links to the bottom.
- Breakpoints change the layout when the available width becomes too narrow.
- Hover alone is insufficient on touch screens; focus and hover-none styles expose captions to more users.

## Image credits

Existing project images are reused. Two new images are stored locally:

- `images/assignment2/baiterek-night.jpg`: Dauren Nabijan, [Baiterek monument at night](https://commons.wikimedia.org/wiki/File:Baiterek_monument_at_night.jpg), [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
- `images/assignment2/khan-shatyr.jpg`: Quarot, [Khan Shatyr](https://commons.wikimedia.org/wiki/File:Khan_Shatyr.jpg), [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Wikimedia's 960px thumbnail is used.

Images are cropped for display with CSS `object-fit: cover`.
