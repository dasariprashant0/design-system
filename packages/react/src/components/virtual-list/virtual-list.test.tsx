import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {VirtualList} from './virtual-list';

const ui = (props: Partial<React.ComponentProps<typeof VirtualList>> = {}) => (
  <VirtualList aria-label="Rows" count={1000} itemHeight={20} height={100} overscan={2} renderItem={(i) => `Row ${i + 1}`} {...props} />
);

describe('VirtualList', () => {
  it('renders only the window plus overscan', () => {
    render(ui());
    expect(screen.getAllByRole('listitem')).toHaveLength(8); // 0..7: 5 visible + 2 overscan + the boundary row
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.queryByText('Row 500')).toBeNull();
  });
  it('reports each row as n of the whole set', () => {
    render(ui());
    const row = screen.getByText('Row 3');
    expect(row).toHaveAttribute('aria-posinset', '3');
    expect(row).toHaveAttribute('aria-setsize', '1000');
  });
  it('swaps rows when scrolled and honours overscan', () => {
    render(ui({overscan: 0}));
    const list = screen.getByRole('list', {name: 'Rows'});
    list.scrollTop = 2000;
    fireEvent.scroll(list);
    expect(screen.queryByText('Row 1')).toBeNull();
    expect(screen.getByText('Row 101')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeLessThanOrEqual(6);
  });
  it('puts one row in the tab order and moves with arrows, End and Home', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    expect(screen.getByText('Row 1')).toHaveFocus();
    expect(screen.getAllByRole('listitem').filter((r) => r.tabIndex === 0)).toHaveLength(1);
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Row 2')).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByText('Row 1000')).toHaveFocus();
    expect(screen.getByText('Row 1000')).toHaveAttribute('aria-posinset', '1000');
    await user.keyboard('{Home}');
    expect(screen.getByText('Row 1')).toHaveFocus();
  });
  it('pages by the window height', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{PageDown}');
    expect(screen.getByText('Row 5')).toHaveFocus();
  });
  it('forwards the ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(ui({ref}));
    expect(ref.current).toHaveAttribute('role', 'list');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
