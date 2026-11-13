// Pure helpers for the registry fields that are not props: the CSS classes and data attributes a component's
// stylesheets select, the usage snippet, and related components. Used by gen-registry.mjs; tested by check-registry.test.mjs.

/** Remove /* comments *\/ so their words never count as selectors. */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Classes and data attributes that the stylesheets select (never the declarations).
 * -> {classes: ['btn', 'btn-solid'], dataAttributes: [{name: 'data-state', values: ['open', 'closed']}]}
 * Order is the order of first appearance; `values` are the quoted attribute values seen (may be empty).
 */
export function cssFacts(cssTexts) {
  const classes = [];
  const data = new Map();
  for (const css of cssTexts) {
    const src = stripComments(css);
    const rule = /([^{}]+)\{/g;
    let m;
    while ((m = rule.exec(src))) {
      // Keep only the selector: drop anything before the last ';' (leftover @import lines).
      const selector = m[1].split(';').pop().trim();
      if (!selector || selector.startsWith('@')) continue;
      const bare = selector.replace(/"[^"]*"|'[^']*'/g, '');
      for (const c of bare.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)) if (!classes.includes(c[1])) classes.push(c[1]);
      for (const a of selector.matchAll(/\[data-([\w-]+)(?:[~|^$*]?=\s*["']?([^"'\]]*)["']?)?\]/g)) {
        const name = `data-${a[1]}`;
        const entry = data.get(name) ?? {name, values: []};
        if (a[2] !== undefined && !entry.values.includes(a[2])) entry.values.push(a[2]);
        data.set(name, entry);
      }
    }
  }
  return {classes, dataAttributes: [...data.values()]};
}

/**
 * Keep only names the package really exports in the `@monoline/react` import lines of a snippet. The demo
 * extractor also brings in same-file helpers' names (a demo's own `type Demo`), which are not public.
 */
export function pruneImports(code, publicNames) {
  return code.split('\n').flatMap((line) => {
    const m = /^import (.*) from '@monoline\/react';$/.exec(line);
    if (!m) return [line];
    const names = m[1].replace(/[{}]/g, '').split(',').map((s) => s.trim()).filter(Boolean);
    const kept = names.filter((n) => publicNames.has(n.replace(/^type /, '').split(' as ')[0]));
    return kept.length ? [`import {${kept.join(', ')}} from '@monoline/react';`] : [];
  }).join('\n');
}

/** Usage: the first demo's standalone snippet when there is one, else the import plus a bare element or call. */
export function usageFor({demo, importLine, symbol, isHook, publicNames}) {
  if (demo?.code) return pruneImports(demo.code, publicNames);
  if (isHook) return importLine;
  return `${importLine}\n\n<${symbol} />`;
}

/**
 * Related components: explicit `related` and `uses` from meta.json (only names in the registry), else up to
 * three siblings from the same category. Never the component itself.
 */
export function relatedFor({meta, known, siblings}) {
  const explicit = [...(meta.related ?? []), ...(meta.uses ?? [])].filter((n) => known.has(n) && n !== meta.name);
  const picked = [...new Set(explicit)];
  if (picked.length) return picked;
  return siblings.filter((n) => n !== meta.name).slice(0, 3);
}
