import type {Demo} from '../../demo';
import {NumberTicker} from './number-ticker';

export const demos: Demo[] = [
  {title: 'Count up', description: 'Starts when it scrolls into view.', render: () => <p style={{fontFamily: 'var(--font-display)', fontSize: 'var(--display-sm)'}}><NumberTicker value={12840} /></p>},
  {title: 'Decimals and units', render: () => <p style={{fontFamily: 'var(--font-display)', fontSize: 'var(--display-sm)'}}><NumberTicker value={99.95} decimals={2} format={(n) => `${n.toFixed(2)}%`} /></p>},
];
