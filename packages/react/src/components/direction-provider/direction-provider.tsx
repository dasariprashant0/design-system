'use client';
import type {ReactNode} from 'react';
import {Direction} from 'radix-ui';

export interface DirectionProviderProps {
  /** Reading direction for everything below: `ltr` or `rtl`. */
  dir: 'ltr' | 'rtl';
  /** The part of the app that should use this direction. */
  children?: ReactNode;
}

/**
 * Set the reading direction once for every Radix-based component below it (tabs, slider, menus,
 * select, toggle group, accordion, navigation menu) and for Monoline's own arrow-key widgets.
 * Also put `dir` on `<html>` (or a wrapper) so the CSS flips: the provider does not render an element.
 * @example <DirectionProvider dir="rtl"><App /></DirectionProvider>
 */
export function DirectionProvider({dir, children}: DirectionProviderProps) {
  return <Direction.Provider dir={dir}>{children}</Direction.Provider>;
}

/** The direction set by the nearest `DirectionProvider`, `'ltr'` when there is none. */
export const useDirection = Direction.useDirection;
