import {render} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Skeleton} from './skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive tech and styled by variant', () => {
    const {container} = render(<><Skeleton /><Skeleton variant="hatch" /></>);
    const [a, b] = Array.from(container.children);
    expect(a).toHaveAttribute('aria-hidden', 'true');
    expect(b).toHaveClass('skeleton-hatch');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Skeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
