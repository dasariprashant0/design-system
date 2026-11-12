// Theme builder: pick the built-in options, optionally override colours, see a live preview and copy the result.
import {useMemo, useState, type CSSProperties} from 'react';
import {Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, CodeBlock, Field, Input, SegmentedControl, Switch, Tag} from '@monoline/react';

const THEMES = ['warm', 'dark', 'midnight'];
const ACCENTS = ['orange', 'green', 'blue', 'violet', 'rose', 'teal', 'amber', 'slate'];
const FONTS = ['mono', 'sans', 'serif'];
const RADII = ['square', 'soft', 'round'];
const DENSITIES = ['compact', 'comfortable', 'spacious'];
const opts = (v: string[]) => v.map((x) => ({value: x, label: x}));

const hex = /^#([0-9a-f]{6})$/i;
const lum = (h: string) => {
  const m = hex.exec(h); if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
/** WCAG contrast ratio of two #rrggbb colours, or null if either is not a valid hex. */
export function contrast(a: string, b: string): number | null {
  const x = lum(a), y = lum(b);
  if (x === null || y === null) return null;
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export function ThemeBuilder() {
  const [s, setS] = useState({theme: 'warm', accent: 'orange', font: 'mono', radius: 'square', density: 'comfortable'});
  const [custom, setCustom] = useState(false);
  const [c, setC] = useState({accent: '#0E7A5F', background: '#FAFAF5', foreground: '#16120E'});
  const set = (k: keyof typeof s) => (v: string) => setS((p) => ({...p, [k]: v}));
  const ratio = custom ? contrast(c.accent, c.background) : null;
  const style = custom ? ({'--accent': c.accent, '--accent-text': c.accent, '--background': c.background, '--foreground': c.foreground} as CSSProperties) : undefined;

  const css = useMemo(() => {
    const attrs = `<html data-theme="${s.theme}" data-accent="${s.accent}" data-font="${s.font}" data-radius="${s.radius}" data-density="${s.density}">`;
    return custom
      ? `${attrs}\n\n/* your overrides, after @monoline/css */\n:root, [data-theme] {\n  --accent: ${c.accent};\n  --accent-text: ${c.accent};\n  --background: ${c.background};\n  --foreground: ${c.foreground};\n}`
      : attrs;
  }, [s, c, custom]);

  return (
    <>
      <section className="block">
        <h2 className="label">Options</h2>
        <div className="builder-controls">
          <div className="custom-row"><span className="label">Theme</span><SegmentedControl aria-label="Theme" options={opts(THEMES)} value={s.theme} onValueChange={set('theme')} /></div>
          <div className="custom-row"><span className="label">Accent</span><SegmentedControl aria-label="Accent" options={opts(ACCENTS)} value={s.accent} onValueChange={set('accent')} /></div>
          <div className="custom-row"><span className="label">Font</span><SegmentedControl aria-label="Font" options={opts(FONTS)} value={s.font} onValueChange={set('font')} /></div>
          <div className="custom-row"><span className="label">Corners</span><SegmentedControl aria-label="Corners" options={opts(RADII)} value={s.radius} onValueChange={set('radius')} /></div>
          <div className="custom-row"><span className="label">Density</span><SegmentedControl aria-label="Density" options={opts(DENSITIES)} value={s.density} onValueChange={set('density')} /></div>
          <div className="builder-switch"><Switch id="custom-colours" checked={custom} onCheckedChange={setCustom} aria-label="Use custom colours" /><label htmlFor="custom-colours">Use custom colours</label></div>
        </div>
        {custom && (
          <div className="builder-colours">
            {(['accent', 'background', 'foreground'] as const).map((k) => (
              <Field key={k} label={k[0]!.toUpperCase() + k.slice(1)} hint="#rrggbb">
                <Input value={c[k]} onChange={(e) => setC((p) => ({...p, [k]: e.target.value}))} invalid={!hex.test(c[k])} spellCheck={false} />
              </Field>
            ))}
            <p className="builder-ratio" role="status">
              {ratio === null ? 'Enter valid #rrggbb colours.' : <>Accent text on background: <strong>{ratio.toFixed(2)}:1</strong> {ratio >= 4.5 ? '(passes WCAG AA for text)' : ratio >= 3 ? '(large text and graphics only; below 4.5:1 for body text)' : '(fails: too low to read)'}</>}
            </p>
          </div>
        )}
      </section>
      <section className="block">
        <h2 className="label">Preview</h2>
        <div className="builder-preview" data-theme={s.theme} data-accent={s.accent} data-font={s.font} data-radius={s.radius} data-density={s.density} style={style}>
          <Card>
            <CardHeader><CardTitle>Team plan</CardTitle><CardDescription>Everything in Free, plus shared projects.</CardDescription></CardHeader>
            <CardContent>
              <div className="builder-row"><Badge variant="accent">new</Badge><Tag>design</Tag><Tag>code</Tag></div>
              <Field label="Work email"><Input placeholder="you@example.com" /></Field>
              <div className="builder-row"><Button variant="solid">Start trial</Button><Button>Learn more</Button><Button variant="ghost">Skip</Button></div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="block">
        <h2 className="label">Copy</h2>
        <CodeBlock title="html + css" code={css} />
      </section>
    </>
  );
}
