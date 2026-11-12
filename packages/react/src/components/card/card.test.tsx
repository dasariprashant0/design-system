import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './card';

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
  it('has no axe violations', async () => {
    const {container} = render(<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader></Card>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
