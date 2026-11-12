import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Kbd} from './kbd';
import {createRef} from 'react';

describe('Kbd', () => {
  it('renders a kbd element with the class', () => {
    render(<Kbd>Esc</Kbd>);
    const el = screen.getByText('Esc');
    expect(el.tagName).toBe('KBD');
    expect(el).toHaveClass('kbd');
  });
  it('merges className, forwards ref and spreads props', () => {
    const ref = createRef<HTMLElement>();
    render(<Kbd ref={ref} className="mine" title="Command">⌘</Kbd>);
    expect(ref.current!.tagName).toBe('KBD');
    expect(ref.current).toHaveClass('kbd', 'mine');
    expect(ref.current).toHaveAttribute('title', 'Command');
  });
  it('renders a key combination as separate kbd elements', () => {
    const {container} = render(<><Kbd>⌘</Kbd><Kbd>K</Kbd></>);
    expect(container.querySelectorAll('kbd')).toHaveLength(2);
  });
  it('renders empty, multi-character and RTL keys', () => {
    const {container} = render(<><Kbd /><Kbd>Shift</Kbd><Kbd dir="rtl">مفتاح</Kbd></>);
    expect(container.querySelectorAll('kbd')).toHaveLength(3);
    expect(screen.getByText('Shift')).toBeInTheDocument();
    expect(screen.getByText('مفتاح')).toBeInTheDocument();
  });
  it('can carry an accessible label different from its glyph', () => {
    render(<Kbd aria-label="Command">⌘</Kbd>);
    expect(screen.getByLabelText('Command')).toHaveTextContent('⌘');
  });
  it('has no axe violations', async () => {
    const {container} = render(<p>Press <Kbd>Esc</Kbd></p>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
