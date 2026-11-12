# Right-to-left (RTL)

Monoline works with `dir="rtl"` (Arabic, Hebrew, Persian, Urdu).

## Turn it on

1. Put `dir` on `<html>` (or any wrapper). The stylesheet reads it, so layout, borders, slides and glyphs flip.
2. Wrap the app once in `DirectionProvider` with the same value. Radix does not detect direction from the DOM, so tabs, slider, menus, select, toggle group, accordion and navigation menu need it for their arrow keys and popper placement.

```tsx
import {DirectionProvider} from '@monoline/react';

<html lang="ar" dir="rtl">
  <DirectionProvider dir="rtl"><App /></DirectionProvider>
</html>
```

CSS only: set `dir="rtl"` on `<html>`. Nothing else is needed.

## What flips

- Every margin, padding, border, inset and `text-align` is logical (`-inline-start`, `-inline-end`, `start`, `end`).
- `--dir` is `1` in LTR and `-1` in RTL (set in `base.css`). Horizontal slides, switch thumbs, accent bars (`inset` box-shadows), the marquee and shimmer multiply by it. Use it in your own CSS: `translateX(calc(8px * var(--dir, 1)))`.
- Breadcrumb `/`, calendar previous/next glyphs and the scroll-progress bar mirror.
- `Drawer` `side` and `Box` `border` accept `start` and `end` (follow the direction). `left` and `right` stay fixed. New utilities: `.text-start`, `.text-end`.
- Arrow keys follow reading direction in Calendar, OtpInput, Tree and Carousel (Next scrolls toward negative `scrollLeft`), and, through `DirectionProvider`, in every Radix widget.
- Custom widgets read the nearest `dir` attribute, then `DirectionProvider`, then the computed CSS direction.

## Long strings

Titles, descriptions, tags, hints, menu items and tab labels use `overflow-wrap: anywhere`, and grid or flex text parents have `min-width: 0`, so a long unbroken word wraps instead of overflowing. Buttons and badges stay on one line by design.

## Keeping it that way

`npm run check` fails on `margin-left`, `margin-right`, `padding-left`, `padding-right`, `border-left*`, `border-right*`, `text-align: left|right`, `left:`, `right:`, `float: left|right` and the physical radius corners. A line that truly means left or right (centring with `left: 50%` plus `translate`, an explicit `data-side="right"`) ends with `/* physical: reason */`.

## Known limitations

- Radix `side="left" | "right"` on Tooltip, Popover and menus is physical and does not swap. Radix flips `align` and submenu opening through `DirectionProvider`.
- The checkbox tick, spinner and orbiting circles are symmetric or rotate; they do not mirror.
- Numbers, code and URLs stay left-to-right inside RTL text (the browser's bidi rules); wrap them in `<bdi>` or `dir="ltr"` when they sit next to Arabic or Hebrew text.
- Not yet checked: block templates (`block-*`) with mixed-direction marketing copy, charts, and the docs site itself.
