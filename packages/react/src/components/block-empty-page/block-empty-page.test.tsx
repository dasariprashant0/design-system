import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockEmptyPage} from './block-empty-page';
import {Button} from '../button';
import {createRef} from 'react';

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
  it('renders only the title when nothing else is given', () => {
    const {container} = render(<BlockEmptyPage title="Nothing" />);
    expect(container.querySelector('.block-empty-page-code')).toBeNull();
    expect(container.querySelector('.block-empty-page-description')).toBeNull();
    expect(container.querySelector('.block-empty-page-actions')).toBeNull();
    expect(screen.getByRole('heading', {level: 1, name: 'Nothing'})).toBeInTheDocument();
  });
  it('keeps the decorative code out of the region name and the heading', () => {
    render(<BlockEmptyPage code="404" title="Lost" />);
    expect(screen.getByRole('region', {name: 'Lost'})).toBeInTheDocument();
    expect(screen.queryByText('404', {ignore: '[aria-hidden]'})).toBeNull();
  });
  it('supports heading levels 1 to 3', () => {
    const {rerender} = render(<BlockEmptyPage title="T" />);
    for (const level of [2, 3] as const) {
      rerender(<BlockEmptyPage title="T" headingLevel={level} />);
      expect(screen.getByRole('heading', {level})).toBeInTheDocument();
    }
  });
  it('renders several actions inside the actions slot', () => {
    render(<BlockEmptyPage title="T" actions={<><Button>One</Button><Button>Two</Button></>} />);
    expect(screen.getByRole('button', {name: 'One'}).parentElement).toHaveClass('block-empty-page-actions');
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
  it('merges className, spreads props and forwards ref to the section', () => {
    const ref = createRef<HTMLElement>();
    render(<BlockEmptyPage ref={ref} className="mine" id="e" title="T" />);
    expect(ref.current!.tagName).toBe('SECTION');
    expect(ref.current).toHaveClass('block-empty-page', 'mine');
    expect(ref.current).toHaveAttribute('id', 'e');
  });
  it('ignores a falsy code (empty string, undefined) rather than rendering an empty paragraph', () => {
    const {container} = render(<BlockEmptyPage code="" title="T" />);
    expect(container.querySelector('p')).toBeNull();
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockEmptyPage code="404" title="Page not found" description="Check the address." actions={<Button variant="solid">Go home</Button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
