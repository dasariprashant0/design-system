import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {CodeBlock} from './code-block';

describe('CodeBlock', () => {
  it('shows the code in a named group', () => {
    render(<CodeBlock title="install.sh" code={'npm i monoline'} />);
    expect(screen.getByRole('group', {name: 'install.sh'})).toBeInTheDocument();
    expect(screen.getByText('npm i monoline').tagName).toBe('CODE');
  });
  it('copies to the clipboard and confirms', async () => {
    const user = userEvent.setup();
    render(<CodeBlock code="npm i monoline" />);
    await user.click(screen.getByRole('button', {name: /copy code/i}));
    expect(await screen.findByRole('status')).toHaveTextContent('Copied to clipboard');
    expect(await navigator.clipboard.readText()).toBe('npm i monoline');
  });
  it('can hide the copy button', () => {
    render(<CodeBlock code="x" hideCopy />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<CodeBlock title="install.sh" code="npm i monoline" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
