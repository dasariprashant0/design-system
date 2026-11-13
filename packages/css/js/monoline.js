/* Monoline behaviours: optional, no dependencies, no build step.
   <script src=".../js/monoline.js" defer></script>
   Everything is driven by data attributes; the same markup works without it
   (you lose tabs, dropdown dismissal, toasts and theme saving).

   data-ml-theme="dark"          button: set the theme
   data-ml-accent="green"        button: set the accent (orange rose amber green teal blue violet slate)
   data-ml-font / -radius / -density="..."  buttons: font (mono sans serif), corners (square soft round), density (compact comfortable spacious)
   [data-tabs]                   wraps .tab[role=tab][aria-controls] + .tabpanel[role=tabpanel]
   data-dialog-open="id"         opens <dialog id>;  data-dialog-close closes its dialog
   data-drawer-open="id"         opens .drawer#id;   data-drawer-close closes it
   data-toast="Saved."           shows a toast; add data-toast-undo to offer Undo
   data-copy="text"              copies text (or data-copy-target="#id")
   details.dropdown              closes on Escape and outside click
   Monoline.toast(msg, {undo})   Monoline.setTheme(t)   Monoline.setAccent(a)   Monoline.setOption('font', 'sans')
   Choices are saved as monoline-theme, monoline-accent, monoline-font ...: the same keys React's ThemeProvider and themeScript() use. */
