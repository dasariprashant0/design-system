import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {TextReveal} from './text-reveal';

describe('TextReveal', () => {
  it('keeps the sentence readable as one piece of text', () => {
    render(<TextReveal text="One two  three" data-testid="t" />);
    expect(screen.getByTestId('t')).toHaveTextContent('One two three');
  });
  it('indexes each word and sets the stagger', () => {
    const {container} = render(<TextReveal text="a b c" stagger={120} data-testid="t" />);
    const words = container.querySelectorAll<HTMLElement>('.text-reveal-word');
    expect(words).toHaveLength(3);
    expect(words[2]!.style.getPropertyValue('--i')).toBe('2');
    expect(screen.getByTestId('t').style.getPropertyValue('--text-reveal-step')).toBe('120ms');
  });
  it('has no axe violations', async () => {
    const {container} = render(<TextReveal text="Hello world" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
