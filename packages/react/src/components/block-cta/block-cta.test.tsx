import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockCta} from './block-cta';
import {Button} from '../button';
import {createRef} from 'react';

describe('BlockCta', () => {
  it('renders title, description and actions in a named region', () => {
    render(<BlockCta title="Ready?" description="Start in a minute." actions={<Button variant="solid">Start</Button>} />);
    expect(screen.getByRole('region', {name: 'Ready?'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
    expect(screen.getByText('Start in a minute.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Start'})).toBeInTheDocument();
  });
  it('respects headingLevel and forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockCta ref={ref} title="T" headingLevel={3} actions={<Button>Go</Button>} />);
    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
  it('omits the description when not given', () => {
    const {container} = render(<BlockCta title="T" actions={<Button>Go</Button>} />);
    expect(container.querySelector('.block-cta-copy p')).toBeNull();
  });
  it('defaults to h2 and supports every heading level', () => {
    const {rerender} = render(<BlockCta title="T" actions={<Button>Go</Button>} />);
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument();
    for (const level of [1, 3, 4, 5] as const) {
      rerender(<BlockCta title="T" headingLevel={level} actions={<Button>Go</Button>} />);
      expect(screen.getByRole('heading', {level})).toBeInTheDocument();
    }
  });
  it('labels the region with the heading id, even with several on a page', () => {
    render(<><BlockCta title="One" actions="a" /><BlockCta title="Two" actions="b" /></>);
    expect(screen.getByRole('region', {name: 'One'})).toBeInTheDocument();
    expect(screen.getByRole('region', {name: 'Two'})).toBeInTheDocument();
  });
  it('renders several actions and keeps them in the actions slot', () => {
    render(<BlockCta title="T" actions={<><Button>A</Button><Button>B</Button></>} />);
    const slot = screen.getByRole('button', {name: 'A'}).parentElement!;
    expect(slot).toHaveClass('block-cta-actions');
    expect(slot.querySelectorAll('button')).toHaveLength(2);
  });
  it('merges className, spreads props and forwards a ref to the section', () => {
    const ref = createRef<HTMLElement>();
    render(<BlockCta ref={ref} className="mine" data-x="1" title="T" actions="a" />);
    expect(ref.current!.tagName).toBe('SECTION');
    expect(ref.current).toHaveClass('block-cta', 'mine');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('copes with very long and RTL titles', () => {
    render(<BlockCta title={'مرحبا '.repeat(200)} actions="a" />);
    expect(screen.getByRole('heading')).toHaveTextContent('مرحبا');
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockCta title="Ready?" actions={<Button variant="solid">Start</Button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
