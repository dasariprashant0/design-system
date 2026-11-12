import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Badge} from './badge';
import {createRef} from 'react';

describe('Badge', () => {
  it('renders text with variant classes', () => {
    render(<><Badge>draft</Badge><Badge variant="solid">12</Badge><Badge variant="accent">new</Badge></>);
    expect(screen.getByText('draft')).toHaveClass('badge');
    expect(screen.getByText('12')).toHaveClass('badge-solid');
    expect(screen.getByText('new')).toHaveClass('badge-accent');
  });
  it('outline is the default and adds no modifier class', () => {
    render(<Badge>x</Badge>);
    expect(screen.getByText('x').className).toBe('badge');
  });
  it('variants are mutually exclusive', () => {
    const {rerender} = render(<Badge variant="solid">x</Badge>);
    expect(screen.getByText('x')).toHaveClass('badge-solid');
    expect(screen.getByText('x')).not.toHaveClass('badge-accent');
    rerender(<Badge variant="accent">x</Badge>);
    expect(screen.getByText('x')).toHaveClass('badge-accent');
    expect(screen.getByText('x')).not.toHaveClass('badge-solid');
  });
  it('is a span, forwards ref, merges className and spreads props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref} className="mine" title="t" data-k="v">x</Badge>);
    expect(ref.current!.tagName).toBe('SPAN');
    expect(ref.current).toHaveClass('badge', 'mine');
    expect(ref.current).toHaveAttribute('title', 't');
    expect(ref.current).toHaveAttribute('data-k', 'v');
  });
  it('renders zero, negative and huge counts as text', () => {
    render(<><Badge>{0}</Badge><Badge>{-3}</Badge><Badge>{'9'.repeat(30)}</Badge></>);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
    expect(screen.getByText('9'.repeat(30))).toBeInTheDocument();
  });
  it('renders empty and RTL content without breaking', () => {
    const {container} = render(<><Badge /><Badge dir="rtl">جديد</Badge></>);
    expect(container.querySelectorAll('.badge')).toHaveLength(2);
    expect(screen.getByText('جديد')).toHaveAttribute('dir', 'rtl');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Badge>draft</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
