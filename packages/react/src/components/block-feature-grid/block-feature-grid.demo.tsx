import type {Demo} from '../../demo';
import {BlockFeatureGrid} from './block-feature-grid';

const dot = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="3" y="3" width="14" height="14" /></svg>;
const features = [
  {title: 'Plain CSS', description: 'Works with any framework, or none.', icon: dot},
  {title: 'Accessible', description: 'Keyboard and screen reader behaviour is tested.', icon: dot},
  {title: 'Three themes', description: 'Warm, dark and midnight, one accent.', icon: dot},
  {title: 'Copy and own', description: 'Every component is one small folder.', icon: dot},
  {title: 'Typed', description: 'Props are string unions with sane defaults.', icon: dot},
  {title: 'No runtime styling', description: 'Tokens and classes only.', icon: dot},
];

export const demos: Demo[] = [
  {
    title: 'Three columns',
    render: () => (
      <BlockFeatureGrid
        title="Why Monoline"
        description="Fewer parts, clearer pages."
        features={features}
      />
    ),
  },
  {
    title: 'Two columns',
    render: () => (
      <BlockFeatureGrid title="Principles" columns={2} features={features.slice(0, 4)} />
    ),
  },
];
