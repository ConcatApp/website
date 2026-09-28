/**
 * Sidebar and prev/next model for the two long-form collections. Sections appear in the order
 * listed here; pages sort by `order` inside a section. An `index` entry is the collection's
 * landing page (/docs or /guides).
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Kind = 'docs' | 'guides';
export type Entry = CollectionEntry<'docs'> | CollectionEntry<'guides'>;

export const BASE: Record<Kind, string> = { docs: '/docs', guides: '/guides' };
export const LABEL: Record<Kind, string> = { docs: 'Developer docs', guides: 'Guides' };
const SECTIONS: Record<Kind, string[]> = {
  docs: ['Start', 'API', 'Transports', 'Recipes'],
  guides: ['Guides'],
};

export interface NavItem {
  id: string;
  title: string;
  href: string;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export function hrefFor(kind: Kind, id: string): string {
  return id === 'index' ? BASE[kind] : `${BASE[kind]}/${id}`;
}

export async function getNav(kind: Kind): Promise<{ groups: NavGroup[]; flat: NavItem[] }> {
  const entries: Entry[] =
    kind === 'docs' ? await getCollection('docs') : await getCollection('guides');
  const sections = SECTIONS[kind];
  const rank = (e: Entry) => {
    const i = sections.indexOf(e.data.section);
    return i === -1 ? sections.length : i;
  };
  const sorted = [...entries].sort(
    (a, b) =>
      rank(a) - rank(b) || a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
  const titles = [...sections, ...sorted.map((e) => e.data.section)].filter(
    (t, i, arr) => arr.indexOf(t) === i,
  );
  const groups = titles
    .map((title) => ({
      title,
      items: sorted
        .filter((e) => e.data.section === title)
        .map((e) => ({ id: e.id, title: e.data.title, href: hrefFor(kind, e.id) })),
    }))
    .filter((g) => g.items.length > 0);
  return { groups, flat: groups.flatMap((g) => g.items) };
}
