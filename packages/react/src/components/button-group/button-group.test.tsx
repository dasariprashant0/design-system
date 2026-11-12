import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Button} from '../button';
import {ButtonGroup} from './button-group';

describe('ButtonGroup', () => {
  it('is a named group of buttons', () => {
    render(<ButtonGroup aria-label="Align"><Button>Left</Button><Button>Right</Button></ButtonGroup>);
    const group = screen.getByRole('group', {name: 'Align'});
    expect(group).toHaveClass('btn-group');
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
  it('lets keyboard users tab through each button', async () => {
    const user = userEvent.setup();
    render(<ButtonGroup aria-label="Align"><Button>Left</Button><Button>Right</Button></ButtonGroup>);
    await user.tab();
    expect(screen.getByRole('button', {name: 'Left'})).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Right'})).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const {container} = render(<ButtonGroup aria-label="Align"><Button>Left</Button><Button>Right</Button></ButtonGroup>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
