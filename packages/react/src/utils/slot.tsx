import {cloneElement, forwardRef, isValidElement, version, type HTMLAttributes, type ReactElement, type ReactNode, type Ref} from 'react';
import {setRefs} from './overlay';

/** The child's ref: `props.ref` in React 19, `element.ref` before (reading it in 19 logs a warning). */
const refOf = (el: ReactElement<{ref?: Ref<unknown>}>): Ref<unknown> | undefined => 'ref' in el.props ? el.props.ref : Number(version.split('.')[0]) < 19 ? (el as unknown as {ref?: Ref<unknown>}).ref : undefined;

/** `asChild` without the weight: renders its only child element with the Slot's props merged in. The child's props win;
 *  event handlers of both run (the child's first); `className` joins; `style` merges; refs compose. */
export const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & {children?: ReactNode}>(function Slot({children, ...slot}, ref) {
  if (!isValidElement(children)) return null;
  const child = children as ReactElement<Record<string, any>>, own = child.props; // eslint-disable-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = {...slot, ...own}; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const k in own) { const a = (slot as Record<string, unknown>)[k], b = own[k]; if (/^on[A-Z]/.test(k) && typeof a === 'function' && typeof b === 'function') props[k] = (...x: unknown[]) => { b(...x); a(...x); }; }
  if (slot.style || own.style) props.style = {...slot.style, ...own.style};
  if (slot.className || own.className) props.className = [slot.className, own.className].filter(Boolean).join(' ');
  props.ref = (n: HTMLElement | null) => setRefs(n, ref, refOf(child as never));
  return cloneElement(child, props);
});
