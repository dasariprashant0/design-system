'use client';
import {createContext, forwardRef, useContext, useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject} from 'react';
import {useControllableState} from '../../hooks/use-controllable-state';
import {cx} from '../../utils/cx';
import {nextItem, setRefs} from '../../utils/overlay';
import {invalidAttrs, useFieldControl} from '../field';
import {Floating, useDismiss, useHydrated, type Placement} from '../popover/float';

interface Ctx {
  open: boolean; setOpen: (o: boolean) => void; value: string; setValue: (v: string) => void;
  trigger: RefObject<HTMLButtonElement | null>; triggerId: string; listId: string; disabled?: boolean;
  /** Item text by value, so the trigger can show the chosen item while the list is closed. */
  labels: Map<string, ReactNode>; label: (value: string, text: ReactNode) => void;
}
const Context = createContext<Ctx>(null as never);
const Group = createContext<string | undefined>(undefined);

export interface SelectProps {
  /** Controlled value. An empty string shows the placeholder. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the chosen item's value. */
  onValueChange?: (value: string) => void;
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** Disables the trigger. */
  disabled?: boolean;
  /** Form field name; the value is submitted through a hidden input. */
  name?: string;
  /** The parts of the component: a trigger and its content. */
  children?: ReactNode;
}

/** The root of a custom single-choice dropdown. Use `value` and `onValueChange` (or `defaultValue`); put a `SelectTrigger` and `SelectContent` inside. For a plain list prefer `NativeSelect`. */
export function Select({value, defaultValue = '', onValueChange, open, defaultOpen = false, onOpenChange, disabled, name, children}: SelectProps) {
  const [val, setValue] = useControllableState({value, defaultValue, onChange: onValueChange});
  const [isOpen, setOpen] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
  const [, bump] = useState(0);
  const trigger = useRef<HTMLButtonElement | null>(null), labels = useRef(new Map<string, ReactNode>());
  const label = (v: string, text: ReactNode) => { if (labels.current.get(v) !== text) { labels.current.set(v, text); if (v === val) bump((n) => n + 1); } };
  const id = useId();
  return (
    <Context.Provider value={{open: isOpen, setOpen, value: val, setValue, trigger, triggerId: id + 't', listId: id + 'l', disabled, labels: labels.current, label}}>
      {children}
      {name && <input type="hidden" name={name} value={val} disabled={disabled} />}
    </Context.Provider>
  );
}

/** Groups related `SelectItem`s, optionally under a `SelectLabel`. */
export const SelectGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SelectGroup(props, ref) {
  const id = useId();
  return <Group.Provider value={id}><div ref={ref} role="group" aria-labelledby={id} {...props} /></Group.Provider>;
});

/** Shows the chosen item's text inside the `SelectTrigger`; `placeholder` appears while nothing is chosen. */
export function SelectValue({placeholder, children}: {
  /** Text shown while no item is chosen. */
  placeholder?: ReactNode;
  /** Overrides the shown text. */
  children?: ReactNode;
}) {
  const c = useContext(Context);
  return <span>{children ?? (c.value ? c.labels.get(c.value) : undefined) ?? placeholder}</span>;
}

export interface SelectTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `md` (default), `sm` for dense layouts or `lg` for prominent forms. Heights match Button, Input and Select at each size. */
  size?: 'sm' | 'md' | 'lg';
  /** Marks the control invalid (`aria-invalid`). A surrounding Field sets this from its `error`. */
  invalid?: boolean;
}
/** The button that shows the chosen value. Inside a Field it is labelled and described automatically. */
export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger({className, size = 'md', invalid, children, id, onClick, onKeyDown, disabled, ...rest}, ref) {
  const f = useFieldControl(), c = useContext(Context);
  const off = disabled ?? c.disabled;
  return (
    <button
      ref={(n) => setRefs(n, c.trigger, ref)} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={c.open} aria-controls={c.open ? c.listId : undefined} aria-autocomplete="none"
      id={id ?? f.id ?? c.triggerId} aria-describedby={f['aria-describedby']} {...invalidAttrs(invalid || Boolean(f['aria-invalid']))}
      data-state={c.open ? 'open' : 'closed'} data-placeholder={c.value ? undefined : ''} data-disabled={off ? '' : undefined} disabled={off}
      className={cx('select-trigger', size !== 'md' && `input-${size}`, className)} {...rest}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) c.setOpen(!c.open); }}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); c.setOpen(true); } }}
    >{children}</button>
  );
});

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement>, Placement {
  /** Accepted for compatibility with earlier versions; the list is always positioned against the trigger. */
  position?: 'item-aligned' | 'popper';
}

