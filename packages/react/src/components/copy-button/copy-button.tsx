'use client';
import {forwardRef, type ReactNode} from 'react';
import {Button, type ButtonProps} from '../button';
import {IconButton} from '../icon-button';
import {useClipboard} from '../../hooks/use-clipboard';

export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'value' | 'aria-label'> {
  /** The text written to the clipboard when the button is pressed. */
  value: string;
  /** Visible text. Leave it out for an icon-only button that is named by `label`. */
  children?: ReactNode;
  /** The accessible name of the icon-only button (the text button is named by its children). Default "Copy". */
  label?: string;
  /** What is shown (text button) and announced to screen readers after a successful copy. Default "Copied". */
  copiedLabel?: string;
  /** What is announced when the browser refuses to copy. Default "Copy failed". */
  failedLabel?: string;
  /** How long the copied state lasts, in milliseconds. Default 2000. */
  timeout?: number;
  /** Called with the copied text after a successful copy. */
  onCopied?: (value: string) => void;
}

const Copy = () => <svg aria-hidden="true" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor"><rect x="5.5" y="5.5" width="8" height="8" /><path d="M10.5 5.5v-3h-8v8h3" /></svg>;
const Check = () => <svg aria-hidden="true" viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor"><path d="M2.5 8.5l3.5 3.5 7.5-8" /></svg>;

/**
 * A button that copies `value` to the clipboard, swaps to a check or "Copied" for two seconds and announces the result in a polite live region.
 * @example <CopyButton value="npm i @monoline/react" />
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton({value, children, label = 'Copy', copiedLabel = 'Copied', failedLabel = 'Copy failed', timeout, onCopied, onClick, ...rest}, ref) {
  const {copied, error, copy} = useClipboard({timeout});
  const press = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (await copy(value)) onCopied?.(value);
  };
  const status = <span role="status" className="sr-only">{copied ? copiedLabel : error ? failedLabel : ''}</span>;
  return children === undefined ? (
    <>
      <IconButton ref={ref} aria-label={label} data-copied={copied || undefined} onClick={press} {...rest}>{copied ? <Check /> : <Copy />}</IconButton>
      {status}
    </>
  ) : (
    <>
      <Button ref={ref} data-copied={copied || undefined} onClick={press} {...rest}>{copied ? copiedLabel : children}</Button>
      {status}
    </>
  );
});
