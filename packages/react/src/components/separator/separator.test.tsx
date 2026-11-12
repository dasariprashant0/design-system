import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Separator} from './separator';
import {createRef} from 'react';

describe('Separator', () => {
  it('is hidden from assistive tech when decorative (default)', () => {
    const {container} = render(<Separator />);
    expect(container.firstChild).toHaveAttribute('role', 'none');
  });
  it('is a real separator when not decorative', () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
  it('is horizontal by default and carries data-orientation', () => {
    const {container} = render(<Separator decorative={false} />);
    expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation');
    expect(container.firstElementChild).toHaveAttribute('data-orientation', 'horizontal');
  });
  it('vertical separators expose aria-orientation=vertical', () => {
    render(<Separator orientation="vertical" decorative={false} />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
  it('decorative separators use role none and expose no separator', () => {
    const {container} = render(<Separator orientation="vertical" />);
    expect(container.firstElementChild).toHaveAttribute('role', 'none');
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
  it('merges className, forwards ref and spreads props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} className="mine" data-x="1" />);
    expect(ref.current).toHaveClass('separator', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('can be named when meaningful', () => {
    render(<Separator decorative={false} aria-label="Between sections" />);
    expect(screen.getByRole('separator', {name: 'Between sections'})).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Separator decorative={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
