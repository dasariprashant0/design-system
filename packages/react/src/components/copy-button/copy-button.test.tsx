import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {CopyButton} from './copy-button';

const stub = (writeText: (t: string) => Promise<void>) => Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
afterEach(() => { Reflect.deleteProperty(navigator, 'clipboard'); });

describe('CopyButton', () => {
  it('is a named icon button by default', () => {
    render(<CopyButton value="x" label="Copy token" />);
    expect(screen.getByRole('button', {name: 'Copy token'})).toHaveClass('btn-icon');
  });
  it('copies, announces "Copied" and calls onCopied', async () => {
    const user = userEvent.setup();
    const onCopied = vi.fn();
    const writeText = vi.fn(async () => {});
    render(<CopyButton value="hello" onCopied={onCopied} />);
    stub(writeText);
    await user.click(screen.getByRole('button', {name: 'Copy'}));
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(onCopied).toHaveBeenCalledWith('hello');
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
  });
  it('is operable with the keyboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(async () => {});
    render(<CopyButton value="k" />);
    stub(writeText);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(writeText).toHaveBeenCalledWith('k');
  });
  it('text form swaps its label', async () => {
    const user = userEvent.setup();
    render(<CopyButton value="v" copiedLabel="Done">Copy link</CopyButton>);
    stub(async () => {});
    await user.click(screen.getByRole('button', {name: 'Copy link'}));
    expect(screen.getByRole('button', {name: 'Done'})).toBeInTheDocument();
  });
  it('announces a failure', async () => {
    const user = userEvent.setup();
    render(<CopyButton value="v" />);
    stub(async () => { throw new Error('no'); });
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed');
  });
  it('forwards the ref and respects disabled', () => {
    const ref = {current: null as HTMLButtonElement | null};
    render(<CopyButton ref={ref} value="v" disabled />);
    expect(ref.current).toBeDisabled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<><CopyButton value="a" /><CopyButton value="b">Copy</CopyButton></>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
