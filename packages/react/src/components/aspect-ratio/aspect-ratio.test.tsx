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
  it('has no axe violations', async () => {
    const {container} = render(<AspectRatio ratio={16 / 9}><img alt="chart" src="x.png" /></AspectRatio>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
