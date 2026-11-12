import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockFeatureGrid} from './block-feature-grid';
import {createRef} from 'react';

const features = [{title: 'Fast', description: 'Loads quickly.'}, {title: 'Plain', description: 'No magic.'}, {title: 'Small', description: 'Few parts.', icon: <svg />}];

describe('BlockFeatureGrid', () => {
  it('renders the title and each feature one heading level below', () => {
    render(<BlockFeatureGrid title="Why use it" description="Three reasons." features={features} />);
    expect(screen.getByRole('heading', {level: 2, name: 'Why use it'})).toBeInTheDocument();
    expect(screen.getAllByRole('heading', {level: 3})).toHaveLength(3);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
  it('respects headingLevel and columns', () => {
    render(<BlockFeatureGrid title="T" features={features} headingLevel={3} columns={4} />);
    expect(screen.getByRole('heading', {level: 3, name: 'T'})).toBeInTheDocument();
    expect(screen.getAllByRole('heading', {level: 4})).toHaveLength(3);
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '4');
  });
  it('names the region by the title and forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockFeatureGrid ref={ref} title="Why" features={features} />);
    expect(screen.getByRole('region', {name: 'Why'})).toBe(ref.current);
  });
  it('defaults to three columns and level 2/3 headings', () => {
    render(<BlockFeatureGrid title="T" features={features} />);
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '3');
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
  });
  it('accepts 2 and 4 columns', () => {
    const {rerender} = render(<BlockFeatureGrid title="T" features={features} columns={2} />);
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '2');
    rerender(<BlockFeatureGrid title="T" features={features} columns={4} />);
    expect(screen.getByRole('list')).toHaveAttribute('data-columns', '4');
  });
  it('caps feature headings at h6 when the section title is already h5 or h6', () => {
    render(<BlockFeatureGrid title="T" features={features} headingLevel={5} />);
    expect(screen.getAllByRole('heading', {level: 6})).toHaveLength(3);
  });
  it('renders icons as hidden decoration, and only for features that have one', () => {
    const {container} = render(<BlockFeatureGrid title="T" features={features} />);
    const icons = container.querySelectorAll('.block-feature-icon');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
  });
  it('renders features in order with their descriptions', () => {
    render(<BlockFeatureGrid title="T" features={features} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('FastLoads quickly.');
    expect(items[2]).toHaveTextContent('SmallFew parts.');
  });
  it('renders an empty list for no features and omits the description when absent', () => {
    const {container} = render(<BlockFeatureGrid title="T" features={[]} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(container.querySelector('.block-features-head p')).toBeNull();
  });
  it('survives a very large number of features and merges className', () => {
    const many = Array.from({length: 200}, (_, i) => ({title: `F${i}`, description: 'd'}));
    const ref = createRef<HTMLElement>();
    render(<BlockFeatureGrid ref={ref} className="mine" title="T" features={many} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(200);
    expect(ref.current).toHaveClass('block-features', 'mine');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockFeatureGrid title="Why" features={features} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
