/**
 * Sponsorship tiers shown in the Sponsor section. Sponsoring starts with a message, so every tier
 * links to the Contact section rather than a payment page. The earlier Payoneer payment links are
 * in git history (commit e7da0d9) if direct payment ever comes back.
 */
export interface SponsorTier {
  /** Amount in US dollars. */
  amount: number;
  recommended?: boolean;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  { amount: 25, recommended: true },
  { amount: 100 },
  { amount: 250 },
];
