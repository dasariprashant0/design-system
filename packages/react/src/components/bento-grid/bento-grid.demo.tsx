import type {Demo} from '../../demo';
import {BentoCard, BentoGrid} from './bento-grid';

const tile = (title: string, text: string) => (<><h3 style={{margin: 0, fontWeight: 500}}>{title}</h3><p style={{margin: 'var(--s2) 0 0', color: 'var(--muted)'}}>{text}</p></>);

export const demos: Demo[] = [
  {title: 'Features', description: 'Wide and tall tiles collapse to one column on phones.', render: () => (
    <BentoGrid>
      <BentoCard colSpan={2} rowSpan={2}>{tile('Tokens first', 'Every colour, space and rule comes from one small set of tokens.')}</BentoCard>
      <BentoCard>{tile('Three themes', 'Warm, dark and midnight.')}</BentoCard>
      <BentoCard>{tile('Four accents', 'One accent at a time.')}</BentoCard>
      <BentoCard colSpan={3}>{tile('Plain CSS core', 'Use the stylesheets alone, or the React layer on top.')}</BentoCard>
    </BentoGrid>
  )},
];
