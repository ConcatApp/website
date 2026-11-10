/**
 * Structured data (JSON-LD) shared by the long-form pages and the tools: breadcrumbs, and the
 * article description of a guide or a docs page. Absolute URLs come from `site`.
 */
// The sitemap's git lookup: the last commit that touched a page's source. Build time only.
import { lastmodFor } from '@/lib/sitemap.mjs';

export const ORGANIZATION = (site: URL | undefined) => ({
  '@type': 'Organization',
  name: 'Concat',
  url: site?.toString(),
  logo: site ? new URL('/favicon.png', site).toString() : undefined,
});

/** A BreadcrumbList from [name, path] pairs, home first. */
export function breadcrumbs(site: URL | undefined, trail: Array<[string, string]>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: site ? new URL(path, site).toString() : path,
    })),
  };
}

/** When the page at `pathname` last changed, from git; undefined when history is unavailable. */
export function lastModified(pathname: string): string | undefined {
  return lastmodFor(pathname) as string | undefined;
}

export function article(options: {
  site: URL | undefined;
  path: string;
  headline: string;
  description?: string;
  image: string;
  modified?: string;
  /** The day it was first published, for a dated post. */
  published?: string;
  type?: 'Article' | 'TechArticle' | 'HowTo' | 'BlogPosting';
}) {
  const {
    site,
    path,
    headline,
    description,
    image,
    modified,
    published,
    type = 'Article',
  } = options;
  const url = site ? new URL(path, site).toString() : path;
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline,
    description,
    image: site ? new URL(image, site).toString() : image,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    ...(published && { datePublished: published }),
    ...(modified && { dateModified: modified }),
    author: ORGANIZATION(site),
    publisher: ORGANIZATION(site),
  };
}
