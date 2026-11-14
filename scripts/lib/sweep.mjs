// State sweep shared by scripts/audit.mjs (docs) and scripts/audit-examples.mjs: what axe on a still page cannot see.
//   await installSweep(cdp)                                   once per browser session (adds window.__mlcheck on every page)
//   const issues = await sweepState({cdp, evaluate, sleep})   [{kind, detail}] for the current state of the page
//
// For the current state (a page, or an open dialog, drawer, menu, select, popover, tooltip, toast, command palette or
// date picker: when an overlay is open only the topmost overlay is checked) it:
//   1. computes the contrast of every visible text node (own colour over the real stacked background colours) and
//      reports text under WCAG AA (4.5:1, 3:1 for large text);
//   2. reports text boxes that overlap other text boxes;
//   3. moves the real mouse over every distinct control and re-checks its contrast (a hover colour equal to the
//      background shows up as a ratio of 1:1);
//   4. focuses every distinct control from the keyboard and checks that the focus changes something visible and that
//      contrast still holds.
// Distinct = same tag, role, classes and text, so a table with 40 identical "Edit" buttons costs one hover.

const PAGE = String.raw`(() => {
  if (window.__mlcheck) return;
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  let ctx = null; const cache = new Map();
  const rgba = (c) => {
    if (cache.has(c)) return cache.get(c);
    ctx ??= cv.getContext('2d', {willReadFrequently: true});
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data; const v = [d[0], d[1], d[2], d[3] / 255]; cache.set(c, v); return v;
  };
  const over = (f, b) => [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
  const lum = (c) => { const [r, g, b] = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const sig = (e) => e.tagName.toLowerCase() + (e.getAttribute('role') ? '[' + e.getAttribute('role') + ']' : '') + [...e.classList].slice(0, 2).map((c) => '.' + c).join('');
  const text = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && e.checkVisibility({checkOpacity: true, checkVisibilityCSS: true}); };
  const disabled = (e) => !!e.closest('[disabled],[aria-disabled="true"],[data-disabled],fieldset:disabled');

  // Topmost overlay, else the whole page.
  const OVERLAY = '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="tooltip"],[data-radix-popper-content-wrapper]';
  const scope = () => { const o = [...document.querySelectorAll(OVERLAY)].filter(visible); return o.length ? o[o.length - 1] : document.body; };

  // Effective background: stacked background colours up the tree. null when an image or gradient is involved (not measurable).
  const background = (el) => {
    const layers = []; let e = el;
    for (; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== 'none') return null;
      const b = rgba(s.backgroundColor);
      if (b[3] > 0) { layers.push(b); if (b[3] >= 1) break; }
    }
    let acc = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) acc = over(layers[i], acc);
    return acc;
  };
  const opacityOf = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity); return o; };

  const contrast = (root) => {
    const out = [];
    const els = [root, ...root.querySelectorAll('*')];
    for (const e of els) {
      const t = text(e); if (!t || !visible(e) || disabled(e)) continue;
      if (e.closest('.sr-only,[aria-hidden="true"] svg,script,style')) continue;
      const s = getComputedStyle(e);
      if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || s.color === 'rgba(0, 0, 0, 0)') continue;
      const bg = background(e); if (!bg) continue;
      const fg0 = rgba(s.color); const fg = over([fg0[0], fg0[1], fg0[2], fg0[3] * opacityOf(e)], bg);
      const size = parseFloat(s.fontSize), bold = parseInt(s.fontWeight, 10) >= 700;
      const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
      const r = ratio(fg, bg);
      if (r < need - 0.01) out.push({kind: 'contrast', detail: sig(e) + ' ' + r.toFixed(2) + ':1 (needs ' + need + ') ' + hex(fg) + ' on ' + hex(bg) + ' "' + t.slice(0, 22) + '"'});
    }
    return out;
  };

  // Text boxes of different elements that overlap each other.
  const clipped = (e, r) => {
    for (let p = e.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        const pr = p.getBoundingClientRect();
        if (r.right <= pr.left || r.left >= pr.right || r.bottom <= pr.top || r.top >= pr.bottom) return true;
      }
    }
    return false;
  };
  const layer = (e) => e.closest('.toast-item,.toast-viewport,[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"],[role="tooltip"],[data-radix-popper-content-wrapper]');
  const collisions = (root) => {
    const items = [];
    for (const e of [root, ...root.querySelectorAll('*')]) {
      if (!text(e) || !visible(e) || e.closest('.sr-only,[aria-hidden="true"]')) continue;
      const range = document.createRange(); const rects = [];
      for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { range.selectNodeContents(n); rects.push(...range.getClientRects()); }
      const lh = parseFloat(getComputedStyle(e).lineHeight);
      const rs = rects.filter((r) => r.width > 1 && r.height > 1 && !clipped(e, r)).map((r) => { const h = Math.min(r.height, isNaN(lh) ? r.height : lh); const top = r.top + (r.height - h) / 2; return {left: r.left, right: r.right, top, bottom: top + h}; });
      if (rs.length) items.push({e, rs});
    }
    const out = [];
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.e.contains(b.e) || b.e.contains(a.e) || layer(a.e) !== layer(b.e)) continue;
      hit: for (const x of a.rs) for (const y of b.rs) {
        const w = Math.min(x.right, y.right) - Math.max(x.left, y.left), h = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
        if (w > 2 && h > 3) { out.push({kind: 'text-overlap', detail: sig(a.e) + ' "' + text(a.e).slice(0, 18) + '" over ' + sig(b.e) + ' "' + text(b.e).slice(0, 18) + '"'}); break hit; }
      }
    }
    return out;
  };

  const CONTROLS = 'button,a[href],input:not([type="hidden"]),select,textarea,summary,[role="tab"],[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="option"],[role="radio"],[role="checkbox"],[role="switch"],[role="combobox"],[role="slider"],[role="gridcell"][tabindex],[tabindex]:not([tabindex="-1"]):not(body)';
  let list = [];
  // What makes two controls "the same" for the sweep: element, classes, state. Text is left out, so 31 calendar days cost one hover.
  const kind = (e) => [sig(e), ...['data-state', 'data-tone', 'aria-selected', 'aria-pressed', 'aria-checked', 'aria-current', 'type'].map((a) => e.getAttribute(a) || '')].join('|');
  const controlSig = (e) => sig(e) + '|' + (text(e) || e.getAttribute('aria-label') || e.value || '').slice(0, 20);
  const controls = (max) => {
    const seen = new Set(); list = [];
    for (const e of scope().querySelectorAll(CONTROLS)) {
      if (!visible(e) || disabled(e) || e.closest('[inert]') || e.matches('[role="tablist"],[role="menu"],[role="listbox"],[role="toolbar"],[role="radiogroup"],[role="grid"]')) continue;
      const k = kind(e); if (seen.has(k)) continue; seen.add(k); list.push(e);
      if (list.length >= max) break;
    }
    return list.map((e, i) => ({i, label: controlSig(e)}));
  };
  const prepare = (i) => { const e = list[i]; if (!e || !e.isConnected) return null; e.scrollIntoView({block: 'nearest', inline: 'nearest'}); const r = e.getBoundingClientRect(); if (r.width < 1) return null; return {x: r.x + Math.min(r.width / 2, 40), y: r.y + r.height / 2}; };
  const tag = (list_i, phase) => (d) => ({...d, detail: '[' + phase + ' ' + kind(list[list_i]).replace(/\|+$/, '') + '] ' + d.detail.replace(/ "[^"]*"$/, '')});
  const hover = (i) => { const e = list[i]; if (!e || !e.isConnected) return []; return contrast(e).map(tag(i, 'hover')); };
  const look = (e) => { const s = getComputedStyle(e); return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.backgroundColor, s.textDecorationLine, s.color, s.borderColor, s.stroke, s.fill, s.strokeWidth].join('|'); };
  const focus = (i) => {
    const e = list[i]; if (!e || !e.isConnected) return [];
    e.blur(); const before = look(e); e.focus({preventScroll: true});
    if (document.activeElement !== e) return [];
    const out = contrast(e).map(tag(i, 'focus'));
    const ring = e.matches(':focus-visible');
    if (ring && look(e) === before && !(e.closest('[role="menu"],[role="listbox"],[role="grid"],[role="radiogroup"]') && e.matches('[data-highlighted],[aria-selected="true"]'))) out.push({kind: 'no-focus-indicator', detail: '[focus ' + kind(e).replace(/\|+$/, '') + '] focus changes nothing visible'});
    e.blur();
    return out;
  };
  window.__mlcheck = {scope, contrast, collisions, controls, prepare, hover, focus, page: () => { const s = scope(); return [...contrast(s), ...collisions(s)]; }, scopeName: () => sig(scope())};
})()`;

export async function installSweep(cdp) {
  await cdp('Page.addScriptToEvaluateOnNewDocument', {source: PAGE});
}

/** Run the checks for the page's current state. `controls: false` skips the hover and focus passes. */
export async function sweepState({cdp, evaluate, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), controls = true, max = 40}) {
  await evaluate(PAGE); // idempotent; covers a document that was already open when installSweep ran
  const issues = [...await evaluate('__mlcheck.page()')];
  if (!controls) return issues;
  const list = await evaluate(`__mlcheck.controls(${max})`);
  for (const {i} of list) {
    const p = await evaluate(`__mlcheck.prepare(${i})`); if (!p) continue;
    await cdp('Input.dispatchMouseEvent', {type: 'mouseMoved', x: p.x, y: p.y});
    await sleep(30);
    issues.push(...await evaluate(`__mlcheck.hover(${i})`));
  }
  await cdp('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 1, y: 1});
  // A real Tab press first, so programmatic focus() afterwards matches :focus-visible like a keyboard user's focus.
  await cdp('Input.dispatchKeyEvent', {type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9});
  await cdp('Input.dispatchKeyEvent', {type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9});
  for (const {i} of list) issues.push(...await evaluate(`__mlcheck.focus(${i})`));
  return issues;
}
