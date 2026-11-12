'use client';
import {forwardRef, useId, useState, type InputHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {useControllableState} from '../../hooks/use-controllable-state';
import {useIsRtl} from '../../utils/direction';
import {useFieldControl} from '../field';
import type {TreeNode} from '../tree';

export interface TreeSelectProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'role' | 'size' | 'type'> {
  /** The tree: top-level nodes, each with an `id`, a `label` and optional `children`. Same shape as `Tree`. */
  items: TreeNode[];
  /** Selected node ids when controlled. Always an array, also in single mode (zero or one id). Pair with `onValueChange`. */
  value?: string[];
  /** Ids selected at first when uncontrolled. Default none. */
  defaultValue?: string[];
  /** Called with the full list of selected ids after each change. */
  onValueChange?: (ids: string[]) => void;
  /** Allows several selections: choosing a node toggles it and the list stays open. Default false (choosing closes the list). */
  multiple?: boolean;
  /** Shown when the search matches nothing. Default "No matches". */
  emptyText?: string;
  /** Marks the field as having an error: sets `aria-invalid` and shows the error border. */
  invalid?: boolean;
}

interface Row {node: TreeNode; level: number; parent?: string; kids: boolean; open: boolean; pos: number; size: number}

const textOf = (n: TreeNode) => n.text ?? (typeof n.label === 'string' ? n.label : n.id);

/**
 * A select whose options are a tree, with search. Focus stays in the input (a combobox with a tree popup):
 * ArrowUp/Down move, ArrowRight opens a branch then enters it, ArrowLeft closes it then goes to the parent, Enter selects, Escape closes.
 * Typing filters the tree to matching nodes and their parents. Use `multiple` to pick several nodes.
 * @example <TreeSelect aria-label="Folder" items={folders} onValueChange={(ids) => setFolder(ids[0])} />
 */
export const TreeSelect = forwardRef<HTMLInputElement, TreeSelectProps>(function TreeSelect({items, value, defaultValue = [], onValueChange, multiple = false, emptyText = 'No matches', invalid, className, onBlur, onKeyDown, ...rest}, ref) {
  const f = useFieldControl();
  const listId = useId();
  const isRtl = useIsRtl();
  const [selected, setSelected] = useControllableState<string[]>({value, defaultValue, onChange: onValueChange});
  const [text, setText] = useState<string | null>(null); // null = show the selection
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [expanded, setExpanded] = useState<string[]>([]);

  const q = (text ?? '').trim().toLowerCase();
  const matches = (n: TreeNode): boolean => textOf(n).toLowerCase().includes(q) || !!n.children?.some(matches);
  const rows: Row[] = [];
  const walk = (nodes: TreeNode[], level: number, parent?: string) => {
    const list = q ? nodes.filter(matches) : nodes;
    list.forEach((node, i) => {
      const kids = !!(q ? node.children?.some(matches) : node.children?.length);
      const isOpen = kids && (!!q || expanded.includes(node.id));
      rows.push({node, level, parent, kids, open: isOpen, pos: i + 1, size: list.length});
      if (isOpen) walk(node.children!, level + 1, node.id);
    });
  };
  walk(items, 1);

  const all: TreeNode[] = [];
  const collect = (nodes: TreeNode[]) => nodes.forEach((n) => { all.push(n); if (n.children) collect(n.children); });
  collect(items);
  const names = selected.map((id) => all.find((n) => n.id === id)).filter((n): n is TreeNode => !!n).map(textOf);
  const summary = names.length > 2 ? `${names.length} selected` : names.join(', ');

  const index = rows.findIndex((r) => r.node.id === activeId);
  const cur = index >= 0 ? index : rows.findIndex((r) => !r.node.disabled);
  const rowId = (i: number) => `${listId}-${i}`;

  const pick = (node: TreeNode) => {
    if (node.disabled) return;
    if (multiple) setSelected(selected.includes(node.id) ? selected.filter((x) => x !== node.id) : [...selected, node.id]);
    else { setSelected([node.id]); setText(null); setOpen(false); }
  };
  const toggle = (id: string) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const step = (dir: 1 | -1) => { for (let j = cur + dir; j >= 0 && j < rows.length; j += dir) if (!rows[j]!.node.disabled) { setActiveId(rows[j]!.node.id); return; } };

  const keydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const row = rows[cur];
    const rtl = isRtl(e.currentTarget);
    const key = rtl && e.key === 'ArrowRight' ? 'ArrowLeft' : rtl && e.key === 'ArrowLeft' ? 'ArrowRight' : e.key;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!open) setOpen(true); else step(e.key === 'ArrowDown' ? 1 : -1); }
    else if (e.key === 'Enter' && open && row) { e.preventDefault(); pick(row.node); }
    else if (e.key === 'Escape') { if (open) { e.preventDefault(); setOpen(false); } else if (text !== null) setText(null); }
    else if (open && !q && row && key === 'ArrowRight') {
      e.preventDefault();
      if (row.kids && !row.open) toggle(row.node.id);
      else if (row.kids) { const child = rows[cur + 1]; if (child && !child.node.disabled) setActiveId(child.node.id); }
    } else if (open && !q && row && key === 'ArrowLeft') {
      e.preventDefault();
      if (row.open) toggle(row.node.id); else if (row.parent) setActiveId(row.parent);
    }
  };

  return (
    <div className={cx('tree-select', className)}>
      <input
        ref={ref}
        type="text"
        role="combobox"
        autoComplete="off"
        className="input"
        aria-haspopup="tree"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && cur >= 0 ? rowId(cur) : undefined}
        {...f}
        {...(invalid ? {'aria-invalid': true as const} : {})}
        value={text ?? summary}
        onChange={(e) => { setText(e.target.value); setOpen(true); setActiveId(undefined); }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={(e) => { onBlur?.(e); setOpen(false); setText(null); }}
        onKeyDown={keydown}
        {...rest}
      />
      {open && (
        <ul id={listId} role="tree" className="tree-select-list" aria-label={rest['aria-label']} aria-multiselectable={multiple || undefined}>
          {rows.length === 0 && <li className="tree-select-empty" role="presentation">{emptyText}</li>}
          {rows.map((r, i) => (
            <li
              key={r.node.id}
              id={rowId(i)}
              role="treeitem"
              aria-level={r.level}
              aria-setsize={r.size}
              aria-posinset={r.pos}
              aria-expanded={r.kids ? r.open : undefined}
              aria-selected={selected.includes(r.node.id)}
              aria-disabled={r.node.disabled || undefined}
              data-active={i === cur || undefined}
              className="tree-select-item"
              style={{paddingInlineStart: `calc(var(--s3) * ${r.level - 1} + var(--s3))`}}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActiveId(r.node.id)}
              onClick={() => pick(r.node)}
            >
              <span
                className="tree-select-twisty"
                aria-hidden="true"
                onClick={(e) => { if (r.kids && !q) { e.stopPropagation(); toggle(r.node.id); } }}
              >{r.kids ? (r.open ? '−' : '+') : ''}</span>
              {r.node.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
