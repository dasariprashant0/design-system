import type {Demo} from '../../demo';
import {useMediaQuery} from './use-media-query';

function WidthDemo() {
  const wide = useMediaQuery('(min-width: 40rem)');
  return <p>{wide ? 'Viewport is 40rem or wider.' : 'Viewport is narrower than 40rem.'}</p>;
}

export const demos: Demo[] = [{title: 'Viewport width', description: 'Resize the window to see it change.', render: () => <WidthDemo />}];
