import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Tour, type TourStep} from './tour';

const steps: TourStep[] = [
  {target: '#a', title: 'First', content: 'About A.'},
  {target: '#b', title: 'Second', content: 'About B.'},
  {title: 'Last', content: 'Bye.'},
];
const page = (props: Partial<Parameters<typeof Tour>[0]> = {}) => (
  <div>
    <button id="a">Alpha</button>
    <button id="b">Beta</button>
    <Tour steps={steps} defaultOpen {...props} />
  </div>
);

describe('Tour', () => {
  it('shows nothing until open', () => {
    render(page({defaultOpen: false}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('shows a named dialog for the first step and moves focus to it', () => {
    render(page());
    const d = screen.getByRole('dialog', {name: 'First'});
    expect(d).toHaveAccessibleDescription('About A.');
    expect(d).toHaveFocus();
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });
  it('moves through steps with Next and Back, and announces them', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(page({onStepChange: fn}));
    expect(screen.queryByRole('button', {name: 'Back'})).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getByRole('dialog', {name: 'Second'})).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Step 2 of 3: Second');
    expect(fn).toHaveBeenLastCalledWith(1);
    await user.click(screen.getByRole('button', {name: 'Back'}));
    expect(screen.getByRole('dialog', {name: 'First'})).toBeInTheDocument();
  });
  it('finishes on the last step and calls onFinish', async () => {
    const user = userEvent.setup();
    const done = vi.fn(), change = vi.fn();
    render(page({defaultStep: 2, onFinish: done, onOpenChange: change}));
    await user.click(screen.getByRole('button', {name: 'Done'}));
    expect(done).toHaveBeenCalled();
    expect(change).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('skips with the button and with Escape, without calling onFinish', async () => {
    const user = userEvent.setup();
    const done = vi.fn();
    const {unmount} = render(page({onFinish: done}));
    await user.click(screen.getByRole('button', {name: 'Skip tour'}));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    unmount();
    render(page({onFinish: done}));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(done).not.toHaveBeenCalled();
  });
  it('moves between steps with arrow keys when the card has focus', async () => {
    const user = userEvent.setup();
    render(page());
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('dialog', {name: 'Second'})).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('dialog', {name: 'First'})).toBeInTheDocument();
  });
  it('mirrors arrow keys in rtl', async () => {
    const user = userEvent.setup();
    render(<div dir="rtl">{page()}</div>);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('dialog', {name: 'Second'})).toBeInTheDocument();
  });
  it('keeps Tab inside the card', async () => {
    const user = userEvent.setup();
    render(page());
    await user.tab(); // Skip
    expect(screen.getByRole('button', {name: 'Skip tour'})).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Next'})).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Skip tour'})).toHaveFocus();
    await user.tab({shift: true});
    expect(screen.getByRole('button', {name: 'Next'})).toHaveFocus();
  });
  it('restores focus to where it was when it closes', async () => {
    const user = userEvent.setup();
    function App() {
      const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Start</button><button id="a">A</button><Tour steps={steps} open={open} onOpenChange={setOpen} /></>;
    }
    render(<App />);
    const start = screen.getByRole('button', {name: 'Start'});
    await user.click(start);
    expect(screen.getByRole('dialog')).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(start).toHaveFocus();
  });
  it('scrolls the target into view and draws a spotlight', () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(page());
    expect(scroll).toHaveBeenCalled();
    expect(document.querySelector('.tour-spotlight')).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {baseElement} = render(page());
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
