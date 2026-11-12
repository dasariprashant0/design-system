import {useEffect, useState} from 'react';

export const themes = ['warm', 'dark', 'midnight'] as const;
export const accents = ['orange', 'green', 'blue', 'violet', 'rose', 'teal', 'amber', 'slate'] as const;
export type Theme = (typeof themes)[number];
export type Accent = (typeof accents)[number];

/** The kit has no React theme hook, so this writes the attributes on <html> itself. */
export function useLook() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'warm');
  const [accent, setAccent] = useState<Accent>(() => (localStorage.getItem('accent') as Accent) || 'orange');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = accent;
    localStorage.setItem('theme', theme);
    localStorage.setItem('accent', accent);
  }, [theme, accent]);
  return {theme, setTheme, accent, setAccent};
}
