import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {AspectRatio} from './aspect-ratio';

describe('AspectRatio', () => {
  it('renders its children', () => {
    render(<AspectRatio ratio={2}><img alt="a chart" src="x.png" /></AspectRatio>);
    expect(screen.getByAltText('a chart')).toBeInTheDocument();
  });
  it('forwards ref', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<AspectRatio ref={ref} ratio={1}>x</AspectRatio>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
  it('sets the padding-bottom of the wrapper from the ratio', () => {
    const ref = {current: null as HTMLDivElement | null};
    const {rerender} = render(<AspectRatio ref={ref} ratio={2}>x</AspectRatio>);
    expect(ref.current!.parentElement!.style.paddingBottom).toBe('50%');
    rerender(<AspectRatio ref={ref} ratio={16 / 9}>x</AspectRatio>);
    expect(ref.current!.parentElement!.style.paddingBottom).toBe(`${100 / (16 / 9)}%`);
  });
  it('defaults to a square', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<AspectRatio ref={ref}>x</AspectRatio>);
    expect(ref.current!.parentElement!.style.paddingBottom).toBe('100%');
  });
  it('passes className, data and aria attributes to the content element', () => {
    render(<AspectRatio ratio={1} className="frame" data-testid="ar" aria-label="Preview">x</AspectRatio>);
    expect(screen.getByTestId('ar')).toHaveClass('frame');
    expect(screen.getByLabelText('Preview')).toBe(screen.getByTestId('ar'));
  });
  it('supports asChild', () => {
    render(<AspectRatio ratio={3} asChild><section data-testid="s">hi</section></AspectRatio>);
    expect(screen.getByTestId('s').tagName).toBe('SECTION');
    expect(screen.getByTestId('s').parentElement!.style.paddingBottom).toBeTruthy();
  });
  it('renders with no children', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(<AspectRatio ref={ref} ratio={4} />);
    expect(ref.current).toBeEmptyDOMElement();
  });
  it('has no axe violations', async () => {
    const {container} = render(<AspectRatio ratio={16 / 9}><img alt="chart" src="x.png" /></AspectRatio>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
