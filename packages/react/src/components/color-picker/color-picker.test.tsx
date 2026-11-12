import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {ColorPicker} from './color-picker';

const colors = ['#e5484d', '#30a46c', '#0090ff'];

describe('ColorPicker', () => {
  it('is a named group with a swatch button per colour', () => {
    render(<ColorPicker aria-label="Brand" colors={colors} defaultValue="#30a46c" />);
    expect(screen.getByRole('group', {name: 'Brand'})).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', {name: '#30a46c'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '#e5484d'})).toHaveAttribute('aria-pressed', 'false');
  });
  it('sets swatch colours inline from the prop', () => {
    render(<ColorPicker colors={colors} />);
    expect(screen.getByRole('button', {name: '#e5484d'})).toHaveStyle({background: '#e5484d'});
  });
  it('picks a swatch with the mouse and keyboard', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<ColorPicker aria-label="Brand" colors={colors} onValueChange={fn} />);
    await user.click(screen.getByRole('button', {name: '#e5484d'}));
    expect(fn).toHaveBeenLastCalledWith('#e5484d');
    screen.getByRole('button', {name: '#0090ff'}).focus();
    await user.keyboard('{Enter}');
    expect(fn).toHaveBeenLastCalledWith('#0090ff');
    expect(screen.getByRole('textbox', {name: 'Brand hex value'})).toHaveValue('#0090ff');
  });
  it('applies a valid hex, expanding short forms', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<ColorPicker aria-label="Brand" onValueChange={fn} />);
    const hex = screen.getByRole('textbox', {name: 'Brand hex value'});
    await user.clear(hex);
    await user.type(hex, 'ABC');
    expect(fn).toHaveBeenLastCalledWith('#aabbcc');
    expect(hex).not.toHaveAttribute('aria-invalid');
  });
  it('marks an invalid hex, explains it, and keeps the last good colour', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<ColorPicker aria-label="Brand" defaultValue="#112233" onValueChange={fn} />);
    const hex = screen.getByRole('textbox', {name: 'Brand hex value'});
    await user.clear(hex);
    await user.type(hex, 'zz');
    expect(hex).toHaveAttribute('aria-invalid', 'true');
    expect(hex).toHaveAccessibleDescription('Use a hex colour like #1a2b3c.');
    expect(fn).not.toHaveBeenCalled();
    await user.tab();
    expect(hex).toHaveValue('#112233');
    expect(hex).not.toHaveAttribute('aria-invalid');
  });
  it('follows the native colour input', () => {
    const fn = vi.fn();
    render(<ColorPicker aria-label="Brand" onValueChange={fn} />);
    fireEvent.change(screen.getByLabelText('Brand picker'), {target: {value: '#123456'}});
    expect(fn).toHaveBeenCalledWith('#123456');
    expect(screen.getByRole('textbox', {name: 'Brand hex value'})).toHaveValue('#123456');
  });
  it('works controlled, disabled and forwards the ref', async () => {
    const user = userEvent.setup();
    const ref = {current: null as HTMLDivElement | null};
    const {rerender} = render(<ColorPicker aria-label="Brand" ref={ref} colors={colors} value="#e5484d" />);
    expect(ref.current).toBe(screen.getByRole('group'));
    await user.click(screen.getByRole('button', {name: '#0090ff'}));
    expect(screen.getByRole('textbox', {name: 'Brand hex value'})).toHaveValue('#e5484d');
    rerender(<ColorPicker aria-label="Brand" colors={colors} value="#e5484d" disabled />);
    expect(screen.getByRole('button', {name: '#0090ff'})).toBeDisabled();
  });
  it('has no axe violations', async () => {
    const {container} = render(<ColorPicker aria-label="Brand" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
