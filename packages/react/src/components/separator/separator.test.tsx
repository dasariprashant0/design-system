import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Separator} from './separator';

describe('Separator', () => {
  it('is hidden from assistive tech when decorative (default)', () => {
    const {container} = render(<Separator />);
    expect(container.firstChild).toHaveAttribute('role', 'none');
  });
  it('is a real separator when not decorative', () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Separator decorative={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
