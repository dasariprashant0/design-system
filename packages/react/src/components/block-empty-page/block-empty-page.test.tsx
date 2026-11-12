import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockEmptyPage} from './block-empty-page';
import {Button} from '../button';

describe('BlockEmptyPage', () => {
  it('renders an h1 title, description and actions', () => {
    render(<BlockEmptyPage code="404" title="Page not found" description="Check the address." actions={<Button variant="solid">Go home</Button>} />);
    expect(screen.getByRole('region', {name: 'Page not found'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1, name: 'Page not found'})).toBeInTheDocument();
    expect(screen.getByText('Check the address.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Go home'})).toBeInTheDocument();
  });
  it('hides the code from assistive tech', () => {
    render(<BlockEmptyPage code="404" title="Gone" />);
    expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true');
  });
  it('respects headingLevel and forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockEmptyPage ref={ref} title="T" headingLevel={2} />);
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockEmptyPage code="404" title="Page not found" description="Check the address." actions={<Button variant="solid">Go home</Button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
