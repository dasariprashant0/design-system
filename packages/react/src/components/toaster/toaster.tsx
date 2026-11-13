'use client';
import {useSyncExternalStore, type ReactNode} from 'react';
import {Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport} from '../toast';
import {useDirection} from '../direction-provider';

/** Kinds of toast. `loading` stays until it is updated or dismissed. */
export type ToastKind = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading';

/** Options for `toast()` and its helpers. */
export interface ToastOptions {
  /** Longer text under the message. */
  description?: ReactNode;
  /** One button, such as Undo or Retry. `label` is also its accessible name. */
  action?: {label: string; onClick: () => void};
  /** Milliseconds before it closes. Default 5000; 8000 for errors; `Infinity` keeps it until dismissed. */
  duration?: number;
  /** Reuse an id to replace a toast that is already showing instead of adding another. */
  id?: string | number;
}

/** Texts for `toast.promise()`. Each may be a string or a function of the result or error. */
export interface ToastPromiseMessages<T> {
  /** Shown while the promise is pending. */
  loading: ReactNode;
  /** Shown when it resolves. */
  success: ReactNode | ((value: T) => ReactNode);
  /** Shown when it rejects. */
  error: ReactNode | ((reason: unknown) => ReactNode);
}

interface Item extends ToastOptions {
  id: string | number;
  kind: ToastKind;
  message: ReactNode;
  open: boolean;
}

// A tiny external store: a list, a version, and listeners. Nothing runs at import time.
let items: Item[] = [];
const listeners = new Set<() => void>();
let seq = 0;
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const snapshot = () => items;

function show(kind: ToastKind, message: ReactNode, opts: ToastOptions = {}): string | number {
  const id = opts.id ?? ++seq;
  const next: Item = {...opts, id, kind, message, open: true};
  items = items.some((i) => i.id === id) ? items.map((i) => (i.id === id ? next : i)) : [...items, next];
  emit();
  return id;
}

function remove(id: string | number) {
  items = items.filter((i) => i.id !== id);
  emit();
}

function dismiss(id?: string | number) {
  items = items.map((i) => (id === undefined || i.id === id ? {...i, open: false} : i));
  emit();
  // Let the exit animation play, then forget the toast.
  setTimeout(() => items.filter((i) => !i.open).forEach((i) => remove(i.id)), 300);
}

/** The function behind `toast`. Use `toast` itself. */
export interface ToastFn {
  (message: ReactNode, options?: ToastOptions): string | number;
  /** A success message. */
  success: (message: ReactNode, options?: ToastOptions) => string | number;
  /** An error message. Announced assertively and stays longer. */
  error: (message: ReactNode, options?: ToastOptions) => string | number;
  /** A neutral information message. */
  info: (message: ReactNode, options?: ToastOptions) => string | number;
  /** A warning message. */
  warning: (message: ReactNode, options?: ToastOptions) => string | number;
  /** Follows a promise: shows `loading`, then replaces it with `success` or `error`. Returns the promise. */
  promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) => Promise<T>;
  /** Closes the toast with this id, or all toasts when called without one. */
  dismiss: (id?: string | number) => void;
}

/**
 * Show a message from anywhere, no hook needed. Mount one `<Toaster />` first.
 * @example toast.success('Saved', {description: 'Draft stored.', action: {label: 'Undo', onClick: undo}})
 */
export const toast: ToastFn = Object.assign(
  (message: ReactNode, options?: ToastOptions) => show('default', message, options),
  {
    success: (m: ReactNode, o?: ToastOptions) => show('success', m, o),
    error: (m: ReactNode, o?: ToastOptions) => show('error', m, o),
    info: (m: ReactNode, o?: ToastOptions) => show('info', m, o),
    warning: (m: ReactNode, o?: ToastOptions) => show('warning', m, o),
    promise: <T,>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: ToastOptions) => {
      const id = show('loading', messages.loading, {...options, duration: Infinity});
      const text = <A,>(m: ReactNode | ((a: A) => ReactNode), a: A) => (typeof m === 'function' ? (m as (a: A) => ReactNode)(a) : m);
      promise.then(
        (v) => { show('success', text(messages.success, v), {...options, id}); },
        (e) => { show('error', text(messages.error, e), {...options, id}); },
      );
      return promise;
    },
    dismiss,
  },
);

export interface ToasterProps {
  /** Most toasts shown at once. Older ones wait out of sight and return when there is room. Default 3. */
  limit?: number;
  /** Where the stack sits. `end` is the bottom corner at the end of the reading direction. Default "end". */
  position?: 'end' | 'start' | 'center';
  /** Names the region for screen readers. Default "Notifications". */
  label?: string;
  /** Text of each close button. Default "Dismiss". */
  dismissLabel?: string;
}

/**
 * Renders the toasts made by `toast()`. Mount it once near the root of the app. Pressing F8 moves focus to the stack;
 * hovering or focusing a toast pauses its timer. Errors are announced assertively, everything else politely.
 * @example <Toaster limit={3} />
 */
export function Toaster({limit = 3, position = 'end', label = 'Notifications', dismissLabel = 'Dismiss'}: ToasterProps) {
  const all = useSyncExternalStore(subscribe, snapshot, snapshot);
  const dir = useDirection();
  // Only the newest `limit` open toasts are rendered; older ones simply unmount.
  const shown = all.filter((i) => i.open).slice(-limit);
  return (
    <ToastProvider duration={5000} swipeDirection={dir === 'rtl' ? 'left' : 'right'} label={label}>
      {shown.map((t) => (
        <Toast
          key={t.id}
          className="toaster-item"
          data-kind={t.kind}
          type={t.kind === 'error' ? 'foreground' : 'background'}
          duration={t.duration ?? (t.kind === 'error' ? 8000 : undefined)}
          open={t.open}
          onOpenChange={(o) => { if (!o) dismiss(t.id); }}
        >
          <ToastTitle>{t.message}</ToastTitle>
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          {t.action && <ToastAction altText={t.action.label} onClick={t.action.onClick}>{t.action.label}</ToastAction>}
          <ToastClose>{dismissLabel}</ToastClose>
        </Toast>
      ))}
      <ToastViewport className="toaster-viewport" data-position={position} label={`${label} ({hotkey})`} />
    </ToastProvider>
  );
}
