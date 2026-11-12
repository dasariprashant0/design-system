'use client';
import {forwardRef, useEffect, useMemo, useRef, useState, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {highlight, languageFromName, type Language, type Token} from '../../utils/highlight';

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The text to show and to copy. Rendered as text with coloured spans, never as HTML. */
  code: string;
  /** A file name (`button.tsx`) or label (`bash`) shown in the header. Also names the region and picks the language. */
  title?: string;
  /** Syntax colouring: `tsx`, `ts`, `jsx`, `js`, `css`, `html`, `bash`, `json` or `text`. Default: guessed from `title`, else `text`. */
  language?: Language;
  /** Number each line. Use for longer listings, not one-line commands. */
  lineNumbers?: boolean;
  /** Hide the copy button. */
  hideCopy?: boolean;
}

const CopyIcon = () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.25"><rect x="5.5" y="5.5" width="8" height="8" /><path d="M10.5 5.5v-3h-8v8h3" /></svg>;
const CheckIcon = () => <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8.5l3.2 3.2L13 4.8" /></svg>;

/** Split tokens into lines, keeping each token's type. */
function toLines(tokens: Token[]): Token[][] {
  const lines: Token[][] = [[]];
  for (const t of tokens) {
    const parts = t.text.split('\n');
    parts.forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({type: t.type, text: part});
    });
  }
  return lines;
}

/**
 * Syntax-coloured code with an icon copy button inside the panel. With a `title` the button sits in a header
 * row; without one it floats in the top corner. The copy button announces "Copied" politely.
 * @example <CodeBlock title="app.tsx" code={source} lineNumbers />
 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock({code, title, language, lineNumbers, hideCopy, className, ...rest}, ref) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const lang = language ?? languageFromName(title);
  const lines = useMemo(() => toLines(highlight(code.replace(/\n$/, ''), lang)), [code, lang]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  const button = !hideCopy && (
    <button type="button" className="code-copy" onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'} data-copied={copied || undefined}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
  return (
    <div ref={ref} role="group" aria-label={title ?? 'Code'} className={cx('code-block', className)} data-headless={!title || undefined} data-language={lang} {...rest}>
      {title && (
        <div className="code-head">
          <span className="code-title">{title}</span>
          {button}
        </div>
      )}
      {!title && button}
      <pre tabIndex={0} data-lines={lineNumbers || undefined}>
        <code>
          {lines.map((line, i) => (
            <span key={i} className="code-line">
              {line.map((t, j) => (t.type === 'plain' ? t.text : <span key={j} className={`tok-${t.type}`}>{t.text}</span>))}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      <span className="sr-only" role="status">{copied ? 'Copied to clipboard' : ''}</span>
    </div>
  );
});
