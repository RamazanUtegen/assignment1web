# KZ Travel improvements

**Goal:** Improve the existing six-page guide's readability, mobile interaction and photo delivery while preserving Assignment 5 requirements.

**Architecture:** Keep the static HTML, shared CSS and vanilla JavaScript. Reuse the existing blue, lime, DM Sans and Barlow design. Original images remain unchanged; responsive WebP derivatives live in `assets/optimized/`.

**Scope:** The user selected comprehensive improvement of the current site. Preserve English content, team credits, all photos, offline operation, forms, galleries, saved places, ratings, themes and the three-step planner. No backend or new website dependencies.

## Tasks

- [x] Improve shared typography, search visibility, touch targets, focus contrast, forms and restrained interaction states in `css/editorial.css`.
- [x] Reproduce mobile menu and filter focus bugs with a regression script, then fix shared handlers in `js/site.js` and `js/experience.js`.
- [x] Generate responsive WebP variants with a reproducible Pillow script; retain fallback `src`, use accurate dimensions and lazy loading, and prioritise hero photos.
- [x] Align homepage section navigation, table descriptions and accessible table regions; refresh changed asset versions.
- [x] Run static preservation checks, derivative integrity checks, focused regressions and the existing Chromium/Firefox scenarios.
- [x] Inspect desktop, tablet and mobile renders, both themes, reduced motion and no-JavaScript content. Review the final diff and record measured results in README.

## Review focus

- Mobile same-page navigation must close the menu and reveal the destination heading.
- Hiding a filtered card or empty-state action must leave keyboard focus on a visible control.
- Responsive photo paths must exist, retain source aspect ratio and load offline.
- Larger text and targets must fit at 320px, 390px, 768px and desktop widths.
- Night mode, reduced motion, storage failure and planner validation must retain existing behaviour.

## Verification

- Static assignment checks: all six pages, original photos, links, IDs and credits pass.
- Responsive integrity: 93 WebP files and 136 image tags pass.
- Focused interaction regression: 12 HTTP scenarios pass.
- Full browser suite: Chromium and Firefox at 1440 × 1000 and 390 × 844 pass, including Web Audio, disabled storage and reduced motion. Evidence is in `output/improvements-verification/`.
- Independent review: all six pages at 320, 390, 768, 991, 1024 and 1440px have no horizontal overflow, oversized image layout or JavaScript page errors.
- Visual review covers desktop/mobile imagery, discovery and both themes. The About photo maintains its 4:3 crop. Homepage content also loads without JavaScript.
- Existing editorial hero line breaks, kickers, rules and symbol controls are retained intentionally; design scanners flag these conventions, so their style score is not a completion gate.
- Publication, report and ZIP were not updated. Physical devices, Safari and a screen reader were not tested.
