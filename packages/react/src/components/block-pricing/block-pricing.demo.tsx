import type {Demo} from '../../demo';
import {BlockPricing} from './block-pricing';

export const demos: Demo[] = [
  {title: 'Three plans', render: () => (
    <BlockPricing
      title="Simple pricing"
      description="Switch to yearly for two months free."
      tiers={[
        {name: 'Free', description: 'For trying it out.', price: {monthly: '$0', yearly: '$0'}, features: ['One project', 'Community support'], ctaLabel: 'Start free', href: '#'},
        {name: 'Team', description: 'For small teams.', price: {monthly: '$12', yearly: '$120'}, features: ['Unlimited projects', 'Email support', 'Shared themes'], ctaLabel: 'Choose Team', highlighted: true},
        {name: 'Scale', description: 'For larger groups.', price: {monthly: '$48', yearly: '$480'}, features: ['Everything in Team', 'Single sign-on', 'Priority support'], ctaLabel: 'Talk to us', href: '#'},
      ]}
    />
  )},
];
