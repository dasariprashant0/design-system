import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {BlockCta} from './block-cta';
import {Button} from '../button';

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
  it('has no axe violations', async () => {
    const {container} = render(<BlockCta title="Ready?" actions={<Button variant="solid">Start</Button>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
