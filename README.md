# @personal/ui

The shared design system for my personal apps (loadout, gloamlog and whatever comes next): tokens, base styles, components, React pieces and the rules for using them.

- **Rules:** [DESIGN.md](DESIGN.md). Read it before building a screen.
- **See it:** `npm --prefix gallery install && npm --prefix gallery run dev`, then open http://localhost:5180. Use the sidebar to switch theme and app accent.
- **Example page, no install:** open [example/index.html](example/index.html) in a browser. It links the real `css/` files.
- **Use it in an app:** DESIGN.md §1.
- **Make Claude follow it everywhere:** link the skill once:

```bash
ln -s ~/Projects/personal/design-system/skill ~/.claude/skills/personal-ui
```

## What's inside

| Path | What |
|---|---|
| `css/tokens.css` | Every colour, size, space and timing; three themes |
| `css/base.css` | Fonts (DM Mono, Space Mono, OFL), reset, type roles |
| `css/components.css` | Shell, buttons, fields, lists, banners, drawer, dialog, toast |
| `react/index.tsx` | Thin React wrappers over those classes, plus `useTheme` |
| `example/index.html` | A static page showing the kit; double-click to open |
| `gallery/` | A live page showing all of it |
| `skill/` | The Claude skill that points every session at DESIGN.md |
