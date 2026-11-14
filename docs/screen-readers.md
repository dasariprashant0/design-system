# Screen readers and Monoline

**Short version: Monoline has an automated accessibility-tree check, and no screen reader testing at all.** Nobody has tried these components with NVDA, JAWS, VoiceOver or TalkBack yet. The claim "WCAG 2.2 AA" is a goal for the components, backed by axe, keyboard tests and the check described here. It is not a conformance statement and not a substitute for listening to the components.

## What is checked

`npm run ax` opens the built docs site in real Chrome and, for about forty components, does what a keyboard user does: it opens the dialog, the menu and the popover, presses Tab and the arrow keys, and then reads the accessibility tree Chrome builds from the page. That tree is what screen readers on Windows, macOS and Android consume, so it is the best automated stand-in for them. For each component it asserts:

- every control has a role and a non-empty accessible name;
- the states a user should hear are present: expanded, checked, selected, pressed, invalid, required, disabled, busy, current, sort order;
- relationships resolve to text: `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-activedescendant`;
- the node that has focus after real key presses is the one the pattern promises;
- dialogs have a name and a description, report that they are modal, and nothing behind them stays in the tree;
- toasts, alerts and status messages sit in live regions with the right politeness;
- nothing focusable is left with no role (a "generic" element a screen reader cannot announce), and each docs page has one main landmark and no skipped heading levels.

The expectations are plain data in `scripts/ax/expectations.mjs`: to cover another component, add one entry. The run writes `docs/a11y-report.md`, which lists for each component the role, name, states, the announcement the tree implies ("Save, button, collapsed") and any finding. CI runs it on every pull request (`.github/workflows/ax.yml`) and fails when the report would change.

## What is not checked

- **How a screen reader words it.** NVDA, JAWS, VoiceOver and TalkBack each build their own sentence from the tree, in their own order, with their own verbosity settings. The "expected announcement" in the report is a template, not a recording.
- **Whether it is a good experience.** Order, amount of speech, focus and browse mode switching, rotor and element lists, touch gestures, braille output.
- **Other browsers.** Only Chrome's tree is read. Firefox and Safari build theirs differently.
- **Anything that needs a person:** whether labels make sense, whether instructions are clear, whether a flow can be finished without sight.
- **Target size, zoom, text spacing and forced colours.** Not part of this check.

## What was already found and fixed

Reading the tree found real problems that axe had passed: decorative glyphs ("+", "−", "↓", "✓") that were read as part of names and values, dialogs that did not say they were modal, a focusable carousel track with no role, an unnamed suggestion list. They are listed, with the fixes, at the top of `docs/a11y-report.md`.

## Manual testing still to do

`docs/a11y-report.md` has a checklist with the fifteen most important flows and a short setup per technology: NVDA, JAWS, VoiceOver on macOS and iOS, and TalkBack. Until someone runs it, treat the accessibility notes on every component page as intent. If you find a barrier, an issue that names the component, the screen reader and version, the browser and the steps is the most useful thing you can send.

## Using the components well

The components give you names, roles and states. You still supply the words: every icon-only button needs an `aria-label`, every form control needs a label (use `Field`), every menu opened from a context needs a name (`aria-label`), and headings and landmarks depend on where you place things. No component can fix a missing label for you.
