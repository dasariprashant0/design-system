// The Tokens reference: every design token with its real value, read from packages/tokens/dist/tokens.json at build time, so
// it can never drift from the CSS. Colours show a swatch per theme; spacing, radius and type show what they look like.
import type {ReactNode} from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@monoline/react';
import {href} from '../shell/router';

type Tok = {$value: string; $type?: string};
type Group = Record<string, Tok>;
type Tokens = {
  base: Record<string, Group>;
  theme: Record<string, {color: Group}>;
  accent: Record<string, Record<string, {color: Group}>>;
};

const tokens: Tokens = Object.values(import.meta.glob<Tokens>('../../../../packages/tokens/dist/tokens.json', {eager: true, import: 'default'}))[0] ?? {base: {}, theme: {}, accent: {}};
const THEMES = ['warm', 'dark', 'midnight'] as const;
const H2 = ({id, children}: {id: string; children: ReactNode}) => <h2 id={id} className="cdoc-h2">{children}</h2>;
const Sec = ({id, title, note, children}: {id: string; title: string; note?: ReactNode; children: ReactNode}) => (
  <section className="cdoc-section" aria-labelledby={id}><H2 id={id}>{title}</H2>{note && <p className="cdoc-muted">{note}</p>}{children}</section>
);
const Swatch = ({value}: {value: string}) => <span className="tk-sw" style={{background: value}} role="img" aria-label={`Colour ${value}`} />;

