import type {Demo} from '../../demo';
import {BlockFooter} from './block-footer';

export const demos: Demo[] = [
  {title: 'Three columns', render: () => (
    <BlockFooter
      brand="Your brand"
      description="Short line about what you make."
      columns={[
        {title: 'Product', links: [{label: 'Components', href: '#'}, {label: 'Blocks', href: '#'}, {label: 'Changelog', href: '#'}]},
        {title: 'Resources', links: [{label: 'Docs', href: '#'}, {label: 'Source', href: '#'}]},
        {title: 'Company', links: [{label: 'About', href: '#'}, {label: 'Contact', href: '#'}]},
      ]}
      legal="© 2026 Your brand. All rights reserved."
    />
  )},
];
