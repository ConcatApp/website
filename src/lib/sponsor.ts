/**
 * Sponsorship tiers shown in the Sponsor section. Every tier is monthly, and the perks last for the
 * months sponsored. Sponsoring starts with a message, so every tier links to the Contact section
 * rather than a payment page. The earlier Payoneer payment links are in git history (commit
 * e7da0d9) if direct payment ever comes back.
 */
export interface SponsorTier {
  name: string;
  /** Amount in US dollars per month, or a word such as "Custom" for a tier priced in conversation. */
  price: number | string;
  /** What the tier includes, one short line each. */
  benefits: string[];
  recommended?: boolean;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    name: 'Public sponsor',
    price: 100,
    benefits: ['One month in one of the public sponsor slots on the Concat repository.'],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    benefits: ['Everything in Public sponsor.', 'Custom integration planning.'],
  },
];

export function formatPrice(price: SponsorTier['price']): string {
  return typeof price === 'number' ? `$${price}` : price;
}
