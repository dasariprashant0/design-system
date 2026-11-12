import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {Button} from './button';

describe('Button', () => {
  it('renders a native button that defaults to type=button', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', {name: 'Save'});
    expect(btn).toHaveAttribute('type', 'button');
    expect(btn).toHaveClass('btn', 'btn-line');
  });

  it('applies variant and size classes', () => {
    render(<Button variant="solid" size="sm">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-solid', 'btn-sm');
  });

  it('calls onClick, and not when disabled or loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const {rerender} = render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Button onClick={onClick} disabled>Go</Button>);
    await user.click(screen.getByRole('button'));
    rerender(<Button onClick={onClick} loading>Go</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('exposes the loading state to assistive tech and keeps the label', () => {
    render(<Button loading>Saving</Button>);
    const btn = screen.getByRole('button', {name: 'Saving'});
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('can render a link with button styles', () => {
    render(<Button asChild variant="solid"><a href="/docs">Docs</a></Button>);
    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveClass('btn', 'btn-solid');
    expect(link).not.toHaveAttribute('type');
  });

  it('forwards its ref', () => {
    const ref = {current: null as HTMLButtonElement | null};
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has no axe violations', async () => {
    const {container} = render(<Button>Accessible</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
