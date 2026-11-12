import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Alert} from './alert';
import {createRef} from 'react';

describe('Alert', () => {
  it('announces urgent tones with role=alert and others as status', () => {
    render(<><Alert tone="danger" title="Bad" /><Alert tone="info" title="Fine" /></>);
    expect(screen.getByRole('alert')).toHaveTextContent('Bad');
    expect(screen.getByRole('status')).toHaveTextContent('Fine');
  });
  it('renders the description and tone attribute', () => {
    render(<Alert tone="warning" title="Careful">Details here</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'warning');
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });
  it('maps every tone to the right role: warning is urgent, success is polite', () => {
    const tones = {info: 'status', success: 'status', warning: 'alert', danger: 'alert'} as const;
    for (const [tone, role] of Object.entries(tones)) {
      const {unmount} = render(<Alert tone={tone as keyof typeof tones} title={tone} />);
      expect(screen.getByRole(role)).toHaveAttribute('data-tone', tone);
      unmount();
    }
  });
  it('defaults to the info tone', () => {
    render(<Alert title="Hi" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'info');
  });
  it('omits the description element when there are no children', () => {
    const {container, rerender} = render(<Alert title="T" />);
    expect(container.querySelector('.alert-description')).toBeNull();
    rerender(<Alert title="T">body</Alert>);
    expect(container.querySelector('.alert-description')).toHaveTextContent('body');
  });
  it('forwards ref, merges className and passes through other props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref} title="T" className="mine" id="a1" data-x="1" />);
    expect(ref.current).toHaveClass('alert', 'mine');
    expect(ref.current).toHaveAttribute('id', 'a1');
    expect(ref.current).toHaveAttribute('data-x', '1');
  });
  it('lets a caller override the role', () => {
    render(<Alert title="T" role="note" />);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
  it('accepts rich titles and very long or RTL text', () => {
    const long = 'x'.repeat(5000);
    render(<Alert tone="danger" title={<strong>مرحبا</strong>}>{long}</Alert>);
    expect(screen.getByText('مرحبا').tagName).toBe('STRONG');
    expect(screen.getByText(long)).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const {container} = render(<Alert tone="success" title="Saved">ok</Alert>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
