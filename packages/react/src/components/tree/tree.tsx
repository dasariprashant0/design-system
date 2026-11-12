'use client';
import {forwardRef, useRef, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {useIsRtl} from '../../utils/direction';

export interface TreeNode {
  id: string;
  label: ReactNode;
  /** Plain text used for type-ahead. Defaults to `label` when it is a string. */
  text?: string;
  disabled?: boolean;
  children?: TreeNode[];
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLUListElement>, 'defaultValue' | 'onChange'> {
  items: TreeNode[];
  /** Selected node id. Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Open branches. Controlled with `expanded` + `onExpandedChange`, or uncontrolled with `defaultExpanded`. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  /** Required: names the tree. */
  'aria-label': string;
}

interface Flat {node: TreeNode; parent?: string; level: number}

/**
 * A tree view with single selection. One node is in the tab order (roving tabindex);
 * ArrowUp/Down move, ArrowRight opens or enters, ArrowLeft closes or goes to the parent, Home/End jump, typing jumps to a label.
 */
export const Tree = forwardRef<HTMLUListElement, TreeProps>(function Tree({items, value, defaultValue, onValueChange, expanded, defaultExpanded = [], onExpandedChange, className, onKeyDown, ...rest}, ref) {
  const [innerVal, setInnerVal] = useState(defaultValue);
  const [innerExp, setInnerExp] = useState(defaultExpanded);
  const [focusId, setFocusId] = useState<string | undefined>();
  const els = useRef(new Map<string, HTMLLIElement>());
  const buffer = useRef({text: '', at: 0});
  const isRtl = useIsRtl();
  const sel = value ?? innerVal;
  const open = expanded ?? innerExp;

  const visible: Flat[] = [];
  const walk = (nodes: TreeNode[], level: number, parent?: string) => nodes.forEach((node) => {
    visible.push({node, parent, level});
    if (node.children?.length && open.includes(node.id)) walk(node.children, level + 1, node.id);
  });
  walk(items, 1);
  const tabId = visible.find((v) => v.node.id === focusId)?.node.id ?? visible.find((v) => v.node.id === sel)?.node.id ?? visible.find((v) => !v.node.disabled)?.node.id;

  const setOpen = (ids: string[]) => { if (expanded === undefined) setInnerExp(ids); onExpandedChange?.(ids); };
  const toggle = (id: string) => setOpen(open.includes(id) ? open.filter((x) => x !== id) : [...open, id]);
  const select = (id: string) => { if (value === undefined) setInnerVal(id); onValueChange?.(id); };
  const focus = (id: string) => { setFocusId(id); els.current.get(id)?.focus(); };

  const keydown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(e);
    const t = e.target as HTMLElement;
    if (e.defaultPrevented || t.getAttribute('role') !== 'treeitem') return;
    const id = t.dataset.treeId!;
    const i = visible.findIndex((v) => v.node.id === id);
    const cur = visible[i];
    if (!cur) return;
    const enabled = visible.filter((v) => !v.node.disabled);
    const step = (dir: 1 | -1) => { for (let j = i + dir; j >= 0 && j < visible.length; j += dir) if (!visible[j]!.node.disabled) return visible[j]!.node.id; };
    const hasKids = !!cur.node.children?.length;
    let next: string | undefined;
    const rtl = isRtl(e.currentTarget);
    const key = rtl && e.key === 'ArrowRight' ? 'ArrowLeft' : rtl && e.key === 'ArrowLeft' ? 'ArrowRight' : e.key; // ArrowLeft opens in rtl
    switch (key) {
      case 'ArrowDown': next = step(1); break;
      case 'ArrowUp': next = step(-1); break;
      case 'Home': next = enabled[0]?.node.id; break;
      case 'End': next = enabled[enabled.length - 1]?.node.id; break;
      case 'ArrowRight':
        if (hasKids && !open.includes(id)) { e.preventDefault(); toggle(id); return; }
        if (hasKids) { next = cur.node.children!.find((c) => !c.disabled)?.id; }
        break;
      case 'ArrowLeft':
        if (hasKids && open.includes(id)) { e.preventDefault(); toggle(id); return; }
        next = cur.parent;
        break;
      case 'Enter': case ' ':
        e.preventDefault(); if (!cur.node.disabled) select(id); return;
      default: {
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
        const now = Date.now(), b = buffer.current;
        b.text = (now - b.at > 600 ? '' : b.text) + e.key.toLowerCase(); b.at = now;
        const text = (v: Flat) => (v.node.text ?? (typeof v.node.label === 'string' ? v.node.label : '')).toLowerCase();
        const order = [...visible.slice(i + (b.text.length > 1 ? 0 : 1)), ...visible.slice(0, i + 1)];
        next = order.find((v) => !v.node.disabled && text(v).startsWith(b.text))?.node.id;
        if (next) e.preventDefault();
      }
    }
    if (next) { e.preventDefault(); focus(next); }
  };

  const render = (nodes: TreeNode[], level: number): ReactNode => nodes.map((node) => {
    const hasKids = !!node.children?.length;
    const isOpen = hasKids && open.includes(node.id);
    return (
      <li
        key={node.id}
        ref={(el) => { if (el) els.current.set(node.id, el); else els.current.delete(node.id); }}
        role="treeitem"
        data-tree-id={node.id}
        aria-level={level}
        aria-expanded={hasKids ? isOpen : undefined}
        aria-selected={node.id === sel}
        aria-disabled={node.disabled || undefined}
        tabIndex={node.id === tabId ? 0 : -1}
        className="tree-item"
        onFocus={(e) => { if (e.target === e.currentTarget) setFocusId(node.id); }}
      >
        <div
          className="tree-row"
          style={{paddingInlineStart: `calc(var(--s3) * ${level - 1} + var(--s2))`}}
          data-selected={node.id === sel || undefined}
          onClick={() => { if (node.disabled) return; setFocusId(node.id); els.current.get(node.id)?.focus(); select(node.id); if (hasKids) toggle(node.id); }}
        >
          <span className="tree-twisty" aria-hidden="true">{hasKids ? (isOpen ? '−' : '+') : ''}</span>
          <span className="tree-label">{node.label}</span>
        </div>
        {isOpen && <ul role="group" className="tree-group">{render(node.children!, level + 1)}</ul>}
      </li>
    );
  });

  return <ul ref={ref} role="tree" className={cx('tree', className)} onKeyDown={keydown} {...rest}>{render(items, 1)}</ul>;
});
