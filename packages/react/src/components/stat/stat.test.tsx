import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Stat} from './stat';

describe('Stat', () => {
  it('pairs the label with the value', () => {
    render(<Stat label="Revenue" value="$12k" note="+4% this week" />);
    expect(screen.getByText('Revenue').tagName).toBe('DT');
    expect(screen.getByText('$12k')).toHaveClass('stat-value');
    expect(screen.getByText('+4% this week')).toHaveClass('stat-note');
  });
  it('omits the note when not given', () => {
    const {container} = render(<Stat label="Users" value="3" />);
    expect(container.querySelector('.stat-note')).toBeNull();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Stat label="Users" value="3" note="today" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
