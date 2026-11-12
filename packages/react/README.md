# @monoline/react

Accessible, typed React components for Monoline. Radix underneath for the complex ones; native elements for the rest. Styled by [`@monoline/css`](../css).

```bash
npm install @monoline/react @monoline/css
```

```tsx
import '@monoline/css';
import {Button, Combobox, DataTable} from '@monoline/react';

export const App = () => <Button variant="solid">Save</Button>;
```

- Compound components are named exports (`Dialog`, `DialogTrigger`, `DialogContent`), so unused parts tree-shake.
- Controlled and uncontrolled pairs follow one pattern: `value` / `defaultValue` / `onValueChange`, `open` / `defaultOpen` / `onOpenChange`.
- Interactive files carry `'use client'`, so they work in the Next.js App Router.
- Prefer to own the code? `npx monoline add <component>` copies the source into your project.

Every component has a `meta.json` (name, category, a11y notes) and is tested with axe and keyboard tests. The full list is in [`llms.txt`](../../llms.txt).
