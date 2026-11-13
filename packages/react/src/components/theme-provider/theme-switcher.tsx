'use client';
import {forwardRef, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {NativeSelect} from '../native-select';
import {themeOptions, useTheme} from './theme-provider';

export interface ThemeSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  /** Which choices to offer. Default both: `['theme', 'accent']`. */
  show?: ('theme' | 'accent')[];
}

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** Two selects, theme and accent, wired to `useTheme()`. Must sit under `ThemeProvider`. Build your own with `useTheme` for more control. */
export const ThemeSwitcher = forwardRef<HTMLDivElement, ThemeSwitcherProps>(function ThemeSwitcher({show = ['theme', 'accent'], className, ...rest}, ref) {
  const {theme, accent, setTheme, setAccent} = useTheme();
  return (
    <div ref={ref} role="group" aria-label="Appearance" className={cx('theme-switcher', className)} style={{display: 'flex', gap: 'var(--s2)'}} {...rest}>
      {show.includes('theme') && (
        <NativeSelect aria-label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
          {themeOptions.theme.map((t) => <option key={t} value={t}>{cap(t)}</option>)}
        </NativeSelect>
      )}
      {show.includes('accent') && (
        <NativeSelect aria-label="Accent" value={accent} onChange={(e) => setAccent(e.target.value as typeof accent)}>
          {themeOptions.accent.map((a) => <option key={a} value={a}>{cap(a)}</option>)}
        </NativeSelect>
      )}
    </div>
  );
});
