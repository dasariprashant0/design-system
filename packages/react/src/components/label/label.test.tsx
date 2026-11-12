import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Label} from './label';

describe('Label', () => {
  it('names its control and focuses it on click', async () => {
    render(<><Label htmlFor="x">Name</Label><input id="x" /></>);
    expect(screen.getByLabelText('Name')).toBe(screen.getByRole('textbox'));
  });
  it('shows the required marker class', () => {
    render(<Label required>Name</Label>);
    expect(screen.getByText('Name')).toHaveClass('field-required');
  });
  it('has no axe violations', async () => {
    const {container} = render(<><Label htmlFor="y">Name</Label><input id="y" /></>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
