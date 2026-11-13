import type {Demo} from '../../demo';
import {Button} from '../button';
import {ThemeProvider, useTheme} from './theme-provider';
import {ThemeSwitcher} from './theme-switcher';

function Controls() {
  const {theme, resolvedTheme, accent, density, setTheme, setDensity} = useTheme();
  return (
    <div style={{display: 'grid', gap: 12}}>
      <ThemeSwitcher />
      <p>Theme: {theme}{theme === 'system' ? ` (${resolvedTheme})` : ''}. Accent: {accent}. Density: {density}.</p>
      <div style={{display: 'flex', gap: 8}}>
        <Button onClick={() => setTheme(resolvedTheme === 'dark' ? 'warm' : 'dark')}>Toggle dark</Button>
        <Button onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}>Toggle compact</Button>
      </div>
    </div>
  );
}

export const demos: Demo[] = [{
  title: 'useTheme and ThemeSwitcher',
  description: 'ThemeProvider writes data-theme, data-accent and the other options to <html> and saves them. On a server-rendered page also put <script dangerouslySetInnerHTML={{__html: themeScript()}} /> in <head>.',
  render: () => <ThemeProvider storageKey="monoline-demo"><Controls /></ThemeProvider>,
}];
