import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from './accordion';

const ui = () => (
  <Accordion type="single" collapsible>
    <AccordionItem value="a"><AccordionTrigger>One</AccordionTrigger><AccordionContent>Body one</AccordionContent></AccordionItem>
    <AccordionItem value="b"><AccordionTrigger>Two</AccordionTrigger><AccordionContent>Body two</AccordionContent></AccordionItem>
  </Accordion>
);

describe('Accordion', () => {
  it('expands and collapses an item with aria-expanded', async () => {
    const user = userEvent.setup();
    render(ui());
    const one = screen.getByRole('button', {name: 'One'});
    expect(one).toHaveAttribute('aria-expanded', 'false');
    await user.click(one);
    expect(one).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body one')).toBeVisible();
    await user.click(one);
    expect(one).toHaveAttribute('aria-expanded', 'false');
  });
  it('single mode closes the other item', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.click(screen.getByRole('button', {name: 'One'}));
    await user.click(screen.getByRole('button', {name: 'Two'}));
    expect(screen.getByRole('button', {name: 'One'})).toHaveAttribute('aria-expanded', 'false');
  });
  it('moves between triggers with arrow keys', async () => {
    const user = userEvent.setup();
    render(ui());
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', {name: 'Two'})).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
