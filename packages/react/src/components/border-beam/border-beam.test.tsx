import {createRef} from 'react';
import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BorderBeam} from './border-beam';

describe('BorderBeam', () => {
  it('renders its children and hides the beam from assistive tech', () => {
    const {container} = render(<BorderBeam>Content</BorderBeam>);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(container.querySelector('.border-beam-light')).toHaveAttribute('aria-hidden', 'true');
  });
  it('sets the duration', () => {
    render(<BorderBeam data-testid="b" duration={10}>x</BorderBeam>);
    expect(screen.getByTestId('b').style.getPropertyValue('--border-beam-duration')).toBe('10s');
  });
  it('merges className and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<BorderBeam ref={ref} className="x">y</BorderBeam>);
    expect(ref.current).toHaveClass('border-beam', 'x');
  });
  it('defaults the duration to 6s and accepts fractional and zero values', () => {
    const {rerender} = render(<BorderBeam data-testid="b">x</BorderBeam>);
    expect(screen.getByTestId('b').style.getPropertyValue('--border-beam-duration')).toBe('6s');
    rerender(<BorderBeam data-testid="b" duration={0.5}>x</BorderBeam>);
    expect(screen.getByTestId('b').style.getPropertyValue('--border-beam-duration')).toBe('0.5s');
    rerender(<BorderBeam data-testid="b" duration={0}>x</BorderBeam>);
    expect(screen.getByTestId('b').style.getPropertyValue('--border-beam-duration')).toBe('0s');
  });
  it('keeps the caller style and lets it override the duration variable', () => {
    render(<BorderBeam data-testid="b" style={{color: 'red', ['--border-beam-duration' as string]: '1s'}}>x</BorderBeam>);
    const el = screen.getByTestId('b');
    expect(el.style.color).toBe('red');
    expect(el.style.getPropertyValue('--border-beam-duration')).toBe('1s');
  });
  it('puts the light before the children and keeps it out of the accessible text', () => {
    const {container} = render(<BorderBeam data-testid="b">Content</BorderBeam>);
    expect(container.firstElementChild!.firstElementChild).toHaveClass('border-beam-light');
    expect(screen.getByTestId('b')).toHaveTextContent('Content');
  });
  it('renders with no children and spreads other props', () => {
    render(<BorderBeam data-testid="b" id="i" role="group" aria-label="Beam" />);
    expect(screen.getByRole('group', {name: 'Beam'})).toHaveAttribute('id', 'i');
  });
  it('is a plain div', () => {
    render(<BorderBeam data-testid="b">x</BorderBeam>);
    expect(screen.getByTestId('b').tagName).toBe('DIV');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BorderBeam><p>Content</p></BorderBeam>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
