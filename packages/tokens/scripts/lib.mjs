// Turns Monoline's CSS token sources into design-tool files. No dependencies.
// Input: packages/css/src/{tokens,accents,options}.css. Output: see build.mjs.

export const THEMES = ['warm', 'dark', 'midnight'];
const ACCENT_VARS = ['--accent', '--accent-text', '--accent-2', '--on-accent'];

// Every `selector { --custom: value; }` block, in source order. Only custom properties are kept.
export function cssBlocks(css) {
  const out = [];
  for (const [, selector, body] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = [...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]);
    if (decls.length) out.push({selector: selector.trim().replace(/\s+/g, ' '), decls});
  }
  return out;
}

const attrs = (selector) => Object.fromEntries([...selector.matchAll(/\[data-(\w+)="([\w-]+)"\]/g)].map(([, k, v]) => [k, v]));

// Sorts the CSS into {base, themes, accents, options}. accents[name] has `generic` (the bare
// [data-accent] rule, which is the warm look) plus one object per theme that overrides it.
export function parseSources({tokens, accents, options}) {
  const src = {base: {}, themes: {}, accents: {}, options: {}};
  for (const {selector, decls} of cssBlocks(tokens)) {
    const theme = attrs(selector).theme;
    if (theme) Object.assign((src.themes[theme] ??= {}), Object.fromEntries(decls));
    else if (selector === ':root') Object.assign(src.base, Object.fromEntries(decls));
    else throw new Error(`tokens.css: unexpected selector "${selector}"`);
  }
  for (const {selector, decls} of cssBlocks(accents)) {
    const {accent, theme = 'generic'} = attrs(selector);
    if (!accent) throw new Error(`accents.css: no data-accent in "${selector}"`);
    ((src.accents[accent] ??= {})[theme] = Object.fromEntries(decls));
  }
  for (const {selector, decls} of cssBlocks(options)) {
    const m = selector.match(/^\[data-(\w+)="([\w-]+)"\]$/); // descendant rules hold no custom properties
    if (m) ((src.options[m[1]] ??= {})[m[2]] = Object.fromEntries(decls));
  }
  return src;
}

// Custom properties in effect for a theme and accent, the way the cascade applies them.
export function themeEnv(src, theme, accent) {
  const a = src.accents[accent] ?? {};
  return {...src.base, ...src.themes[theme], ...(a.generic ?? {}), ...(a[theme] ?? {})};
}

// Expands var(--x) against env. Everything else is left as written.
export function resolve(value, env, depth = 0) {
  if (depth > 10) throw new Error(`reference cycle at ${value}`);
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => {
    if (!(name in env)) throw new Error(`undefined token ${name}`);
    return resolve(env[name], env, depth + 1);
  });
}

