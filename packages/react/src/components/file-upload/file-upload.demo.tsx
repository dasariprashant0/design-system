import type {Demo} from '../../demo';
import {FileUpload} from './file-upload';

export const demos: Demo[] = [
  {title: 'Multiple files', render: () => <div style={{maxWidth: '420px'}}><FileUpload multiple accept="image/*,.pdf" label="Drop files here or choose" /></div>},
];
