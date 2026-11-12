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
  it('has no axe violations', async () => {
    const {container} = render(<BorderBeam><p>Content</p></BorderBeam>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
