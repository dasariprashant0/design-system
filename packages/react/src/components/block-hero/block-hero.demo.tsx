import type {Demo} from '../../demo';
import {BlockHero} from './block-hero';
import {Button} from '../button';

export const demos: Demo[] = [
  {title: 'Left aligned', render: () => (
    <BlockHero
      eyebrow="Version 1.0"
      title="Interfaces with fewer parts"
      description="A small kit of plain components. Copy the ones you need."
      actions={<><Button variant="solid">Get started</Button><Button>Read the docs</Button></>}
      media={<div style={{border: '1px solid var(--rule)', aspectRatio: '4 / 3', display: 'grid', placeItems: 'center'}}>Preview</div>}
    />
  )},
  {title: 'Centred', render: () => (
    <BlockHero align="center" title="One accent, three themes" description="Tokens carry every colour." actions={<Button variant="solid">Try it</Button>} />
  )},
];
