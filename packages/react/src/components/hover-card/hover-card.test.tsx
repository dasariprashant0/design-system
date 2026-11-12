import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {HoverCard, HoverCardContent, HoverCardTrigger} from './hover-card';

const ui = () => <HoverCard openDelay={0} closeDelay={0}><HoverCardTrigger asChild><a href="#ada">@ada</a></HoverCardTrigger><HoverCardContent>Ada Lovelace, engineer</HoverCardContent></HoverCard>;

describe('HoverCard', () => {
  it('is hidden until hovered', async () => {
    const user = userEvent.setup();
    render(ui());
    expect(screen.queryByText('Ada Lovelace, engineer')).not.toBeInTheDocument();
    await user.hover(screen.getByRole('link', {name: '@ada'}));
    expect(await screen.findByText('Ada Lovelace, engineer')).toBeInTheDocument();
  });
  it('opens on keyboard focus', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    expect(await screen.findByText('Ada Lovelace, engineer')).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
