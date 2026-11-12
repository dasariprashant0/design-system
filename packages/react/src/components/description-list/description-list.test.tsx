import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {DescriptionList} from './description-list';
import {createRef} from 'react';

const items = [{term: 'Plan', details: 'Pro'}, {term: 'Seats', details: '12'}];

describe('DescriptionList', () => {
  it('renders each term with its details', () => {
    render(<DescriptionList items={items} />);
    expect(screen.getByText('Plan').tagName).toBe('DT');
    expect(screen.getByText('Pro').tagName).toBe('DD');
    expect(screen.getAllByRole('term')).toHaveLength(2);
  });
  it('supports a stacked layout', () => {
    const {container} = render(<DescriptionList items={items} layout="stacked" />);
    expect(container.querySelector('dl')).toHaveClass('dlist-stacked');
  });
  it('defaults to the inline layout (no stacked class)', () => {
    const {container} = render(<DescriptionList items={items} />);
    expect(container.querySelector('dl')!.className).toBe('dlist');
  });
  it('pairs each term with its own details, in order, inside a row', () => {
    const {container} = render(<DescriptionList items={items} />);
    const rows = container.querySelectorAll('.dlist-row');
    expect(rows).toHaveLength(2);
    expect(rows[0]!.querySelector('dt')).toHaveTextContent('Plan');
    expect(rows[0]!.querySelector('dd')).toHaveTextContent('Pro');
    expect(rows[1]!.querySelector('dt')).toHaveTextContent('Seats');
    expect(rows[1]!.querySelector('dd')).toHaveTextContent('12');
  });
  it('maps terms and definitions to the term and definition roles', () => {
    render(<DescriptionList items={items} />);
    expect(screen.getAllByRole('term')).toHaveLength(2);
    expect(screen.getAllByRole('definition')).toHaveLength(2);
  });
  it('renders an empty dl for no items', () => {
    const {container} = render(<DescriptionList items={[]} />);
    expect(container.querySelector('dl')).toBeEmptyDOMElement();
  });
  it('accepts rich nodes, zero and long or RTL text', () => {
    render(<DescriptionList items={[{term: <b>مفتاح</b>, details: 0}, {term: 'Long', details: 'y'.repeat(5000)}]} />);
    expect(screen.getByText('مفتاح').tagName).toBe('B');
    expect(screen.getByText('0').tagName).toBe('DD');
    expect(screen.getByText('y'.repeat(5000))).toBeInTheDocument();
  });
  it('forwards ref, merges className with the layout class and spreads props', () => {
    const ref = createRef<HTMLDListElement>();
    render(<DescriptionList ref={ref} items={items} layout="stacked" className="mine" data-x="1" />);
    expect(ref.current).toHaveClass('dlist', 'dlist-stacked', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('has no axe violations', async () => {
    const {container} = render(<DescriptionList items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
