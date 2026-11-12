// Themes: named presets made only from the options the kit already has (theme, accent, font, corners, density)
// plus optional token overrides. Each is previewed on a small dashboard, checked for contrast against the live
// computed colours with the helper from theme-builder.tsx, and can be applied to this site or exported as CSS.
import {useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import {Avatar, Badge, Button, Collapsible, CollapsibleContent, CollapsibleTrigger, CodeBlock, Progress, Tag} from '@monoline/react';
import {contrast} from '../theme-builder';
import {parseTokens, usePrefsContext} from '../shell/prefs';
import {href} from '../shell/router';

interface Preset {
  id: string;
  title: string;
  description: string;
  theme: 'warm' | 'dark' | 'midnight';
  accent: string;
  font: string;
  radius: string;
  density: string;
  /** Token overrides, `--name:value;--other:value`. Optional. */
  tokens?: string;
}

export const PRESETS: Preset[] = [
  {id: 'paper', title: 'Paper', description: 'Ink on warm paper. Serif type, a slate accent and square corners, for reading-heavy pages.', theme: 'warm', accent: 'slate', font: 'serif', radius: 'square', density: 'comfortable'},
  {id: 'terminal', title: 'Terminal', description: 'Dark, monospace, green on near-black and tight spacing. The look of a console.', theme: 'dark', accent: 'green', font: 'mono', radius: 'square', density: 'compact'},
  {id: 'slate', title: 'Slate', description: 'A cool grey dark theme with sans type and gently rounded corners, for dashboards.', theme: 'dark', accent: 'slate', font: 'sans', radius: 'soft', density: 'comfortable'},
  {id: 'soft', title: 'Soft', description: 'Light, friendly and roomy. Rose accent, rounded corners, spacious density.', theme: 'warm', accent: 'rose', font: 'sans', radius: 'round', density: 'spacious'},
  {id: 'midnight-blue', title: 'Midnight blue', description: 'The midnight theme with a blue accent and sans type, for products used at night.', theme: 'midnight', accent: 'blue', font: 'sans', radius: 'soft', density: 'comfortable'},
  {id: 'high-contrast', title: 'High contrast', description: 'Pure black on white, a deep blue accent and strong rules. Token overrides raise every ratio.', theme: 'warm', accent: 'blue', font: 'sans', radius: 'square', density: 'spacious',
    tokens: '--background:#FFFFFF;--foreground:#000000;--muted:#3A3A3A;--accent:#0033A0;--accent-text:#0033A0;--on-accent:#FFFFFF;--rule:color-mix(in srgb, var(--foreground) 65%, transparent)'},
];

/** The CSS a project would add to get this preset. */
export function presetCss(p: Preset): string {
  const attrs = `<html data-theme="${p.theme}" data-accent="${p.accent}" data-font="${p.font}" data-radius="${p.radius}" data-density="${p.density}">`;
  const over = p.tokens ? parseTokens(p.tokens) : [];
  const css = over.length ? `\n\n/* After @monoline/css. The selector beats the accent presets. */\nhtml[data-theme][data-accent] {\n${over.map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}` : '';
  return `<!-- Monoline preset: ${p.title} -->\n${attrs}${css}`;
}

// Pairs that must hold: text 4.5:1, non-text 3:1.
const CHECKS: Array<{label: string; fg: string; bg: string; min: number}> = [
  {label: 'Text on background', fg: '--foreground', bg: '--background', min: 4.5},
  {label: 'Muted text on background', fg: '--muted', bg: '--background', min: 4.5},
  {label: 'Accent text on background', fg: '--accent-text', bg: '--background', min: 4.5},
  {label: 'Text on accent fill', fg: '--on-accent', bg: '--accent', min: 4.5},
  {label: 'Accent against background', fg: '--accent', bg: '--background', min: 3},
  {label: 'Error text on background', fg: '--danger', bg: '--background', min: 4.5},
  {label: 'Success text on background', fg: '--ok', bg: '--background', min: 4.5},
  {label: 'Warning text on background', fg: '--warning', bg: '--background', min: 4.5},
];
type Result = {label: string; ratio: number | null; min: number};

function Dashboard({p, onResults}: {p: Preset; onResults: (r: Result[]) => void}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const cs = getComputedStyle(ref.current!);
    const read = (n: string) => cs.getPropertyValue(n).trim();
    onResults(CHECKS.map((c) => ({label: c.label, min: c.min, ratio: contrast(read(c.fg), read(c.bg))})));
  }, [p, onResults]);
  const style = p.tokens ? Object.fromEntries(parseTokens(p.tokens)) as CSSProperties : undefined;
  return (
    <div ref={ref} className="tp" aria-hidden="true" {...{inert: true}} data-theme={p.theme} data-accent={p.accent} data-font={p.font} data-radius={p.radius} data-density={p.density} style={style}>
      <div className="tp-bar">
        <strong>Acme</strong>
        <span className="tp-nav"><span aria-current="page">Overview</span><span>Reports</span><span>Team</span></span>
        <Avatar name="Ada Lovelace" />
      </div>
      <div className="tp-stats">
        {[['Revenue', '$48.2k', '+12%'], ['Orders', '1,204', '+4%'], ['Refunds', '17', '-2%']].map(([k, v, d]) => (
          <div key={k} className="tp-stat"><span className="tp-k">{k}</span><strong>{v}</strong><Badge variant={d!.startsWith('+') ? 'accent' : 'outline'}>{d}</Badge></div>
        ))}
      </div>
      <Progress aria-label="Quarter goal" value={64} />
      <div className="tp-row"><Tag>design</Tag><Tag>billing</Tag><span className="tp-error">Card declined</span></div>
      <div className="tp-row"><Button variant="solid" size="sm">Invite</Button><Button size="sm">Export</Button><Button variant="ghost" size="sm">Skip</Button></div>
    </div>
  );
}

