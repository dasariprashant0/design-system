import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockHero} from './block-hero';
import {Button} from '../button';

describe('BlockHero', () => {
  it('names the region by its h1 title by default', () => {
    render(<BlockHero title="Ship faster" description="Plain words." eyebrow="New" />);
    expect(screen.getByRole('heading', {level: 1, name: 'Ship faster'})).toBeInTheDocument();
    expect(screen.getByRole('region', {name: 'Ship faster'})).toBeInTheDocument();
    expect(screen.getByText('Plain words.')).toBeInTheDocument();
  });
  it('lets the heading level change', () => {
    render(<BlockHero title="Hello" headingLevel={2} />);
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
  });
  it('renders actions and media, and the alignment', () => {
    render(<BlockHero title="T" align="center" actions={<Button>Start</Button>} media={<img alt="Preview" src="x.png" />} data-testid="h" />);
    expect(screen.getByRole('button', {name: 'Start'})).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Preview'})).toBeInTheDocument();
    expect(screen.getByTestId('h')).toHaveAttribute('data-align', 'center');
  });
  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockHero ref={ref} title="T" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockHero title="Ship faster" description="Plain words." actions={<Button variant="solid">Start</Button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
