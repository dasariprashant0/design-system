import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe} from '../../test/axe';
import {BlockPricing, type PricingTier} from './block-pricing';

const tiers: PricingTier[] = [
  {name: 'Free', price: {monthly: '$0', yearly: '$0'}, features: ['One project'], ctaLabel: 'Start free', href: '/start'},
  {name: 'Pro', description: 'For teams.', price: {monthly: '$12', yearly: '$120'}, features: ['Unlimited projects', 'Priority support'], ctaLabel: 'Choose Pro', highlighted: true},
];

describe('BlockPricing', () => {
  it('renders the title, a heading per tier and the features', () => {
    render(<BlockPricing title="Pricing" tiers={tiers} />);
    expect(screen.getByRole('heading', {level: 2, name: 'Pricing'})).toBeInTheDocument();
    expect(screen.getAllByRole('heading', {level: 3}).map((h) => h.textContent)).toEqual(['Free', 'Pro']);
    expect(screen.getByText('Priority support')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });
  it('shows monthly prices first and switches to yearly', async () => {
    render(<BlockPricing title="Pricing" tiers={tiers} />);
    expect(screen.getByText('$12')).toBeInTheDocument();
    const group = screen.getByRole('radiogroup', {name: 'Billing period'});
    await userEvent.click(within(group).getByRole('radio', {name: 'Yearly'}));
    expect(screen.getByText('$120')).toBeInTheDocument();
    expect(screen.queryByText('$12')).toBeNull();
  });
  it('can start on yearly', () => {
    render(<BlockPricing title="Pricing" tiers={tiers} defaultInterval="yearly" />);
    expect(screen.getByText('$120')).toBeInTheDocument();
  });
  it('renders a link for a tier with href and a button otherwise that reports the choice', async () => {
    const onSelect = vi.fn();
    render(<BlockPricing title="Pricing" tiers={tiers} onSelect={onSelect} />);
    expect(screen.getByRole('link', {name: 'Start free'})).toHaveAttribute('href', '/start');
    await userEvent.click(screen.getByRole('button', {name: 'Choose Pro'}));
    expect(onSelect).toHaveBeenCalledWith(tiers[1], 'monthly');
  });
  it('forwards ref', () => {
    const ref = {current: null as HTMLElement | null};
    render(<BlockPricing ref={ref} title="Pricing" tiers={tiers} />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
  it('has no axe violations', async () => {
    const {container} = render(<BlockPricing title="Pricing" description="Pick a plan." tiers={tiers} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
