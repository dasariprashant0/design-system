'use client';
import {forwardRef, useState, type InputHTMLAttributes} from 'react';
import {cx} from '../../utils/cx';
import {invalidAttrs, useFieldControl} from '../field';
import {Tag} from '../tag';

export interface TagsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  /** The current tags when controlled. Pair with `onValueChange`. */
  value?: string[];
  /** The tags present at first when uncontrolled. Default empty. */
  defaultValue?: string[];
  /** Called with the full list of tags after one is added or removed. */
  onValueChange?: (value: string[]) => void;
  /** `md` (default), `sm` for dense layouts or `lg` for prominent forms. Heights match Button, Input and Select at each size. */
  size?: 'sm' | 'md' | 'lg';
  /** Marks the field as having an error: sets `aria-invalid` and shows the error border. */
  invalid?: boolean;
}

/**
 * Free-text tags. Enter or comma adds the typed text (trimmed, duplicates ignored),
 * Backspace in an empty field removes the last tag, and each tag has a remove button.
 * Unlike `MultiSelect` there is no list: any text is a valid tag.
 */
export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput({value, defaultValue = [], onValueChange, size = 'md', invalid, disabled, className, onKeyDown, onBlur, ...rest}, ref) {
  const f = useFieldControl();
  const [inner, setInner] = useState(defaultValue);
  const tags = value ?? inner;
  const [text, setText] = useState('');
  const commit = (next: string[]) => { if (value === undefined) setInner(next); onValueChange?.(next); };
  const add = (raw: string) => {
    const t = raw.trim();
    setText('');
    if (t && !tags.includes(t)) commit([...tags, t]);
  };

  return (
    <div className={cx('tags-input', className)} data-size={size !== 'md' ? size : undefined} data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
      {tags.map((t) => <Tag key={t} onRemove={disabled ? undefined : () => commit(tags.filter((x) => x !== t))}>{t}</Tag>)}
      <input
        ref={ref}
        type="text"
        className="tags-input-field"
        disabled={disabled}
        {...f}
        {...invalidAttrs(invalid)}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          if (v.includes(',')) { const parts = v.split(','); parts.slice(0, -1).forEach(add); setText(parts[parts.length - 1]!); }
          else setText(v);
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          if (e.key === 'Enter') { e.preventDefault(); add(text); }
          else if (e.key === 'Backspace' && !text && tags.length) commit(tags.slice(0, -1));
        }}
        onBlur={(e) => { onBlur?.(e); add(text); }}
        {...rest}
      />
    </div>
  );
});
