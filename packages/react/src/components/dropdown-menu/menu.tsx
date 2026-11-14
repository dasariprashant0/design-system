'use client';
import {createContext, forwardRef, useContext, useEffect, useId, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, type RefObject} from 'react';
import {useControllableState} from '../../hooks/use-controllable-state';
import {cx} from '../../utils/cx';
import {nextItem, setRefs} from '../../utils/overlay';
import {Floating, useDismiss, useHydrated, type Placement} from '../popover/float';

/* The menu core behind DropdownMenu, ContextMenu and Menubar: state, the floating role="menu" panel with roving
   focus and type-ahead, and the item kinds. The three components only add their trigger and class names. */

/** Where focus goes when a menu opens. Set by whatever opened it, read once by the panel. A module variable because only one menu can open at a time. */
let intent: 'first' | 'last' | 'panel' = 'panel';
export const openWith = (i: typeof intent) => { intent = i; };

export interface MenuCtx {
  open: boolean; setOpen: (o: boolean) => void; trigger: RefObject<HTMLElement | null>; triggerId: string; menuId: string;
  /** Element to position against when it is not the trigger (the pointer, for a context menu). */
  anchor?: () => Element | null;
  /** Menubar only: ArrowLeft/ArrowRight inside the panel moves to the neighbouring menu. */
  step?: (dir: 1 | -1, from: Element | null) => void;
}
/** Internal: open state, trigger and ids shared by a menu and its parts. */
export const MenuContext = createContext<MenuCtx>(null as never);

export interface MenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  /** Called with the next open state. */
  onOpenChange?: (open: boolean) => void;
  /** The parts of the component: a trigger and its content. */
  children?: ReactNode;
}

/** Internal: holds a menu's open state for DropdownMenu, ContextMenu and Menubar. */
export function MenuRoot({open, defaultOpen = false, onOpenChange, children, extra}: MenuProps & {extra?: Partial<MenuCtx>}) {
  const [isOpen, setOpen] = useControllableState({value: open, defaultValue: defaultOpen, onChange: onOpenChange});
  const trigger = useRef<HTMLElement | null>(null), id = useId();
  return <MenuContext.Provider value={{open: isOpen, setOpen, trigger, triggerId: id + 't', menuId: id + 'm', ...extra}}>{children}</MenuContext.Provider>;
}

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement>, Placement {
  /** Called when Escape is pressed; call `event.preventDefault()` to keep it open. */
  onEscapeKeyDown?: (event: Event) => void;
  /** Called after it closes, before focus returns to the trigger; `preventDefault()` lets you move focus yourself. */
  onCloseAutoFocus?: (event: Event) => void;
}

const ITEM = '[role^=menuitem]:not([aria-disabled=true])';

const Panel = forwardRef<HTMLDivElement, MenuContentProps>(function Panel({onEscapeKeyDown, onCloseAutoFocus, onKeyDown, ...rest}, forwarded) {
  const c = useContext(MenuContext);
  const el = useRef<HTMLDivElement | null>(null), outside = useRef(false), typed = useRef({text: '', at: 0});
  useDismiss(true, [el, c.trigger], (kind) => {
    if (kind === 'escape' && onEscapeKeyDown) { const e = new Event('x', {cancelable: true}); onEscapeKeyDown(e); if (e.defaultPrevented) return; }
    outside.current = kind === 'outside';
    c.setOpen(false);
  });
  useEffect(() => {
    const p = el.current!, items = p.querySelectorAll<HTMLElement>(ITEM), how = intent;
    intent = 'panel';
    (how === 'first' ? items[0] : how === 'last' ? items[items.length - 1] : p)?.focus();
    return () => {
      if (outside.current) return;
      const e = new Event('x', {cancelable: true}); onCloseAutoFocus?.(e);
      if (!e.defaultPrevented) c.trigger.current?.focus({preventScroll: true});
    };
  }, []);
  const keydown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (c.step && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); c.step(e.key === 'ArrowRight' ? 1 : -1, c.trigger.current); return; }
    const next = nextItem(e.key, !e.ctrlKey && !e.metaKey && !e.altKey, [...el.current!.querySelectorAll<HTMLElement>(ITEM)], typed.current);
    if (next === null) return;
    e.preventDefault(); next?.focus();
  };
  return <Floating ref={(n) => setRefs(n, el, forwarded)} anchor={() => (c.anchor ?? (() => c.trigger.current))()} role="menu" id={c.menuId} aria-orientation="vertical" aria-labelledby={c.anchor ? undefined : c.triggerId} tabIndex={-1} data-state="open" {...rest} onKeyDown={keydown} />;
});

