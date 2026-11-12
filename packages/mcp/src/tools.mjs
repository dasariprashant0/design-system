// Pure helpers for the tools: ranking, props extraction, install closure, page composition.

const words = (s) => String(s).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Rank components for a query. Name beats title beats keywords beats prop names beats category beats description.
 * Prop names come from the registry's `propNames` (exact word match, e.g. "asChild", "selected").
 */
export function rank(components, query) {
  const q = words(query);
  const phrase = q.join('-');
  const out = [];
  for (const c of components) {
    const name = c.name.toLowerCase(), title = (c.title ?? '').toLowerCase(), desc = (c.description ?? '').toLowerCase();
    const kws = (c.keywords ?? []).map((k) => k.toLowerCase());
    const props = (c.propNames ?? []).map((p) => p.toLowerCase());
    let score = name === phrase ? 100 : 0;
    for (const t of q) {
      if (name === t) score += 50;
      else if (name.split('-').includes(t)) score += 40;
      else if (name.startsWith(t)) score += 30;
      else if (name.includes(t)) score += 20;
      if (title.includes(t)) score += 15;
      if (kws.includes(t)) score += 25;
      else if (kws.some((k) => k.includes(t))) score += 10;
      if (props.includes(t)) score += 12;
      if ((c.category ?? '').includes(t)) score += 5;
      if (desc.includes(t)) score += 3;
    }
    if (score > 0) out.push({c, score, matchedProps: (c.propNames ?? []).filter((p) => q.includes(p.toLowerCase()))});
  }
  return out.sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name));
}

/**
 * Props in the registry's shape: [{name, props: [{name, type, optional, default, description}]}].
 * Registries built before props were in the registry only have source: those are read with propsSummary.
 */
export function propGroupsOf(c) {
  if (Array.isArray(c.props)) return c.props;
  return propsSummary(c.source ?? []).map((g) => ({
    name: g.interface,
    props: g.props.map((p) => ({name: p.name, type: p.type, optional: !p.required, default: null, description: p.doc ?? ''})),
  }));
}

/** Pull `export interface FooProps { ... }` members out of component source: name, type, optional, doc. */
export function propsSummary(files) {
  const out = [];
  for (const f of files) {
    if (!/\.tsx?$/.test(f.path) || /\.(test|demo)\./.test(f.path)) continue;
    const re = /export (?:interface (\w+Props)[^{]*|type (\w+Props)\s*=\s*[^{]*)\{/g;
    let m;
    while ((m = re.exec(f.content))) {
      let depth = 1, i = re.lastIndex;
      while (i < f.content.length && depth) { const ch = f.content[i++]; if (ch === '{') depth++; else if (ch === '}') depth--; }
      const body = f.content.slice(re.lastIndex, i - 1);
      const props = [];
      let doc = '', d = 0;
      for (const raw of body.split('\n')) {
        const line = raw.trim();
        if (d === 0) {
          const dm = /^\/\*\*\s*(.*?)\s*\*\/$/.exec(line);
          if (dm) { doc = dm[1]; continue; }
          const pm = /^(?:readonly )?(['"]?[\w-]+['"]?)(\??):\s*(.*?);?$/.exec(line);
          if (pm) { props.push({name: pm[1].replace(/['"]/g, ''), required: !pm[2], type: pm[3].replace(/;$/, ''), ...(doc && {doc})}); doc = ''; }
          else if (line && !line.startsWith('*') && !line.startsWith('/*') && !line.startsWith('//')) doc = '';
        }
        d += (line.match(/[{(]/g) ?? []).length - (line.match(/[})]/g) ?? []).length;
        if (d < 0) d = 0;
      }
      out.push({interface: m[1] ?? m[2], props});
    }
  }
  return out;
}

/** The npx line for the requested names plus what they pull in (the registry's `uses`) and npm packages. */
export async function installInfo(reg, wanted) {
  const seen = new Map();
  const queue = [...wanted];
  while (queue.length) {
    const n = queue.shift();
    if (seen.has(n)) continue;
    const c = await reg.component(n);
    seen.set(n, c);
    queue.push(...(c.uses ?? []));
  }
  const dependencies = {};
  for (const c of seen.values()) Object.assign(dependencies, c.dependencies);
  const alsoCopied = [...seen.keys()].filter((n) => !wanted.includes(n));
  const pkgs = Object.entries(dependencies).map(([k, v]) => `${k}@${v}`);
  return {
    command: `npx monoline add ${wanted.join(' ')}`,
    alsoCopied,
    dependencies,
    npmInstall: ['npm install react', ...(pkgs.length ? [`npm install ${pkgs.join(' ')}`] : [])],
    css: [...new Set([...seen.values()].flatMap((c) => (c.css ?? []).map((f) => f.path.split('/').pop())))],
    note: 'Also import tokens.css, base.css and accents.css from @monoline/css once. Each added component prints its own CSS import.',
  };
}

// keyword -> components. First match order is the page order.
const RULES = [
  [/landing|marketing|home ?page|hero|startup|saas|product page/, ['block-hero', 'block-feature-grid', 'block-testimonials', 'block-cta', 'block-footer']],
  [/pricing|plans?|subscription|tiers?/, ['block-pricing']],
  [/testimonial|review|quote|social proof/, ['block-testimonials']],
  [/footer/, ['block-footer']],
  [/log ?in|sign ?in|auth/, ['block-login']],
  [/sign ?up|register|registration|onboard/, ['block-signup']],
  [/dashboard|admin|analytics|metrics|kpi|overview|stats?/, ['block-dashboard-shell', 'stat', 'card', 'line-chart', 'data-table']],
  [/settings|preferences|account|profile/, ['block-settings-form', 'switch', 'field']],
  [/empty|no results|nothing here|404|not found/, ['block-empty-page', 'empty-state']],
  [/form|input|checkout|contact|survey/, ['form', 'field', 'input', 'button']],
  [/table|list of|records|orders|users|inventory/, ['data-table']],
  [/chart|graph|trend|revenue/, ['line-chart', 'bar-chart']],
  [/modal|dialog|confirm/, ['dialog']],
  [/tabs?|views?/, ['tabs']],
  [/menu|navigation|navbar|nav\b|sidebar/, ['navigation-menu', 'dropdown-menu']],
  [/search|command|palette|spotlight/, ['command']],
  [/notif|toast|message/, ['toast', 'alert']],
  [/calendar|schedule|booking|date/, ['calendar', 'date-picker']],
  [/upload|file|attach|image/, ['file-upload']],
  [/faq|accordion|help/, ['accordion']],
  [/steps?|wizard|progress|checkout/, ['stepper', 'progress']],
  [/blog|article|docs|documentation|post/, ['heading', 'text', 'code-block', 'breadcrumb']],
];

/** Keyword mapping from a description to existing registry entries. Always adds layout and the main action. */
export function compose(description, all) {
  const d = description.toLowerCase();
  const chosen = new Map();
  const add = (n, why) => { if (all.has(n) && !chosen.has(n)) chosen.set(n, why); };
  add('container', 'page layout');
  for (const [re, list] of RULES) {
    const hit = re.exec(d);
    if (hit) for (const n of list) add(n, `matches "${hit[0].trim()}"`);
  }
  // Fall back to ranked search over the registry when the rules found nothing specific.
  if (chosen.size <= 1) for (const {c} of rank([...all.values()], description).slice(0, 5)) add(c.name, 'search match');
  add('heading', 'page title');
  add('button', 'main action');
  return [...chosen].map(([name, reason]) => {
    const c = all.get(name);
    return {name, title: c.title, category: c.category, reason, import: c.import};
  });
}