const isHex = (v: string) => /^(#|rgb)/.test(v);

function Colours() {
  const names = Object.keys(tokens.theme.warm?.color ?? {});
  return (
    <Table wrapperLabel="Colour tokens per theme">
      <TableHeader><TableRow><TableHead scope="col">Token</TableHead>{THEMES.map((t) => <TableHead key={t} scope="col">{t}</TableHead>)}</TableRow></TableHeader>
      <TableBody>
        {names.map((n) => (
          <TableRow key={n}>
            <TableCell><code>--{n}</code></TableCell>
            {THEMES.map((t) => { const v = tokens.theme[t]?.color[n]?.$value ?? ''; return <TableCell key={t}><span className="tk-val">{isHex(v) && <Swatch value={v} />}<code>{v}</code></span></TableCell>; })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Accents() {
  const names = Object.keys(tokens.accent);
  return (
    <Table wrapperLabel="Accent presets">
      <TableHeader><TableRow><TableHead scope="col"><code>data-accent</code></TableHead>{THEMES.map((t) => <TableHead key={t} scope="col">{t}: accent, accent-text</TableHead>)}</TableRow></TableHeader>
      <TableBody>
        {names.map((a) => (
          <TableRow key={a}>
            <TableCell><code>{a}</code></TableCell>
            {THEMES.map((t) => { const c = tokens.accent[a]?.[t]?.color; return <TableCell key={t}>{c && <span className="tk-val"><Swatch value={c.accent!.$value} /><Swatch value={c['accent-text']!.$value} /><code>{c.accent!.$value}</code></span>}</TableCell>; })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** The heading sizes are filed under `color` in tokens.json; they are type tokens, so they move to the typography table. */
const isHeading = (n: string) => n.startsWith('heading');
const entriesOf = (g: string) => {
  const own = Object.entries(tokens.base[g] ?? {});
  if (g === 'color') return own.filter(([n]) => !isHeading(n));
  if (g === 'type') return [...own, ...Object.entries(tokens.base.color ?? {}).filter(([n]) => isHeading(n))];
  return own;
};
const rows = (g: string, cols: (n: string, t: Tok) => ReactNode[], head: string[], label: string) => (
  <Table wrapperLabel={label}>
    <TableHeader><TableRow>{head.map((h) => <TableHead key={h} scope="col">{h}</TableHead>)}</TableRow></TableHeader>
    <TableBody>{entriesOf(g).map(([n, t]) => <TableRow key={n}>{cols(n, t).map((c, i) => <TableCell key={i}>{c}</TableCell>)}</TableRow>)}</TableBody>
  </Table>
);

export function Tokens() {
  const px = (v: string) => (/^\d+px$/.test(v) ? Number.parseInt(v, 10) : 0);
  return (
    <>
      <Sec id="tk-use" title="Using tokens" note={<>Every token is a CSS custom property on <code>:root</code>. Use <code>var(--s4)</code> instead of a number, and a theme or option changes it everywhere. The same values ship as W3C JSON at <code>@monoline/css/tokens.json</code> and as Figma variables in <code>@monoline/tokens</code>. See <a href={href('docs/theming')}>Theming</a> for how to override them.</>}>
        <pre className="tk-code" tabIndex={0}><code>{'.card {\n  padding: var(--s4);\n  border: 1px solid var(--rule);\n  color: var(--foreground);\n}'}</code></pre>
      </Sec>

      <Sec id="tk-colour" title="Colour" note="Three themes. Switch with data-theme on the html element; the accent comes from data-accent.">
        <Colours />
        <h3 id="tk-derived" className="cdoc-h3">Lines, washes and ink</h3>
        <p className="cdoc-muted">Derived from the text colour, so they follow every theme. Use <code>--rule</code> for dividers, <code>--wash</code> for hover and code backgrounds, and <code>--ink-2</code> to <code>--ink-5</code> for lighter text and fills.</p>
        {rows('color', (n, t) => [<code key="n">--{n}</code>, <span key="v" className="tk-val">{n.startsWith('ink') || n === 'rule' || n.startsWith('wash') ? <span className="tk-sw" style={{background: `var(--${n})`}} aria-hidden="true" /> : null}<code>{t.$value}</code></span>], ['Token', 'Value'], 'Derived colour tokens')}
        <h3 id="tk-accents" className="cdoc-h3">Accent presets</h3>
        <Accents />
      </Sec>

      <Sec id="tk-type" title="Typography">
        {rows('type', (n, t) => [<code key="n">--{n}</code>, <code key="v">{t.$value}</code>, n.startsWith('text') || isHeading(n) ? <span key="s" style={{fontSize: t.$value}}>The quick brown fox</span> : n.startsWith('font') ? <span key="s" style={{fontFamily: `var(--${n})`}}>The quick brown fox</span> : ''], ['Token', 'Value', 'Sample'], 'Typography tokens')}
        <p className="cdoc-muted">Set <code>data-font</code> to <code>mono</code>, <code>sans</code> or <code>serif</code> to swap the font tokens. Font weights are not tokens yet; components use 400, 500 and 700.</p>
      </Sec>

      <Sec id="tk-space" title="Spacing" note={<>A 4px scale. <code>data-density</code> (<code>compact</code>, <code>comfortable</code>, <code>spacious</code>) rescales <code>--s2</code> to <code>--s7</code> and the base text size.</>}>
        {rows('space', (n, t) => [<code key="n">--{n}</code>, <code key="v">{t.$value}</code>, <span key="b" className="tk-bar" style={{width: `${px(t.$value)}px`}} aria-hidden="true" />], ['Token', 'Value', 'Size'], 'Spacing tokens')}
      </Sec>

      <Sec id="tk-size" title="Sizes and layout" note="Control heights keep Button, Input and Select the same height at each size. The layout tokens set the sidebar, line length and widest column.">
        {rows('control', (n, t) => [<code key="n">--control-{n}</code>, <code key="v">{t.$value}</code>], ['Token', 'Value'], 'Control height tokens')}
        {rows('layout', (n, t) => [<code key="n">--{n}</code>, <code key="v">{t.$value}</code>], ['Token', 'Value'], 'Layout tokens')}
      </Sec>

      <Sec id="tk-radius" title="Radius" note={<>Square by default. <code>data-radius="soft"</code> sets <code>--radius</code> to 6px and <code>"round"</code> to 12px. <code>--round</code> is for pills and dots.</>}>
        {rows('radius', (n, t) => [<code key="n">--{n}</code>, <code key="v">{t.$value}</code>, <span key="s" className="tk-sw tk-sw-lg" style={{borderRadius: t.$value === '0' ? 0 : t.$value}} aria-hidden="true" />], ['Token', 'Value', 'Shape'], 'Radius tokens')}
      </Sec>

      <Sec id="tk-motion" title="Motion and layers" note="Animations are turned off for people who ask the system for reduced motion.">
        {rows('motion', (n, t) => [<code key="n">--{n}</code>, <code key="v">{t.$value}</code>], ['Token', 'Value'], 'Motion tokens')}
        {rows('zIndex', (n, t) => [<code key="n">--z-{n}</code>, <code key="v">{t.$value}</code>], ['Token', 'Value'], 'Layer tokens')}
      </Sec>

      <Sec id="tk-gaps" title="Not tokens yet" note="Said plainly, so you do not look for them: the kit has no breakpoint, font-weight, size-scale, shadow or border-width tokens. Breakpoints in the stylesheets are fixed values, and the docs site uses 560, 880 and 1100 pixels. The useMediaQuery hook takes any query. These are on the roadmap.">
        <ul className="cdoc-list"><li>Breakpoints: a standard set, as custom properties and a documented list.</li><li>Font weights and line heights.</li><li>Sizes for widths and heights beyond the control heights.</li><li>A radius scale (small, medium, large) instead of one value.</li><li>Shadows for popovers and toasts, and a focus-ring token.</li></ul>
      </Sec>
    </>
  );
}
