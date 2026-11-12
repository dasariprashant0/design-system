// Look preferences (theme, accent, font, corners, density, direction): data attributes on <html>, saved in localStorage.
import {useEffect, useRef, useState} from 'react';
import {Button, Collapsible, CollapsibleContent, CollapsibleTrigger, SegmentedControl} from '@monoline/react';

const ACCENTS = ['orange', 'rose', 'amber', 'green', 'teal', 'blue', 'violet', 'slate'] as const;
const SWATCH: Record<string, string> = {orange: '#FF4500', rose: '#E11D48', amber: '#D97706', green: '#0E7A5F', teal: '#0F766E', blue: '#2563EB', violet: '#7C3AED', slate: '#334155'};
const DEFAULTS = {theme: 'system', accent: 'orange', font: 'mono', radius: 'square', density: 'comfortable', dir: 'ltr'};
export type Prefs = typeof DEFAULTS;
type Set = (k: keyof Prefs, v: string) => void;
export const ACCENT_COUNT = ACCENTS.length;

export function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try { return {...DEFAULTS, ...JSON.parse(localStorage.getItem('monoline-prefs') ?? '{}')}; } catch { return DEFAULTS; }
  });
  useEffect(() => {
    const root = document.documentElement;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      root.dataset.theme = prefs.theme === 'system' ? (mq.matches ? 'dark' : 'warm') : prefs.theme;
      root.dataset.accent = prefs.accent; root.dataset.font = prefs.font; root.dataset.radius = prefs.radius; root.dataset.density = prefs.density;
      root.dir = prefs.dir;
    };
    apply();
    mq.addEventListener('change', apply);
    try { localStorage.setItem('monoline-prefs', JSON.stringify(prefs)); } catch { /* private mode */ }
    return () => mq.removeEventListener('change', apply);
  }, [prefs]);
  return [prefs, ((k, v) => setPrefs((p) => ({...p, [k]: v}))) as Set] as const;
}

function Customize({prefs, set}: {prefs: Prefs; set: Set}) {
  const opt = (values: string[]) => values.map((v) => ({value: v, label: v}));
  return (
    <div className="custom">
      <div className="custom-row"><span className="label">Theme</span><SegmentedControl aria-label="Theme" value={prefs.theme} onValueChange={(v) => set('theme', v)} options={opt(['system', 'warm', 'dark', 'midnight'])} /></div>
      <div className="custom-row"><span className="label">Accent</span>
        <div className="swatches" role="radiogroup" aria-label="Accent">
          {ACCENTS.map((a) => <button key={a} type="button" role="radio" aria-checked={prefs.accent === a} aria-label={a} title={a} className="swatch" style={{background: SWATCH[a]}} onClick={() => set('accent', a)} />)}
        </div>
      </div>
      <div className="custom-row"><span className="label">Font</span><SegmentedControl aria-label="Font" value={prefs.font} onValueChange={(v) => set('font', v)} options={opt(['mono', 'sans', 'serif'])} /></div>
      <div className="custom-row"><span className="label">Corners</span><SegmentedControl aria-label="Corners" value={prefs.radius} onValueChange={(v) => set('radius', v)} options={opt(['square', 'soft', 'round'])} /></div>
      <div className="custom-row"><span className="label">Density</span><SegmentedControl aria-label="Density" value={prefs.density} onValueChange={(v) => set('density', v)} options={opt(['compact', 'comfortable', 'spacious'])} /></div>
      <div className="custom-row"><span className="label">Direction</span><SegmentedControl aria-label="Direction" value={prefs.dir} onValueChange={(v) => set('dir', v)} options={[{value: 'ltr', label: 'LTR'}, {value: 'rtl', label: 'RTL'}]} /></div>
    </div>
  );
}

export function CustomisePanel({prefs, set}: {prefs: Prefs; set: Set}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div ref={ref} className="docs-custom">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild><Button size="sm">Customise</Button></CollapsibleTrigger>
        <CollapsibleContent className="docs-custom-panel"><Customize prefs={prefs} set={set} /></CollapsibleContent>
      </Collapsible>
    </div>
  );
}
