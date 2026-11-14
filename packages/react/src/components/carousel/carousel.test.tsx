import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Carousel} from './carousel';

const ui = () => <Carousel aria-label="Projects"><div>One</div><div>Two</div><div>Three</div></Carousel>;

describe('Carousel', () => {
  it('is a named carousel region of numbered slides', () => {
    render(ui());
    expect(screen.getByRole('region', {name: 'Projects'})).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getByRole('group', {name: '1 of 3'})).toHaveTextContent('One');
    expect(screen.getAllByRole('group', {name: /of 3/})).toHaveLength(3);
  });
  it('steps with the buttons', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(ui());
    (screen.getByRole('region').querySelector('.carousel-track') as HTMLElement).scrollBy = fn;
    await user.click(screen.getByRole('button', {name: 'Next slide'}));
    expect(fn).toHaveBeenCalledWith(expect.objectContaining({behavior: 'smooth'}));
  });
  it('has a keyboard-scrollable track', () => {
    render(ui());
    expect(screen.getByLabelText('Projects slides')).toHaveAttribute('tabindex', '0');
  });
  it('names the scrollable track as a group', () => {
    render(<Carousel aria-label="Featured"><p>A</p><p>B</p></Carousel>);
    expect(screen.getByRole('group', {name: 'Featured slides'})).toHaveAttribute('tabindex', '0');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
