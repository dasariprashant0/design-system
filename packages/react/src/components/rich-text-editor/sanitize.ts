const ALLOWED = new Set(['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote']);
/** Tags that are renamed rather than dropped (what browsers' execCommand and pasted HTML often produce). */
const RENAME: Record<string, string> = {b: 'strong', i: 'em', h1: 'h2', h4: 'h3', h5: 'h3', h6: 'h3', div: 'p'};
/** Tags whose content must not survive at all, not even as text. */
const DROP = new Set(['script', 'style', 'noscript', 'template', 'iframe', 'frame', 'object', 'embed', 'svg', 'math', 'head', 'title', 'textarea', 'select', 'option', 'audio', 'video', 'canvas', 'applet']);

/** True for http(s) and mailto links only. Whitespace and control characters are removed first, as browsers ignore them inside a scheme (`java\tscript:`). */
export function isSafeUrl(url: string): boolean {
  // eslint-disable-next-line no-control-regex
  const u = url.replace(/[\u0000- \u007f-\u009f]/g, '');
  return /^(https?:\/\/[^/?#]|mailto:.)/i.test(u);
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function walk(node: Node, out: string[]): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) { out.push(escapeText(child.nodeValue ?? '')); continue; }
    if (child.nodeType !== 1) continue; // comments, processing instructions
    const el = child as Element;
    const raw = el.tagName.toLowerCase();
    if (DROP.has(raw)) continue;
    const tag = RENAME[raw] ?? raw;
    if (!ALLOWED.has(tag)) { walk(el, out); continue; } // unknown tag: keep its text, lose the tag
    if (tag === 'br') { out.push('<br>'); continue; }
    if (tag === 'a') {
      const href = el.getAttribute('href');
      if (href && isSafeUrl(href)) out.push(`<a href="${escapeText(href.trim()).replace(/"/g, '&quot;')}" rel="noopener noreferrer">`);
      else { walk(el, out); continue; }
    } else out.push(`<${tag}>`);
    walk(el, out);
    out.push(`</${tag}>`);
  }
}

/**
 * Reduces untrusted HTML to a small allowlist: p, br, strong, em, u, a[href], ul, ol, li, h2, h3, blockquote.
 * Scripts, styles, event handlers, `style` and every other attribute, unknown tags (their text stays) and
 * non-http(s)/mailto links are removed. Parsing uses `DOMParser`, which never runs scripts. Without a DOM
 * (server render) all markup is stripped to escaped text.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  if (typeof DOMParser === 'undefined') return escapeText(html.replace(/<[^>]*>/g, ''));
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out: string[] = [];
  walk(doc.body, out);
  return out.join('');
}
