import {createRef} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {ShimmerButton} from './shimmer-button';

describe('ShimmerButton', () => {
  it('is a real button with the button classes and defaults to solid', () => {
    render(<ShimmerButton>Start</ShimmerButton>);
    const b = screen.getByRole('button', {name: 'Start'});
    expect(b.tagName).toBe('BUTTON');
    expect(b).toHaveClass('btn', 'btn-solid', 'shimmer-button');
    expect(b).toHaveAttribute('type', 'button');
  });
  it('accepts the other Button variants', () => {
    render(<ShimmerButton variant="line">Go</ShimmerButton>);
    expect(screen.getByRole('button')).toHaveClass('btn-line');
  });
  it('clicks and activates from the keyboard', async () => {
    const onClick = vi.fn();
    render(<ShimmerButton onClick={onClick}>Go</ShimmerButton>);
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });
  it('ignores clicks when disabled', async () => {
    const onClick = vi.fn();
    render(<ShimmerButton disabled onClick={onClick}>Go</ShimmerButton>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
  it('forwards its ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ShimmerButton ref={ref}>Go</ShimmerButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<ShimmerButton>Start</ShimmerButton>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
