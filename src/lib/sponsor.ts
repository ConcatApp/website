/**
 * Sponsorship tiers shown in the Sponsor section. Each tier links to a Payoneer payment request
 * for that amount. A tier without `href` renders as "Coming soon" until its link exists.
 */
export interface SponsorTier {
  /** Amount in US dollars. */
  amount: number;
  /** Payment link. Missing while the tier is not set up yet. */
  href?: string;
  recommended?: boolean;
}

export const SPONSOR_TIERS: SponsorTier[] = [
  {
    amount: 25,
    href: 'https://link.payoneer.com/Token?t=50C5F337968A48CD86C56AC4209EA1BA&src=pl',
    recommended: true,
  },
  {
    amount: 100,
    href: 'https://link.payoneer.com/Token?t=64406F4366C14380840FD06E0CB826DD&src=dpl',
  },
  {
    amount: 250,
    href: 'https://link.payoneer.com/Token?t=81CF9CFC7BB7429EBC1696289BD7AEDF&src=pl',
  },
];
