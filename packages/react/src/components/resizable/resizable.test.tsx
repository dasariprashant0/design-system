import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup, type ResizablePanelGroupProps} from './resizable';

const two = (props: Partial<ResizablePanelGroupProps> = {}, a = {}, b = {}) => (
  <ResizablePanelGroup aria-label="Layout" {...props}>
    <ResizablePanel defaultSize={30} minSize={20} maxSize={60} {...a}>One</ResizablePanel>
    <ResizableHandle aria-label="Resize one" />
    <ResizablePanel defaultSize={70} {...b}>Two</ResizablePanel>
  </ResizablePanelGroup>
);
const handle = () => screen.getByRole('separator', {name: 'Resize one'});

// jsdom has no PointerEvent; a MouseEvent carries clientX/clientY and button.
if (!('PointerEvent' in window)) (window as unknown as {PointerEvent: typeof MouseEvent}).PointerEvent = class extends MouseEvent {};

describe('Resizable', () => {
  it('renders a focusable separator with value, limits and the panel it controls', () => {
    render(two());
    const h = handle();
    expect(h).toHaveAttribute('aria-orientation', 'vertical');
    expect(h).toHaveAttribute('aria-valuenow', '30');
    expect(h).toHaveAttribute('aria-valuemin', '20');
    expect(h).toHaveAttribute('aria-valuemax', '60');
    expect(h).toHaveAttribute('tabindex', '0');
    expect(document.getElementById(h.getAttribute('aria-controls')!)).toHaveTextContent('One');
  });
  it('resizes with arrow keys by the step and reports the layout', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(two({step: 10, onLayoutChange: fn}));
    handle().focus();
    await user.keyboard('{ArrowRight}');
    expect(handle()).toHaveAttribute('aria-valuenow', '40');
    expect(fn).toHaveBeenLastCalledWith([40, 60]);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(handle()).toHaveAttribute('aria-valuenow', '20');
  });
  it('stops at min and max, and Home/End jump to them', async () => {
    const user = userEvent.setup();
    render(two());
    handle().focus();
    await user.keyboard('{End}');
    expect(handle()).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{ArrowRight}');
    expect(handle()).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{Home}');
    expect(handle()).toHaveAttribute('aria-valuenow', '20');
  });
  it('respects the neighbour panel limits', async () => {
    const user = userEvent.setup();
    render(two({}, {}, {minSize: 50}));
    handle().focus();
    await user.keyboard('{End}');
    expect(handle()).toHaveAttribute('aria-valuenow', '50');
  });
  it('uses Up and Down in a vertical group', async () => {
    const user = userEvent.setup();
    render(two({direction: 'vertical'}));
    expect(handle()).toHaveAttribute('aria-orientation', 'horizontal');
    handle().focus();
    await user.keyboard('{ArrowDown}');
    expect(handle()).toHaveAttribute('aria-valuenow', '35');
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(handle()).toHaveAttribute('aria-valuenow', '25');
  });
  it('mirrors left and right in rtl', async () => {
    const user = userEvent.setup();
    render(<div dir="rtl">{two()}</div>);
    handle().focus();
    await user.keyboard('{ArrowLeft}');
    expect(handle()).toHaveAttribute('aria-valuenow', '35');
  });
  it('resizes by dragging', () => {
    render(two());
    const group = screen.getByLabelText('Layout');
    group.getBoundingClientRect = () => ({width: 1000, height: 100, top: 0, left: 0, right: 1000, bottom: 100, x: 0, y: 0, toJSON() {}});
    const h = handle();
    fireEvent.pointerDown(h, {button: 0, clientX: 300, pointerId: 1});
    fireEvent.pointerMove(h, {clientX: 400, pointerId: 1});
    expect(h).toHaveAttribute('aria-valuenow', '40');
    expect(h).toHaveAttribute('data-dragging');
    fireEvent.pointerMove(h, {clientX: 900, pointerId: 1});
    expect(h).toHaveAttribute('aria-valuenow', '60');
    fireEvent.pointerUp(h, {pointerId: 1});
    expect(h).not.toHaveAttribute('data-dragging');
  });
  it('supports three panels with two handles', async () => {
    const user = userEvent.setup();
    render(
      <ResizablePanelGroup aria-label="L">
        <ResizablePanel defaultSize={25}>A</ResizablePanel>
        <ResizableHandle aria-label="h1" />
        <ResizablePanel defaultSize={50}>B</ResizablePanel>
        <ResizableHandle aria-label="h2" />
        <ResizablePanel defaultSize={25}>C</ResizablePanel>
      </ResizablePanelGroup>,
    );
    screen.getByRole('separator', {name: 'h2'}).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('separator', {name: 'h2'})).toHaveAttribute('aria-valuenow', '55');
    expect(screen.getByRole('separator', {name: 'h1'})).toHaveAttribute('aria-valuenow', '25');
  });
  it('has no axe violations', async () => {
    const {container} = render(two());
    expect(await axe(container)).toHaveNoViolations();
  });
});
