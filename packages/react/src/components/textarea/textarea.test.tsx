import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Textarea} from './textarea';

describe('Textarea', () => {
  it('accepts multi-line text', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Notes" />);
    await user.type(screen.getByRole('textbox'), 'a{Enter}b');
    expect(screen.getByRole('textbox')).toHaveValue('a\nb');
  });
  it('shows the invalid state', () => {
    render(<Textarea aria-label="n" invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Textarea aria-label="Notes" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
