// The home page board: a four-column masonry of small cards built from real Monoline components. All names, numbers and
// copy are made up for the demo, except the component count and version, which come from the registry and package.
import {useState} from 'react';
import {Avatar, Badge, Button, Checkbox, Field, Input, Progress, SegmentedControl, Switch, Tag, Textarea} from '@monoline/react';
import {ArrowIcon, CheckIcon, CopyIcon} from './Logo';
import {components, hooks} from './registry';
import {href} from './router';
import {VERSION} from './registry';

const Dot = () => <span className="bd-dot" aria-hidden="true" />;
const Row = ({k, v, dim}: {k: string; v: string; dim?: boolean}) => <div className="bd-line" data-dim={dim || undefined}><span>{k}</span><span>{v}</span></div>;
const Eyebrow = ({children}: {children: string}) => <p className="bd-k">{children}</p>;

const glyph = (d: string) => <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false"><path d={d} /></svg>;
const FILE = glyph('M4 1.5h5l3 3v10H4ZM9 1.5v3h3');
const TOKEN = glyph('M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2ZM8 2v12M2 8h12');
const PATTERN = glyph('M2 2h5v5H2ZM9 9h5v5H9ZM9 2h5v5H9ZM2 9h5v5H2Z');
const USERS = glyph('M8 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 13.5c.4-2.4 2.4-3.6 5-3.6s4.6 1.2 5 3.6');
const PALETTE = glyph('M8 2a6 6 0 1 0 0 12c1 0 1.4-.7 1-1.5s-.2-1.5.8-1.5H12a2 2 0 0 0 2-2A6 6 0 0 0 8 2Z');
const CARD = glyph('M1.5 3.5h13v9h-13ZM1.5 6.5h13');

