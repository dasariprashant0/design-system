import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Pagination, pageWindow} from './pagination';

describe('pageWindow', () => {
  it('always keeps first and last and collapses gaps', () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 5].length ? [1, 2, 'gap', 5] : []);
    expect(pageWindow(10, 20)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(1, 1)).toEqual([1]);
  });
});

describe('Pagination', () => {
  it('marks the current page and disables Prev on the first', () => {
    render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />);
    expect(screen.getByRole('button', {name: 'Page 1'})).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', {name: 'Prev'})).toBeDisabled();
  });
  it('calls onPageChange for a page, Next and Prev', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination page={3} pageCount={5} onPageChange={onChange} />);
    await user.click(screen.getByRole('button', {name: 'Next'}));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole('button', {name: 'Prev'}));
    expect(onChange).toHaveBeenLastCalledWith(2);
    await user.click(screen.getByRole('button', {name: 'Page 5'}));
    expect(onChange).toHaveBeenLastCalledWith(5);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Pagination page={3} pageCount={10} onPageChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
