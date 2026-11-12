'use client';
import {forwardRef, useId, useState, type HTMLAttributes} from 'react';
import {cx} from '../../utils/cx';

const PRESETS = ['#e5484d', '#f76b15', '#f5d90a', '#30a46c', '#12a594', '#0090ff', '#6e56cf', '#d6409f', '#8b8d98', '#000000', '#ffffff'];
const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalise "#abc", "abc" or "#AABBCC" to "#aabbcc"; null when it is not a hex colour. */
function normalise(raw: string): string | null {
  const m = HEX.exec(raw.trim());
  if (!m) return null;
  let h = m[1]!.toLowerCase();
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  return `#${h}`;
}

export interface ColorPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** The colour as "#rrggbb". */
  value?: string;
  /** The initial colour as "#rrggbb" when uncontrolled. */
  defaultValue?: string;
  /** Called with the new colour as "#rrggbb" when the user picks a swatch or types a valid hex. */
  onValueChange?: (value: string) => void;
  /** Preset swatches, each a CSS hex colour. Set from this prop, never from the stylesheet. */
  colors?: string[];
  /** Stops the user changing the colour. */
  disabled?: boolean;
  /** Accessible name for the group. */
  'aria-label'?: string;
}

/**
 * A colour field: a grid of preset swatches, the browser's own colour control, and a hex
 * text field. The hex field validates as you type: only a complete valid value (#rgb or
 * #rrggbb) is applied; anything else marks the field invalid and keeps the last good colour.
 */
export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(function ColorPicker({value, defaultValue = '#000000', onValueChange, colors = PRESETS, disabled, className, 'aria-label': label = 'Colour', ...rest}, ref) {
  const id = useId();
  const [inner, setInner] = useState(normalise(defaultValue) ?? '#000000');
  const current = (value && normalise(value)) || inner;
  const [draft, setDraft] = useState<string | null>(null); // null = show the current value
  const bad = draft !== null && normalise(draft) === null;

  const set = (v: string) => { if (value === undefined) setInner(v); onValueChange?.(v); setDraft(null); };

  return (
    <div ref={ref} role="group" aria-label={label} className={cx('color-picker', className)} data-disabled={disabled || undefined} {...rest}>
      <div className="color-picker-swatches">
        {colors.map((c) => {
          const n = normalise(c) ?? c;
          return (
            <button
              key={c}
              type="button"
              className="color-picker-swatch"
              style={{background: c}}
              aria-label={c}
              aria-pressed={n === current}
              disabled={disabled}
              onClick={() => set(n)}
            />
          );
        })}
      </div>
      <div className="color-picker-row">
        <input type="color" className="color-picker-native" aria-label={`${label} picker`} value={current} disabled={disabled} onChange={(e) => set(e.target.value)} />
        <input
          type="text"
          className="input color-picker-hex"
          aria-label={`${label} hex value`}
          aria-invalid={bad || undefined}
          aria-describedby={bad ? `${id}-err` : undefined}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          disabled={disabled}
          value={draft ?? current}
          onChange={(e) => { const n = normalise(e.target.value); if (n) set(n); else setDraft(e.target.value); }}
          onBlur={() => setDraft(null)}
        />
      </div>
      {bad && <p id={`${id}-err`} className="color-picker-error">Use a hex colour like #1a2b3c.</p>}
    </div>
  );
});
