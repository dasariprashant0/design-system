// Renders every demo of every component and hook once: it must not throw, must not log React errors
// (invalid nesting, missing keys, act warnings) and must have no axe violations. A new component's demo
// is picked up automatically, so a broken demo fails here before it reaches the docs site.
import {render} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {axe} from './test/axe';
import type {Demo} from './demo';

const modules = import.meta.glob<{demos: Demo[]}>('./{components,hooks}/*/*.demo.tsx', {eager: true});

beforeEach(() => {
  // jsdom lacks these; effects and menus feature-detect them in the browser.
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as never;
  globalThis.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } } as never;
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => vi.restoreAllMocks());

describe.each(Object.entries(modules))('%s', (path, mod) => {
  mod.demos.forEach((demo) => {
    it(`${demo.title}: renders cleanly and has no axe violations`, async () => {
      const errors: string[] = [];
      vi.spyOn(console, 'error').mockImplementation((...a) => { errors.push(a.map(String).join(' ').slice(0, 200)); });
      const {container, unmount} = render(<>{demo.render()}</>);
      expect(errors, path).toEqual([]);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    });
  });
});
