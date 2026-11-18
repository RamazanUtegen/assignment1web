# KZ Travel interface review

## Scope and coverage

The review followed the English-language trip-planning journey through Home, Sign Up, Log In and Profile, including city search, saved places, route copying and the forecast. It also checked the shared navigation, galleries, clocks and weather panels on their respective pages. The layout scan covered all nine pages. The detailed content review covered the trip-planning controls and states.

The project uses static HTML, Bootstrap 5.3.8, jQuery, vanilla JavaScript and shared CSS. Locally hosted DM Sans and the palette in `css/editorial.css` define the visual system. The repository describes its conventions in the [project README](../../README.md) and [team review guide](README.md).

| Domain | Evidence inspected | Findings addressed |
| --- | --- | ---: |
| Accessibility | Keyboard navigation, accessibility snapshots, gallery targets, login and refresh focus, the saved filter, modal focus, and the live clock | 4 |
| Layout | All nine pages at 320 px, real browser zoom at 200%, cold forecast values, and autocomplete ordering | 3 |
| Writing | Search and Saved empty states, failed storage writes, account errors, the forecast, and clipboard feedback | 3 |
| Typography | Computed mobile field sizes, forecast numbers and measured wrapping | 1 |
| Colors | Both themes and the rendered forecast text and background during refresh | 1 |
| UI polish | Touch Save and remove states, keyboard focus, and normal and reduced-motion feedback | 1 |

## Findings

The Before column describes the interface in review commit `3405ccb`. The After column records the fix.

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| HIGH | Layout | [css/editorial.css:1557](../../css/editorial.css#L1557), [js/site.js:37](../../js/site.js#L37) | The expanded navigation grew with all its links. At 200% browser zoom, four of ten tab stops fell below the viewport. | The menu scrolls within the viewport and closes when focus moves outside it. | Focused actions need to stay visible. [WCAG 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) |
| HIGH | Layout | [css/endterm.css:36](../../css/endterm.css#L36), [index.html:495](../../index.html#L495) | Each high and low temperature stayed in one flex row. At 320 px, the cold values extended 10–15 px past their card edges. | Pairs wrap within their cards and have visible High and Low labels. Forecast digits use tabular spacing. | Travellers should be able to tell which temperatures belong to each day at narrow widths. [WCAG reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) |
| HIGH | Writing | [js/experience.js:170](../../js/experience.js#L170) | A storage exception left the button in its Saved state and announced “Saved Almaty.” Reloading lost the city. | Save and remove update the interface after storage succeeds. A failed write leaves the state intact and shows how to retry next to the button. | The confirmation now reflects whether the city will appear on Profile. |
| HIGH | Accessibility | [index.html:896](../../index.html#L896), [css/editorial.css:1039](../../css/editorial.css#L1039) | Five galleries offered a second slide selector above their thumbnail row. Axe flagged the nine small indicators on each page at 320 px in both themes. | The gallery uses the existing labelled thumbnails and previous and next controls. All nine thumbnails are at least 44 px in each dimension and remain keyboard reachable. | One set of direct selectors meets target-size requirements and removes repeated tab stops. |
| HIGH | Accessibility | [js/clock.js:22](../../js/clock.js#L22) | The live clock updated every second on six pages. The interface offered no pause. | A clock button pauses updates and resumes with the current time. | Visitors can stop nonessential automatic updates. [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) |
| HIGH | Accessibility | [script.js:157](../../script.js#L157) | Removing the focused city from the Saved filter hid the focused button. | Focus moves to the next available Save button, the preceding one, or the Saved filter when the list is empty. | Keyboard users keep a visible place in the results. |
| HIGH | Colors | [css/endterm.css:19](../../css/endterm.css#L19) | A refresh set the previous forecast panel’s opacity to `0.65`. Precipitation text measured 3.00:1 in light mode and 4.14:1 in dark mode. | The panel stays opaque during refresh. The same text now measures 6.68:1 and 7.47:1. The loading message and button label communicate progress. | Normal text needs at least 4.5:1 contrast. |
| HIGH | UI polish | [css/editorial.css:688](../../css/editorial.css#L688) | After a touch tap removed a city, the button kept its hovered fill even though `aria-pressed` was false. | Pointer hover styling runs on hover-capable devices. A removed city returns to its unfilled Save treatment on touch. | The appearance reflects the saving state after the gesture ends. |
| MEDIUM | Accessibility | [js/auth.js:138](../../js/auth.js#L138), [js/weather.js:158](../../js/weather.js#L158) | Native disabling during submission and refresh displaced keyboard focus. A wrong-password response and a failed forecast both left focus away from the recovery control. | Login focuses its error message when submission displaced focus. Refresh stays focusable during a request and guards against a repeat activation. | Each flow leaves the user in a useful place to read the error and continue. |
| MEDIUM | Writing | [script.js:265](../../script.js#L265) | A denied clipboard request showed manual-copy instructions for 2.2 seconds. | The inline instructions remain until the traveller retries or resets the route. | The fallback remains available while the traveller selects the route text. |
| MEDIUM | Layout | [script.js:165](../../script.js#L165) | Typing `al` and accepting the first autocomplete suggestion chose Astana through the keyword “capital.” | City-name prefixes appear before keywords. The first suggestion for `al` is Almaty. | The keyboard default follows the entered city name. |
| MEDIUM | Writing | [script.js:145](../../script.js#L145), [index.html:259](../../index.html#L259) | A single empty state referred to a heart icon and gave the same message for missing matches and an empty list. | The empty Saved list describes how to save a city. A no-match search shows the search term and offers **Show all cities**. | The message matches the visible controls and tells travellers how to recover. |
| MEDIUM | Typography | [css/editorial.css:1589](../../css/editorial.css#L1589), [css/assignment6.css:31](../../css/assignment6.css#L31), [css/endterm.css:58](../../css/endterm.css#L58) | Search, account fields and the forecast city field computed to 13–14 px on phones. | Mobile entry fields and selects use `1rem`, measured at 16 px with the default browser text size. | The larger editing text removes the small-field trigger for input zoom on iOS. |

## Verification

- `python3 scripts/verify-final.py` passed the link, asset, validation and page checks.
- `KZ_FINAL_CHANNEL=chromium KZ_WEATHER_LIVE=1 node scripts/verify-final.cjs` and `KZ_FINAL_CHANNEL=msedge node scripts/verify-final.cjs` passed at 390, 768, 1024 and 1440 px. The journeys cover both themes, registration, wrong credentials, Almaty persistence, the two-day route and the live API. Forecast recovery checks cover errors, retry and dated cache. [Browser results](browser-verification.json)
- At 320 px, all nine pages fit the viewport and the 18 axe scans across both themes reported zero violations. A cold fixture verified that the high and low values stay within their cards. Keyboard selection reached the ninth thumbnail on each carousel page.
- At 200% native Chromium browser zoom, keyboard focus reached all ten navigation actions while they were visible, then moved to the visible email field after the menu closed.
- With storage writes blocked, Save stayed unpressed and the inline recovery message appeared. With clipboard access denied, the instructions remained past the previous dismissal time. During a delayed forecast failure, focus stayed on Refresh and a second Enter did not start another request.
- Chromium replayed the 180 ms planner transition at 10% speed. With reduced motion, the step remained available without movement.
- Screen-reader playback and native iOS Safari focus zoom are **not verified**. Accessibility trees, computed field sizes and automated browser scans were verified.

## Verdict

**Approve** for the reviewed journey and shared controls.
