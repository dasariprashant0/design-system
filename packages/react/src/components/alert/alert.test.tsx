import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Alert} from './alert';

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
  it('has no axe violations', async () => {
    const {container} = render(<Alert tone="success" title="Saved">ok</Alert>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
