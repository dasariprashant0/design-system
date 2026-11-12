import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Tabs, TabsContent, TabsList, TabsTrigger} from './tabs';

const ui = (onValueChange?: (v: string) => void) => (
  <Tabs defaultValue="a" onValueChange={onValueChange}>
    <TabsList aria-label="Demo"><TabsTrigger value="a">One</TabsTrigger><TabsTrigger value="b">Two</TabsTrigger></TabsList>
    <TabsContent value="a">Panel one</TabsContent>
    <TabsContent value="b">Panel two</TabsContent>
  </Tabs>
);

describe('Tabs', () => {
  it('shows the selected panel and switches on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(ui(onChange));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one');
    await user.click(screen.getByRole('tab', {name: 'Two'}));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel two');
    expect(onChange).toHaveBeenCalledWith('b');
  });
  it('moves with arrow keys', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', {name: 'Two'})).toHaveFocus();
  });
  it('links tabs and panels for assistive tech', () => {
    render(ui());
    expect(screen.getByRole('tab', {name: 'One'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName('One');
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
