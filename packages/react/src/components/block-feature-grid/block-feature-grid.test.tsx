import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockFeatureGrid} from './block-feature-grid';

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
  it('has no axe violations', async () => {
    const {container} = render(<BlockFeatureGrid title="Why" features={features} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
