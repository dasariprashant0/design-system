import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {AnimatedList} from './animated-list';

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
  it('has no axe violations', async () => {
    const {container} = render(<AnimatedList><span>One</span><span>Two</span></AnimatedList>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
