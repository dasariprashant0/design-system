import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {Spinner} from './spinner';
import {createRef} from 'react';

describe('Spinner', () => {
  it('is a named status', () => {
    render(<Spinner label="Syncing" />);
    expect(screen.getByRole('status', {name: 'Syncing'})).toHaveClass('spinner');
  });
  it('defaults the accessible name to Loading', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
  });
  it('uses a custom label', () => {
    render(<Spinner label="Saving draft" />);
    expect(screen.getByRole('status', {name: 'Saving draft'})).toBeInTheDocument();
  });
  it('is a span with the spinner class, merges className and forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} className="mine" />);
    expect(ref.current!.tagName).toBe('SPAN');
    expect(ref.current).toHaveClass('spinner', 'mine');
  });
  it('shows no text of its own (the label is the name, not content)', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
  it('lets callers override aria-label via the label prop only, and spread other props', () => {
    render(<Spinner label="Wait" data-x="1" id="s" />);
    const s = screen.getByRole('status');
    expect(s).toHaveAttribute('id', 's');
    expect(s).toHaveAttribute('data-x', '1');
  });
  it('handles RTL and very long labels', () => {
    render(<Spinner label={'جارٍ التحميل '.repeat(100)} />);
    expect(screen.getByRole('status')).toHaveAccessibleName(/جارٍ التحميل/);
  });
  it('has no axe violations', async () => {
    const {container} = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
