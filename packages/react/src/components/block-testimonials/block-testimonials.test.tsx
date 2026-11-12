import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockTestimonials} from './block-testimonials';

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
  it('has no axe violations', async () => {
    const {container} = render(<BlockTestimonials title="What people say" items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
