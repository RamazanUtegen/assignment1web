---
name: KZ Travel
description: Calm, modern and light travel discovery.
colors:
  primary: "#0d7667"
  primary-hover: "#095b50"
  paper: "#ffffff"
  ink: "#173d36"
  muted: "#596e67"
  wash: "#f3f7f5"
  line: "#dce7e1"
  control-border: "#73887d"
  night-control-border: "#7b9d8c"
  soft-accent: "#e7f1eb"
  night-paper: "#112722"
  night-panel: "#19362e"
  night-ink: "#edf5ef"
  night-muted: "#b0c5ba"
  night-primary: "#9bdac5"
typography:
  display:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "clamp(44px, 5.7vw, 80px)"
    fontWeight: 650
    lineHeight: 1.07
    letterSpacing: "-0.04em"
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
rounded:
  control: "12px"
  card: "18px"
  hero: "28px"
spacing:
  mobile-gutter: "24px"
  desktop-gutter: "48px"
  mobile-section: "56px"
  desktop-section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
---

# Design System: KZ Travel

## Overview

The user selected a calm, modern and light direction for a complete redesign. Real Caspian, steppe and Tian Shan photographs lead; clear sentence-case typography and generous spacing keep the guide inviting. The previous condensed blue/lime editorial treatment has been replaced across all six pages.

## Colors

Caspian teal identifies actions on cool white and pale green surfaces. Night mode uses deep green grounds, light text and mint actions. Error text is dark red by day and light coral by night. Use the stylesheet's semantic variables so selected, focus and validation states remain legible in both themes.

## Typography

Use the locally hosted DM Sans throughout. Headings are weight 650 with modest negative tracking; body text is 16px with line-height 1.7. Home and city headlines use two short lines. The condensed Barlow face remains in the historical assets but is not loaded by the current design.

## Layout

The homepage and city openings use a 43/57 copy/photo grid, capped at 1280px with 48px outer gutters. Tablet uses 46/54 and 30px gutters. Below 768px, copy precedes the photo with 24px gutters. Hero photo heights are 570px on Home and 520px on city pages, reducing to 500px, 460px, 310px and 280px at the stylesheet's narrower breakpoints. Section spacing is generally 80px desktop and 56px mobile; the planner uses 88px desktop.

The visitor chooses a destination, builds an inspiration route or reads a city guide. Keep the original Bootstrap column exercises, forms, IDs, data hooks, photos and team credits intact. Search and categories form one discovery toolbar. Reading paragraphs use a comfortable measure.

## Elevation & Depth

Use tonal surfaces rather than permanent card shadows. A temporary toast may cast a soft offset shadow. Direct interaction can move a destination card slightly on a fine pointer; reduced motion disables movement. Search results update immediately without entry motion while typing or filtering from the keyboard. Keep planner steps immediate; decorative entry feedback is reserved for direct pointer actions.

## Shapes

Hero photos use 28px corners on desktop and 20px on mobile. Destination cards use 18px corners; buttons use 12px; inputs and navigation states use 10px. Save controls remain circular and at least 44px square.

## Components

- Primary actions use teal fill and white text, reversing to mint with dark text at night. Buttons are at least 48px high.
- Cards combine a real destination photograph, location descriptor, clear title, description and guide link. Saved hearts retain visible state and accessible names.
- Inputs use a distinct control-border token, 16px text and a visible focus outline. Borders retain at least 3:1 contrast on the Sand, Sky and Steppe surfaces in both themes. Validation states retain inline messages and focus handling; checkbox errors sit below the complete checkbox/label row.
- Navigation uses sentence case and a quiet selected surface. Mobile menus retain Bootstrap collapse, Escape and same-page focus behavior.
- The three-step planner retains required-field validation, Back/reset, review and route output. Progress and labels express the current step.
- Inline authored SVGs provide consistent theme, sound, heart, search, arrow and rating controls without external icon requests.

## Do's and Don'ts

- Do keep the user's selected light, calm direction coherent across every page and both themes.
- Do use original photographs and responsive derivatives, preserving local/offline operation.
- Do preserve keyboard focus, touch targets, reduced motion and all educational demonstrations.
- Do not invent reviews, statistics, booking inventory or commercial functionality.
- Do not reintroduce condensed all-caps hero typography or decorative section numbering.
