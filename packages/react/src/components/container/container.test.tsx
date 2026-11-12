import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Container} from './container';
import {createRef} from 'react';

describe('Container', () => {
  it('defaults to the page size', () => {
    render(<Container data-testid="c">x</Container>);
    expect(screen.getByTestId('c')).toHaveClass('container', 'container-page');
  });
  it('supports sizes and asChild', () => {
    render(<Container size="text" asChild><main>body</main></Container>);
    expect(screen.getByRole('main')).toHaveClass('container', 'container-text');
  });
  it('maps each size to a class and never combines two sizes', () => {
    for (const size of ['text', 'page', 'full'] as const) {
      const {unmount} = render(<Container size={size} data-testid="c">x</Container>);
      const el = screen.getByTestId('c');
      expect(el).toHaveClass(`container-${size}`);
      expect(el.className.match(/container-/g)).toHaveLength(1);
      unmount();
    }
  });
  it('merges className and spreads props', () => {
    render(<Container data-testid="c" className="mine" id="i">x</Container>);
    expect(screen.getByTestId('c')).toHaveClass('container', 'container-page', 'mine');
    expect(screen.getByTestId('c')).toHaveAttribute('id', 'i');
  });
  it('forwards a ref to the div, and to the child with asChild', () => {
    const a = createRef<HTMLDivElement>();
    const b = createRef<HTMLDivElement>();
    render(<><Container ref={a}>x</Container><Container ref={b} asChild><section data-testid="s">y</section></Container></>);
    expect(a.current!.tagName).toBe('DIV');
    expect(b.current).toBe(screen.getByTestId('s'));
  });
  it('asChild keeps the child class alongside the container classes', () => {
    render(<Container asChild size="full" className="mine"><main className="own">x</main></Container>);
    expect(screen.getByRole('main')).toHaveClass('container', 'container-full', 'own', 'mine');
  });
  it('renders empty and very long unbroken text', () => {
    render(<><Container data-testid="e" /><Container data-testid="l">{'x'.repeat(10000)}</Container></>);
    expect(screen.getByTestId('e')).toBeEmptyDOMElement();
    expect(screen.getByTestId('l').textContent).toHaveLength(10000);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Container>content</Container>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
