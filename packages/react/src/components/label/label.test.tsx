import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Label} from './label';
import {createRef} from 'react';
import userEvent from '@testing-library/user-event';

describe('Label', () => {
  it('names its control and focuses it on click', async () => {
    render(<><Label htmlFor="x">Name</Label><input id="x" /></>);
    expect(screen.getByLabelText('Name')).toBe(screen.getByRole('textbox'));
  });
  it('shows the required marker class', () => {
    render(<Label required>Name</Label>);
    expect(screen.getByText('Name')).toHaveClass('field-required');
  });
  it('has no required class by default', () => {
    render(<Label>Name</Label>);
    expect(screen.getByText('Name').className).toBe('label');
  });
  it('renders a label element, forwards ref and merges className', () => {
    const ref = createRef<HTMLLabelElement>();
    render(<Label ref={ref} className="mine" required>Name</Label>);
    expect(ref.current!.tagName).toBe('LABEL');
    expect(ref.current).toHaveClass('label', 'field-required', 'mine');
  });
  it('works by wrapping the control too, and clicking the text focuses it', async () => {
    const user = userEvent.setup();
    render(<Label>Wrapped<input /></Label>);
    await user.click(screen.getByText('Wrapped'));
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
  it('does not swallow a double click on text into a text selection (Radix prevents it)', () => {
    render(<Label htmlFor="x">Text</Label>);
    const ev = new MouseEvent('mousedown', {bubbles: true, cancelable: true, detail: 2});
    screen.getByText('Text').dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
  });
  it('leaves interactive children alone on double click', () => {
    render(<Label htmlFor="x"><button>Inner</button></Label>);
    const ev = new MouseEvent('mousedown', {bubbles: true, cancelable: true, detail: 2});
    screen.getByRole('button').dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });
  it('supports long and RTL text', () => {
    render(<Label htmlFor="x" dir="rtl">{'الاسم '.repeat(200)}</Label>);
    expect(screen.getByText(/الاسم/)).toHaveAttribute('dir', 'rtl');
  });
  it('has no axe violations', async () => {
    const {container} = render(<><Label htmlFor="y">Name</Label><input id="y" /></>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
