import '@testing-library/jest-dom/vitest';
import {expect} from 'vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

// jsdom lacks these browser APIs that Radix popper, select and slider use.
class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.setPointerCapture ??= () => {};

// jsdom has no showModal(): model open/close and the close event so the native-<dialog> components run.
const dlg = HTMLDialogElement.prototype;
dlg.show ??= function (this: HTMLDialogElement) { this.setAttribute('open', ''); };
dlg.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
  // the "dialog focusing steps": first focusable descendant, else the dialog itself
  (this.querySelector<HTMLElement>('[autofocus], input, button, a[href], select, textarea, [tabindex]:not([tabindex="-1"])') ?? this).focus();
};
dlg.close ??= function (this: HTMLDialogElement) { if (this.hasAttribute('open')) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); } };
// Browsers fire `cancel` on the topmost modal dialog when Escape is pressed.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = document.querySelectorAll<HTMLDialogElement>('dialog[open]');
  const top = open[open.length - 1];
  if (top && !top.dispatchEvent(new Event('cancel', {cancelable: true}))) return;
  top?.close();
});
