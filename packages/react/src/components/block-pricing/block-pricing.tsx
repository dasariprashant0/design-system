'use client';
import {forwardRef, useId, useState, type HTMLAttributes, type ReactNode} from 'react';
import {cx} from '../../utils/cx';
import {Badge} from '../badge';
import {Button} from '../button';
import {Container} from '../container';
import {Heading} from '../heading';
import {SegmentedControl} from '../segmented-control';
import {Text} from '../text';

export type PricingInterval = 'monthly' | 'yearly';

export interface PricingTier {
  name: ReactNode;
  description?: ReactNode;
  /** Shown as written, so include the currency: "$12", "Free", "Talk to us". */
  price: {monthly: ReactNode; yearly: ReactNode};
  features: ReactNode[];
  ctaLabel: ReactNode;
  /** Makes the call to action a link. Without it, it is a button; handle it with `onSelect`. */
  href?: string;
  /** Marks the tier to pick. Adds a badge with `highlightLabel`. */
  highlighted?: boolean;
}

export interface BlockPricingProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onSelect'> {
  title: ReactNode;
  description?: ReactNode;
  tiers: PricingTier[];
  /** Start on yearly billing. */
  defaultInterval?: PricingInterval;
  labels?: Partial<{monthly: string; yearly: string; switcher: string; period: Record<PricingInterval, string>; highlight: string}>;
  /** Called when a tier's button (one without `href`) is pressed. */
  onSelect?: (tier: PricingTier, interval: PricingInterval) => void;
  headingLevel?: 1 | 2 | 3 | 4 | 5;
}

/** Plan cards with a monthly or yearly switch. Prices are copy you pass in; the block does no maths. */
export const BlockPricing = forwardRef<HTMLElement, BlockPricingProps>(function BlockPricing({title, description, tiers, defaultInterval = 'monthly', labels, onSelect, headingLevel = 2, className, ...rest}, ref) {
  const id = useId();
  const [interval, setInterval] = useState<PricingInterval>(defaultInterval);
  const l = {monthly: 'Monthly', yearly: 'Yearly', switcher: 'Billing period', highlight: 'Popular', period: {monthly: '/ month', yearly: '/ year'}, ...labels};
  const sub = Math.min(headingLevel + 1, 6) as 2 | 3 | 4 | 5 | 6;
  return (
    <section ref={ref} className={cx('block-pricing', className)} aria-labelledby={id} {...rest}>
      <Container>
        <div className="block-pricing-head">
          <Heading id={id} level={headingLevel}>{title}</Heading>
          {description && <Text tone="muted">{description}</Text>}
          <SegmentedControl
            aria-label={l.switcher}
            value={interval}
            onValueChange={(v) => setInterval(v as PricingInterval)}
            options={[{value: 'monthly', label: l.monthly}, {value: 'yearly', label: l.yearly}]}
          />
        </div>
        <ul className="block-pricing-tiers" role="list">
          {tiers.map((tier, i) => (
            <li key={i} className="block-tier" data-highlighted={tier.highlighted || undefined}>
              <div className="block-tier-head">
                <Heading level={sub} size="md">{tier.name}</Heading>
                {tier.highlighted && <Badge variant="accent">{l.highlight}</Badge>}
              </div>
              {tier.description && <Text size="sm" tone="muted">{tier.description}</Text>}
              <p className="block-tier-price">
                <span className="block-tier-amount">{tier.price[interval]}</span>
                <span className="block-tier-period">{l.period[interval]}</span>
              </p>
              <ul className="block-tier-features" role="list">
                {tier.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              {tier.href
                ? <Button asChild variant={tier.highlighted ? 'solid' : 'line'}><a href={tier.href}>{tier.ctaLabel}</a></Button>
                : <Button variant={tier.highlighted ? 'solid' : 'line'} onClick={() => onSelect?.(tier, interval)}>{tier.ctaLabel}</Button>}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
});
