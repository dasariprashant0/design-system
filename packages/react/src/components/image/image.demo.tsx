import type {Demo} from '../../demo';
import {Image} from './image';

const svg = (c: string) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="${c}"/></svg>`);

export const demos: Demo[] = [
  {
    title: 'Ratio',
    render: () => (
      <div style={{maxWidth: '320px'}}>
        <Image src={svg('#999')} alt="A grey placeholder" ratio={16 / 9} />
      </div>
    ),
  },
  {
    title: 'Fallback',
    description: 'A broken source shows the alt text.',
    render: () => (
      <div style={{maxWidth: '320px'}}>
        <Image src="/missing.png" alt="Quarterly revenue chart" ratio={16 / 9} />
      </div>
    ),
  },
];
