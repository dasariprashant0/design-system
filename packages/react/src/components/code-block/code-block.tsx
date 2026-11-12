'use client';
import {forwardRef, useEffect, useRef, useState, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The text to show and to copy. Rendered as plain text, never as HTML. */
  code: string;
  /** Shown top left, for example a file name or "bash". Also names the region. */
  title?: string;
  /** Hide the copy button. */
  hideCopy?: boolean;
}

/** Plain code with a copy button. Add syntax colours with your own highlighter by rendering it as children of the `code` element via CSS classes if needed. */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock({code, title, hideCopy, className, ...rest}, ref) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  return (
    <div ref={ref} role="group" aria-label={title ?? 'Code'} className={cx('code-block', className)} {...rest}>
      {(title || !hideCopy) && (
        <div className="code-head">
          <span className="label">{title}</span>
          {!hideCopy && <button type="button" className="code-copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}<span className="sr-only"> code</span></button>}
        </div>
      )}
      <pre tabIndex={0}><code>{code}</code></pre>
      <span className="sr-only" role="status">{copied ? 'Copied to clipboard' : ''}</span>
    </div>
  );
});
