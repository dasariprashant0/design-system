// @personal/ui React pieces. Each one is a thin wrapper over a class in
// css/components.css: screens compose these and never invent their own
// colours, fonts or spacing. React is a peer dependency of the app.
import {useEffect, useRef, useState, type ReactNode} from 'react';

/* ─── Theme ─── */

export type Theme = 'warm' | 'dark' | 'midnight';
export const THEMES: Theme[] = ['warm', 'dark', 'midnight'];

function storedTheme(): Theme {
    try {
        const t = localStorage.getItem('theme');
        if (t === 'warm' || t === 'dark' || t === 'midnight') return t;
    } catch { /* storage can be off; fall through */ }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'warm';
}

/** The current theme, kept on <html data-theme> and in localStorage. */
export function useTheme(): [Theme, (t: Theme) => void] {
    const [theme, setTheme] = useState<Theme>(storedTheme);
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try { localStorage.setItem('theme', theme); } catch { /* fine */ }
    }, [theme]);
    // Another window of the same app changed the theme: follow it.
    useEffect(() => {
        const follow = (e: StorageEvent) => { if (e.key === 'theme') setTheme(storedTheme()); };
        window.addEventListener('storage', follow);
        return () => window.removeEventListener('storage', follow);
    }, []);
    return [theme, setTheme];
}

export function ThemeSwitch({theme, onChange}: {theme: Theme; onChange: (t: Theme) => void}) {
    return (
        <div className="themes" role="radiogroup" aria-label="Theme">
            {THEMES.map(t => <button key={t} role="radio" aria-checked={t === theme} className="theme" onClick={() => onChange(t)}>{t}</button>)}
        </div>
    );
}

/* ─── Layout ─── */

/** Sidebar on the left, scrolling main on the right. */
export function Shell({side, children}: {side: ReactNode; children: ReactNode}) {
    return (
        <div className="shell">
            <aside className="side">{side}</aside>
            <main className="main">{children}</main>
        </div>
    );
}

export function Brand({name}: {name: string}) {
    return <p className="brand"><span className="brand-mark" aria-hidden="true"/>{name}</p>;
}

export function NavItem({children, current, meta, onClick}: {children: ReactNode; current?: boolean; meta?: ReactNode; onClick?: () => void}) {
    return (
        <button className="nav-item" aria-current={current ? 'page' : undefined} onClick={onClick}>
            <span>{children}</span>{meta !== undefined && <span className="small">{meta}</span>}
        </button>
    );
}

/** A page title: each line rises once, in order. */
export function Display({lines, size = 'md', id}: {lines: string[]; size?: 'md' | 'sm'; id?: string}) {
    return (
        <h1 id={id} className={`display display-${size}`}>
            {lines.map((l, i) => <span className="reveal" key={l + i}><span style={{animationDelay: `${0.06 + i * 0.12}s`}}>{l}</span></span>)}
        </h1>
    );
}

export function SectionTitle({children, id}: {children: ReactNode; id?: string}) {
    return <h2 id={id} className="display display-sm section-title">{children}</h2>;
}

export function Tabs<T extends string>({items, current, onChange}: {items: [T, string][]; current: T; onChange: (t: T) => void}) {
    return (
        <nav className="tabs">
            {items.map(([id, label]) => <button key={id} className="tab" aria-current={id === current ? 'page' : undefined} onClick={() => onChange(id)}>{label}</button>)}
        </nav>
    );
}

export function Empty({title, children, action}: {title: string[]; children?: ReactNode; action?: ReactNode}) {
    return (
        <div className="empty">
            <Display lines={title} size="sm"/>
            {children && <p className="muted">{children}</p>}
            {action}
        </div>
    );
}

/* ─── Controls ─── */

type ButtonProps = {
    children: ReactNode; onClick?: () => void; disabled?: boolean;
    variant?: 'solid' | 'line' | 'danger' | 'ghost'; size?: 'sm'; block?: boolean;
    type?: 'button' | 'submit'; title?: string;
};
export function Button({children, onClick, disabled, variant = 'solid', size, block, type = 'button', title}: ButtonProps) {
    const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, block && 'btn-block'].filter(Boolean).join(' ');
    return <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}

/** One choice of a few, always visible. */
export function Segmented<T extends string>({label, options, value, onChange}: {label?: string; options: [T, string][]; value: T; onChange: (v: T) => void}) {
    return (
        <div className="seg" role="radiogroup" aria-label={label}>
            {label && <span className="muted small">{label}</span>}
            {options.map(([v, text]) => <button key={v} role="radio" aria-checked={v === value} className="seg-opt small" onClick={() => onChange(v)}>{text}</button>)}
        </div>
    );
}