const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
// Resolved colour -> [r, g, b, a] in 0-255 and 0-1, or null when it is not a plain colour (gradients).
export function toRgba(value) {
  let m;
  if ((m = value.match(/^color-mix\(in srgb, (#[0-9a-f]{6}) ([\d.]+)%, transparent\)$/i))) return [...hex(m[1]), Number(m[2]) / 100];
  if ((m = value.match(/^#[0-9a-f]{6}$/i))) return [...hex(value), 1];
  if ((m = value.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/))) return [+m[1], +m[2], +m[3], +m[4]];
  return null;
}

// Resolved length -> px number, for px literals and calc(a + b) of them. Null for anything else (clamp, ch).
export function toPx(value) {
  const calc = value.match(/^calc\((.+)\)$/);
  const nums = (calc ? calc[1].split(' + ') : [value]).map((p) => p.match(/^(-?[\d.]+)(px)?$/)?.[1]); // a bare 0 is a length too
  return nums.every((n) => n !== undefined) ? nums.reduce((s, n) => s + Number(n), 0) : null;
}

// Group and leaf name for a custom property, e.g. --control-sm -> control / sm.
const GROUPS = [
  ['code', /^--code-/],
  ['zIndex', /^--z-/],
  ['control', /^--control-/],
  ['space', /^--s\d$/],
  ['type', /^--(font|text|display)-/],
  ['motion', /^--(ease|fast|base|slow)$/],
  ['layout', /^--(side|measure|content|window-pad)$/],
  ['radius', /^--(radius|round)$/],
  ['color', /^--/],
];
const PREFIX = {code: '--code-', zIndex: '--z-', control: '--control-'};
export function classify(name) {
  const group = GROUPS.find(([, re]) => re.test(name))[0];
  return {group, leaf: name.slice((PREFIX[group] ?? '--').length)};
}
export const cssName = (group, leaf) => (PREFIX[group] ?? '--') + leaf;

const typeOf = (group, value) => {
  if (group === 'color' || group === 'code') return /gradient/.test(value) ? {} : {$type: 'color'};
  return /^-?[\d.]+px$/.test(value) ? {$type: 'dimension'} : {};
};

// The W3C design-token tree: base (the :root block), theme.<name>, accent.<name>.<theme>, option.<kind>.<value>.
export function buildTokens(src) {
  const tree = (decls) => {
    const t = {};
    for (const [name, value] of Object.entries(decls)) {
      const {group, leaf} = classify(name);
      (t[group] ??= {})[leaf] = {$value: value, ...typeOf(group, value)};
    }
    return t;
  };
  const accentNames = Object.keys(src.accents);
  return {
    $description: 'Monoline design tokens, generated from packages/css/src/{tokens,accents,options}.css. Edit the CSS and run node packages/tokens/scripts/build.mjs.',
    base: tree(src.base),
    theme: Object.fromEntries(THEMES.map((t) => [t, tree(src.themes[t])])),
    accent: Object.fromEntries(accentNames.map((a) => [a, Object.fromEntries(THEMES.map((t) => {
      const env = themeEnv(src, t, a);
      return [t, tree(Object.fromEntries(ACCENT_VARS.map((n) => [n, resolve(env[n], env)])))];
    }))])),
    option: Object.fromEntries(Object.entries(src.options).map(([kind, values]) => [kind, Object.fromEntries(Object.entries(values).map(([v, decls]) => [v, tree(decls)]))])),
  };
}

// Flat [cssName, value] pairs of a tree from buildTokens (group -> leaf -> {$value}).
export function flatten(tree) {
  return Object.entries(tree).flatMap(([group, leaves]) => Object.entries(leaves).map(([leaf, node]) => [cssName(group, leaf), node.$value]));
}

// Re-export as CSS. Same cascade as the source: base, then themes, then accents, then options.
export function tokensCss(json) {
  const block = (selector, tree) => `${selector} {\n${flatten(tree).map(([n, v]) => `  ${n}: ${v};`).join('\n')}\n}\n`;
  const parts = [
    '/* Generated by packages/tokens/scripts/build.mjs from packages/css/src. Do not edit. */',
    block(':root', json.base),
    block(':root, [data-theme="warm"]', json.theme.warm),
    block('[data-theme="dark"]', json.theme.dark),
    block('[data-theme="midnight"]', json.theme.midnight),
  ];
  for (const a of Object.keys(json.accent)) {
    parts.push(block(`[data-accent="${a}"]`, json.accent[a].warm));
    parts.push(block(`[data-accent="${a}"][data-theme="dark"]`, json.accent[a].dark));
    parts.push(block(`[data-accent="${a}"][data-theme="midnight"]`, json.accent[a].midnight));
  }
  for (const [kind, values] of Object.entries(json.option)) for (const [v, tree] of Object.entries(values)) parts.push(block(`[data-${kind}="${v}"]`, tree));
  return parts.join('\n');
}

// Figma variables: four collections. Colours have a mode per theme and accent; the others have
// a mode per option. Shape: {collections:[{name, modes, variables:[{name, resolvedType, valuesByMode}]}]}.
// Colours are {r,g,b,a} in 0-1. Not exported (Figma has no type for them): motion, z-index, gradients, ch lengths.
export function figmaVariables(src) {
  const skipped = new Set();
  const accents = Object.keys(src.accents);
  const colourModes = THEMES.flatMap((t) => accents.map((a) => ({name: `${t} / ${a}`, t, a})));
  const colourNames = [...new Set([...Object.keys(src.base), ...Object.keys(src.themes.warm)])].filter((n) => ['color', 'code'].includes(classify(n).group));
  const colourVars = [];
  for (const name of colourNames) {
    const {group, leaf} = classify(name);
    const valuesByMode = {};
    let ok = true;
    for (const m of colourModes) {
      const env = themeEnv(src, m.t, m.a);
      const rgba = toRgba(resolve(env[name], env));
      if (!rgba) { ok = false; break; }
      valuesByMode[m.name] = {r: +(rgba[0] / 255).toFixed(6), g: +(rgba[1] / 255).toFixed(6), b: +(rgba[2] / 255).toFixed(6), a: +rgba[3].toFixed(6)};
    }
    if (ok) colourVars.push({name: `${group}/${leaf}`, resolvedType: 'COLOR', valuesByMode});
    else skipped.add(name);
  }

  // Lengths and strings for a set of modes: env is the base with that option applied.
  const scalarCollection = (name, modes, envFor, groups) => {
    const names = Object.keys(src.base).filter((n) => groups.includes(classify(n).group));
    const variables = names.map((n) => {
      const {group, leaf} = classify(n);
      const values = modes.map((m) => { const env = envFor(m); return resolve(env[n], env); });
      const px = values.map(toPx);
      const isNumber = px.every((p) => p !== null);
      return {name: `${group}/${leaf}`, resolvedType: isNumber ? 'FLOAT' : 'STRING', valuesByMode: Object.fromEntries(modes.map((m, i) => [m, isNumber ? px[i] : values[i]]))};
    });
    return {name, modes, variables};
  };
  const density = ['comfortable', 'compact', 'spacious'];
  const radii = ['square', 'soft', 'round'];
  const fonts = ['mono', 'sans', 'serif'];
  const dens = (d) => src.options.density?.[d] ?? {};
  const fontDecls = (f) => (f === 'mono' ? {} : src.options.font[f]);
  const typeModes = fonts.flatMap((f) => density.map((d) => `${f} / ${d}`));
  const typeEnv = (m) => { const [f, d] = m.split(' / '); return {...src.base, ...fontDecls(f), ...dens(d)}; };

  const collections = [
    {name: 'Colors', modes: colourModes.map((m) => m.name), variables: colourVars},
    scalarCollection('Spacing', density, (d) => ({...src.base, ...dens(d)}), ['space', 'control', 'layout']),
    scalarCollection('Radius', radii, (r) => ({...src.base, ...(src.options.radius?.[r] ?? {})}), ['radius']),
    scalarCollection('Typography', typeModes, typeEnv, ['type']),
  ];
  for (const n of Object.keys(src.base)) if (['motion', 'zIndex'].includes(classify(n).group)) skipped.add(n);
  return {$format: 'monoline-figma-variables', $skipped: [...skipped].sort(), collections};
}

// TypeScript types for the token names and themes.
export function typesDts(json) {
  const leaves = (tree, group) => Object.keys(tree[group] ?? {});
  const union = (names) => names.map((n) => JSON.stringify(n)).join(' | ');
  const color = [...new Set([...leaves(json.base, 'color'), ...leaves(json.theme.warm, 'color'), ...leaves(json.base, 'code').map((c) => `code-${c}`)])];
  const accents = Object.keys(json.accent);
  const fonts = ['mono', ...Object.keys(json.option.font)];
  return `// Generated by packages/tokens/scripts/build.mjs. Do not edit.
export declare const themes: readonly [${THEMES.map((t) => JSON.stringify(t)).join(', ')}];
export type Theme = ${union(THEMES)};
export declare const accents: readonly [${accents.map((a) => JSON.stringify(a)).join(', ')}];
export type Accent = ${union(accents)};
export declare const densities: readonly ["comfortable", "compact", "spacious"];
export type Density = "comfortable" | "compact" | "spacious";
export declare const fonts: readonly [${fonts.map((f) => JSON.stringify(f)).join(', ')}];
export type Font = ${union(fonts)};
export declare const radii: readonly ["square", "soft", "round"];
export type Radius = "square" | "soft" | "round";

/** Colour tokens: theme colours, accent colours and derived lines and washes (without the leading --). */
export type ColorToken = ${union(color)};
export type SpaceToken = ${union(leaves(json.base, 'space'))};
export type ControlToken = ${union(leaves(json.base, 'control'))};
export type LayoutToken = ${union(leaves(json.base, 'layout'))};
export type TypeToken = ${union(leaves(json.base, 'type'))};
export type RadiusToken = ${union(leaves(json.base, 'radius'))};
export type MotionToken = ${union(leaves(json.base, 'motion'))};
export type ZIndexToken = ${union(leaves(json.base, 'zIndex'))};
export type CodeToken = ${union(leaves(json.base, 'code').map((c) => `code-${c}`))};

/** Every custom property the tokens define, with its leading --. */
export type CssVariable = ${union([...new Set(flatten(json.base).concat(flatten(json.theme.warm)).concat(Object.values(json.option).flatMap((o) => Object.values(o).flatMap(flatten))).map(([n]) => n))])};
`;
}
