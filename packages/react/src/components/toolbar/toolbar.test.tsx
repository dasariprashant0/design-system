import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Toolbar, ToolbarButton, ToolbarSeparator} from './toolbar';

const ui = () => <Toolbar aria-label="Format"><ToolbarButton>Bold</ToolbarButton><ToolbarButton>Italic</ToolbarButton><ToolbarSeparator /><ToolbarButton>Link</ToolbarButton></Toolbar>;

describe('Toolbar', () => {
  it('is a named toolbar with buttons', () => {
    render(ui());
    expect(screen.getByRole('toolbar', {name: 'Format'})).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
  it('uses one tab stop and arrow keys', async () => {
    const user = userEvent.setup();
    render(<><button>before</button>{ui()}<button>after</button></>);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', {name: 'Bold'})).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', {name: 'Italic'})).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', {name: 'after'})).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const {container} = render(ui());
    expect(await axe(container)).toHaveNoViolations();
  });
});
