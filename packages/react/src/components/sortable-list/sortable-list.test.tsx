import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {SortableList, type SortableItem} from './sortable-list';

// jsdom may lack PointerEvent; a MouseEvent carries the same button and clientY.
globalThis.PointerEvent ??= class extends MouseEvent {} as unknown as typeof PointerEvent;

const items: SortableItem[] = ['Alpha', 'Beta', 'Gamma'].map((t) => ({id: t, label: t}));
const names = () => screen.getAllByRole('listitem').map((li) => li.textContent);
const live = () => screen.getByRole('status');

describe('SortableList', () => {
  it('renders the items with a named handle each', () => {
    render(<SortableList aria-label="Tasks" defaultValue={items} />);
    expect(screen.getByRole('list', {name: 'Tasks'})).toBeInTheDocument();
    expect(names()).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(screen.getByRole('button', {name: 'Reorder Beta'})).toHaveAttribute('aria-pressed', 'false');
  });
  it('picks up with Space, moves with arrows, drops with Space and announces each step', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SortableList aria-label="Tasks" defaultValue={items} onValueChange={onValueChange} />);
    await user.click(document.body);
    screen.getByRole('button', {name: 'Reorder Alpha'}).focus();
    await user.keyboard(' ');
    expect(live()).toHaveTextContent('Picked up Alpha, position 1 of 3');
    expect(screen.getByRole('button', {name: 'Reorder Alpha'})).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard('{ArrowDown}');
    expect(live()).toHaveTextContent('Alpha moved to position 2 of 3');
    await user.keyboard('{ArrowDown}');
    expect(names()).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(screen.getByRole('button', {name: 'Reorder Alpha'})).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled(); // nothing is committed until the drop
    await user.keyboard(' ');
    expect(live()).toHaveTextContent('Alpha dropped at position 3 of 3');
    expect(onValueChange.mock.calls[0]![0].map((i: SortableItem) => i.id)).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(names()).toEqual(['Beta', 'Gamma', 'Alpha']);
  });
  it('stops at the ends', async () => {
    const user = userEvent.setup();
    render(<SortableList aria-label="Tasks" defaultValue={items} />);
    screen.getByRole('button', {name: 'Reorder Alpha'}).focus();
    await user.keyboard(' {ArrowUp}{ArrowUp} ');
    expect(names()).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
  it('Escape cancels and restores the order without calling onValueChange', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SortableList aria-label="Tasks" defaultValue={items} onValueChange={onValueChange} />);
    screen.getByRole('button', {name: 'Reorder Gamma'}).focus();
    await user.keyboard(' {ArrowUp}{ArrowUp}');
    expect(names()).toEqual(['Gamma', 'Alpha', 'Beta']);
    await user.keyboard('{Escape}');
    expect(names()).toEqual(['Alpha', 'Beta', 'Gamma']);
    expect(live()).toHaveTextContent('Move cancelled. Gamma is back at position 3 of 3');
    expect(onValueChange).not.toHaveBeenCalled();
  });
  it('Home and End jump', async () => {
    const user = userEvent.setup();
    render(<SortableList aria-label="Tasks" defaultValue={items} />);
    screen.getByRole('button', {name: 'Reorder Beta'}).focus();
    await user.keyboard(' {End} ');
    expect(names()).toEqual(['Alpha', 'Gamma', 'Beta']);
  });
  it('uses Left and Right when horizontal', async () => {
    const user = userEvent.setup();
    render(<SortableList aria-label="Steps" orientation="horizontal" defaultValue={items} />);
    screen.getByRole('button', {name: 'Reorder Alpha'}).focus();
    await user.keyboard(' {ArrowRight} ');
    expect(names()).toEqual(['Beta', 'Alpha', 'Gamma']);
  });
  it('works controlled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<SortableList aria-label="Tasks" value={items} onValueChange={onValueChange} />);
    screen.getByRole('button', {name: 'Reorder Alpha'}).focus();
    await user.keyboard(' {ArrowDown} ');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(names()).toEqual(['Alpha', 'Beta', 'Gamma']); // parent did not update
  });
  it('reorders by pointer drag', () => {
    render(<SortableList aria-label="Tasks" defaultValue={items} />);
    // jsdom has no layout: each row is 20px tall, in DOM order.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const i = Array.from(this.parentElement?.children ?? []).indexOf(this);
      return {top: i * 20, bottom: i * 20 + 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: i * 20, toJSON() {}} as DOMRect;
    });
    fireEvent.pointerDown(screen.getByRole('button', {name: 'Reorder Alpha'}), {button: 0, clientY: 10});
    expect(live()).toHaveTextContent('Picked up Alpha');
    fireEvent.pointerMove(document, {clientY: 55});
    fireEvent.pointerUp(document);
    expect(names()).toEqual(['Beta', 'Gamma', 'Alpha']);
    vi.restoreAllMocks();
  });
  it('forwards the ref', () => {
    const ref = {current: null as HTMLUListElement | null};
    render(<SortableList ref={ref} aria-label="Tasks" defaultValue={items} />);
    expect(ref.current).toHaveClass('sortable-list');
  });
  it('has no axe violations', async () => {
    const {container} = render(<SortableList aria-label="Tasks" defaultValue={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