const OPTION = '[role=option]:not([aria-disabled=true])';

const List = forwardRef<HTMLDivElement, SelectContentProps>(function List({className, children, position: _p, sideOffset = 4, align = 'start', onKeyDown, ...rest}, forwarded) {
  const c = useContext(Context);
  const el = useRef<HTMLDivElement | null>(null), outside = useRef(false), typed = useRef({text: '', at: 0});
  useDismiss(true, [el, c.trigger], (kind) => { outside.current = kind === 'outside'; c.setOpen(false); });
  useEffect(() => {
    const first = el.current!.querySelector<HTMLElement>('[aria-selected=true]') ?? el.current!.querySelector<HTMLElement>(OPTION);
    first?.focus(); first?.scrollIntoView?.({block: 'nearest'});
    return () => { if (!outside.current) c.trigger.current?.focus({preventScroll: true}); };
  }, []);
  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }
    const next = nextItem(e.key, !e.ctrlKey && !e.metaKey && !e.altKey, [...el.current!.querySelectorAll<HTMLElement>(OPTION)], typed.current);
    if (next === null) return;
    e.preventDefault(); next?.focus(); next?.scrollIntoView?.({block: 'nearest'});
  };
  return (
    <Floating ref={(n) => setRefs(n, el, forwarded)} anchor={() => c.trigger.current} align={align} sideOffset={sideOffset} role="listbox" id={c.listId} aria-labelledby={c.triggerId} data-state="open" className={cx('select-content', className)} {...rest} onKeyDown={keydown}>
      {children}
    </Floating>
  );
});

/** The floating list of options, rendered in a portal and positioned under the trigger. Closed, its items stay mounted but hidden so the trigger can show the chosen text. */
export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(props, ref) {
  const {open} = useContext(Context), hydrated = useHydrated();
  return open && hydrated ? <List ref={ref} {...props} /> : <div hidden>{props.children}</div>;
});

export interface SelectItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The value reported by `onValueChange` when this item is chosen. Must be non-empty. */
  value: string;
  /** Makes the item unselectable and skipped by the keyboard. */
  disabled?: boolean;
}
/** One choice in the list; give it a `value` and the visible text as children. */
export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem({className, children, value, disabled, onClick, onFocus, onBlur, onPointerMove, onKeyDown, ...rest}, ref) {
  const c = useContext(Context);
  const selected = c.value === value;
  useLayoutEffect(() => c.label(value, children), [value, children]);
  const pick = () => { c.setValue(value); c.setOpen(false); };
  return (
    <div
      ref={ref} role="option" tabIndex={-1} aria-selected={selected} aria-disabled={disabled || undefined} data-state={selected ? 'checked' : 'unchecked'} data-disabled={disabled ? '' : undefined}
      className={cx('select-item', className)} {...rest}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented && !disabled) pick(); }}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!disabled) pick(); } }}
      onPointerMove={(e) => { onPointerMove?.(e); if (!disabled) e.currentTarget.focus({preventScroll: true}); }}
      onFocus={(e) => { onFocus?.(e); e.currentTarget.setAttribute('data-highlighted', ''); }}
      onBlur={(e) => { onBlur?.(e); e.currentTarget.removeAttribute('data-highlighted'); }}
    >
      <span>{children}</span>
      {selected && <span aria-hidden="true">✓</span>}
    </div>
  );
});

/** A non-interactive heading for a `SelectGroup`. */
export const SelectLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SelectLabel({className, ...rest}, ref) {
  return <div ref={ref} id={useContext(Group)} className={cx('select-label', className)} {...rest} />;
});
