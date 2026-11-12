import type {Demo} from '../../demo';
import {BlockTestimonials} from './block-testimonials';

export const demos: Demo[] = [
  {title: 'Three quotes', render: () => (
    <BlockTestimonials
      title="What people say"
      items={[
        {quote: 'It stayed out of the way and the pages got simpler.', name: 'Ada Example', role: 'Engineer, Example Co'},
        {quote: 'Keyboard support worked on day one.', name: 'Sam Sample', role: 'Designer, Sample Studio'},
        {quote: 'We deleted a lot of CSS.', name: 'Robin Placeholder', role: 'Founder, Placeholder'},
      ]}
    />
  )},
];
