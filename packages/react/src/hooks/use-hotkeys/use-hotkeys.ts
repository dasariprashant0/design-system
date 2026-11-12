'use client';
import {useEffect, useRef} from 'react';

export type HotkeyHandler = (event: KeyboardEvent) => void;

export interface UseHotkeysOptions {
  /** Set false to turn every binding off. Default true. */
  enabled?: boolean;
  /** Also fire while focus is in a text field, select or contenteditable. Default false. */
  allowInInputs?: boolean;
  /** Call `preventDefault` on a matched key. Default true. */
  preventDefault?: boolean;
}

interface Combo {
  key: string;
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const KEY_ALIASES: Record<string, string> = {esc: 'escape', space: ' ', spacebar: ' ', del: 'delete', return: 'enter'};

/** Parses "mod+shift+k" into parts. `mod` means Cmd on macOS and Ctrl elsewhere. */
export function parseHotkey(combo: string): Combo {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim());
  const key = parts.filter((p) => !['mod', 'ctrl', 'meta', 'cmd', 'shift', 'alt', 'option'].includes(p)).pop() ?? '';
  return {
    key: KEY_ALIASES[key] ?? key,
    mod: parts.includes('mod'),
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
  };
}

function matches(combo: Combo, event: KeyboardEvent): boolean {
  if (event.key.toLowerCase() !== combo.key) return false;
  const mac = isMac();
  const wantMeta = combo.meta || (combo.mod && mac);
  const wantCtrl = combo.ctrl || (combo.mod && !mac);
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== combo.alt) return false;
  // Symbols such as "?" already need Shift on most keyboards, so only letters and named keys check Shift strictly.
  const symbol = combo.key.length === 1 && !/[a-z0-9]/.test(combo.key);
  return symbol || event.shiftKey === combo.shift;
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * Keyboard shortcuts on the document.
 *
 * ```ts
 * useHotkeys({'mod+k': () => openSearch(), escape: () => close()});
 * ```
 *
 * Keys are lower case names (`a`, `escape`, `enter`, `/`) with optional `mod`, `ctrl`, `meta`, `shift`, `alt`.
 * Shortcuts ignore typing in fields unless `allowInInputs` is set. The latest handlers are used, so inline functions are fine.
 */
export function useHotkeys(bindings: Record<string, HotkeyHandler>, options: UseHotkeysOptions = {}): void {
  const {enabled = true, allowInInputs = false, preventDefault = true} = options;
  const bindingsRef = useRef(bindings);

  useEffect(() => {
    bindingsRef.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!allowInInputs && isTyping(event.target)) return;
      for (const [combo, handler] of Object.entries(bindingsRef.current)) {
        if (!matches(parseHotkey(combo), event)) continue;
        if (preventDefault) event.preventDefault();
        handler(event);
        return;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, allowInInputs, preventDefault]);
}
