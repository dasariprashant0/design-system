import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './card';
import {createRef} from 'react';
import {CardFooter} from './card';

describe('Card', () => {
  it('renders its parts', () => {
    render(<Card><CardHeader><CardTitle>Title</CardTitle><CardDescription>Desc</CardDescription></CardHeader><CardContent>Body</CardContent></Card>);
    expect(screen.getByRole('heading', {name: 'Title'})).toHaveClass('card-title');
    expect(screen.getByText('Body')).toHaveClass('card-content');
  });
  it('can be one link with asChild', () => {
    render(<Card asChild interactive><a href="/x">Go</a></Card>);
    const link = screen.getByRole('link', {name: 'Go'});
    expect(link).toHaveClass('card', 'card-hover');
  });
  it('is a plain div with no hover class unless interactive', () => {
    render(<Card data-testid="c">x</Card>);
    const c = screen.getByTestId('c');
    expect(c.tagName).toBe('DIV');
    expect(c.className).toBe('card');
  });
  it('interactive adds card-hover and merges className', () => {
    render(<Card data-testid="c" interactive className="mine">x</Card>);
    expect(screen.getByTestId('c')).toHaveClass('card', 'card-hover', 'mine');
  });
  it('asChild keeps the link semantics and forwards ref to it', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card asChild ref={ref}><a href="/x" className="own">Go</a></Card>);
    const link = screen.getByRole('link', {name: 'Go'});
    expect(link).toHaveAttribute('href', '/x');
    expect(link).toHaveClass('card', 'own');
    expect(ref.current).toBe(link);
  });
  it('renders each part with its tag and class', () => {
    render(<Card><CardHeader data-testid="h"><CardTitle>T</CardTitle><CardDescription>D</CardDescription></CardHeader><CardContent data-testid="c">B</CardContent><CardFooter data-testid="f">F</CardFooter></Card>);
    expect(screen.getByTestId('h')).toHaveClass('card-header');
    expect(screen.getByText('T').tagName).toBe('H3');
    expect(screen.getByText('D').tagName).toBe('P');
    expect(screen.getByText('D')).toHaveClass('card-description');
    expect(screen.getByTestId('c')).toHaveClass('card-content');
    expect(screen.getByTestId('f')).toHaveClass('card-footer');
  });
  it('parts forward refs and merge className', () => {
    const t = createRef<HTMLHeadingElement>();
    const f = createRef<HTMLDivElement>();
    render(<><CardTitle ref={t} className="x">T</CardTitle><CardFooter ref={f} className="y">F</CardFooter></>);
    expect(t.current).toHaveClass('card-title', 'x');
    expect(f.current).toHaveClass('card-footer', 'y');
  });
  it('card parts expose display names for devtools', () => {
    expect(CardHeader.displayName).toBe('CardHeader');
    expect(CardFooter.displayName).toBe('CardFooter');
  });
  it('renders empty and handles long and RTL text', () => {
    render(<><Card data-testid="e" /><Card><CardTitle>{'عنوان '.repeat(300)}</CardTitle></Card></>);
    expect(screen.getByTestId('e')).toBeEmptyDOMElement();
    expect(screen.getByRole('heading')).toHaveTextContent('عنوان');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
