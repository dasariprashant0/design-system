'use client';
import {createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {DirectionProvider} from '../direction-provider';

/** Theme names. `system` follows the operating system setting. */
export type Theme = 'warm' | 'dark' | 'midnight' | 'system';
/** The eight accent presets in `accents.css`. */
export type Accent = 'orange' | 'rose' | 'amber' | 'green' | 'teal' | 'blue' | 'violet' | 'slate';
/** Type family option. */
export type Font = 'mono' | 'sans' | 'serif';
/** Corner option. */
export type Radius = 'square' | 'soft' | 'round';
/** Spacing option. */
export type Density = 'compact' | 'comfortable' | 'spacious';
/** Reading direction. */
export type Dir = 'ltr' | 'rtl';

/** Every allowed value, for building your own switchers. */
export const themeOptions = {
  theme: ['warm', 'dark', 'midnight', 'system'],
  accent: ['orange', 'rose', 'amber', 'green', 'teal', 'blue', 'violet', 'slate'],
  font: ['mono', 'sans', 'serif'],
  radius: ['square', 'soft', 'round'],
  density: ['compact', 'comfortable', 'spacious'],
  dir: ['ltr', 'rtl'],
} as const;

type Look = {theme: Theme; accent: Accent; font: Font; radius: Radius; density: Density; dir: Dir};
const DEFAULTS: Look = {theme: 'system', accent: 'orange', font: 'mono', radius: 'square', density: 'comfortable', dir: 'ltr'};
const KEYS = Object.keys(DEFAULTS) as (keyof Look)[];

/** What `useTheme()` returns: the current choices, the theme actually applied, and one setter per choice. */
export interface ThemeContextValue extends Look {
  /** The theme in effect: `system` resolved to `warm` or `dark`. */
  resolvedTheme: 'warm' | 'dark' | 'midnight';
  /** Choose a theme. */
  setTheme: (theme: Theme) => void;
  /** Choose an accent. */
  setAccent: (accent: Accent) => void;
  /** Choose a font family. */
  setFont: (font: Font) => void;
  /** Choose corner roundness. */
  setRadius: (radius: Radius) => void;
  /** Choose spacing density. */
  setDensity: (density: Density) => void;
  /** Choose reading direction. Also sets `dir` on the page and for Radix components. */
  setDir: (dir: Dir) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps extends Partial<Look> {
  /** Prefix of the localStorage keys, e.g. `monoline` stores `monoline-theme`. Default "monoline". Match it in `themeScript`. */
  storageKey?: string;
  /** The app. */
  children?: ReactNode;
}

const read = (key: string): string | null => { try { return window.localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { window.localStorage.setItem(key, value); } catch { /* storage blocked: the choice lasts for this visit only */ } };
const systemTheme = () => (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'warm');

/**
 * Holds the look of the app (theme, accent, font, corners, density, direction), saves it in localStorage and writes it
 * to `<html>` as the `data-*` attributes the CSS reads. Render it once at the root.
 * On the server nothing touches `window`; the saved choice is read after mount. To avoid a flash of the wrong theme,
 * put `themeScript()` in the `<head>` of server-rendered pages.
 * @example <ThemeProvider defaultAccent="green"><App /></ThemeProvider>
 */
export function ThemeProvider({storageKey = 'monoline', children, ...initial}: ThemeProviderProps) {
  const [look, setLook] = useState<Look>({...DEFAULTS, ...initial});
  const [ready, setReady] = useState(false);
  const [system, setSystem] = useState<'warm' | 'dark'>('warm');

  // After mount: load saved choices and the system preference.
  useEffect(() => {
    setLook((cur) => {
      const next = {...cur};
      for (const k of KEYS) {
        const saved = read(`${storageKey}-${k}`);
        if (saved && (themeOptions[k] as readonly string[]).includes(saved)) (next[k] as string) = saved;
      }
      return next;
    });
    setSystem(systemTheme());
    setReady(true);
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    const on = () => setSystem(systemTheme());
    mq?.addEventListener?.('change', on);
    return () => mq?.removeEventListener?.('change', on);
  }, [storageKey]);

  const resolvedTheme = look.theme === 'system' ? system : look.theme;

  // Apply to <html>. Skipped until the saved choice is loaded so it never overwrites what themeScript set.
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.setAttribute('data-accent', look.accent);
    root.setAttribute('data-font', look.font);
    root.setAttribute('data-radius', look.radius);
    root.setAttribute('data-density', look.density);
    root.setAttribute('dir', look.dir);
  }, [ready, resolvedTheme, look.accent, look.font, look.radius, look.density, look.dir]);

  const set = useCallback(<K extends keyof Look>(k: K, v: Look[K]) => {
    setLook((cur) => ({...cur, [k]: v}));
    write(`${storageKey}-${k}`, v);
  }, [storageKey]);

  const value = useMemo<ThemeContextValue>(() => ({
    ...look,
    resolvedTheme,
    setTheme: (v) => set('theme', v),
    setAccent: (v) => set('accent', v),
    setFont: (v) => set('font', v),
    setRadius: (v) => set('radius', v),
    setDensity: (v) => set('density', v),
    setDir: (v) => set('dir', v),
  }), [look, resolvedTheme, set]);

  return (
    <ThemeContext.Provider value={value}>
      <DirectionProvider dir={look.dir}>{children}</DirectionProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Read and change the app's look. Returns the current `theme`, `resolvedTheme`, `accent`, `font`, `radius`, `density`, `dir`
 * and a setter for each. Must be used under `ThemeProvider`. On the server it returns the defaults.
 * @example const {theme, setTheme} = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return ctx;
}

/**
 * A script (as a string) that sets the saved theme, accent, font, corners, density and direction on `<html>` before the
 * page paints, so server-rendered pages do not flash the wrong look. Inline it in `<head>`.
 * @example <script dangerouslySetInnerHTML={{__html: themeScript()}} />
 */
export function themeScript(options: {storageKey?: string; defaultTheme?: Theme} = {}): string {
  const key = JSON.stringify(options.storageKey ?? 'monoline');
  const def = JSON.stringify(options.defaultTheme ?? 'system');
  return `(function(){try{var d=document.documentElement,k=${key},g=function(n){return localStorage.getItem(k+'-'+n)},t=g('theme')||${def};if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'warm';d.setAttribute('data-theme',t);['accent','font','radius','density'].forEach(function(n){var v=g(n);if(v)d.setAttribute('data-'+n,v)});var r=g('dir');if(r)d.setAttribute('dir',r)}catch(e){}})()`;
}
