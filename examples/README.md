# Examples

Three small apps that use Monoline the way a consumer would: `import '@monoline/css'` and `import {…} from '@monoline/react'`, built with Vite and React 19, type-checked against `packages/react/dist/index.d.ts` in strict mode. They exist to catch the problems unit tests cannot (cascade, layout, hover, overlays at 375px). What they found is in [../docs/dogfood-log.md](../docs/dogfood-log.md).

| App | What it shows |
|---|---|
| `dashboard` | `BlockDashboardShell`, `Stat`, `DataTable` with sorting and paging, `LineChart`, `BarChart`, `DatePicker`, `Command` (Ctrl or Cmd + K), `Dialog`, toasts, theme and accent menu |
| `auth-settings` | sign-in and sign-up with validation (`Form`, `Field`, `PasswordInput`), `Tabs`, `Switch`, `Select`, `NativeSelect`, `FileUpload`, `AlertDialog` danger zone. Routes by hash: `#signin`, `#signup`, `#settings` |
| `landing` | `BlockHero`, `BlockFeatureGrid`, `BlockPricing` with billing toggle, `BlockTestimonials`, `BlockCta`, `BlockFooter`, light and dark switch |

## Run them

From the repo root:

```bash
npm install
npm run build            # the examples import packages/react/dist and packages/css/dist
```

```bash
npx tsc --noEmit -p examples/dashboard
cd examples/dashboard && npx vite build        # also: npx vite   for the dev server
```

Each app's `vite.config.ts` has an `alias` block that points `@monoline/react` and `@monoline/css` at the built output. In your own project, delete the block and `npm install @monoline/react @monoline/css`.

## Check them in a real browser

Needs Chrome (set `CHROME=/path/to/chrome` if it is not in a standard place).

```bash
node scripts/audit-examples.mjs --shots examples/.shots
```

It drives real mouse and keyboard input (open the command palette, dialogs and menus, submit empty forms, click the billing toggle, hover), then runs axe (WCAG 2 A and AA, 2.1, 2.2 AA), checks horizontal overflow, console errors and warnings, in three themes at 1280px and 375px, and saves screenshots. Look at the pictures. Options: `--apps`, `--themes`, `--scenario <name>`.

## Bundle sizes (gzip, React 19 included)

| App | JS | CSS |
|---|---|---|
| dashboard | 121.8 KB | 16.6 KB |
| auth-settings | 114.6 KB | 16.6 KB |
| landing | 84.1 KB | 16.6 KB |

An empty React 19 app is 69.2 KB, so the kit itself adds about 53, 45 and 15 KB.
