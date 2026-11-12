import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Marquee} from './marquee';
import {createRef} from 'react';

describe('Marquee', () => {
  it('renders the items once for assistive tech and a hidden copy', () => {
    const {container} = render(<Marquee><span>Acme</span></Marquee>);
    expect(screen.getAllByText('Acme')).toHaveLength(2);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  });
  it('sets the duration, direction and pause classes', () => {
    render(<Marquee data-testid="m" duration={12} reverse>x</Marquee>);
    const el = screen.getByTestId('m');
    expect(el.style.getPropertyValue('--marquee-duration')).toBe('12s');
    expect(el).toHaveClass('marquee-reverse', 'marquee-pause');
  });
  it('defaults to 30s, forward direction and pause on hover', () => {
    render(<Marquee data-testid="m">x</Marquee>);
    const el = screen.getByTestId('m');
    expect(el.style.getPropertyValue('--marquee-duration')).toBe('30s');
    expect(el).toHaveClass('marquee', 'marquee-pause');
    expect(el).not.toHaveClass('marquee-reverse');
  });
  it('pauseOnHover=false drops the pause class', () => {
    render(<Marquee data-testid="m" pauseOnHover={false}>x</Marquee>);
    expect(screen.getByTestId('m')).not.toHaveClass('marquee-pause');
  });
  it('renders two tracks with identical content, only the second hidden', () => {
    const {container} = render(<Marquee><span>A</span><span>B</span></Marquee>);
    const tracks = container.querySelectorAll('.marquee-track');
    expect(tracks).toHaveLength(2);
    expect(tracks[0]).not.toHaveAttribute('aria-hidden');
    expect(tracks[1]).toHaveAttribute('aria-hidden', 'true');
    expect(tracks[0]!.textContent).toBe(tracks[1]!.textContent);
  });
  it('exposes interactive children to assistive tech only once (the copy is hidden)', () => {
    render(<Marquee><a href="/a">Link</a></Marquee>);
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
  it('renders empty tracks for no children', () => {
    const {container} = render(<Marquee />);
    container.querySelectorAll('.marquee-track').forEach((t) => expect(t).toBeEmptyDOMElement());
  });
  it('merges className and style, forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Marquee ref={ref} className="mine" style={{color: 'red'}} duration={0}>x</Marquee>);
    expect(ref.current).toHaveClass('marquee', 'mine');
    expect(ref.current!.style.color).toBe('red');
    expect(ref.current!.style.getPropertyValue('--marquee-duration')).toBe('0s');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Marquee><span>Acme</span></Marquee>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
