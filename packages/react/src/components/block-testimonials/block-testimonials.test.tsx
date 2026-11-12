import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockTestimonials} from './block-testimonials';
import {createRef} from 'react';

const items = [
  {quote: 'It stayed out of the way.', name: 'Ada Example', role: 'Engineer, Example Co'},
  {quote: 'Our pages got simpler.', name: 'Sam Sample'},
];

describe('BlockTestimonials', () => {
  it('renders a heading and one figure per quote', () => {
    render(<BlockTestimonials title="What people say" items={items} />);
    expect(screen.getByRole('heading', {level: 2, name: 'What people say'})).toBeInTheDocument();
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    expect(screen.getByText('It stayed out of the way.').tagName).toBe('BLOCKQUOTE');
    expect(screen.getByText('Engineer, Example Co')).toBeInTheDocument();
  });
  it('names the region and forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockTestimonials ref={ref} title="Praise" items={items} headingLevel={3} />);
    expect(screen.getByRole('region', {name: 'Praise'})).toBe(ref.current);
    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
  });
  it('puts quote in a blockquote and author in a figcaption inside each figure', () => {
    render(<BlockTestimonials title="T" items={items} />);
    const fig = screen.getAllByRole('figure')[0]!;
    expect(fig.querySelector('blockquote')).toHaveTextContent('It stayed out of the way.');
    expect(fig.querySelector('figcaption')).toHaveTextContent('Ada Example');
    expect(fig.querySelector('figcaption')).toHaveTextContent('Engineer, Example Co');
  });
  it('omits the role span when no role is given', () => {
    const {container} = render(<BlockTestimonials title="T" items={[items[1]!]} />);
    expect(container.querySelector('.block-testimonial-role')).toBeNull();
  });
  it('hides avatars from assistive tech and renders them only when given', () => {
    const {container} = render(<BlockTestimonials title="T" items={[{...items[0]!, avatar: <img alt="Ada" src="a.png" />}, items[1]!]} />);
    const avatars = container.querySelectorAll('.block-testimonial-avatar');
    expect(avatars).toHaveLength(1);
    expect(avatars[0]).toHaveAttribute('aria-hidden', 'true');
  });
  it('renders no figures for an empty items array', () => {
    render(<BlockTestimonials title="T" items={[]} />);
    expect(screen.queryAllByRole('figure')).toHaveLength(0);
    expect(screen.getByRole('heading', {name: 'T'})).toBeInTheDocument();
  });
  it('supports every heading level', () => {
    const {rerender} = render(<BlockTestimonials title="T" items={items} />);
    for (const level of [1, 4, 6] as const) {
      rerender(<BlockTestimonials title="T" items={items} headingLevel={level} />);
      expect(screen.getByRole('heading', {level})).toBeInTheDocument();
    }
  });
  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLElement>();
    render(<BlockTestimonials ref={ref} className="mine" title="T" items={items} />);
    expect(ref.current).toHaveClass('block-testimonials', 'mine');
  });
  it('copes with very long and RTL quotes', () => {
    render(<BlockTestimonials title="T" items={[{quote: 'مرحبا '.repeat(500), name: 'x'}]} />);
    expect(screen.getByRole('figure').querySelector('blockquote')).toHaveTextContent('مرحبا');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockTestimonials title="What people say" items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
