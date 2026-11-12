import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Stat} from './stat';
import {createRef} from 'react';

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
  it('is a description list: term is the label, definition the value', () => {
    render(<Stat label="Revenue" value="$12k" />);
    expect(screen.getByRole('term')).toHaveTextContent('Revenue');
    expect(screen.getByRole('definition')).toHaveTextContent('$12k');
  });
  it('renders the note as a second definition after the value', () => {
    const {container} = render(<Stat label="L" value="1" note="vs last week" />);
    const dds = container.querySelectorAll('dd');
    expect(dds).toHaveLength(2);
    expect(dds[0]).toHaveClass('stat-value');
    expect(dds[1]).toHaveClass('stat-note');
    expect(dds[1]).toHaveTextContent('vs last week');
  });
  it('shows zero as a value and as a note', () => {
    const {container} = render(<Stat label="Errors" value={0} note={0} />);
    expect(container.querySelector('.stat-value')).toHaveTextContent('0');
    expect(container.querySelector('.stat-note')).toHaveTextContent('0');
    expect(container.querySelector('dl')!.textContent).toBe('Errors00');
  });
  it('handles negative, huge, rich and RTL values', () => {
    render(<><Stat label="Delta" value={-42} /><Stat label="Big" value={'9'.repeat(40)} /><Stat label={<b>الإيرادات</b>} value={<span>١٢٣</span>} /></>);
    expect(screen.getByText('-42')).toHaveClass('stat-value');
    expect(screen.getByText('9'.repeat(40))).toBeInTheDocument();
    expect(screen.getByText('الإيرادات').tagName).toBe('B');
  });
  it('forwards ref, merges className and spreads props on the dl', () => {
    const ref = createRef<HTMLDListElement>();
    render(<Stat ref={ref} label="L" value="V" className="mine" data-x="1" />);
    expect(ref.current!.tagName).toBe('DL');
    expect(ref.current).toHaveClass('stat', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
    expect(ref.current!.querySelector('dt')).toHaveClass('label');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Stat label="Users" value="3" note="today" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
