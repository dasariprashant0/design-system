import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Text} from './text';
import {createRef} from 'react';

describe('Text', () => {
  it('renders a paragraph with size and tone classes', () => {
    render(<Text size="sm" tone="muted">Hello</Text>);
    const el = screen.getByText('Hello');
    expect(el.tagName).toBe('P');
    expect(el).toHaveClass('text', 'text-sm', 'text-muted');
  });
  it('supports truncate and asChild', () => {
    render(<Text asChild truncate><span>Long</span></Text>);
    expect(screen.getByText('Long').tagName).toBe('SPAN');
    expect(screen.getByText('Long')).toHaveClass('text-truncate');
  });
  it('defaults to a medium default-tone paragraph', () => {
    render(<Text>x</Text>);
    const p = screen.getByText('x');
    expect(p.tagName).toBe('P');
    expect(p.className).toBe('text text-md');
  });
  it('maps every size', () => {
    for (const size of ['xs', 'sm', 'md', 'lg'] as const) {
      const {unmount} = render(<Text size={size}>x</Text>);
      expect(screen.getByText('x')).toHaveClass(`text-${size}`);
      unmount();
    }
  });
  it('maps every tone and the default tone adds no class', () => {
    for (const tone of ['muted', 'danger', 'ok', 'accent'] as const) {
      const {unmount} = render(<Text tone={tone}>x</Text>);
      expect(screen.getByText('x')).toHaveClass(`text-${tone}`);
      unmount();
    }
    render(<Text tone="default">d</Text>);
    expect(screen.getByText('d').className).not.toMatch(/text-default/);
  });
  it('truncate adds its class only when set', () => {
    const {rerender} = render(<Text>x</Text>);
    expect(screen.getByText('x')).not.toHaveClass('text-truncate');
    rerender(<Text truncate>x</Text>);
    expect(screen.getByText('x')).toHaveClass('text-truncate');
  });
  it('asChild renders the child element with text classes, merged className and ref', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<Text asChild ref={ref} size="sm" tone="muted" className="mine"><span className="own">hi</span></Text>);
    const el = screen.getByText('hi');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveClass('text', 'text-sm', 'text-muted', 'own', 'mine');
    expect(ref.current).toBe(el);
  });
  it('forwards ref, spreads props and keeps long and RTL text intact', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<Text ref={ref} dir="rtl" id="t">{'مرحبا '.repeat(1000)}</Text>);
    expect(ref.current).toHaveAttribute('dir', 'rtl');
    expect(ref.current).toHaveAttribute('id', 't');
    expect(ref.current!.textContent!.length).toBeGreaterThan(5000);
  });
  it('renders empty', () => {
    const {container} = render(<Text />);
    expect(container.firstElementChild).toBeEmptyDOMElement();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Text>Body</Text>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
