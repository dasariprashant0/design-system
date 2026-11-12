import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Slider} from './slider';

describe('Slider', () => {
  it('has a named thumb with value, min and max', () => {
    render(<Slider aria-label="Volume" defaultValue={60} />);
    const thumb = screen.getByRole('slider', {name: 'Volume'});
    expect(thumb).toHaveAttribute('aria-valuenow', '60');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
  });
  it('steps with arrow keys and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={50} onValueChange={onChange} />);
    screen.getByRole('slider').focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith([51]);
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith([0]);
  });
  it('renders two labelled thumbs for a range', () => {
    render(<Slider aria-label="Price" defaultValue={[20, 70]} />);
    expect(screen.getByRole('slider', {name: 'Price minimum'})).toHaveAttribute('aria-valuenow', '20');
    expect(screen.getByRole('slider', {name: 'Price maximum'})).toHaveAttribute('aria-valuenow', '70');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Slider aria-label="Volume" defaultValue={30} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
