import {readFileSync} from 'node:fs';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef} from 'react';
import {Autocomplete} from './components/autocomplete/autocomplete';
import {Avatar} from './components/avatar/avatar';
import {Button} from './components/button/button';
import {Checkbox} from './components/checkbox/checkbox';
import {Combobox} from './components/combobox/combobox';
import {DatePicker} from './components/date-picker/date-picker';
import {Field} from './components/field/field';
import {Input} from './components/input/input';
import {NativeSelect} from './components/native-select/native-select';
import {NumberInput} from './components/number-input/number-input';
import {Pagination} from './components/pagination/pagination';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './components/select/select';
import {Text} from './components/text/text';
import {Textarea} from './components/textarea/textarea';
import {TimePicker} from './components/time-picker/time-picker';

const CSS_DIR = '../../css/src/components/'; // concatenated so Vite does not treat it as an asset URL
const css = (f: string) => readFileSync(new URL(CSS_DIR + f, import.meta.url), 'utf8');
const buttons = css('02-buttons.css'), fields = css('03-form-fields.css'), select = css('select.css');
const opts = [{value: 'a', label: 'A'}];

describe('size scale: sm | md | lg on every single-line control', () => {
  const cases: Array<[string, (size: 'sm' | 'lg') => React.ReactElement, string, string]> = [
    ['Button', (s) => <Button size={s}>x</Button>, 'button', 'btn'],
    ['Input', (s) => <Input aria-label="x" size={s} />, 'textbox', 'input'],
    ['NativeSelect', (s) => <NativeSelect aria-label="x" size={s}><option>a</option></NativeSelect>, 'combobox', 'input'],
    ['Combobox', (s) => <Combobox aria-label="x" options={opts} size={s} />, 'combobox', 'input'],
    ['Autocomplete', (s) => <Autocomplete aria-label="x" suggestions={['a']} size={s} />, 'combobox', 'input'],
    ['NumberInput', (s) => <NumberInput aria-label="x" size={s} />, 'spinbutton', 'input'],
    ['DatePicker', (s) => <DatePicker aria-label="x" size={s} />, 'button', 'input'],
    ['SelectTrigger', (s) => <Select><SelectTrigger aria-label="x" size={s}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>, 'combobox', 'select-trigger'],
  ];
  it.each(cases)('%s takes size="sm" and size="lg" and leaves md unclassed', (_n, make, role, base) => {
    const {unmount} = render(make('sm'));
    const el = screen.getByRole(role as 'button');
    expect(el.className).toContain(`${base === 'btn' ? 'btn' : 'input'}-sm`);
    unmount();
    render(make('lg'));
    expect(screen.getByRole(role as 'button').className).toContain(`${base === 'btn' ? 'btn' : 'input'}-lg`);
  });
  it('TimePicker takes a size too', () => {
    const {container} = render(<TimePicker aria-label="x" size="sm" />);
    expect(container.querySelector('input')!.className).toContain('input-sm');
  });
  it('Avatar adds sm', () => {
    const {container} = render(<Avatar name="Ada Lovelace" size="sm" />);
    expect(container.firstElementChild!.className).toContain('avatar-sm');
  });
});

describe('state attributes: data-invalid and data-disabled', () => {
  it('an `invalid` prop sets aria-invalid and data-invalid', () => {
    render(<><Input aria-label="a" invalid /><Textarea aria-label="b" invalid /><NativeSelect aria-label="c" invalid><option>a</option></NativeSelect><Combobox aria-label="d" options={opts} invalid /></>);
    for (const n of ['a', 'b', 'c', 'd']) {
      const el = screen.getByLabelText(n);
      expect(el).toHaveAttribute('aria-invalid', 'true');
      expect(el).toHaveAttribute('data-invalid');
    }
  });
  it('a Field error sets data-invalid on its control', () => {
    render(<Field label="Name" error="Required"><Input /></Field>);
    expect(screen.getByLabelText('Name')).toHaveAttribute('data-invalid');
  });
  it('Checkbox and DatePicker expose data-invalid', () => {
    render(<><Checkbox aria-label="c" invalid /><DatePicker aria-label="d" invalid /></>);
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-invalid');
    expect(screen.getByRole('button', {name: 'd'})).toHaveAttribute('data-invalid');
  });
  it('disabled form controls expose data-disabled, like Radix parts do', () => {
    render(<><Input aria-label="a" disabled /><Textarea aria-label="b" disabled /><Button disabled>c</Button><Combobox aria-label="d" options={opts} disabled /><TimePicker aria-label="e" disabled /></>);
    for (const el of [screen.getByLabelText('a'), screen.getByLabelText('b'), screen.getByRole('button', {name: 'c'}), screen.getByLabelText('d'), screen.getByLabelText('e')]) {
      expect(el).toHaveAttribute('data-disabled');
      expect(el).toBeDisabled();
    }
  });
  it('a valid, enabled control has neither', () => {
    render(<Input aria-label="a" />);
    expect(screen.getByLabelText('a')).not.toHaveAttribute('data-invalid');
    expect(screen.getByLabelText('a')).not.toHaveAttribute('data-disabled');
  });
});

