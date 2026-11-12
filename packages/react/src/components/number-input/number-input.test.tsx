import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {useState} from 'react';
import {NumberInput} from './number-input';

function Controlled() {
  const [v, setV] = useState('2');
  return <><NumberInput aria-label="Qty" value={v} min={0} max={3} onChange={(e) => setV(e.target.value)} /><output>{v}</output></>;
}

describe('NumberInput', () => {
  it('steps up and down with the buttons (uncontrolled)', async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Qty" defaultValue={1} min={0} max={5} />);
    const input = screen.getByRole('spinbutton', {name: 'Qty'});
    await user.click(screen.getByRole('button', {name: 'Increase'}));
    expect(input).toHaveValue(2);
    await user.click(screen.getByRole('button', {name: 'Decrease'}));
    await user.click(screen.getByRole('button', {name: 'Decrease'}));
    expect(input).toHaveValue(0);
  });
  it('respects max and notifies a controlled parent', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    await user.click(screen.getByRole('button', {name: 'Increase'}));
    await user.click(screen.getByRole('button', {name: 'Increase'}));
    expect(screen.getByRole('spinbutton')).toHaveValue(3);
    expect(screen.getByText('3', {selector: 'output'})).toBeInTheDocument();
  });
  it('disables the step buttons when disabled', () => {
    render(<NumberInput aria-label="Qty" disabled />);
    expect(screen.getByRole('button', {name: 'Increase'})).toBeDisabled();
  });
  it('forwards ref to the input', () => {
    const ref = {current: null as HTMLInputElement | null};
    render(<NumberInput ref={ref} aria-label="Qty" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<NumberInput aria-label="Quantity" defaultValue={1} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
