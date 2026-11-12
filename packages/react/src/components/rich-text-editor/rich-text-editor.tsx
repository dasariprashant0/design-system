'use client';
import {forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type HTMLAttributes, type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {cx} from '../../utils/cx';
import {Button} from '../button';
import {Input} from '../input';
import {Popover, PopoverAnchor, PopoverContent} from '../popover';
import {Toolbar, ToolbarButton, ToolbarSeparator} from '../toolbar';
import {execFormat, queryBlock, queryState} from './exec-command';
import {isSafeUrl, sanitizeHtml} from './sanitize';

export {sanitizeHtml, isSafeUrl} from './sanitize';

type Name = {'aria-label': string; 'aria-labelledby'?: string} | {'aria-labelledby': string; 'aria-label'?: string};

export type RichTextEditorProps = Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'aria-label' | 'aria-labelledby'> & Name & {
  /** Controlled content as an HTML string. It is sanitized with `sanitizeHtml` before it is shown. */
  value?: string;
  defaultValue?: string;
  /** Called with sanitized HTML after every edit. */
  onValueChange?: (html: string) => void;
  /** Shown while the editor is empty (a data attribute and CSS, not a text node). */
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Names the formatting toolbar. */
  toolbarLabel?: string;
};

interface Fmt { bold: boolean; italic: boolean; underline: boolean; ul: boolean; ol: boolean; block: string }
const NO_FMT: Fmt = {bold: false, italic: false, underline: false, ul: false, ol: false, block: ''};

const isMac = () => typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

/** Inserts sanitized HTML at the caret; used for paste. Falls back to a DOM range where `execCommand` is missing. */
function insertHtml(html: string) {
  if (execFormat('insertHTML', html)) return;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const last = tpl.content.lastChild;
  range.insertNode(tpl.content);
  if (last) { range.setStartAfter(last); range.collapse(true); sel.removeAllRanges(); sel.addRange(range); }
}

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * A dependency-free rich text editor: a `contenteditable` region with a formatting toolbar.
 * Content in and out is sanitized HTML (p, br, strong, em, u, a, ul, ol, li, h2, h3, blockquote).
 * Formatting uses `document.execCommand` behind a small adapter (deprecated but universal); where it is
 * missing the toolbar does nothing. Server render shows an empty editor, content appears after hydration.
 * The link prompt is a Popover; only http, https and mailto addresses are accepted.
 * @example <RichTextEditor aria-label="Notes" defaultValue="<p>Hello</p>" onValueChange={save} />
 */
export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(function RichTextEditor(
  {value, defaultValue, onValueChange, placeholder, disabled, readOnly, toolbarLabel = 'Text formatting', className, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, ...rest},
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const last = useRef<string>('');
  const [empty, setEmpty] = useState(true);
  const [fmt, setFmt] = useState<Fmt>(NO_FMT);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState(false);
  const errId = useId();
  const inert = disabled || readOnly;
  const controlled = value !== undefined;

  const refreshEmpty = () => { const el = editorRef.current; if (el) setEmpty(!el.textContent && !el.querySelector('li, br')); };

  // Write the HTML into the DOM: on mount, and when a controlled value differs from what the editor holds.
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const next = sanitizeHtml(controlled ? value : (defaultValue ?? ''));
    if (last.current === '' && el.innerHTML === '' ? next !== '' : next !== last.current) {
      el.innerHTML = next;
      last.current = next;
    }
    refreshEmpty();
  }, [value, controlled, defaultValue]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = sanitizeHtml(el.innerHTML);
    refreshEmpty();
    if (html !== last.current) { last.current = html; onValueChange?.(html); }
  }, [onValueChange]);

  const refreshFmt = useCallback(() => {
    const el = editorRef.current;
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (!el || !sel || !sel.rangeCount || !el.contains(sel.anchorNode)) return;
    range.current = sel.getRangeAt(0).cloneRange();
    setFmt({bold: queryState('bold'), italic: queryState('italic'), underline: queryState('underline'), ul: queryState('insertUnorderedList'), ol: queryState('insertOrderedList'), block: queryBlock()});
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', refreshFmt);
    return () => document.removeEventListener('selectionchange', refreshFmt);
  }, [refreshFmt]);

  const restoreSelection = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (range.current && sel) { sel.removeAllRanges(); sel.addRange(range.current); }
  };

  const run = (command: string, arg?: string) => {
    if (inert) return;
    restoreSelection();
    execFormat(command, arg);
    emit();
    refreshFmt();
  };

  const clear = () => { run('removeFormat'); run('unlink'); run('formatBlock', '<p>'); };

  const openLink = () => {
    if (inert) return;
    refreshFmt();
    const sel = window.getSelection();
    const a = (sel?.anchorNode instanceof Element ? sel.anchorNode : sel?.anchorNode?.parentElement)?.closest('a');
    setUrl(a?.getAttribute('href') ?? 'https://');
    setUrlError(false);
    setLinkOpen(true);
  };

  const submitLink = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // the popover renders in a portal; keep React from bubbling to an outer form
    const href = url.trim();
    if (!isSafeUrl(href)) { setUrlError(true); return; }
    setLinkOpen(false);
    run('createLink', href);
  };

  const onEditorKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!(isMac() ? e.metaKey : e.ctrlKey) || e.altKey || inert) return;
    const cmd = {b: 'bold', i: 'italic', u: 'underline'}[e.key.toLowerCase()];
    if (cmd) { e.preventDefault(); run(cmd); }
    else if (e.key.toLowerCase() === 'k') { e.preventDefault(); openLink(); }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (inert) return;
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    insertHtml(html ? sanitizeHtml(html) : escapeText(text).replace(/\r?\n/g, '<br>'));
    emit();
  };

  const mouseDown = (e: React.MouseEvent) => e.preventDefault(); // keep the selection in the editor when a toolbar button is clicked
  const btn = (label: string, on: boolean, action: () => void, extra?: {pressed?: boolean}) => (
    <ToolbarButton aria-pressed={extra?.pressed === false ? undefined : on} disabled={inert} onMouseDown={mouseDown} onClick={action}>{label}</ToolbarButton>
  );

  return (
    <div className={cx('rte', className)} data-disabled={disabled ? '' : undefined} data-readonly={readOnly ? '' : undefined} ref={ref} {...rest}>
      <Toolbar aria-label={toolbarLabel} className="rte-toolbar" onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); editorRef.current?.focus(); } }}>
        {btn('Bold', fmt.bold, () => run('bold'))}
        {btn('Italic', fmt.italic, () => run('italic'))}
        {btn('Underline', fmt.underline, () => run('underline'))}
        <ToolbarSeparator />
        <Popover open={linkOpen} onOpenChange={setLinkOpen}>
          <PopoverAnchor asChild>{btn('Link', false, openLink, {pressed: false})}</PopoverAnchor>
          <PopoverContent aria-label="Insert link" onCloseAutoFocus={(e) => { e.preventDefault(); restoreSelection(); }}>
            <form className="rte-link" onSubmit={submitLink} noValidate>
              <label className="rte-link-label" htmlFor={`${errId}-url`}>Link address</label>
              <Input id={`${errId}-url`} type="url" value={url} invalid={urlError} aria-describedby={urlError ? errId : undefined} onChange={(e) => { setUrl(e.target.value); setUrlError(false); }} autoFocus />
              {urlError && <p id={errId} role="alert" className="rte-link-error">Use an address that starts with http://, https:// or mailto:.</p>}
              <div className="rte-link-actions">
                <Button type="submit" variant="solid" size="sm">Apply</Button>
                <Button size="sm" onClick={() => { setLinkOpen(false); run('unlink'); }}>Remove link</Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        <ToolbarSeparator />
        {btn('Paragraph', fmt.block === 'p', () => run('formatBlock', '<p>'))}
        {btn('Heading 2', fmt.block === 'h2', () => run('formatBlock', fmt.block === 'h2' ? '<p>' : '<h2>'))}
        {btn('Heading 3', fmt.block === 'h3', () => run('formatBlock', fmt.block === 'h3' ? '<p>' : '<h3>'))}
        {btn('Quote', fmt.block === 'blockquote', () => run('formatBlock', fmt.block === 'blockquote' ? '<p>' : '<blockquote>'))}
        <ToolbarSeparator />
        {btn('Bulleted list', fmt.ul, () => run('insertUnorderedList'))}
        {btn('Numbered list', fmt.ol, () => run('insertOrderedList'))}
        <ToolbarSeparator />
        {btn('Undo', false, () => run('undo'), {pressed: false})}
        {btn('Redo', false, () => run('redo'), {pressed: false})}
        {btn('Clear formatting', false, clear, {pressed: false})}
      </Toolbar>
      <div
        ref={editorRef}
        className="rte-content"
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-readonly={readOnly || undefined}
        aria-disabled={disabled || undefined}
        contentEditable={!inert}
        suppressContentEditableWarning
        tabIndex={disabled ? undefined : 0}
        data-placeholder={placeholder}
        data-empty={empty ? '' : undefined}
        onInput={emit}
        onKeyDown={onEditorKeyDown}
        onPaste={onPaste}
        onDrop={(e) => e.preventDefault()}
        onBlur={emit}
      />
    </div>
  );
});
