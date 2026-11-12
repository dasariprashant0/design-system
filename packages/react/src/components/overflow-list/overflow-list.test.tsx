import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {OverflowList, type OverflowItem} from './overflow-list';

const items = (onSelect?: (id: string) => void): OverflowItem[] => ['One', 'Two', 'Three', 'Four'].map((n) => ({id: n, label: n, onSelect: () => onSelect?.(n)}));

// jsdom has no layout: give each item 100px and the container a width.
function layout(container: number) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.classList.contains('overflow-list-item') ? 100 : 40; });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) { return this.classList.contains('overflow-list') ? container : 0; });
}
afterEach(() => vi.restoreAllMocks());

describe('OverflowList', () => {
  it('shows everything and no menu when all items fit', () => {
    layout(1000);
    render(<OverflowList items={items()} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
  it('hides what does not fit behind a "+N" button with an accessible name', () => {
    layout(250);
    render(<OverflowList items={items()} />);
    const btn = screen.getByRole('button', {name: '2 more items'});
    expect(btn).toHaveTextContent('+2');
  });
  it('flags hidden items so CSS can take them out of the accessibility tree', () => {
    layout(250);
    const {container} = render(<OverflowList items={items()} />);
    expect([...container.querySelectorAll('li')].map((li) => li.hasAttribute('data-hidden'))).toEqual([false, false, true, true]);
  });
  it('lists the hidden items in a menu and selects with the keyboard', async () => {
    layout(250);
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<OverflowList items={items(onSelect)} />);
    screen.getByRole('button', {name: '2 more items'}).focus();
    await user.keyboard('{Enter}');
    const menuItems = await screen.findAllByRole('menuitem');
    expect(menuItems.map((m) => m.textContent)).toEqual(['Three', 'Four']);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('Four');
  });
  it('closes the menu with Escape and returns focus to the button', async () => {
    layout(250);
    const user = userEvent.setup();
    render(<OverflowList items={items()} />);
    const btn = screen.getByRole('button', {name: '2 more items'});
    await user.click(btn);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(btn).toHaveFocus();
  });
  it('uses a custom moreLabel', () => {
    layout(250);
    render(<OverflowList items={items()} moreLabel={(n) => `Show ${n} hidden`} />);
    expect(screen.getByRole('button', {name: 'Show 2 hidden'})).toBeInTheDocument();
  });
  it('forwards the ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<OverflowList ref={ref} items={items()} />);
    expect(ref.current).toHaveClass('overflow-list');
  });
  it('has no axe violations', async () => {
    layout(250);
    const {container} = render(<OverflowList items={items()} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
