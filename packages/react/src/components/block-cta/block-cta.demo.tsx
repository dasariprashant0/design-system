import type {Demo} from '../../demo';
import {BlockCta} from './block-cta';
import {Button} from '../button';

export const demos: Demo[] = [
  {title: 'Default', render: () => (
    <BlockCta title="Start building today" description="Install the package and copy your first component." actions={<><Button variant="solid">Get started</Button><Button>Read the docs</Button></>} />
  )},
];
