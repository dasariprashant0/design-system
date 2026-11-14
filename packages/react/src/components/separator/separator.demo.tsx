import type {Demo} from '../../demo';
import {Separator} from './separator';

export const demos: Demo[] = [
  {
    title: 'Horizontal and vertical',
    render: () => (
      <div>
        <p>Above</p>
        <Separator />
        <p>Below</p>
        <div style={{display: 'flex', alignItems: 'center', height: 24}}>
          <span>One</span>
          <Separator orientation="vertical" />
          <span>Two</span>
        </div>
      </div>
    ),
  },
];
