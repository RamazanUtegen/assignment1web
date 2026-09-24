# Assignment 2 - Complete team website

Team: KZ Travel. Group: SE-2501.

| Member | Assigned pages |
| --- | --- |
| Ramazan Utegen | Home and Aktau |
| Ziyadinkhan | Astana and About Us |
| Ruzimuhammad | Almaty and Shymkent |

## Scope and implementation

Assignment 2 is implemented on all six pages: Home and Aktau by Ramazan Utegen, Astana and About Us by Ziyadinkhan, and Almaty and Shymkent by Ruzimuhammad. Home, Aktau, Astana, and About Us load `css/assignment2.css` on top of `css/style.css`; Almaty and Shymkent use Assignment 2 rules in `css/style.css`.

### Ramazan Utegen's Implementation (Home and Aktau)
1. **Task 1 (Navigation Bar via Flexbox)**: `.nav-menu` uses Flexbox with `justify-content: space-between` and `align-items: center` to keep the brand logo on the left and navigation links on the right. Links are neatly spaced using `gap`, vertically centered, and wrap cleanly on narrow viewports.
2. **Task 2 (Card Row via Flexbox)**: Both pages feature Flexbox card containers (`.feature-cards`) with `display: flex`, `flex-wrap: wrap`, and `align-items: stretch` ensuring all cards stretch to equal height in each row. Each card uses a column flex direction with `margin-top: auto` on buttons for baseline alignment, plus smooth hover lift (`translateY(-5px)`) and depth shadow transitions.
3. **Task 3 (Page Layout with Grid Areas)**: Structured with CSS Grid areas (`"header header"`, `"sidebar main"`, `"footer footer"`). Dedicated sidebars (`.page-sidebar`) provide in-page anchor navigation to all key sections, collapsing to a single-column layout on viewports 850px and below.
4. **Task 4 (Image Gallery via Grid)**: Implemented CSS Grid photo galleries (`.photo-gallery`) with equal-width columns (`repeat(3, minmax(0, 1fr))`), uniform row heights, consistent gaps, image zoom on hover, and smooth expanding caption overlays with full touch/accessibility support.
5. **Consistency & Accessibility**: Consistent typography, warm color palette, skip links (`.skip-link`), descriptive alt texts, and responsive breakpoints at 1100px, 850px, 620px, and 380px.

### Ziyadinkhan's Implementation (Astana and About Us)
1. Navigation: `.nav-menu` and its list use Flexbox, with `space-between`, `align-items: center`, `gap`, and wrapping on narrow screens.
2. Cards: three image/title/text/link-button cards on each assigned page. `.feature-cards` stretches the cards to equal row heights. Cards and their content use column Flexbox; `margin-top: auto` aligns buttons. Cards lift on hover or keyboard focus. On small screens they stack naturally.
3. Page layout: the body defines `header`, `sidebar`, `main`, and `footer` Grid areas. Header/footer span both columns. Sidebars contain working section links. At 850px and below, sections stack in one column.
4. Gallery: About Us contains nine distinct existing project images with three equal Grid columns, equal-height rows, gaps, and caption overlays. Captions expand on hover and keyboard focus and stay visible on touch devices. Each image links to its city guide. The gallery changes to two columns at 620px and one at 380px.
5. Consistency: original palette and navigation retained. Three team profiles show destination photographs, not invented portraits. Skip links, image descriptions, focus outlines, and reduced-motion handling support accessibility.

### Ruzimuhammad's Implementation (Almaty and Shymkent)
1. Navigation: the logo and links use Flexbox with spacing and alignment.
2. Cards: each page has three equal-height Flexbox cards with images, titles, descriptions, working links to its enquiry form, and hover effects.
3. Page layout: named Grid areas place the header, sidebar, main content, and footer. At 850px and below, the sidebar and main content stack to prevent horizontal overflow.
4. Gallery: each page has a nine-image Grid with equal-width columns, consistent gaps, and caption overlays. The galleries change to two columns and then one on narrow screens.

## Verification

Chromium checks at 1440, 1024, 768, 390, and 320 pixels on all six pages: no horizontal overflow; all images decode; all section targets exist; desktop cards have equal heights; mobile cards remain visible; galleries use CSS Grid. The nine-image About Us gallery has working hover and focus captions. The missing Almaty gallery image path and mobile overflow on Almaty and Shymkent were corrected.

## Deployment and submission

Existing website: https://ramazanutegen.github.io/assignment1web/

- Home: https://ramazanutegen.github.io/assignment1web/index.html
- Aktau: https://ramazanutegen.github.io/assignment1web/aktau.html
- Astana: https://ramazanutegen.github.io/assignment1web/astana.html
- About Us: https://ramazanutegen.github.io/assignment1web/about.html
- Almaty: https://ramazanutegen.github.io/assignment1web/almaty.html
- Shymkent: https://ramazanutegen.github.io/assignment1web/shymkent.html

All three members must submit the PDF report, project ZIP, and live URL before the LMS deadline, then defend the work at the practice lesson. The deadline is not specified in the assignment PDF.

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
