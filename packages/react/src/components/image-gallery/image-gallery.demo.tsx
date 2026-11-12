import type {Demo} from '../../demo';
import {ImageGallery, type GalleryImage} from './image-gallery';

// Inline SVGs keep the demo offline and free of third-party hosts.
const tile = (n: number, fill: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${fill}"/><text x="200" y="165" font-family="monospace" font-size="64" text-anchor="middle" fill="#fff">${n}</text></svg>`)}`;
const images: GalleryImage[] = ['#6b4f3a', '#3a5a6b', '#4f6b3a', '#6b3a5a', '#5a3a6b', '#3a6b5a'].map((c, i) => ({src: tile(i + 1, c), alt: `Sample picture ${i + 1}, a flat colour with its number`, caption: `Picture ${i + 1}`}));

export const demos: Demo[] = [
  {title: 'Grid and lightbox', description: 'Open a picture, then use the arrow keys, the buttons or a swipe. Escape closes.', render: () => <div style={{maxWidth: '480px'}}><ImageGallery images={images} /></div>},
];