function PresetCard({p}: {p: Preset}) {
  const [prefs, set] = usePrefsContext();
  const [results, setResults] = useState<Result[]>([]);
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => { if (copied === 'idle') return; const t = setTimeout(() => setCopied('idle'), 2000); return () => clearTimeout(t); }, [copied]);
  const css = presetCss(p);
  const applied = prefs.theme === p.theme && prefs.accent === p.accent && prefs.font === p.font && prefs.radius === p.radius && prefs.density === p.density && (prefs.tokens ?? '') === (p.tokens ?? '');
  const ready = results.length > 0;
  const failing = results.filter((r) => r.ratio === null || r.ratio < r.min);
  const lowest = ready ? results.reduce((a, b) => ((a.ratio ?? 0) / a.min <= (b.ratio ?? 0) / b.min ? a : b)) : null;
  const apply = () => {
    set('theme', p.theme); set('accent', p.accent); set('font', p.font); set('radius', p.radius); set('density', p.density); set('tokens', p.tokens ?? '');
  };
  return (
    <section className="theme-card" aria-labelledby={`t-${p.id}`}>
      <Dashboard p={p} onResults={setResults} />
      <div className="theme-meta">
        <h2 id={`t-${p.id}`} className="cdoc-h3">{p.title}</h2>
        <p className="cdoc-muted">{p.description}</p>
        <p className="theme-opts"><code>{p.theme}</code> <code>{p.accent}</code> <code>{p.font}</code> <code>{p.radius}</code> <code>{p.density}</code>{p.tokens && <> <Badge>token overrides</Badge></>}</p>
        <p className="theme-contrast" role="status">
          {!ready ? 'Checking contrast…' : failing.length === 0
            ? <><Badge variant="accent">Passes contrast</Badge> {results.length} checks; lowest is {lowest!.label.toLowerCase()} at {lowest!.ratio!.toFixed(1)}:1 (needs {lowest!.min}:1).</>
            : <><Badge variant="solid">Fails contrast</Badge> {failing.map((f) => `${f.label} ${f.ratio ? f.ratio.toFixed(1) : 'unreadable'}:1 (needs ${f.min}:1)`).join('; ')}.</>}
        </p>
        <div className="theme-actions">
          <Button variant="solid" size="sm" aria-pressed={applied} onClick={apply}>{applied ? 'Applied' : `Apply ${p.title}`}</Button>
          <Button size="sm" onClick={async () => { try { await navigator.clipboard.writeText(css); setCopied('copied'); } catch { setCopied('failed'); } }}>Copy CSS</Button>
          <span className="cdoc-status" role="status">{copied === 'copied' ? 'Copied' : copied === 'failed' ? 'Copy failed' : ''}</span>
        </div>
        <Collapsible>
          <CollapsibleTrigger asChild><Button size="sm" variant="ghost">View CSS</Button></CollapsibleTrigger>
          <CollapsibleContent><CodeBlock title="html + css" language="html" code={css} /></CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}

export function Themes() {
  const [, set] = usePrefsContext();
  return (
    <>
      <p className="prose">A preset is a combination of the options the kit already has, so there is nothing new to install: set the attributes on <code>&lt;html&gt;</code> and, for High contrast, add a few token overrides. Each card checks its own colours against WCAG AA when it renders. Apply one to this site, or copy the CSS. To build your own, use the <a href={href('guides/theming')}>theming guide</a>.</p>
      <div className="theme-bar"><Button size="sm" variant="line" onClick={() => { set('theme', 'system'); set('accent', 'orange'); set('font', 'mono'); set('radius', 'square'); set('density', 'comfortable'); set('tokens', ''); }}>Reset to the default look</Button></div>
      <div className="theme-grid">{PRESETS.map((p) => <PresetCard key={p.id} p={p} />)}</div>
    </>
  );
}
