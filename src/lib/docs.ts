/**
 * Sidebar and prev/next model for the two long-form collections. Sections appear in the order
 * listed here; pages sort by `order` inside a section. An `index` entry is the collection's
 * landing page (/docs or /guides).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { FOLDER, groupsOf, hrefOf, type PagedKind } from '@/lib/api';

export type Kind = 'docs' | 'guides';
export type Entry = CollectionEntry<'docs'> | CollectionEntry<'guides'>;

export const BASE: Record<Kind, string> = { docs: '/docs', guides: '/guides' };
export const LABEL: Record<Kind, string> = { docs: 'Developer docs', guides: 'Guides' };
const SECTIONS: Record<Kind, string[]> = {
  docs: ['Start', 'API', 'Transports', 'Recipes'],
  guides: [
    'Start',
    'Make something',
    'Captions and voices',
    'Picture',
    'Timeline',
    'Know-how',
    'Reference',
  ],
};

export interface NavItem {
  id: string;
  title: string;
  href: string;
  /** Set out in code type: an API name rather than a page title. */
  code?: boolean;
  /** The pages under this one, in groups that fold: the API reference's methods, commands, types. */
  children?: NavGroup[];
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
        .map((e): NavItem => ({
          id: e.id,
          title: e.data.title,
          href: hrefFor(kind, e.id),
          children: kind === 'docs' ? referenceUnder(e.id) : undefined,
        })),
    }))
    .filter((g) => g.items.length > 0);
  const flat = groups.flatMap((g) =>
    g.items.flatMap((item) => [item, ...(item.children ?? []).flatMap((c) => c.items)]),
  );
  return { groups, flat };
}

/** The reference pages under an index page (api/methods, api/edits, api/types), by group. */
function referenceUnder(id: string): NavGroup[] | undefined {
  const kind = (Object.keys(FOLDER) as PagedKind[]).find((k) => id === `api/${FOLDER[k]}`);
  if (!kind) return undefined;
  return groupsOf(kind).map((group) => ({
    title: group.title,
    items: group.names.map((name) => ({
      id: `${id}/${name}`,
      title: name,
      href: hrefOf(kind, name),
      code: true,
    })),
  }));
}

/** Minutes to read a page at 220 words a minute, counting prose only (no imports or tags). */
export function readingMinutes(body = ''): number {
  const text = body
    .replace(/^import .*$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_|`[\]()-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/**
 * Guides to read next: the rest of the same section, nearest first, then the guides after it in
 * index order, so every page ends on a short list that is never empty.
 */
export async function relatedGuides(
  entry: CollectionEntry<'guides'>,
  count = 3,
): Promise<CollectionEntry<'guides'>[]> {
  const entries = await getCollection('guides');
  const byId = new Map(entries.map((e) => [e.id, e]));
  const { flat } = await getNav('guides');
  const ordered = flat.map((item) => byId.get(item.id)!).filter((e) => e && e.id !== entry.id);
  const sameSection = ordered
    .filter((e) => e.data.section === entry.data.section)
    .sort(
      (a, b) =>
        Math.abs(a.data.order - entry.data.order) - Math.abs(b.data.order - entry.data.order),
    );
  const at = flat.findIndex((item) => item.id === entry.id);
  const after = [...flat.slice(at + 1), ...flat.slice(0, Math.max(at, 0))]
    .map((item) => byId.get(item.id)!)
    .filter((e) => e && e.id !== entry.id);
  const picked: CollectionEntry<'guides'>[] = [];
  for (const e of [...sameSection, ...after]) {
    if (!picked.includes(e)) picked.push(e);
    if (picked.length === count) break;
  }
  return picked;
}