/** Internal: the floating `role="menu"` panel with roving focus and type-ahead. Renders nothing while closed. */
export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent({className, ...props}, ref) {
  const {open} = useContext(MenuContext), hydrated = useHydrated();
  return open && hydrated ? <Panel ref={ref} className={cx('menu-content', className)} {...props} /> : null;
});

export interface MenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Makes the item unselectable and skipped by the keyboard. */
  disabled?: boolean;
  /** Called when the item is chosen by click, Enter or Space. Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void;
}

/** Internal: one menu entry; `role` picks menuitem, menuitemcheckbox or menuitemradio. */
export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps & {role?: string}>(function MenuItem({role = 'menuitem', disabled, onSelect, onClick, onKeyDown, onPointerMove, onFocus, onBlur, ...rest}, ref) {
  const c = useContext(MenuContext);
  const choose = () => { const e = new Event('menu.itemSelect', {cancelable: true}); onSelect?.(e); if (!e.defaultPrevented) c.setOpen(false); };
  return (
    <div
      ref={ref} role={role} tabIndex={-1} aria-disabled={disabled || undefined} data-disabled={disabled ? '' : undefined} {...rest}
      onClick={(e) => { onClick?.(e); if (!e.defaultPrevented && !disabled) choose(); }}
      onKeyDown={(e) => { onKeyDown?.(e); if (!e.defaultPrevented && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!disabled) choose(); } }}
      onPointerMove={(e) => { onPointerMove?.(e); if (!disabled) e.currentTarget.focus({preventScroll: true}); }}
      onFocus={(e) => { onFocus?.(e); e.currentTarget.setAttribute('data-highlighted', ''); }}
      onBlur={(e) => { onBlur?.(e); e.currentTarget.removeAttribute('data-highlighted'); }}
    />
  );
});

export interface MenuCheckboxItemProps extends MenuItemProps {
  /** Whether the entry is on. */
  checked?: boolean | 'indeterminate';
  /** Called with the next state when the entry is chosen. */
  onCheckedChange?: (checked: boolean) => void;
}
/** Internal: a menu entry that toggles. */
export const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(function MenuCheckboxItem({checked = false, onCheckedChange, onSelect, children, className, ...rest}, ref) {
  return (
    <MenuItem ref={ref} role="menuitemcheckbox" aria-checked={checked === 'indeterminate' ? 'mixed' : checked} data-state={checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked'} className={cx('menu-item', className)} onSelect={(e) => { onCheckedChange?.(checked !== true); onSelect?.(e); }} {...rest}>
      <span className="menu-item-check"><span className="menu-indicator">{checked === 'indeterminate' ? '–' : checked ? '✓' : null}</span>{children}</span>
    </MenuItem>
  );
});

const Radio = createContext<{value?: string; onValueChange?: (v: string) => void}>({});
export interface MenuRadioGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** The chosen item's value. */
  value?: string;
  /** Called with the value of the item the user chose. */
  onValueChange?: (value: string) => void;
}
/** Internal: a set of radio entries sharing one value. */
export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>(function MenuRadioGroup({value, onValueChange, ...rest}, ref) {
  return <Radio.Provider value={{value, onValueChange}}><div ref={ref} role="group" {...rest} /></Radio.Provider>;
});
/** Internal: one choice in a radio group of menu entries. */
export const MenuRadioItem = forwardRef<HTMLDivElement, MenuItemProps & {
  /** The value this item reports to its `MenuRadioGroup`. */
  value: string;
}>(function MenuRadioItem({value, onSelect, children, className, ...rest}, ref) {
  const g = useContext(Radio), checked = g.value === value;
  return (
    <MenuItem ref={ref} role="menuitemradio" aria-checked={checked} data-state={checked ? 'checked' : 'unchecked'} className={cx('menu-item', className)} onSelect={(e) => { g.onValueChange?.(value); onSelect?.(e); }} {...rest}>
      <span className="menu-item-check"><span className="menu-indicator">{checked ? '●' : null}</span>{children}</span>
    </MenuItem>
  );
});

/** Internal: groups menu entries. */
export const MenuGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function MenuGroup(props, ref) {
  return <div ref={ref} role="group" {...props} />;
});
/** Internal: a line between groups of entries. */
export const MenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function MenuSeparator({className, ...rest}, ref) {
  return <div ref={ref} role="separator" aria-orientation="horizontal" className={cx('menu-sep', className)} {...rest} />;
});
/** Internal: a heading for a group of entries. */
export const MenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function MenuLabel({className, ...rest}, ref) {
  return <div ref={ref} className={cx('menu-label', className)} {...rest} />;
});
