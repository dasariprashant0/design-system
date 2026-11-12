import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Tag} from './tag';

describe('Tag', () => {
  it('renders text', () => {
    render(<Tag>design</Tag>);
    expect(screen.getByText('design')).toHaveClass('tag');
  });
  it('removes with a named button', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Tag onRemove={fn}>design</Tag>);
    await user.click(screen.getByRole('button', {name: 'Remove design'}));
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('removes by keyboard', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Tag onRemove={fn}>design</Tag>);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(fn).toHaveBeenCalled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Tag onRemove={() => {}}>design</Tag>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
