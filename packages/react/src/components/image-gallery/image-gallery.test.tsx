import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {ImageGallery, type GalleryImage} from './image-gallery';

const images: GalleryImage[] = [1, 2, 3].map((n) => ({src: `/img-${n}.jpg`, thumbnail: `/t-${n}.jpg`, alt: `Picture ${n}`, caption: `Caption ${n}`}));

describe('ImageGallery', () => {
  it('renders a button per image, named by its alt text', () => {
    render(<ImageGallery images={images} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', {name: 'Picture 2'})).toBeInTheDocument();
    expect(screen.getByAltText('Picture 1')).toHaveAttribute('src', '/t-1.jpg');
  });
  it('opens a labelled lightbox with the full image and caption', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} />);
    await user.click(screen.getByRole('button', {name: 'Picture 2'}));
    const dialog = await screen.findByRole('dialog', {name: 'Image 2 of 3'});
    expect(dialog.querySelector('img')).toHaveAttribute('src', '/img-2.jpg');
    expect(screen.getByText('Caption 2')).toBeInTheDocument();
  });
  it('moves with the arrow keys and wraps', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<ImageGallery images={images} onIndexChange={onIndexChange} />);
    await user.click(screen.getByRole('button', {name: 'Picture 3'}));
    await screen.findByRole('dialog', {name: 'Image 3 of 3'});
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('dialog', {name: 'Image 1 of 3'})).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByRole('dialog', {name: 'Image 3 of 3'})).toBeInTheDocument();
    expect(onIndexChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole('status')).toHaveTextContent('Picture 3, 3 of 3');
  });
  it('moves with the Previous and Next buttons', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} />);
    await user.click(screen.getByRole('button', {name: 'Picture 1'}));
    await user.click(await screen.findByRole('button', {name: 'Next'}));
    expect(screen.getByRole('dialog', {name: 'Image 2 of 3'})).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Previous'}));
    expect(screen.getByRole('dialog', {name: 'Image 1 of 3'})).toBeInTheDocument();
  });
  it('closes with Escape and returns focus to the thumbnail', async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} />);
    const thumb = screen.getByRole('button', {name: 'Picture 2'});
    await user.click(thumb);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(thumb).toHaveFocus();
  });
  it('preloads the neighbouring images', async () => {
    const user = userEvent.setup();
    const srcs: string[] = [];
    const RealImage = globalThis.Image;
    globalThis.Image = class extends RealImage { constructor() { super(); Object.defineProperty(this, 'src', {set: (v: string) => { srcs.push(v); }}); } } as typeof Image;
    render(<ImageGallery images={images} />);
    await user.click(screen.getByRole('button', {name: 'Picture 1'}));
    await screen.findByRole('dialog');
    globalThis.Image = RealImage;
    expect(srcs.sort()).toEqual(['/img-2.jpg', '/img-3.jpg']);
  });
  it('sets the column count and forwards the ref', () => {
    const ref = {current: null as HTMLUListElement | null};
    render(<ImageGallery ref={ref} images={images} columns={4} />);
    expect(ref.current?.style.getPropertyValue('--gallery-columns')).toBe('4');
  });
  it('has no axe violations closed and open', async () => {
    const user = userEvent.setup();
    const {container} = render(<ImageGallery images={images} />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole('button', {name: 'Picture 1'}));
    await screen.findByRole('dialog');
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