(function () {
  'use strict';
  var root = document.documentElement;
  var THEMES = ['warm', 'dark', 'midnight'];
  var ACCENTS = ['orange', 'rose', 'amber', 'green', 'teal', 'blue', 'violet', 'slate'];
  var OPTIONS = { font: ['mono', 'sans', 'serif'], radius: ['square', 'soft', 'round'], density: ['compact', 'comfortable', 'spacious'] };
  var OPTION_DEFAULTS = { font: 'mono', radius: 'square', density: 'comfortable' };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  function sync() {
    $$('[data-ml-theme]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-ml-theme') === root.getAttribute('data-theme'))); });
    $$('[data-ml-accent]').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-ml-accent') === (root.getAttribute('data-accent') || 'orange'))); });
    Object.keys(OPTIONS).forEach(function (o) {
      $$('[data-ml-' + o + ']').forEach(function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-ml-' + o) === (root.getAttribute('data-' + o) || OPTION_DEFAULTS[o]))); });
    });
  }
  function setTheme(t) { if (THEMES.indexOf(t) < 0) return; root.setAttribute('data-theme', t); store('monoline-theme', t); sync(); }
  function setAccent(a) { if (ACCENTS.indexOf(a) < 0) return; root.setAttribute('data-accent', a); store('monoline-accent', a); sync(); }

  function setOption(o, v) { if (!OPTIONS[o] || OPTIONS[o].indexOf(v) < 0) return; root.setAttribute('data-' + o, v); store('monoline-' + o, v); sync(); }

  // Restore saved choices; fall back to the system colour scheme for the theme.
  var savedTheme = store('monoline-theme'), savedAccent = store('monoline-accent');
  if (!root.hasAttribute('data-theme')) {
    setTheme(savedTheme || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'warm'));
  } else if (savedTheme) { setTheme(savedTheme); }
  if (savedAccent) setAccent(savedAccent);
  Object.keys(OPTIONS).forEach(function (o) { var v = store('monoline-' + o); if (v) setOption(o, v); });

  // Toasts
  var region;
  function toast(msg, opts) {
    opts = opts || {};
    if (!region) { region = document.createElement('div'); region.className = 'toast-region'; region.setAttribute('role', 'status'); document.body.appendChild(region); }
    var t = document.createElement('div'); t.className = 'toast';
    var span = document.createElement('span'); span.textContent = msg; t.appendChild(span);
    function close() { if (t.parentNode) t.parentNode.removeChild(t); }
    if (opts.undo) {
      var u = document.createElement('button'); u.type = 'button'; u.textContent = 'Undo';
      u.addEventListener('click', function () { close(); if (typeof opts.undo === 'function') opts.undo(); });
      t.appendChild(u);
    }
    var x = document.createElement('button'); x.type = 'button'; x.textContent = 'Dismiss'; x.setAttribute('aria-label', 'Dismiss'); x.addEventListener('click', close); t.appendChild(x);
    region.appendChild(t);
    setTimeout(close, opts.ms || 6000);
    return close;
  }

  // Drawer
  var lastFocus = null;
  function openDrawer(el) { lastFocus = document.activeElement; el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); var f = el.querySelector('.close, button, a, input'); if (f) f.focus(); }
  function closeDrawer(el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  // Tabs
  function initTabs(wrap) {
    var tabs = $$('[role="tab"]', wrap), panels = $$('[role="tabpanel"]', wrap);
    function select(tab, focus) {
      tabs.forEach(function (t) { var on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p) { p.hidden = p.id !== tab.getAttribute('aria-controls'); });
      if (focus) tab.focus();
    }
    var start = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    if (start) select(start);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (n === undefined) return; e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true);
      });
    });
  }
  $$('[data-tabs]').forEach(initTabs);

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-ml-theme],[data-ml-accent],[data-ml-font],[data-ml-radius],[data-ml-density],[data-dialog-open],[data-dialog-close],[data-drawer-open],[data-drawer-close],[data-toast],[data-copy],.scrim') : null;
    if (el) {
      if (el.hasAttribute('data-ml-theme')) setTheme(el.getAttribute('data-ml-theme'));
      else if (el.hasAttribute('data-ml-accent')) setAccent(el.getAttribute('data-ml-accent'));
      else if (el.hasAttribute('data-ml-font')) setOption('font', el.getAttribute('data-ml-font'));
      else if (el.hasAttribute('data-ml-radius')) setOption('radius', el.getAttribute('data-ml-radius'));
      else if (el.hasAttribute('data-ml-density')) setOption('density', el.getAttribute('data-ml-density'));
      else if (el.hasAttribute('data-dialog-open')) { var d = document.getElementById(el.getAttribute('data-dialog-open')); if (d && d.showModal) d.showModal(); }
      else if (el.hasAttribute('data-dialog-close')) { var dd = el.closest('dialog'); if (dd) dd.close(); }
      else if (el.hasAttribute('data-drawer-open')) { var dr = document.getElementById(el.getAttribute('data-drawer-open')); if (dr) openDrawer(dr); }
      else if (el.hasAttribute('data-drawer-close') || el.classList.contains('scrim')) { var dw = el.closest('.drawer'); if (dw) closeDrawer(dw); }
      else if (el.hasAttribute('data-toast')) toast(el.getAttribute('data-toast'), { undo: el.hasAttribute('data-toast-undo') });
      else if (el.hasAttribute('data-copy')) {
        var tgt = el.getAttribute('data-copy-target'), text = tgt ? (document.querySelector(tgt) || {}).textContent : el.getAttribute('data-copy');
        var label = el.textContent;
        var done = function (ok) { el.textContent = ok ? 'Copied' : 'Press Ctrl+C'; setTimeout(function () { el.textContent = label; }, 1500); };
        if (navigator.clipboard && text) navigator.clipboard.writeText(text.trim()).then(function () { done(true); }, function () { done(false); }); else done(false);
      }
    }
    // Close dropdowns on outside click
    $$('details.dropdown[open]').forEach(function (dd) { if (!dd.contains(e.target)) dd.removeAttribute('open'); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('.drawer.open').forEach(closeDrawer);
    $$('details.dropdown[open]').forEach(function (dd) { dd.removeAttribute('open'); var s = dd.querySelector('summary'); if (s) s.focus(); });
  });

  window.Monoline = { toast: toast, setTheme: setTheme, setAccent: setAccent, setOption: setOption, themes: THEMES, accents: ACCENTS, options: OPTIONS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
})();
