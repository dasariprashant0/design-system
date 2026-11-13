# End-to-end findings

Found by `npm run e2e` (scripts/e2e, real Chrome, built docs site). 114 tests. Fixed ones have a regression test in the e2e suite; the date-picker focus fix also has a unit test.

## Fixed

| # | Bug | Where | Fix | Regression test |
|---|---|---|---|---|
| 1 | The docs Direction (RTL) preference flipped the CSS but not Radix keyboard behaviour: tabs, slider, toggle-group, menubar, calendar-adjacent widgets ignored RTL because nothing mounted a `DirectionProvider`. | apps/docs/src/shell/App.tsx | Wrap the docs frame in `DirectionProvider dir={prefs.dir}` | `rtl:` tests |
| 2 | Date picker: opening it put focus on the "Previous month" arrow, not on a day. | date-picker.tsx | `onOpenAutoFocus` focuses the tabbable day | `date-picker: Enter opens...`, unit test in date-picker.test.tsx |
| 3 | Date picker popover ran 26px off the bottom of a 375x667 viewport. | date-picker.tsx | `collisionPadding`, `max-height: var(--radix-popover-content-available-height)`, scroll inside | `layout: date-picker stays inside a 375x667 viewport` |
| 4 | The Command demo bound Ctrl/Cmd+K, the same key as the docs search. Both palettes opened; Escape closed only the top one and left focus on `body`. | command.demo.tsx | Demo uses Ctrl/Cmd+J | `command: its own shortcut...` (asserts exactly one dialog) |
| 5 | Tap targets under 24x24 (WCAG 2.5.8, our own bar): checkbox, switch and radio rows were 21px tall; the remove button in Tag and TagsInput was 18x20. | 10-choices.css, 19-avatar.css | `min-block-size: 24px` on `.choice`; 24px minimum on `.tag button` | `tap targets:` tests |

Fix 5 changes pixels (rows 3px taller, tags up to 4px taller): expect the visual audit baseline to move. Fix 4 changes a demo description, so `registry/`, `llms.txt` and `llms-full.txt` need the maintainer's regenerate.

## Not fixed (report only)

- **Context menu has no keyboard path in the demo.** meta.json promises Shift+F10, but the trigger is a plain `div`: it cannot take focus, so there is nothing for the key to act on. Works only when the trigger wraps a focusable element. Needs a demo with a focusable trigger and a sentence in the docs. Owner: overlays.
- **Drawer demo has no close button.** Escape and a click outside work, but touch users on a phone have no visible control. Add a `DrawerClose` button to the demo or to `DrawerContent`.
- **Tooltip closes when keyboard focus scrolls its trigger into view.** Radix closes tooltips on any scroll. With a trigger below the fold, Tab scrolls it in and the tooltip disappears at once. Seen with scripted focus; not checked with real Tab in a long page.
- **Combobox opens on focus** (`aria-expanded` is true as soon as the input is focused). Acceptable, but differs from the select and from the APG default of opening on typing or Down.
- Radix menus do not loop (ArrowUp on the first item stays put) and Tab does not close a dropdown menu. Both are Radix defaults; tests assert them so a change is noticed.

## Harness notes (things that made tests flaky until fixed)

- Radix reads "arrow key is down" in a timeout after keydown; an instant keyup breaks radio-group arrow selection. The harness holds each key 40ms.
- Chrome headless needs `--disable-renderer-backgrounding` and friends, otherwise `Input.dispatchKeyEvent` sometimes never returns. Also added to the shared launcher.
- Chrome writes `DevToolsActivePort` in two steps; the launcher now waits for both lines (the old audit sometimes died with `Invalid URL`).
- Programmatic `focus()` scrolls and closes Radix tooltips; the harness scrolls first, then focuses with `preventScroll`.
- On a loaded machine pages took up to 10s to render; the wait is 20s. CI uses `--retries 1` and a retry that passes is printed as FLAKY.