describe('open state on custom listboxes', () => {
  it('Combobox exposes data-state open or closed', async () => {
    render(<Combobox aria-label="x" options={opts} />);
    const el = screen.getByRole('combobox');
    expect(el).toHaveAttribute('data-state', 'closed');
    await userEvent.click(el);
    expect(el).toHaveAttribute('data-state', 'open');
  });
});

describe('ref forwarding and className merging', () => {
  it('forwards refs to the root element and keeps the base class', () => {
    const r = createRef<HTMLInputElement>();
    render(<Input aria-label="a" ref={r} className="mine" />);
    expect(r.current).toBeInstanceOf(HTMLInputElement);
    expect(r.current!.className).toBe('input mine');
  });
});

describe('deprecated aliases keep working', () => {
  it('Text tone="ok" keeps its class, and success and warning are styled by the same stylesheet', () => {
    const {container} = render(<><Text tone="ok">a</Text><Text tone="success">b</Text><Text tone="warning">c</Text></>);
    const [a, b, c] = Array.from(container.querySelectorAll('p'));
    expect(a!.className).toContain('text-ok');
    expect(b!.className).toContain('text-success');
    expect(c!.className).toContain('text-warning');
    const text = css('text.css');
    expect(text).toMatch(/\.text-success, \.text-ok \{ color: var\(--ok\)/);
    expect(text).toContain('.text-warning { color: var(--warning)');
  });
});

describe('Pagination controlled and uncontrolled', () => {
  it('works uncontrolled with defaultPage and still reports changes', async () => {
    const onPageChange = vi.fn();
    render(<Pagination pageCount={5} defaultPage={2} onPageChange={onPageChange} />);
    expect(screen.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', {name: 'Page 3'})).toHaveAttribute('aria-current', 'page');
  });
  it('stays on the controlled page', async () => {
    render(<Pagination pageCount={5} page={2} onPageChange={() => {}} />);
    await userEvent.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getByRole('button', {name: 'Page 2'})).toHaveAttribute('aria-current', 'page');
  });
});

/**
 * jsdom has no layout, so heights are checked where they are decided: the CSS. Every single-line control must take
 * its height from the same --control-* token at the same size, so Button, Input and Select line up in a row.
 */
describe('control heights come from one scale', () => {
  const rule = (src: string, selector: string) => {
    const m = src.split('\n').find((l) => l.startsWith(selector + ' {') || l.includes(`${selector} {`));
    return m?.match(/(?<![-\w])height:\s*(var\(--control-(?:sm|md|lg)\))/)?.[1];
  };
  it.each([
    ['md', 'var(--control-md)', rule(buttons, '.btn'), rule(fields, '.input, .select'), rule(select, '.select-trigger')],
    ['sm', 'var(--control-sm)', rule(buttons, '.btn-sm'), rule(fields, '.input-sm'), rule(select, '.select-trigger.input-sm')],
    ['lg', 'var(--control-lg)', rule(buttons, '.btn-lg'), rule(fields, '.input-lg'), rule(select, '.select-trigger.input-lg')],
  ])('size %s: Button, Input/NativeSelect and Select trigger all use %s', (_s, token, btn, input, trigger) => {
    expect([btn, input, trigger]).toEqual([token, token, token]);
  });
});