export function Board() {
  return (
    <div className="bd">
      <section className="bd-card" aria-label="Controls">
        <div className="bd-row"><Button size="sm">Button <ArrowIcon /></Button><Button size="sm" variant="line">Secondary</Button><Button size="sm" variant="ghost">Ghost</Button></div>
        <Input aria-label="Project name" placeholder="Enter project name..." />
        <Textarea aria-label="Description" rows={3} placeholder="Write a brief description..." />
        <div className="bd-row bd-between">
          <div className="bd-row"><Badge>Badge</Badge><Tag>Outline</Tag></div>
          <div className="bd-row"><Switch aria-label="Notifications" defaultChecked /><Checkbox aria-label="Accept" defaultChecked /></div>
        </div>
      </section>

      <section className="bd-card" aria-label="Workspace directory">
        <div className="bd-row bd-between"><Eyebrow>Workspace directory</Eyebrow><Badge>Active</Badge></div>
        <div className="bd-cols">
          <div><Eyebrow>Documents</Eyebrow><ul className="bd-list"><li>{FILE} Architecture</li><li>{TOKEN} Tokens</li><li>{PATTERN} Patterns</li></ul></div>
          <div><Eyebrow>Settings</Eyebrow><ul className="bd-list"><li>{USERS} Team roles</li><li>{PALETTE} Themes</li><li>{CARD} Billing</li></ul></div>
        </div>
      </section>

      <section className="bd-card bd-fade" aria-label="Quarterly target">
        <div className="bd-row bd-between"><Eyebrow>Quarterly target</Eyebrow><Badge>On track</Badge></div>
        <p className="bd-big">$420,000</p>
        <Progress aria-label="Quarter progress" value={65} />
        <p className="bd-note">65% completed · $273,000 achieved</p>
      </section>

      <section className="bd-card" aria-label="Contribution pulse">
        <div className="bd-row bd-between"><div><p className="bd-title">Contribution pulse</p><p className="bd-note">Last 6 months velocity</p></div><Badge>+24.8%</Badge></div>
        <div className="bd-bars" role="img" aria-label="Contributions per month, rising from December to May">
          {[['Dec', 52], ['Jan', 58], ['Feb', 50], ['Mar', 60], ['Apr', 48], ['May', 62]].map(([m, h]) => <div key={m as string}><span style={{height: `${h}px`}} /><small>{m}</small></div>)}
        </div>
        <div className="bd-row bd-between bd-top"><div><Eyebrow>Releases</Eyebrow><p className="bd-title">v{VERSION} live</p></div><Button size="sm" variant="line" asChild><a href={href('docs/tools/changelog')}>Changelog <ArrowIcon /></a></Button></div>
      </section>

      <section className="bd-card" aria-label="Account balance">
        <div className="bd-row bd-between"><Eyebrow>Claimable balance</Eyebrow><Badge><Dot /> Verified</Badge></div>
        <p className="bd-big">$1,211.29</p>
        <Row k="Net royalties" v="$1,248.75" />
        <Row k="Processing fee" v="-$37.46" dim />
        <Button className="bd-wide">Withdraw funds</Button>
      </section>

      <section className="bd-card bd-fade" aria-label="Quote">
        <Eyebrow>Editorial layout</Eyebrow>
        <p className="bd-quote">"Design tokens should live in CSS, not locked in build configurations."</p>
      </section>

      <section className="bd-card" aria-label="Create milestone">
        <div className="bd-row bd-between"><Eyebrow>Create milestone</Eyebrow><Badge>Sprint 4</Badge></div>
        <Field label="Goal name"><Input defaultValue="Type-safe rollout" /></Field>
        <div className="bd-cols"><Field label="Target ($)"><Input defaultValue="15,000" /></Field><Field label="Timeline"><Input defaultValue="Q4 2026" /></Field></div>
        <div className="bd-row"><Button className="bd-grow">Save goal</Button><Button variant="ghost">Cancel</Button></div>
      </section>

      <section className="bd-card" aria-label="Payout settings">
        <div className="bd-row bd-between"><Eyebrow>Payout settings</Eyebrow><Switch aria-label="Payouts on" /></div>
        <SegmentedControl aria-label="Currency" defaultValue="usd" options={[{value: 'usd', label: 'USD ($)'}, {value: 'eur', label: 'EUR (€)'}, {value: 'gbp', label: 'GBP (£)'}]} />
        <div className="bd-line"><span className="bd-k">Threshold amount</span><span>$2,450.00</span></div>
        <Input aria-label="Threshold amount" defaultValue="2,450.00" />
      </section>

      <section className="bd-card" aria-label="Maintainer">
        <div className="bd-row"><Avatar name="Ada Ferreira" /><div><p className="bd-title">Ada Ferreira</p><p className="bd-note">Lead maintainer · Monoline</p></div></div>
        <Checkbox label="Show semantic token labels" />
      </section>

      <section className="bd-card" aria-label="Editorial system">
        <div className="bd-row bd-between"><Eyebrow>Editorial · Layout</Eyebrow><Badge>Tokens</Badge></div>
        <p className="bd-h">A calm system for dense interfaces</p>
        <p className="bd-note">Typed React components styled through shared semantic tokens for every theme and accent.</p>
        <div className="bd-row"><Tag>React 19</Tag><Tag>Plain CSS</Tag></div>
        <a className="bd-link" href={href('docs/components')}><Eyebrow>Explore components</Eyebrow><ArrowIcon /></a>
      </section>

      <section className="bd-card" aria-label="Package install">
        <div className="bd-row bd-between"><p className="bd-title"><Dot /> Package install</p><Eyebrow>Ready</Eyebrow></div>
        <div className="bd-term"><p>$ npm i @monoline/react</p><p className="bd-ok">✓ Types and docs installed</p></div>
        <div className="bd-row"><Input aria-label="Filter component names" placeholder="Filter component names" /><Button variant="line">Filter</Button></div>
      </section>

      <section className="bd-card bd-fade" aria-label="Documented components">
        <p className="bd-big">{components.length + hooks.length} <span className="bd-up" aria-hidden="true">↑</span></p>
        <Eyebrow>Documented components</Eyebrow>
        <p className="bd-note">Package exports with examples, props, tokens and usage guidance.</p>
      </section>
    </div>
  );
}

export const INSTALL_MANAGERS = ['npm', 'pnpm', 'bun', 'yarn'] as const;

/** Package manager tabs, the command and a Copy button. */
export function InstallBox() {
  const [pm, setPm] = useState<(typeof INSTALL_MANAGERS)[number]>('npm');
  const [done, setDone] = useState(false);
  const cmd = `${{npm: 'npm i', pnpm: 'pnpm add', bun: 'bun add', yarn: 'yarn add'}[pm]} @monoline/react`;
  const copy = async () => { try { await navigator.clipboard.writeText(cmd); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked */ } };
  return (
    <div className="bd-install">
      <div className="bd-pms" role="group" aria-label="Package manager">
        {INSTALL_MANAGERS.map((m) => <button key={m} type="button" aria-pressed={pm === m} onClick={() => setPm(m)}>{m}</button>)}
      </div>
      <code>{cmd}</code>
      <button type="button" className="bd-copy" onClick={copy}>{done ? <CheckIcon /> : <CopyIcon />} {done ? 'Copied' : 'Copy'}</button>
    </div>
  );
}
