// The gallery: every token and component, in every theme, with each app's
// accent. Run `npm run dev` here and keep it open while you change ../css.
import {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '../css/tokens.css';
import '../css/base.css';
import '../css/components.css';
import {
    Badge, Banner, Brand, Button, Dialog, Display, Drawer, Empty, Facts, Field, Kbd, NavItem,
    Row, SectionTitle, Segmented, Setting, Shell, Switch, Tabs, ThemeSwitch, Toast, useTheme,
} from '../react';

// Each app owns a brand.css like this one; the gallery inlines two to compare.
const BRANDS = {
    loadout: '',
    gloamlog: `
      :root, [data-theme="warm"] { --accent: #0E7A5F; --accent-text: #0B6A52; --accent-2: #E0A23A; --on-accent: #FFFFFF; }
      [data-theme="dark"] { --accent: #45C29C; --accent-text: #45C29C; --accent-2: #E0A23A; --on-accent: #06241C; }
      [data-theme="midnight"] { --accent: #5FD6B2; --accent-text: #5FD6B2; --accent-2: #FFC857; --on-accent: #06241C; }`,
};
type BrandName = keyof typeof BRANDS;

const TOKENS = ['--background', '--foreground', '--muted', '--rule', '--wash-2', '--accent', '--accent-text', '--accent-2', '--danger', '--warning', '--ok', '--surface'];

function Gallery() {
    const [theme, setTheme] = useTheme();
    const [brand, setBrand] = useState<BrandName>('loadout');
    const [tab, setTab] = useState<'components' | 'tokens'>('components');
    const [view, setView] = useState<'day' | 'week' | 'month'>('day');
    const [on, setOn] = useState(true);
    const [drawer, setDrawer] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [toast, setToast] = useState('');

    const side = <>
        <Brand name={brand}/>
        <p className="label side-label">Pages</p>
        <nav className="nav">
            <NavItem current meta="24">Components</NavItem>
            <NavItem meta="12">Tokens</NavItem>
            <NavItem>Rules</NavItem>
        </nav>
        <div className="side-foot">
            <Segmented label="App" options={[['loadout', 'loadout'], ['gloamlog', 'gloamlog']]} value={brand} onChange={setBrand}/>
            <ThemeSwitch theme={theme} onChange={setTheme}/>
        </div>
    </>;

    return (
        <Shell side={side}>
            <style>{BRANDS[brand]}</style>
            <header className="head">
                <div className="head-title">
                    <p className="label">@personal/ui</p>
                    <Display lines={['The kit', 'every app shares']}/>
                </div>
                <Button onClick={() => setToast('Saved. Every screen follows the tokens.')}>Show a toast</Button>
            </header>
            <Tabs items={[['components', 'Components'], ['tokens', 'Tokens']]} current={tab} onChange={setTab}/>

            {tab === 'tokens' ? (
                <section className="block" style={{marginTop: 'var(--s7)'}}>
                    <SectionTitle>Colour</SectionTitle>
                    <ul className="list">
                        {TOKENS.map(t => <li key={t}><Row mark={<span className="swatch" style={{background: `var(${t})`, boxShadow: 'inset 0 0 0 1px var(--rule)'}}/>} title={t} meta="Theme-aware; never use a raw hex in a screen."/></li>)}
                    </ul>
                    <SectionTitle>Heat</SectionTitle>
                    <div className="row-gap">{[0, 1, 2, 3, 4].map(n => <span key={n} className={`heat-${n}`} style={{width: 28, height: 28}}/>)}</div>
                    <p className="small muted" style={{marginTop: 'var(--s3)'}}>Five steps of the accent for counts over time (gloamlog's 12-week grid).</p>
                </section>
            ) : (
                <div style={{marginTop: 'var(--s7)'}}>
                    <section className="block">
                        <SectionTitle>Buttons</SectionTitle>
                        <div className="row-gap">
                            <Button>Save</Button>
                            <Button variant="line">Cancel</Button>
                            <Button variant="danger">Delete</Button>
                            <Button variant="ghost">Learn more</Button>
                            <Button variant="line" size="sm">Small</Button>
                            <Button disabled>Disabled</Button>
                        </div>
                    </section>

                    <section className="block">
                        <SectionTitle>Fields</SectionTitle>
                        <div className="two">
                            <div className="stack">
                                <Field label="Name" hint="Shown in the sidebar."><input className="input" placeholder="Work"/></Field>
                                <Field label="Folder" error="That folder doesn't exist."><input className="input" aria-invalid="true" defaultValue="~/Notes/missing"/></Field>
                                <Field label="Template"><select className="select"><option>Daily</option><option>Weekly</option></select></Field>
                            </div>
                            <div>
                                <Setting title="Remind me at 6pm" hint="One quiet notification, weekdays only."><Switch checked={on} onChange={setOn}/></Setting>
                                <Setting title="View"><Segmented options={[['day', 'Day'], ['week', 'Week'], ['month', 'Month']]} value={view} onChange={setView}/></Setting>
                                <Setting title="Open quickly" hint="From any app."><span><Kbd>⌥</Kbd> <Kbd>⌘</Kbd> <Kbd>L</Kbd></span></Setting>
                            </div>
                        </div>
                    </section>

                    <section className="block">
                        <SectionTitle>Lists and marks</SectionTitle>
                        <ul className="list rule-top">
                            <li><Row onClick={() => setDrawer(true)} mark={<span className="swatch" style={{background: 'var(--ink-1)'}}/>} title="Open the drawer" meta="Rows are split by rules, never boxed." end="12 uses"/></li>
                            <li><Row onClick={() => setDialog(true)} mark={<span className="swatch" style={{background: 'var(--ink-3)'}}/>} title="Open a dialog" meta="For a question that blocks." end={<Badge tone="accent">new</Badge>}/></li>
                            <li><Row mark={<span className="swatch" style={{background: 'var(--hatch)'}}/>} title="Ink density" meta="Up to five kinds without new colours." end={<Badge>3 of 9</Badge>}/></li>
                        </ul>
                        <Facts items={[['Days', '214'], ['Streak', '12'], ['Words', '18,402'], ['Since', 'Mar 2026']]}/>
                    </section>

                    <section className="block">
                        <SectionTitle>Banners</SectionTitle>
                        <div className="stack">
                            <Banner>Synced to iCloud Drive two minutes ago.</Banner>
                            <Banner tone="accent">Claude Code added an entry to today.</Banner>
                            <Banner tone="warning" action={<Button variant="line" size="sm">Review</Button>}><strong>Two versions.</strong> This day changed in another app while you typed.</Banner>
                            <Banner tone="danger"><strong>Can't save.</strong> The notes folder is read-only.</Banner>
                        </div>
                    </section>

                    <section className="block">
                        <SectionTitle>Card and code</SectionTitle>
                        <div className="two">
                            <div className="card card-hover"><p className="label">Yesterday</p><p style={{marginTop: 'var(--s2)'}}>Shipped the export sheet; review copy still open.</p></div>
                            <pre className="code-block">{'## Done\n- Wrote the tokens\n- Ported the gallery'}</pre>
                        </div>
                    </section>

                    <section className="block">
                        <Empty title={['Nothing', 'here yet']} action={<Button variant="line">Write today</Button>}>An empty state says what goes here and offers the one action that fills it.</Empty>
                    </section>
                </div>
            )}

            <Drawer open={drawer} onClose={() => setDrawer(false)} title="Drawer">
                <p className="lede">Details for one thing, from the right. Escape or the scrim closes it.</p>
                <div className="panel-actions"><Button>Primary</Button><Button variant="line" onClick={() => setDrawer(false)}>Close</Button></div>
            </Drawer>
            <Dialog open={dialog} onClose={() => setDialog(false)} title="Discard changes?"
                    actions={<><Button variant="line" onClick={() => setDialog(false)}>Keep editing</Button><Button variant="danger" onClick={() => setDialog(false)}>Discard</Button></>}>
                <p className="muted">Your edits to today's page will be lost.</p>
            </Dialog>
            {toast && <Toast message={toast} action="Undo" onAction={() => setToast('')} onDone={() => setToast('')}/>}
        </Shell>
    );
}

createRoot(document.getElementById('root')!).render(<StrictMode><Gallery/></StrictMode>);
