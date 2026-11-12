// Shared by build.mjs and check.mjs: read the CSS files into plain objects.
import {readFileSync} from 'node:fs';

export const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

function blocks(css) {
  const out = [];
  strip(css).replace(/([^{}]+)\{([^{}]*)\}/g, (_, sel, body) => {
    const vars = {};
    body.replace(/(--[\w-]+)\s*:\s*([^;]+);/g, (__, k, v) => { vars[k] = v.trim(); });
    out.push({sel: sel.trim(), vars});
  });
  return out;
}

/** {base, themes: {warm, dark, midnight}, accents: {orange: {warm, dark, midnight}, ...}} */
export function parseTokens() {
  const themes = {}, base = {}, accents = {};
  for (const {sel, vars} of blocks(read('css/tokens.css'))) {
    const t = sel.match(/\[data-theme="(\w+)"\]/);
    if (t) themes[t[1]] = {...(themes[t[1]] || {}), ...vars};
    else if (sel === ':root') Object.assign(base, vars);
  }
  for (const {sel, vars} of blocks(read('css/accents.css'))) {
    const a = sel.match(/^\[data-accent="(\w+)"\](?:\[data-theme="(\w+)"\])?$/);
    if (!a) continue;
    (accents[a[1]] ||= {})[a[2] || 'warm'] = vars;
  }
  return {base, themes, accents};
}

export const isColor = (v) => /^(#|rgba?\()/.test(v);

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
