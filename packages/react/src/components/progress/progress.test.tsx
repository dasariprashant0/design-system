import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Progress} from './progress';

describe('Progress', () => {
  it('exposes value, min and max', () => {
    render(<Progress aria-label="Upload" value={62} />);
    const bar = screen.getByRole('progressbar', {name: 'Upload'});
    expect(bar).toHaveAttribute('aria-valuenow', '62');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
  it('is indeterminate without a value', () => {
    render(<Progress aria-label="Waiting" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-state', 'indeterminate');
  });
  it('clamps the fill width', () => {
    const {container} = render(<Progress aria-label="x" value={250} />);
    expect(container.querySelector('.progress-fill')).toHaveStyle({width: '100%'});
  });
  it('has no axe violations', async () => {
    const {container} = render(<Progress aria-label="Upload" value={40} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
