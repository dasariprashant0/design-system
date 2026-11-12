import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Kbd} from './kbd';

describe('Kbd', () => {
  it('renders a kbd element with the class', () => {
    render(<Kbd>Esc</Kbd>);
    const el = screen.getByText('Esc');
    expect(el.tagName).toBe('KBD');
    expect(el).toHaveClass('kbd');
  });
  it('has no axe violations', async () => {
    const {container} = render(<p>Press <Kbd>Esc</Kbd></p>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
