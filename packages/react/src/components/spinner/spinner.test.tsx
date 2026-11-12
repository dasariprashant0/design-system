import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Spinner} from './spinner';

describe('Spinner', () => {
  it('is a named status', () => {
    render(<Spinner label="Syncing" />);
    expect(screen.getByRole('status', {name: 'Syncing'})).toHaveClass('spinner');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
