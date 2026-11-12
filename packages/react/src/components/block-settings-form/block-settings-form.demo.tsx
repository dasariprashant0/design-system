import type {Demo} from '../../demo';
import {BlockSettingsForm} from './block-settings-form';

export const demos: Demo[] = [
  {title: 'Account settings', render: () => (
    <BlockSettingsForm
      title="Settings"
      description="Changes apply to your account."
      sections={[
        {legend: 'Notifications', description: 'Choose what we email you.', items: [
          {kind: 'switch', name: 'product', label: 'Product updates', hint: 'About once a month.', defaultChecked: true},
          {kind: 'switch', name: 'digest', label: 'Weekly digest'},
        ]},
        {legend: 'Display', items: [
          {kind: 'select', name: 'theme', label: 'Theme', options: [{value: 'warm', label: 'Warm'}, {value: 'dark', label: 'Dark'}, {value: 'midnight', label: 'Midnight'}], defaultValue: 'warm'},
          {kind: 'select', name: 'density', label: 'Density', hint: 'Compact fits more rows.', options: [{value: 'comfortable', label: 'Comfortable'}, {value: 'compact', label: 'Compact'}]},
        ]},
      ]}
    />
  )},
];
