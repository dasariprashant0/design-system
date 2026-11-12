// Blocks gallery: every block-* component full width, one viewport switcher for the whole page, with Copy code and
// the install command per block. The frame is a plain resizable container (no iframe), so a block's own @media
// rules still follow the browser window; the frame width shows how the content wraps at that width.
import {useEffect, useState} from 'react';
import {Button, CodeBlock, SegmentedControl} from '@monoline/react';
import type {Demo} from '@monoline/react';
import {demosFor, inCategory, pathOf} from '../shell/registry';
import {href} from '../shell/router';

type DemoCode = {title: string; code: string};
type Extra = {importName: string; demos: DemoCode[]};
const extras: Record<string, Extra> = Object.values(import.meta.glob<Record<string, Extra>>('../page/demos.generated.json', {eager: true, import: 'default'}))[0] ?? {};

const VIEWPORTS = [
  {value: 'mobile', label: 'Mobile 375', width: 375},
  {value: 'tablet', label: 'Tablet 768', width: 768},
  {value: 'desktop', label: 'Desktop', width: 0},
];

function CopyCode({code}: {code: string}) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useEffect(() => { if (state === 'idle') return; const t = setTimeout(() => setState('idle'), 2000); return () => clearTimeout(t); }, [state]);
  return (
    <>
      <Button size="sm" onClick={async () => { try { await navigator.clipboard.writeText(code); setState('copied'); } catch { setState('failed'); } }}>Copy code</Button>
      <span className="cdoc-status" role="status">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : ''}</span>
    </>
  );
}

function Preview({demo, width, label}: {demo: Demo; width: number; label: string}) {
  return (
    <div className="blocks-frame" data-no-toc role="region" aria-label={`${label} preview`} tabIndex={0} style={width ? {width: `min(100%, ${width}px)`} : undefined}>
      {demo.render()}
    </div>
  );
}

export function Blocks() {
  const [vp, setVp] = useState('desktop');
  const width = VIEWPORTS.find((v) => v.value === vp)!.width;
  const blocks = inCategory('blocks');
  return (
    <>
      <p className="prose">{blocks.length} page sections you can drop in. Pick a width to see how the content wraps, resize a frame by dragging its lower corner, then copy the code or install the block with the CLI.</p>
      <div className="blocks-bar" role="group" aria-label="Preview width">
        <SegmentedControl aria-label="Preview width" value={vp} onValueChange={setVp} options={VIEWPORTS.map((v) => ({value: v.value, label: v.label}))} />
        <span className="cdoc-muted">Layout rules that depend on the screen, not the frame, follow your browser window.</span>
      </div>
      {blocks.map((m) => {
        const demos = demosFor(m.name);
        const code = extras[m.name]?.demos ?? [];
        return (
          <section key={m.name} className="block blocks-item" aria-labelledby={`b-${m.name}`}>
            <h2 id={`b-${m.name}`} className="cdoc-h3"><a href={href(pathOf(m))}>{m.title}</a></h2>
            <p className="cdoc-muted">{m.description}</p>
            {demos.map((d, i) => {
              const src = code.find((c) => c.title === d.title)?.code ?? code[i]?.code ?? '';
              return (
                <div key={d.title} className="blocks-demo">
                  {demos.length > 1 && <h3 className="cdoc-h3 blocks-variant">{d.title}</h3>}
                  <Preview demo={d} width={width} label={`${m.title}${demos.length > 1 ? `, ${d.title}` : ''}`} />
                  <div className="blocks-actions">{src && <CopyCode code={src} />}</div>
                </div>
              );
            })}
            <CodeBlock language="bash" code={`npx monoline add ${m.name}`} />
          </section>
        );
      })}
    </>
  );
}
