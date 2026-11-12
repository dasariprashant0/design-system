'use client';
import {useEffect, useId, useState, type ReactNode} from 'react';
import {Dialog as RadixDialog} from 'radix-ui';
import {cx} from '../../utils/cx';

export interface CommandItem {
  id: string;
  label: string;
  /** Items with the same group are listed together under a heading. */
  group?: string;
  /** Extra words that also match the search. */
  keywords?: string[];
  /** Shown at the right, for example "⌘N". Display only. */
  hint?: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface CommandProps {
  items: CommandItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A global key that toggles the palette, like `mod+k` (`mod` is Cmd on Mac, Ctrl elsewhere). */
  shortcut?: string;
  /** Names the dialog. Visually hidden. */
  title?: string;
  placeholder?: string;
  emptyText?: string;
  /** Optional trigger element, rendered as-is (use a Button with aria-haspopup="dialog"). */
  trigger?: ReactNode;
  className?: string;
}

/** True when a keydown matches a combo such as `mod+k` or `shift+p`. */
export function matchesShortcut(e: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>, shortcut: string) {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts.pop();
  return e.key.toLowerCase() === key
    && (e.metaKey || e.ctrlKey) === parts.includes('mod')
    && e.shiftKey === parts.includes('shift')
    && e.altKey === parts.includes('alt');
}

/**
 * A command palette: a dialog with a search box and a grouped, filtered list of actions.
 * Models the listbox on Combobox: focus stays in the input, ArrowUp/Down moves the active option, Enter runs it.
 * @example <Command shortcut="mod+k" items={[{id: 'new', label: 'New file', onSelect: create}]} />
 */
export function Command({items, open, defaultOpen = false, onOpenChange, shortcut, title = 'Command palette', placeholder = 'Type a command', emptyText = 'No results', trigger, className}: CommandProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const setOpen = (next: boolean) => { if (open === undefined) setInner(next); onOpenChange?.(next); if (!next) { setQuery(''); setActive(0); } };

  useEffect(() => {
    if (!shortcut) return;
    const h = (e: KeyboardEvent) => { if (matchesShortcut(e, shortcut)) { e.preventDefault(); setOpen(!isOpen); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  });

  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((it) => [it.label, ...(it.keywords ?? [])].some((s) => s.toLowerCase().includes(q))) : items;
  const groups: Array<{name: string | undefined; items: CommandItem[]}> = [];
  for (const it of shown) {
    const g = groups.find((x) => x.name === it.group);
    if (g) g.items.push(it); else groups.push({name: it.group, items: [it]});
  }
  const flat = groups.flatMap((g) => g.items); // display order, used for keyboard
  const optId = (id: string) => `${listId}-${id}`;
  const cur = Math.min(active, Math.max(0, flat.length - 1));
  const activeItem = flat[cur];

  const run = (it: CommandItem) => { if (it.disabled) return; setOpen(false); it.onSelect?.(); };
  const move = (dir: 1 | -1) => {
    if (!flat.length) return;
    let i = cur;
    for (let n = 0; n < flat.length; n++) { i = (i + dir + flat.length) % flat.length; if (!flat[i]!.disabled) break; }
    setActive(i);
  };
  const keydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(Math.max(0, flat.length - 1)); }
    else if (e.key === 'Enter' && activeItem) { e.preventDefault(); run(activeItem); }
  };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="dialog-overlay" />
        <RadixDialog.Content className={cx('command', className)} aria-describedby={undefined}>
          <RadixDialog.Title className="sr-only">{title}</RadixDialog.Title>
          <input
            type="text"
            role="combobox"
            autoComplete="off"
            className="command-input"
            aria-label={title}
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? optId(activeItem.id) : undefined}
            placeholder={placeholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={keydown}
          />
          <div id={listId} role="listbox" aria-label={title} className="command-list">
            {flat.length === 0 && <p className="command-empty" role="presentation">{emptyText}</p>}
            {groups.map((g, gi) => {
              const opts = g.items.map((it) => (
                <div
                  key={it.id}
                  id={optId(it.id)}
                  role="option"
                  aria-selected={it === activeItem}
                  aria-disabled={it.disabled || undefined}
                  data-active={it === activeItem || undefined}
                  className="command-item"
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => setActive(flat.indexOf(it))}
                  onClick={() => run(it)}
                >
                  <span>{it.label}</span>
                  {it.hint && <kbd className="command-hint" aria-hidden="true">{it.hint}</kbd>}
                </div>
              ));
              return g.name ? (
                <div key={g.name} role="group" aria-labelledby={`${listId}-g${gi}`} className="command-group">
                  <div id={`${listId}-g${gi}`} className="command-heading" role="presentation">{g.name}</div>
                  {opts}
                </div>
              ) : <div key={`g${gi}`} role="group" aria-label="Other" className="command-group">{opts}</div>;
            })}
          </div>
          <p className="sr-only" role="status">{flat.length === 0 ? emptyText : `${flat.length} results`}</p>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
