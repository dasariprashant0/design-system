import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from './collapsible';

const ui = () => <Collapsible><CollapsibleTrigger>Details</CollapsibleTrigger><CollapsibleContent>Hidden text</CollapsibleContent></Collapsible>;

describe('Collapsible', () => {
  it('is closed by default and toggles by click', async () => {
    const user = userEvent.setup();
    render(ui());
    const trigger = screen.getByRole('button', {name: 'Details'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Hidden text')).not.toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Hidden text')).toBeVisible();
  });
  it('toggles by keyboard', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByText('Hidden text')).toBeVisible();
    await user.keyboard(' ');
    expect(screen.queryByText('Hidden text')).not.toBeInTheDocument();
  });
  it('can start open', () => {
    render(<Collapsible defaultOpen><CollapsibleTrigger>Details</CollapsibleTrigger><CollapsibleContent>Shown</CollapsibleContent></Collapsible>);
    expect(screen.getByText('Shown')).toBeVisible();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Collapsible defaultOpen><CollapsibleTrigger>Details</CollapsibleTrigger><CollapsibleContent>Shown</CollapsibleContent></Collapsible>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
