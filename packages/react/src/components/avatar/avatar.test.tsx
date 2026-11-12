import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Avatar} from './avatar';
import {createRef} from 'react';

describe('Avatar', () => {
  it('shows initials as a named image when there is no src', () => {
    render(<Avatar name="Ada Lovelace" />);
    const el = screen.getByRole('img', {name: 'Ada Lovelace'});
    expect(el).toHaveTextContent('AL');
  });
  it('applies size and variant classes', () => {
    const {container} = render(<Avatar name="Alan Turing" size="lg" variant="line" />);
    expect(container.firstChild).toHaveClass('avatar', 'avatar-lg', 'avatar-line');
  });
  it('builds initials from the first two words, upper-cased', () => {
    const cases: Record<string, string> = {'ada lovelace': 'AL', 'Plato': 'P', 'Jean Claude Van Damme': 'JC', '  spaced out  ': 'SO'};
    for (const [name, text] of Object.entries(cases)) {
      const {unmount} = render(<Avatar name={name} />);
      expect(screen.getByRole('img', {name: name.trim()})).toHaveTextContent(text);
      unmount();
    }
  });
  it('does not crash on an empty name and renders no initials', () => {
    const {container} = render(<Avatar name="" />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector('[role="img"]')).toBeEmptyDOMElement();
  });
  it('handles non-Latin and RTL names', () => {
    render(<><Avatar name="محمد علي" /><Avatar name="山田 太郎" /></>);
    expect(screen.getByRole('img', {name: 'محمد علي'})).toHaveTextContent('مع');
    expect(screen.getByRole('img', {name: '山田 太郎'})).toHaveTextContent('山太');
  });
  it('keeps the initials when the image has not loaded (src given, jsdom never loads it)', () => {
    render(<Avatar name="Grace Hopper" src="https://example.test/g.png" />);
    expect(screen.getByRole('img', {name: 'Grace Hopper'})).toHaveTextContent('GH');
  });
  it('defaults to md and solid: no modifier classes', () => {
    const {container} = render(<Avatar name="A B" />);
    expect((container.firstChild as HTMLElement).className).toBe('avatar');
  });
  it('applies size and variant independently', () => {
    const {container, rerender} = render(<Avatar name="A B" size="lg" />);
    expect(container.firstChild).toHaveClass('avatar-lg');
    expect(container.firstChild).not.toHaveClass('avatar-line');
    rerender(<Avatar name="A B" variant="line" />);
    expect(container.firstChild).toHaveClass('avatar-line');
    expect(container.firstChild).not.toHaveClass('avatar-lg');
  });
  it('forwards ref, merges className and passes other props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} name="A B" className="mine" data-testid="av" title="hi" />);
    expect(ref.current).toBe(screen.getByTestId('av'));
    expect(ref.current).toHaveClass('avatar', 'mine');
    expect(ref.current).toHaveAttribute('title', 'hi');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Avatar name="Ada Lovelace" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
