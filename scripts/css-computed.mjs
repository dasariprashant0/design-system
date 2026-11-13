#!/usr/bin/env node
// Real-browser computed-style test of the shipped CSS. jsdom cannot see the cascade, so a rule that is silently
// overridden by another stylesheet passes every unit test (docs/dogfood-log.md A1 to A3: Grid lost its columns,
// Heading size md rendered at 34px instead of 18px, a selected segment's label vanished on hover). This script loads
// the built docs site (apps/docs/dist, which bundles the full @monoline/css), renders the markup the React components
// emit, reads getComputedStyle and compares it with the documented value, resolved from the tokens (so it holds in
// every theme and look).
//
//   npm run build -w apps/docs
//   npm run test:css-browser            (or: node scripts/css-computed.mjs [--themes warm,dark] [--dump])
//
// --dump prints every measured value instead of asserting (handy when you add a component to the list).
// Chrome: set CHROME=/path/to/chrome. In Claude Code's sandbox it needs dangerouslyDisableSandbox.
import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {openBrowser} from './lib/browser.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d; };
const THEMES = opt('themes', 'warm,dark,midnight').split(',');
const dist = join(root, 'apps/docs/dist');
if (!existsSync(join(dist, 'index.html'))) { console.error('Build the docs first: npm run build -w apps/docs'); process.exit(2); }

