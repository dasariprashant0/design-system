import {render, screen} from '@testing-library/react';
import {axe} from '../../test/axe';
import {fireEvent} from '@testing-library/react';
import {Image} from './image';

describe('Image', () => {
  it('renders with alt, lazy loading and the fit class', () => {
    render(<Image src="a.png" alt="A chart" fit="contain" />);
    const img = screen.getByRole('img', {name: 'A chart'});
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveClass('image-contain');
  });
  it('reserves space with a ratio', () => {
    render(<Image src="a.png" alt="x" ratio={2} />);
    expect(screen.getByRole('img').style.aspectRatio).toBe('2');
  });
  it('falls back to the alt text when loading fails', () => {
    const onError = vi.fn();
    render(<Image src="missing.png" alt="A chart" onError={onError} />);
    fireEvent.error(screen.getByRole('img'));
    expect(onError).toHaveBeenCalled();
    expect(screen.getByRole('img', {name: 'A chart'})).toHaveTextContent('A chart');
  });
  it('has no axe violations', async () => {
    const {container} = render(<Image src="a.png" alt="A chart" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
