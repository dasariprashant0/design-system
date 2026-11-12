import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {TextReveal} from './text-reveal';
import {createRef} from 'react';

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
  it('defaults the step to 80ms', () => {
    render(<TextReveal text="a b" data-testid="t" />);
    expect(screen.getByTestId('t').style.getPropertyValue('--text-reveal-step')).toBe('80ms');
  });
  it('wraps every word in its own indexed span, in order, with single spaces between', () => {
    const {container} = render(<TextReveal text="  one   two three  " data-testid="t" />);
    const words = [...container.querySelectorAll<HTMLElement>('.text-reveal-word')];
    expect(words.map((w) => w.textContent)).toEqual(['one', 'two', 'three']);
    expect(words.map((w) => w.style.getPropertyValue('--i'))).toEqual(['0', '1', '2']);
    expect(screen.getByTestId('t').textContent).toBe('one two three');
  });
  it('splits on newlines and tabs too', () => {
    const {container} = render(<TextReveal text={'a\nb\tc'} />);
    expect(container.querySelectorAll('.text-reveal-word')).toHaveLength(3);
  });
  it('renders nothing for empty or whitespace-only text', () => {
    const {container, rerender} = render(<TextReveal text="" data-testid="t" />);
    expect(screen.getByTestId('t')).toBeEmptyDOMElement();
    rerender(<TextReveal text="   " data-testid="t" />);
    expect(container.querySelectorAll('.text-reveal-word')).toHaveLength(0);
  });
  it('a single word has no trailing space', () => {
    render(<TextReveal text="Hi" data-testid="t" />);
    expect(screen.getByTestId('t').textContent).toBe('Hi');
  });
  it('re-splits when the text changes', () => {
    const {container, rerender} = render(<TextReveal text="a b" />);
    rerender(<TextReveal text="a b c d" />);
    expect(container.querySelectorAll('.text-reveal-word')).toHaveLength(4);
  });
  it('handles zero stagger, many words, RTL and merges className/style/ref', () => {
    const ref = createRef<HTMLParagraphElement>();
    render(<TextReveal ref={ref} text={'كلمة '.repeat(500)} stagger={0} className="mine" style={{color: 'red'}} />);
    expect(ref.current!.tagName).toBe('P');
    expect(ref.current).toHaveClass('text-reveal', 'mine');
    expect(ref.current!.style.getPropertyValue('--text-reveal-step')).toBe('0ms');
    expect(ref.current!.style.color).toBe('red');
    expect(ref.current!.querySelectorAll('.text-reveal-word')).toHaveLength(500);
  });
  it('has no axe violations', async () => {
    const {container} = render(<TextReveal text="Hello world" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
