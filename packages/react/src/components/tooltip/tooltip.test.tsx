import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Tooltip, TooltipProvider} from './tooltip';

const ui = () => (
  <TooltipProvider delayDuration={0}>
    <Tooltip content="Saved to notes"><button>Save</button></Tooltip>
  </TooltipProvider>
);

describe('Tooltip', () => {
  it('shows on hover', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.hover(screen.getByRole('button', {name: 'Save'}));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Saved to notes');
  });
  it('shows on keyboard focus and hides on Escape', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
  it('describes its trigger while open', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await screen.findByRole('tooltip');
    expect(screen.getByRole('button', {name: 'Save'})).toHaveAccessibleDescription('Saved to notes');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