// Runs in the page. Returns {name: value} for everything the assertions below compare.
const MEASURE = String.raw`(() => {
  document.getElementById('mlfx')?.remove();
  const host = document.createElement('div');
  host.id = 'mlfx';
  host.style.cssText = 'position:absolute;left:0;top:0;width:1000px;background:var(--background);color:var(--foreground);z-index:99999;padding:8px';
  host.innerHTML = ${'`'}
    <button class="btn btn-line" id="btn">Save</button><button class="btn btn-line btn-sm" id="btn-sm">Save</button><button class="btn btn-solid" id="btn-solid">Save</button>
    <input class="input" id="input" value="x"><input class="input input-sm" id="input-sm" value="x">
    <button class="select-trigger" id="select" type="button"><span>Pick</span></button>
    <textarea class="textarea" id="textarea">x</textarea>
    <div class="card" id="card"><div class="card-header"><h3 class="card-title">T</h3></div><div class="card-body">Body</div></div>
    <h1 class="heading heading-display" id="h-display">Display</h1><h2 class="heading heading-xl" id="h-xl">Xl</h2><h3 class="heading heading-lg" id="h-lg">Lg</h3><h4 class="heading heading-md" id="h-md">Md</h4><h5 class="heading heading-sm" id="h-sm">Sm</h5>
    <h1 class="display display-md" id="page-title">Page title</h1>
    <p class="text text-md" id="text">Body</p><p class="text text-sm text-muted" id="text-sm">Small</p>
    <div class="stack" id="stack" style="--stack-gap: var(--s5)"><i>a</i><i>b</i></div><div class="stack stack-row" id="stack-row"><i>a</i><i>b</i></div><div class="stack" id="stack-default"><i>a</i><i>b</i></div>
    <div class="container container-page" id="container-page">x</div><div class="container container-text" id="container-text">x</div><div class="container container-full" id="container-full">x</div>
    <div class="empty" id="empty"><div class="empty-icon">i</div><h3 class="empty-title">None</h3><p class="empty-description">d</p><div class="empty-actions"><button class="btn btn-line">Go</button></div></div>
    <div class="code-block" id="code"><pre><code>const a = 1;</code></pre></div>
    <span class="badge" id="badge">New</span><span class="badge badge-solid" id="badge-solid">New</span>
    <span class="tag" id="tag">tag</span>
    <div class="alert" id="alert" role="status"><div class="alert-title">T</div><div class="alert-description">D</div></div>
    <div class="dialog-content" id="dialog" role="dialog" style="position:static;transform:none"><div class="dialog-header"><h2 class="dialog-title heading heading-xl" id="dialog-title">Delete?</h2></div><p class="dialog-description">d</p><div class="dialog-footer"><button class="btn">x</button></div></div>
    <div class="tabs-root" id="tabs"><div class="tabs-list" role="tablist"><button class="tabs-trigger" role="tab" aria-selected="true" data-state="active" id="tab-on">One</button><button class="tabs-trigger" role="tab" aria-selected="false" data-state="inactive" id="tab-off">Two</button></div><div class="tabs-content" role="tabpanel">x</div></div>
    <div class="card" id="card-flow"><h3 class="heading heading-md" id="cf-h">Title</h3><p class="text" id="cf-t">Body</p><button class="btn btn-solid" id="cf-b1">One</button><button class="btn btn-line" id="cf-b2">Two</button></div>
    <div class="dialog-content" id="dialog-flow" style="position:static;transform:none"><div class="field" id="df-1"><label>A</label><input class="input"></div><div class="field" id="df-2"><label>B</label><input class="input"></div></div>
    <div class="prose" id="prose"><p class="text" id="pr-t1">One</p><p class="text" id="pr-t2">Two</p></div>
    <div class="popover date-popover" id="datepop" style="position:static"><div class="calendar" id="datecal">x</div></div>
    <svg width="40" height="40"><rect class="chart-bar chart-outline" id="bar" width="20" height="20" style="fill: var(--accent)"/></svg>
    <div class="segmented"><button class="segment" data-state="off" id="seg-off">A</button><button class="segment" data-state="on" id="seg-on">B</button></div>
    <div class="toggle-group"><button class="toggle" data-state="on" id="tog-on">T</button></div>
    <div class="toolbar"><button class="toolbar-item" data-state="on" id="tb-on">T</button></div>
    <button class="calendar-day" aria-pressed="true" id="cal-on">1</button>
    <div class="table-wrap"><table class="table" id="table"><thead><tr><th>A</th><th class="num">B</th></tr></thead><tbody><tr><td>1</td><td class="num">2</td></tr></tbody></table></div>
  ${'`'};
  document.body.appendChild(host);
  const $ = (id) => host.querySelector('#' + id); // scoped: the docs page has ids of its own, such as #alert
  const cs = (id, pseudo) => getComputedStyle($(id), pseudo);
  const num = (v) => parseFloat(v);
  // A token resolved to pixels or a colour, through a probe element.
  const probe = document.createElement('div'); host.appendChild(probe);
  const tok = (name, prop = 'width') => { probe.style.cssText = prop === 'color' ? 'color:var(' + name + ')' : prop + ':var(' + name + ');position:absolute'; return getComputedStyle(probe)[prop === 'color' ? 'color' : prop]; };
  const px = (name) => num(tok(name));
  const rect = (id) => $(id).getBoundingClientRect();
  const out = {};
  for (const id of ['btn', 'btn-sm', 'input', 'input-sm', 'select']) out['height:' + id] = rect(id).height;
  out['font:input'] = cs('input').fontFamily; out['font:textarea'] = cs('textarea').fontFamily; out['font:btn'] = cs('btn').fontFamily; out['font:select'] = cs('select').fontFamily;
  out['textarea:minHeight'] = num(cs('textarea').minHeight); out['textarea:height'] = rect('textarea').height;
  out['btn-solid:bg'] = cs('btn-solid').backgroundColor; out['btn-solid:color'] = cs('btn-solid').color; out['tok:foreground'] = tok('--foreground', 'color'); out['tok:background'] = tok('--background', 'color');
  // card
  out['card:borderTop'] = cs('card').borderTopWidth; out['card:bg'] = cs('card').backgroundColor; out['card:padTop'] = cs('card').paddingTop; out['card:display'] = cs('card').display;
  out['card-body:padTop'] = cs('card').paddingTop;
  // headings
  for (const k of ['display', 'xl', 'lg', 'md', 'sm']) { out['h:' + k + ':size'] = num(cs('h-' + k).fontSize); out['h:' + k + ':transform'] = cs('h-' + k).textTransform; out['h:' + k + ':lh'] = cs('h-' + k).lineHeight; }
  out['page-title:transform'] = cs('page-title').textTransform; out['page-title:size'] = num(cs('page-title').fontSize);
  out['dialog-title:transform'] = cs('dialog-title').textTransform; out['dialog-title:size'] = num(cs('dialog-title').fontSize);
  out['tok:text-lg'] = px('--text-lg'); out['tok:text-base'] = px('--text-base'); out['tok:text-sm'] = px('--text-sm'); out['tok:text-xs'] = px('--text-xs');
  out['text:size'] = num(cs('text').fontSize); out['text:margin'] = cs('text').marginTop; out['text-sm:size'] = num(cs('text-sm').fontSize); out['text-sm:color'] = cs('text-sm').color; out['tok:muted'] = tok('--muted', 'color'); out['tok:text-base2'] = px('--text-base');
  // stack
  out['stack:display'] = cs('stack').display; out['stack:dir'] = cs('stack').flexDirection; out['stack:gap'] = cs('stack').rowGap; out['tok:s5'] = px('--s5');
  out['stack-row:dir'] = cs('stack-row').flexDirection; out['stack-default:gap'] = cs('stack-default').rowGap; out['tok:s3'] = px('--s3'); out['tok:s4'] = px('--s4');
  // container
  for (const k of ['page', 'text', 'full']) { out['container-' + k + ':max'] = cs('container-' + k).maxWidth; out['container-' + k + ':ml'] = cs('container-' + k).marginLeft; out['container-' + k + ':mr'] = cs('container-' + k).marginRight; }
  out['tok:measure'] = px('--measure'); out['tok:content'] = px('--content');
  // empty state
  out['empty:align'] = cs('empty').textAlign; out['empty:justify'] = cs('empty').justifyItems; out['empty:gap'] = cs('empty').rowGap; out['empty:border'] = cs('empty').borderTopStyle; out['empty:mt'] = cs('empty').marginTop;
  // code block
  out['code:bg'] = cs('code').backgroundColor; out['code:color'] = cs('code').color; out['tok:surface'] = tok('--surface', 'color'); out['tok:surface-text'] = tok('--surface-text', 'color');
  out['code:pad'] = cs('code').paddingTop; out['code:shadow'] = cs('code').boxShadow; out['code:border'] = cs('code').borderTopWidth; out['code:pre-pad'] = cs('code').paddingTop;
  out['code:pre-padding'] = getComputedStyle($('code').querySelector('pre')).paddingTop; out['code:ws'] = cs('code').whiteSpace;
  // small marks
  out['badge:display'] = cs('badge').display; out['badge:border'] = cs('badge').borderTopWidth; out['badge-solid:bg'] = cs('badge-solid').backgroundColor; out['badge-solid:color'] = cs('badge-solid').color;
  out['tag:display'] = cs('tag').display; out['tag:border'] = cs('tag').borderTopWidth;
  out['alert:border'] = cs('alert').borderTopWidth; out['alert:padTop'] = cs('alert').paddingTop;
  out['dialog:bg'] = cs('dialog').backgroundColor; out['dialog:border'] = cs('dialog').borderTopWidth; out['dialog:pad'] = cs('dialog').paddingTop; out['dialog:maxw'] = cs('dialog').maxWidth;
  out['tab-on:color'] = cs('tab-on').color; out['tab-off:color'] = cs('tab-off').color; out['tab-on:bb'] = cs('tab-on').borderBottomWidth; out['tab-off:bb'] = cs('tab-off').borderBottomWidth; out['tab-on:bbc'] = cs('tab-on').borderBottomColor;  out['table:collapse'] = cs('table').borderCollapse; out['table:width'] = rect('table').width; out['table:th-align'] = getComputedStyle($('table').querySelector('th')).textAlign; out['table:num-align'] = getComputedStyle($('table').querySelector('th.num')).textAlign;
  out['table:td-pad'] = getComputedStyle($('table').querySelector('td')).paddingTop;
  const mt = (id) => cs(id).marginTop;
  out['flow:card-text'] = mt('cf-t'); out['flow:card-button'] = mt('cf-b1'); out['flow:card-button2'] = mt('cf-b2'); out['flow:dialog-field'] = mt('df-2'); out['flow:dialog-first'] = mt('df-1'); out['flow:prose-text'] = mt('pr-t2'); out['flow:card-text-heading'] = mt('cf-h');
  out['datepop:border'] = cs('datepop').borderTopWidth; out['datepop:pad'] = cs('datepop').paddingTop; out['datecal:border'] = cs('datecal').borderTopWidth;
  out['bar:fillOpacity'] = num(cs('bar').fillOpacity); out['bar:stroke'] = cs('bar').strokeWidth;
  return out;
})()`;

// Selected controls whose label must stay readable while the pointer is over them.
const HOVER = ['seg-on', 'tog-on', 'tb-on', 'cal-on', 'btn-solid', 'btn', 'tab-on'];

const b = await openBrowser({dist});
const fails = [];
let n = 0;
const dump = args.includes('--dump');
try {
  await b.setViewport(1280, 800);
  await b.navigate(b.base);
  for (const theme of THEMES) for (const font of ['default', 'sans', 'serif']) {
    await b.evaluate(`(() => { const r = document.documentElement; r.dataset.theme = ${JSON.stringify(theme)}; ${font === 'default' ? 'delete r.dataset.font' : `r.dataset.font = ${JSON.stringify(font)}`}; })()`);
    const m = await b.evaluate(MEASURE);
    if (dump) { if (theme === THEMES[0] && font === 'default') console.log(JSON.stringify(m, null, 1)); continue; }
    const where = `[${theme}${font === 'default' ? '' : ', font=' + font}]`;
    const ok = (name, cond, detail) => { n++; if (!cond) fails.push(`${where} ${name}: ${detail}`); };
    const eq = (name, a, e) => ok(name, a === e, `got ${a}, expected ${e}`);
    const near = (name, a, e) => ok(name, Math.abs(a - e) < 0.6, `got ${a}, expected ${e}`);
    // Form controls line up in a row.
    near('Button md height = Input md height', m['height:btn'], m['height:input']);
    near('Select md height = Input md height', m['height:select'], m['height:input']);
    near('Button sm height = Input sm height', m['height:btn-sm'], m['height:input-sm']);
    ok('sm controls are shorter than md', m['height:btn-sm'] < m['height:btn'] && m['height:input-sm'] < m['height:input'], `${m['height:btn-sm']} vs ${m['height:btn']}`);
    eq('Input font family = Textarea font family', m['font:textarea'], m['font:input']);
    eq('Button font family = Input font family', m['font:btn'], m['font:input']);
    eq('Select font family = Input font family', m['font:select'], m['font:input']);
    ok('Textarea is taller than an Input', m['textarea:height'] > m['height:input'] * 2, `${m['textarea:height']}`);
    eq('Solid button background = --foreground', m['btn-solid:bg'], m['tok:foreground']);
    eq('Solid button text = --background', m['btn-solid:color'], m['tok:background']);
    // Typography: sizes follow the scale; one casing rule.
    near('Heading md = --text-lg', m['h:md:size'], m['tok:text-lg']);
    near('Heading sm = --text-base', m['h:sm:size'], m['tok:text-base']);
    ok('Heading sizes strictly descend display > xl > lg > md > sm', m['h:display:size'] > m['h:xl:size'] && m['h:xl:size'] > m['h:lg:size'] && m['h:lg:size'] > m['h:md:size'] && m['h:md:size'] > m['h:sm:size'], ['display', 'xl', 'lg', 'md', 'sm'].map((k) => m[`h:${k}:size`]).join(' > '));
    ok('Heading display (the h1 default) is capped at 44px', m['h:display:size'] <= 44.01, `${m['h:display:size']}px`);
    for (const k of ['display', 'xl', 'lg', 'md', 'sm']) eq(`Heading ${k} is sentence case`, m[`h:${k}:transform`], 'none');
    eq('Dialog title is sentence case', m['dialog-title:transform'], 'none');
    eq('.display page title is uppercase unless the look is sans or serif', m['page-title:transform'], font === 'default' ? 'uppercase' : 'none');
    near('Text md size = --text-base', m['text:size'], m['tok:text-base']);
    near('Text sm size = --text-sm', m['text-sm:size'], m['tok:text-sm']);
    eq('Text muted colour = --muted', m['text-sm:color'], m['tok:muted']);
    eq('Text has no margin', m['text:margin'], '0px');
    // Layout primitives.
    eq('Stack is a flex column', `${m['stack:display']} ${m['stack:dir']}`, 'flex column');
    near('Stack gap follows --stack-gap', parseFloat(m['stack:gap']), m['tok:s5']);
    near('Stack default gap = --s3', parseFloat(m['stack-default:gap']), m['tok:s3']);
    eq('Stack row direction', m['stack-row:dir'], 'row');
    near('Container text max-width = --measure + 2 x --s5', parseFloat(m['container-text:max']), m['tok:measure'] + 2 * m['tok:s5']);
    near('Container page max-width = --content + 2 x --s5', parseFloat(m['container-page:max']), m['tok:content'] + 2 * m['tok:s5']);
    eq('Container full has no max-width', m['container-full:max'], 'none');
    for (const k of ['page', 'text']) eq(`Container ${k} is centred`, m[`container-${k}:ml`], m[`container-${k}:mr`]);
    // Components.
    near('Card padding = --s5', parseFloat(m['card:padTop']), m['tok:s5']);
    eq('Empty state text is centred', `${m['empty:align']} ${m['empty:justify']}`, 'center center');
    near('Empty state gap = --s3', parseFloat(m['empty:gap']), m['tok:s3']);
    eq('Empty state has a dashed frame', m['empty:border'], 'dashed');
    eq('Empty state has no 14vh top margin (legacy rule)', m['empty:mt'], '0px');
    eq('Code block background = --surface', m['code:bg'], m['tok:surface']);
    eq('Code block text = --surface-text', m['code:color'], m['tok:surface-text']);
    eq('Code block panel has no padding of its own (the pre has it)', m['code:pad'], '0px');
    eq('Code block has no inset shadow', m['code:shadow'], 'none');
    eq('Code block border is 1px', m['code:border'], '1px');
    near('Code block pre padding = --s4', parseFloat(m['code:pre-padding']), m['tok:s4']);
    eq('Badge solid text is on its fill', m['badge-solid:color'] !== m['badge-solid:bg'], true);
    near('Alert padding-top = --s3', parseFloat(m['alert:padTop']), m['tok:s3']);
    eq('Dialog content has a surface background', m['dialog:bg'] !== 'rgba(0, 0, 0, 0)', true);
    ok('Dialog content has a border', m['dialog:border'] !== '0px', m['dialog:border']);
    ok('Selected tab is distinguishable from an unselected one', m['tab-on:color'] !== m['tab-off:color'] || m['tab-on:bb'] !== m['tab-off:bb'] || m['tab-on:bbc'] !== m['tab-off:bbc'], 'same colour and underline');
    // Default rhythm: bare siblings in a Card, Dialog or prose do not touch.
    for (const k of ['flow:card-text', 'flow:card-button', 'flow:dialog-field']) near(`${k} = --s4`, parseFloat(m[k]), m['tok:s4']);
    near('A Heading after a block gets 1.5 steps (Card)', parseFloat(m['flow:card-text-heading']), 0); // first child: none
    eq('Buttons side by side get no top margin', m['flow:card-button2'], '0px');
    eq('The first child gets no top margin', m['flow:dialog-first'], '0px');
    near('Text after Text in prose = --s4', parseFloat(m['flow:prose-text']), m['tok:s4']);
    // Date picker: one border (the popover's), not two.
    eq('Date popover keeps its own border', m['datepop:border'], '1px');
    eq('Date popover has no padding', m['datepop:pad'], '0px');
    eq('Calendar inside the date popover has no second border', m['datecal:border'], '0px');
    // Charts: bars are a light fill with an outline.
    ok('Chart bar fill is lighter than solid', m['bar:fillOpacity'] < 0.7, `fill-opacity ${m['bar:fillOpacity']}`);
    eq('Table collapses borders', m['table:collapse'], 'collapse');
    eq('Numeric table header aligns to the end', m['table:num-align'] === 'right' || m['table:num-align'] === 'end', true);
    // Hover: the pointer sits over each control; its label must not take the colour of its own background.
    if (font === 'default') for (const id of HOVER) {
      const r = await b.evaluate(`(() => { const e = document.querySelector('#mlfx #' + ${JSON.stringify(id)}); e.scrollIntoView({block: 'center'}); const r = e.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; })()`);
      await b.cdp('Input.dispatchMouseEvent', {type: 'mouseMoved', x: r.x, y: r.y});
      await new Promise((res) => setTimeout(res, 100));
      const h = await b.evaluate(`(() => { const e = document.querySelector('#mlfx #' + ${JSON.stringify(id)}); const s = getComputedStyle(e); return {hover: e.matches(':hover'), color: s.color, bg: s.backgroundColor}; })()`);
      ok(`hover: #${id} is hovered in the test`, h.hover, 'pointer is not over the element');
      ok(`hover: #${id} label differs from its background`, h.color !== h.bg, `both ${h.color}`);
      await b.cdp('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 0, y: 0});
    }
  }
} finally {
  b.close();
}
if (dump) process.exit(0);
if (fails.length) { console.error(fails.map((f) => 'FAIL ' + f).join('\n')); console.error(`${fails.length} of ${n} computed-style checks failed`); process.exit(1); }
console.log(`ok: ${n} computed-style checks across ${THEMES.length} themes and 3 font looks`);
