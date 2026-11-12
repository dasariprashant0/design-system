import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {AnimatedList} from './animated-list';
import {createRef} from 'react';

describe('AnimatedList', () => {
  it('renders one list item per child, all in the document from the start', () => {
    render(<AnimatedList><span>One</span><span>Two</span><span>Three</span></AnimatedList>);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Three')).toBeVisible();
  });
  it('indexes items and sets the interval', () => {
    render(<AnimatedList interval={500} data-testid="l"><span>a</span><span>b</span></AnimatedList>);
    expect(screen.getByTestId('l').style.getPropertyValue('--animated-list-step')).toBe('500ms');
    expect((screen.getAllByRole('listitem')[1] as HTMLElement).style.getPropertyValue('--i')).toBe('1');
  });
  it('ignores empty children', () => {
    render(<AnimatedList>{null}{false}<span>Only</span></AnimatedList>);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
  it('renders items in order, one li per child, inside a ul', () => {
    render(<AnimatedList><span>A</span><span>B</span><span>C</span></AnimatedList>);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['A', 'B', 'C']);
    expect(screen.getByRole('list').tagName).toBe('UL');
    screen.getAllByRole('listitem').forEach((li, i) => expect(li.style.getPropertyValue('--i')).toBe(String(i)));
  });
  it('defaults the step to 300ms and honours 0', () => {
    const {rerender} = render(<AnimatedList data-testid="l"><span>a</span></AnimatedList>);
    expect(screen.getByTestId('l').style.getPropertyValue('--animated-list-step')).toBe('300ms');
    rerender(<AnimatedList data-testid="l" interval={0}><span>a</span></AnimatedList>);
    expect(screen.getByTestId('l').style.getPropertyValue('--animated-list-step')).toBe('0ms');
  });
  it('lets a caller style merge with the step variable', () => {
    render(<AnimatedList data-testid="l" style={{color: 'red'}}><span>a</span></AnimatedList>);
    const l = screen.getByTestId('l');
    expect(l.style.color).toBe('red');
    expect(l.style.getPropertyValue('--animated-list-step')).toBe('300ms');
  });
  it('forwards ref and merges className', () => {
    const ref = createRef<HTMLUListElement>();
    render(<AnimatedList ref={ref} className="extra"><span>a</span></AnimatedList>);
    expect(ref.current).toHaveClass('animated-list', 'extra');
  });
  it('renders an empty list with no children and wraps newly added children', () => {
    const {rerender} = render(<AnimatedList />);
    expect(screen.getByRole('list')).toBeEmptyDOMElement();
    rerender(<AnimatedList><span>a</span><span>b</span></AnimatedList>);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
  it('flattens fragments and arrays into separate items', () => {
    render(<AnimatedList>{['x', 'y'].map((s) => <span key={s}>{s}</span>)}<span>z</span></AnimatedList>);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });
  it('has no axe violations', async () => {
    const {container} = render(<AnimatedList><span>One</span><span>Two</span></AnimatedList>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
