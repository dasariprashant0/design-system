import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Container} from './container';

describe('Container', () => {
  it('defaults to the page size', () => {
    render(<Container data-testid="c">x</Container>);
    expect(screen.getByTestId('c')).toHaveClass('container', 'container-page');
  });
  it('supports sizes and asChild', () => {
    render(<Container size="text" asChild><main>body</main></Container>);
    expect(screen.getByRole('main')).toHaveClass('container', 'container-text');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Container>content</Container>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
