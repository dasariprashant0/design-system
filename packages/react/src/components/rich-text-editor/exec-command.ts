/**
 * A small adapter over `document.execCommand`. That API is deprecated but still the only dependency-free way
 * to edit rich text in a `contenteditable` region, and every browser ships it. Limits: behaviour differs a
 * little between browsers, and where it is missing (jsdom, a future removal) every call returns `false`
 * and the editor leaves the content unchanged. Check the return value.
 */
export function execFormat(command: string, value?: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  try { return document.execCommand(command, false, value); } catch { return false; }
}

export function queryState(command: string): boolean {
  if (typeof document === 'undefined' || typeof document.queryCommandState !== 'function') return false;
  try { return document.queryCommandState(command); } catch { return false; }
}

/** The current block tag: `p`, `h2`, `h3`, `blockquote` or an empty string. */
export function queryBlock(): string {
  if (typeof document === 'undefined' || typeof document.queryCommandValue !== 'function') return '';
  try { return document.queryCommandValue('formatBlock').toLowerCase().replace(/[<>]/g, ''); } catch { return ''; }
}
