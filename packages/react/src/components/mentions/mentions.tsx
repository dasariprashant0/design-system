'use client';
import {forwardRef, useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent, type TextareaHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {useFieldControl} from '../field';

/** One person or thing the user can mention. */
export interface MentionOption {
  /** Text inserted after the trigger, for example "jane" gives "@jane". No spaces. */
  value: string;
  /** Text shown in the list. */
  label: string;
  /** Makes the option unselectable. */
  disabled?: boolean;
}

export interface MentionsProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'defaultValue' | 'onChange' | 'role'> {
  /** The text when controlled. Pair with `onValueChange`. */
  value?: string;
  /** The initial text when uncontrolled. Default empty. */
  defaultValue?: string;
  /** Called with the full text after every edit and after a mention is inserted. */
  onValueChange?: (value: string) => void;
  /** The choices, filtered by what is typed after the trigger. Use `onSearch` instead to load them. */
  options?: MentionOption[];
  /** Loads choices for the typed query, for example from a server. Return the options or a promise of them. Late answers for an older query are ignored. Replaces `options` filtering when given. */
  onSearch?: (query: string, trigger: string) => MentionOption[] | Promise<MentionOption[]>;
  /** Characters that open the list when typed at the start of a word. Default `["@"]`. */
  triggers?: string[];
  /** Called with the option and the trigger when the user inserts a mention. */
  onMentionSelect?: (option: MentionOption, trigger: string) => void;
  /** Text shown while `onSearch` is loading. Default "Loading". */
  loadingText?: string;
  /** Text shown when nothing matches. Default "No matches". */
  emptyText?: string;
  /** Marks the field as having an error: sets `aria-invalid` and shows the error border. */
  invalid?: boolean;
}

interface Active { trigger: string; start: number; query: string }

/** Finds an open mention at the caret: a trigger at the start of a word followed by non-space text up to the caret. */
function findActive(text: string, caret: number, triggers: string[]): Active | null {
  for (let i = caret - 1; i >= 0; i--) {
    const ch = text[i]!;
    if (/\s/.test(ch)) return null;
    if (triggers.includes(ch)) return i === 0 || /\s/.test(text[i - 1]!) ? {trigger: ch, start: i, query: text.slice(i + 1, caret)} : null;
  }
  return null;
}

/** A textarea that suggests people or items when the user types a trigger such as `@`. It follows the ARIA combobox pattern as far as a `<textarea>` allows (a textarea cannot take role combobox, so it stays a textbox with `aria-haspopup`, `aria-controls` and `aria-activedescendant`): ArrowUp/ArrowDown choose, Enter or Tab insert, Escape closes. Options are filtered locally or loaded with `onSearch`. The list opens under the field, not at the caret. */
export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(function Mentions({value, defaultValue = '', onValueChange, options = [], onSearch, triggers = ['@'], onMentionSelect, loadingText = 'Loading', emptyText = 'No matches', invalid, className, onKeyDown, onBlur, onSelect, ...rest}, ref) {
  const f = useFieldControl();
  const listId = useId();
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const area = useRef<HTMLTextAreaElement | null>(null);
  const [active, setActive] = useState<Active | null>(null);
  const [dismissed, setDismissed] = useState<number | null>(null); // trigger index the user closed with Escape
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<MentionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const open = !!active && dismissed !== active.start;

  const query = active?.query ?? '';
  const trigger = active?.trigger ?? '';
  useEffect(() => {
    if (!open || !onSearch) return;
    const n = ++seq.current;
    setLoading(true);
    Promise.resolve(onSearch(query, trigger)).then((r) => { if (n === seq.current) { setLoaded(r); setLoading(false); } }, () => { if (n === seq.current) { setLoaded([]); setLoading(false); } });
    return () => { seq.current++; };
  }, [open, query, trigger, onSearch]);

  const shown = !open ? [] : onSearch ? loaded : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()) || o.value.toLowerCase().includes(query.toLowerCase()));
  const at = Math.min(index, Math.max(shown.length - 1, 0));
  const optId = (i: number) => `${listId}-${i}`;

  const sync = (el: HTMLTextAreaElement, next = el.value) => {
    const a = findActive(next, el.selectionStart ?? next.length, triggers);
    setActive((p) => { if (p && a && p.start === a.start && p.query === a.query && p.trigger === a.trigger) return p; return a; });
    if (!a || a.query !== active?.query) setIndex(0);
    if (!a) setDismissed(null);
  };
  const change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) setInner(e.target.value);
    onValueChange?.(e.target.value);
    sync(e.target);
  };
  const pick = (o: MentionOption | undefined) => {
    const el = area.current;
    if (!o || o.disabled || !active || !el) return;
    const insert = `${active.trigger}${o.value} `;
    const end = active.start + 1 + active.query.length;
    const next = text.slice(0, active.start) + insert + text.slice(end);
    if (value === undefined) setInner(next);
    onValueChange?.(next);
    onMentionSelect?.(o, active.trigger);
    setActive(null); setDismissed(null);
    const caret = active.start + insert.length;
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(caret, caret); });
  };
  const move = (dir: 1 | -1) => {
    if (!shown.length) return;
    let i = at;
    for (let n = 0; n < shown.length; n++) { i = (i + dir + shown.length) % shown.length; if (!shown[i]!.disabled) break; }
    setIndex(i);
  };
  const keydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if ((e.key === 'Enter' || e.key === 'Tab') && shown[at] && !e.shiftKey) { e.preventDefault(); pick(shown[at]); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setDismissed(active!.start); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); setIndex(0); }
  };
  const status = !open ? '' : loading ? loadingText : shown.length ? `${shown.length} ${shown.length === 1 ? 'suggestion' : 'suggestions'}` : emptyText;

  return (
    <div className={cx('mentions', className)}>
      <textarea
        ref={(el) => { area.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
        className="textarea"
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && shown[at] ? optId(at) : undefined}
        {...f}
        {...(invalid ? {'aria-invalid': true as const} : {})}
        value={text}
        onChange={change}
        onKeyDown={keydown}
        onSelect={(e) => { onSelect?.(e); sync(e.currentTarget); }}
        onBlur={(e) => { onBlur?.(e); setActive(null); setDismissed(null); }}
        {...rest}
      />
      {open && (
        <ul id={listId} role="listbox" className="mentions-list" aria-label={rest['aria-label'] ? `${rest['aria-label']} suggestions` : 'Suggestions'}>
          {loading && <li role="presentation" className="mentions-note">{loadingText}</li>}
          {!loading && shown.length === 0 && <li role="presentation" className="mentions-note">{emptyText}</li>}
          {!loading && shown.map((o, i) => (
            <li
              key={o.value}
              id={optId(i)}
              role="option"
              aria-selected={i === at}
              aria-disabled={o.disabled || undefined}
              data-active={i === at || undefined}
              className="mentions-option"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setIndex(i)}
              onClick={() => pick(o)}
            >{o.label}</li>
          ))}
        </ul>
      )}
      <div role="status" className="sr-only">{status}</div>
    </div>
  );
});
