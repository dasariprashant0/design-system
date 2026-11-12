'use client';
import {forwardRef, useId, type FormEvent, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Button} from '../button';
import {Field} from '../field';
import {Fieldset} from '../fieldset';
import {Form, FormActions} from '../form';
import {Heading} from '../heading';
import {NativeSelect} from '../native-select';
import {Switch} from '../switch';
import {Text} from '../text';

export interface SettingSwitch {
  kind: 'switch';
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  defaultChecked?: boolean;
}
export interface SettingSelect {
  kind: 'select';
  name: string;
  label: ReactNode;
  hint?: ReactNode;
  options: {value: string; label: string}[];
  defaultValue?: string;
}
export type SettingItem = SettingSwitch | SettingSelect;

export interface SettingsSection {
  /** Names the group (a `legend`). */
  legend: ReactNode;
  description?: ReactNode;
  items: SettingItem[];
}

export interface BlockSettingsFormProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  title: ReactNode;
  description?: ReactNode;
  sections: SettingsSection[];
  saveLabel?: ReactNode;
  resetLabel?: ReactNode;
  /** Called with every control's value: switches are `true` or `false`, selects their value. */
  onSubmit?: (values: Record<string, string | boolean>) => void;
  loading?: boolean;
  headingLevel?: 1 | 2 | 3;
}

/** A settings page body: sections of switches and selects, each in a Fieldset, with Save and Reset. */
export const BlockSettingsForm = forwardRef<HTMLElement, BlockSettingsFormProps>(function BlockSettingsForm({title, description, sections, saveLabel = 'Save changes', resetLabel = 'Reset', onSubmit, loading, headingLevel = 1, className, ...rest}, ref) {
  const id = useId();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const values: Record<string, string | boolean> = {};
    for (const s of sections) for (const it of s.items) {
      const el = form.elements.namedItem(it.name);
      // A Radix Switch inside a form renders a hidden checkbox with the name.
      values[it.name] = it.kind === 'select' ? (el instanceof HTMLSelectElement ? el.value : '') : el instanceof HTMLInputElement && el.checked;
    }
    onSubmit?.(values);
  };
  return (
    <section ref={ref} className={cx('block-settings', className)} aria-labelledby={id} {...rest}>
      <div className="block-settings-head">
        <Heading id={id} level={headingLevel} size="xl">{title}</Heading>
        {description && <Text tone="muted">{description}</Text>}
      </div>
      <Form aria-labelledby={id} preventDefault onSubmit={submit}>
        {sections.map((s, i) => (
          <Fieldset key={i} legend={s.legend}>
            {s.description && <Text size="sm" tone="muted">{s.description}</Text>}
            {s.items.map((it) => it.kind === 'switch' ? (
              <div key={it.name} className="block-settings-row">
                <Switch name={it.name} label={it.label} defaultChecked={it.defaultChecked} aria-describedby={it.hint ? `${id}-${it.name}-hint` : undefined} />
                {it.hint && <span id={`${id}-${it.name}-hint`} className="field-hint">{it.hint}</span>}
              </div>
            ) : (
              <Field key={it.name} label={it.label} hint={it.hint}>
                <NativeSelect name={it.name} defaultValue={it.defaultValue}>
                  {it.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </NativeSelect>
              </Field>
            ))}
          </Fieldset>
        ))}
        <FormActions>
          <Button type="submit" variant="solid" loading={loading}>{saveLabel}</Button>
          <Button type="reset">{resetLabel}</Button>
        </FormActions>
      </Form>
    </section>
  );
});
