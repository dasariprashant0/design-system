/**
 * Every component folder has a `meta.json` with this shape (checked by `npm run registry`).
 * The docs site, the registry and `llms.txt` are generated from it.
 */
export type Category =
  | 'layout' | 'typography' | 'buttons' | 'forms' | 'data-display'
  | 'feedback' | 'overlays' | 'navigation' | 'effects' | 'blocks' | 'hooks';

export interface ComponentMeta {
  /** kebab-case, equals the folder name: `dropdown-menu` */
  name: string;
  /** Human title: `Dropdown menu` */
  title: string;
  category: Category;
  /** One sentence. Say what it is for, not how it is built. */
  description: string;
  /** `stable` once tested and documented; `beta` while the API may change. */
  status: 'stable' | 'beta';
  /** Other Monoline components this one imports, by name. */
  uses?: string[];
  /** The headless primitive it wraps, if any: `radix-ui/Dialog`. */
  primitive?: string;
  /** Stylesheets in packages/css/src/components/ this component needs (the CSS-only classes it renders). */
  css: string[];
  /** Keyboard and screen reader behaviour, one line each. */
  a11y: string[];
  /** Words people may search for: `modal`, `popup`. */
  keywords?: string[];
}
