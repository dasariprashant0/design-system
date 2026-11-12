import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockHero} from './block-hero';
import {Button} from '../button';
import {createRef} from 'react';

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
  it('defaults to start alignment', () => {
    render(<BlockHero title="T" data-testid="h" />);
    expect(screen.getByTestId('h')).toHaveAttribute('data-align', 'start');
  });
  it('omits eyebrow, description, actions and media when not given', () => {
    const {container} = render(<BlockHero title="T" />);
    for (const c of ['.block-hero-eyebrow', '.block-hero-description', '.block-hero-actions', '.block-hero-media']) expect(container.querySelector(c)).toBeNull();
  });
  it('renders the eyebrow outside the heading so it does not pollute the name', () => {
    render(<BlockHero eyebrow="New" title="Ship faster" />);
    expect(screen.getByRole('region', {name: 'Ship faster'})).toBeInTheDocument();
    expect(screen.getByText('New')).toHaveClass('block-hero-eyebrow');
  });
  it('supports heading levels 1 to 3', () => {
    const {rerender} = render(<BlockHero title="T" headingLevel={3} />);
    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
    rerender(<BlockHero title="T" headingLevel={2} />);
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
  });
  it('gives two heroes on one page distinct accessible names', () => {
    render(<><BlockHero title="A" headingLevel={2} /><BlockHero title="B" headingLevel={2} /></>);
    expect(screen.getByRole('region', {name: 'A'})).toBeInTheDocument();
    expect(screen.getByRole('region', {name: 'B'})).toBeInTheDocument();
  });
  it('merges className and forwards a ref to the section', () => {
    const ref = createRef<HTMLElement>();
    render(<BlockHero ref={ref} className="mine" title="T" />);
    expect(ref.current!.tagName).toBe('SECTION');
    expect(ref.current).toHaveClass('block-hero', 'mine');
  });
  it('handles very long and RTL titles', () => {
    render(<BlockHero title={'שלום '.repeat(300)} dir="rtl" />);
    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('שלום');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockHero title="Ship faster" description="Plain words." actions={<Button variant="solid">Start</Button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
