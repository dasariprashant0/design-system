import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {DescriptionList} from './description-list';

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
  it('has no axe violations', async () => {
    const {container} = render(<DescriptionList items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
