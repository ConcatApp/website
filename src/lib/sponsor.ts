/**
 * What sponsoring Concat includes, shown in the Sponsor section. Sponsorship is monthly and the price
 * is agreed over a message, so the page shows no amount and the button links to the Contact section
 * rather than a payment page. The earlier $100 Public sponsor tier and the Payoneer payment links are
 * in git history (commit e7da0d9 for the links).
 */
import type { ImageMetadata } from 'astro';
import proxyon from '@/assets/sponsors/proxyon.png';

export interface Sponsor {
  name: string;
  description: string;
  href: string;
  logo: ImageMetadata;
  /** A line under the description, e.g. a discount code the sponsor offers. */
  note?: string;
}

/** Current paid sponsors, as the app README lists them. Keep the two in step. */
export const SPONSORS: Sponsor[] = [
  {
    name: 'Proxyon',
    description: 'Pay-as-you-go proxies for developers',
    href: 'https://proxyon.io/?ref=concat',
    logo: proxyon,
    note: 'Use code JUB0T for 20% off',
  },
];

export const SPONSOR_BENEFITS: string[] = [
  'Your name, description, logo and a link on the Concat repository README.',
  'The same place on the Concat website landing page.',
  'Custom integration planning.',
];