/** A label above any control, with an optional hint or error below. */
export function Field({label, hint, error, children}: {label: string; hint?: ReactNode; error?: string; children: ReactNode}) {
    return (
        <label className="field">
            <span className="label">{label}</span>
            {children}
            {error ? <span className="field-hint danger" role="alert">{error}</span> : hint && <span className="field-hint">{hint}</span>}
        </label>
    );
}

export function Switch({label, checked, onChange, disabled}: {label?: ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean}) {
    return (
        <label className="switch">
            <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)}/>
            {label && <span>{label}</span>}
        </label>
    );
}

/** A settings row: what it is on the left, the control on the right. */
export function Setting({title, hint, children}: {title: ReactNode; hint?: ReactNode; children: ReactNode}) {
    return (
        <div className="setting">
            <div><span>{title}</span>{hint && <span className="small muted">{hint}</span>}</div>
            <div>{children}</div>
        </div>
    );
}

/* ─── Content ─── */

/** A list row: optional mark, title, meta line, something at the end. */
export function Row({mark, title, meta, end, onClick}: {mark?: ReactNode; title: ReactNode; meta?: ReactNode; end?: ReactNode; onClick?: () => void}) {
    const inner = <>{mark}<span className="row-body"><span className="row-title">{title}</span>{meta && <span className="row-meta">{meta}</span>}</span>{end !== undefined && <span className="row-end small muted">{end}</span>}</>;
    return onClick ? <button className="row" onClick={onClick}>{inner}</button> : <div className="row">{inner}</div>;
}

/** Term/value pairs in a row. */
export function Facts({items}: {items: [string, ReactNode][]}) {
    return (
        <dl className="facts rule-top">
            {items.map(([t, v]) => <div key={t}><dt className="muted">{t}</dt><dd>{v}</dd></div>)}
        </dl>
    );
}

export function Badge({children, tone}: {children: ReactNode; tone?: 'solid' | 'accent'}) {
    return <span className={tone ? `badge badge-${tone}` : 'badge'}>{children}</span>;
}

export function Kbd({children}: {children: ReactNode}) {
    return <kbd className="kbd">{children}</kbd>;
}

/** A small square in an item's fill: legend and list marker. The app
 *  defines `.fill-<name>` from the ink or heat tokens. */
export function Swatch({fill}: {fill: string}) {
    return <span aria-hidden="true" className={`swatch fill-${fill}`}/>;
}

export function Banner({tone, children, action}: {tone?: 'accent' | 'warning' | 'danger'; children: ReactNode; action?: ReactNode}) {
    return (
        <div className={tone ? `banner banner-${tone}` : 'banner'} role={tone === 'danger' ? 'alert' : 'status'}>
            <div>{children}</div>{action}
        </div>
    );
}

/* ─── Overlays ─── */

function useEscape(active: boolean, onClose: () => void) {
    useEffect(() => {
        if (!active) return;
        const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [active, onClose]);
}

/** Details for one thing, from the right. Escape or the scrim closes it. */
export function Drawer({open, onClose, title, wide, children}: {open: boolean; onClose: () => void; title?: string; wide?: boolean; children: ReactNode}) {
    useEscape(open, onClose);
    return (
        <div className={open ? 'drawer open' : 'drawer'} aria-hidden={!open}>
            <div className="scrim" onClick={onClose}/>
            {open && (
                <section className={wide ? 'panel panel-wide' : 'panel'} role="dialog" aria-modal="true" aria-label={title}>
                    <button className="close" onClick={onClose}>Close</button>
                    {title && <h2 className="display display-sm panel-title">{title}</h2>}
                    {children}
                </section>
            )}
        </div>
    );
}

/** A question that blocks: confirm, conflict, short form. Native <dialog>. */
export function Dialog({open, onClose, title, children, actions}: {open: boolean; onClose: () => void; title: string; children?: ReactNode; actions: ReactNode}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const d = ref.current;
        if (!d) return;
        if (open && !d.open) d.showModal();
        if (!open && d.open) d.close();
    }, [open]);
    return (
        <dialog ref={ref} className="dialog" onCancel={e => { e.preventDefault(); onClose(); }}>
            <h2 className="dialog-title">{title}</h2>
            {children}
            <div className="dialog-actions">{actions}</div>
        </dialog>
    );
}

/** What just happened, with an optional undo. Hides itself after `ms`. */
export function Toast({message, action, onAction, onDone, ms = 6000}: {message: string; action?: string; onAction?: () => void; onDone: () => void; ms?: number}) {
    const done = useRef(onDone);
    done.current = onDone;
    useEffect(() => {
        const t = setTimeout(() => done.current(), ms);
        return () => clearTimeout(t);
    }, [message, ms]);
    return (
        <div className="toast" role="status">
            <span>{message}</span>
            {action && <button onClick={onAction}>{action}</button>}
            <button className="muted" onClick={onDone} aria-label="Dismiss">×</button>
        </div>
    );
}
