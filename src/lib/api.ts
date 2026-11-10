/**
 * The API reference's single source: `src/data/concat-api.schema.json`, the contract the app
 * prints with `concat --schema` (synced by `npm run api:sync`). Every parameter, field, type,
 * event and error code on /docs is read from it, so the pages cannot drift from the app; the
 * prose around them (what a method is for, examples, caveats) is written by hand in the MDX.
 * scripts/check-api-docs.mjs fails the build when a page leaves something in the schema out, or
 * names something the schema does not have.
 */
import schema from '@/data/concat-api.schema.json';
import groupFile from '@/data/api-groups.json';

type Json = Record<string, any>;

const defs: Record<string, Json> = (schema as Json).$defs;

/** The app release the schema was printed by, and the API version it speaks. */
export const API_VERSION: string = (schema as Json).apiVersion;
export const APP_VERSION: string = (schema as Json).concat;

/** A schema definition that is a family of variants, documented on its own page, not as a type. */
const FAMILIES = new Set(['Request', 'Command', 'Event', 'ErrorCode']);

export interface Field {
  name: string;
  type: TypeRef;
  required: boolean;
  /** The default as JSON, when the schema states one that says something. */
  fallback?: string;
  description: string;
}

/** A type as the reader sees it: plain words, with links to the types it names. */
export type TypeRef =
  | { kind: 'plain'; text: string }
  | { kind: 'ref'; name: string }
  | { kind: 'array'; of: TypeRef }
  | { kind: 'map'; of: TypeRef }
  | { kind: 'literals'; values: string[] }
  | { kind: 'union'; of: TypeRef[] };

function refName(ref: string): string {
  return ref.replace('#/$defs/', '');
}

function isNull(s: Json): boolean {
  return (
    s.type === 'null' || (Array.isArray(s.type) && s.type.length === 1 && s.type[0] === 'null')
  );
}

/** Whether a schema admits null, which on the wire means "may be left out". */
function nullable(s: Json): boolean {
  if (Array.isArray(s.type) && s.type.includes('null')) return true;
  const alts = s.anyOf ?? s.oneOf;
  return Array.isArray(alts) && alts.some(isNull);
}

export function typeOf(s: Json): TypeRef {
  if (s.$ref) return { kind: 'ref', name: refName(s.$ref) };
  if (s.const !== undefined) return { kind: 'literals', values: [JSON.stringify(s.const)] };
  if (Array.isArray(s.enum))
    return { kind: 'literals', values: s.enum.map((v: unknown) => JSON.stringify(v)) };
  const alts: Json[] | undefined = s.anyOf ?? s.oneOf;
  if (Array.isArray(alts)) {
    const kept = alts.filter((alt) => !isNull(alt));
    if (kept.length === 1) return typeOf(kept[0]);
    if (kept.every((alt) => alt.const !== undefined)) {
      return { kind: 'literals', values: kept.map((alt) => JSON.stringify(alt.const)) };
    }
    return { kind: 'union', of: kept.map(typeOf) };
  }
  const type = Array.isArray(s.type) ? s.type.filter((t: string) => t !== 'null') : [s.type];
  if (type.length > 1)
    return { kind: 'union', of: type.map((t: string) => typeOf({ ...s, type: t })) };
  switch (type[0]) {
    case 'string':
      return { kind: 'plain', text: 'string' };
    case 'boolean':
      return { kind: 'plain', text: 'bool' };
    case 'integer':
      return { kind: 'plain', text: 'integer' };
    case 'number':
      return { kind: 'plain', text: 'number' };
    case 'array': {
      if (Array.isArray(s.prefixItems)) {
        return {
          kind: 'plain',
          text: `[${s.prefixItems.map((p: Json) => show(typeOf(p))).join(', ')}]`,
        };
      }
      return { kind: 'array', of: s.items ? typeOf(s.items) : { kind: 'plain', text: 'any' } };
    }
    case 'object':
      if (s.additionalProperties && typeof s.additionalProperties === 'object') {
        return { kind: 'map', of: typeOf(s.additionalProperties) };
      }
      return { kind: 'plain', text: 'object' };
    default:
      return { kind: 'plain', text: 'any' };
  }
}

/** A type in plain text, for checks and titles. */
export function show(t: TypeRef): string {
  switch (t.kind) {
    case 'plain':
      return t.text;
    case 'ref':
      return t.name;
    case 'array':
      return `${show(t.of)}[]`;
    case 'map':
      return `{ [key]: ${show(t.of)} }`;
    case 'literals':
      return t.values.join(' | ');
    case 'union':
      return t.of.map(show).join(' | ');
  }
}

/** The fields of an object schema, required ones first in schema order, the discriminator left out. */
export function fieldsOf(s: Json, discriminator?: string): Field[] {
  const props: Record<string, Json> = s.properties ?? {};
  const required = new Set<string>(s.required ?? []);
  const fields = Object.entries(props)
    .filter(([name]) => name !== discriminator)
    .map(([name, p]) => {
      const fallback =
        p.default === undefined ||
        p.default === null ||
        (Array.isArray(p.default) && p.default.length === 0)
          ? undefined
          : JSON.stringify(p.default);
      return {
        name,
        type: typeOf(p),
        required: required.has(name) && !nullable(p),
        fallback,
        description: p.description ?? '',
      };
    });
  return [...fields.filter((f) => f.required), ...fields.filter((f) => !f.required)];
}

function variants(family: string, key: string): Map<string, Json> {
  const out = new Map<string, Json>();
  for (const alt of defs[family].oneOf as Json[]) {
    const name = alt.properties?.[key]?.const ?? alt.const;
    if (typeof name === 'string') out.set(name, alt);
  }
  return out;
}

const METHODS = variants('Request', 'method');
const COMMANDS = variants('Command', 'op');
const EVENTS = variants('Event', 'event');
const ERRORS = variants('ErrorCode', '');

export const methodNames = [...METHODS.keys()];
export const commandNames = [...COMMANDS.keys()];
export const eventNames = [...EVENTS.keys()];
export const errorCodes = [...ERRORS.entries()].map(([code, s]) => ({
  code,
  description: s.description ?? '',
}));

/** The types a reader can look up: every definition but the variant families. */
export const typeNames = Object.keys(defs)
  .filter((name) => !FAMILIES.has(name))
  .sort();

export type Kind = 'method' | 'command' | 'event' | 'type';

export interface Entry {
  kind: Kind;
  name: string;
  description: string;
  fields: Field[];
  /** A method's reply. */
  reply?: TypeRef;
  /** A type that is one of a set of values rather than an object. */
  values?: { value: string; description: string }[];
  /** A type that is one of several shapes, told apart by a tag field. */
  shapes?: { tag: string; description: string; fields: Field[] }[];
  /** A type that is neither: an alias of another. */
  alias?: TypeRef;
}

function tagOf(alt: Json): [string, string] | undefined {
  for (const [key, p] of Object.entries<Json>(alt.properties ?? {})) {
    if (p.const !== undefined && typeof p.const === 'string') return [key, p.const];
  }
  return undefined;
}

function typeEntry(name: string): Entry {
  const s = defs[name];
  const base = {
    kind: 'type' as const,
    name,
    description: s.description ?? '',
    fields: [] as Field[],
  };
  const alts: Json[] | undefined = s.oneOf ?? s.anyOf;
  if (s.properties) return { ...base, fields: fieldsOf(s) };
  if (Array.isArray(s.enum)) {
    return {
      ...base,
      values: s.enum.map((v: unknown) => ({ value: JSON.stringify(v), description: '' })),
    };
  }
  if (Array.isArray(alts) && alts.every((alt) => alt.const !== undefined || isNull(alt))) {
    return {
      ...base,
      values: alts
        .filter((alt) => !isNull(alt))
        .map((alt) => ({ value: JSON.stringify(alt.const), description: alt.description ?? '' })),
    };
  }
  if (Array.isArray(alts) && alts.every((alt) => tagOf(alt))) {
    return {
      ...base,
      shapes: alts.map((alt) => {
        const [key, tag] = tagOf(alt)!;
        return {
          tag: `${key}: ${JSON.stringify(tag)}`,
          description: alt.description ?? '',
          fields: fieldsOf(alt, key),
        };
      }),
    };
  }
  return { ...base, alias: typeOf(s) };
}

export function entry(kind: Kind, name: string): Entry {
  switch (kind) {
    case 'method': {
      const s = METHODS.get(name);
      if (!s) throw new Error(`The API has no method ${name}`);
      const reply = (schema as Json).replies[name];
      return {
        kind,
        name,
        description: s.description ?? '',
        fields: fieldsOf(s, 'method'),
        reply: reply ? typeOf(reply) : undefined,
      };
    }
    case 'command': {
      const s = COMMANDS.get(name);
      if (!s) throw new Error(`The API has no edit command ${name}`);
      return { kind, name, description: s.description ?? '', fields: fieldsOf(s, 'op') };
    }
    case 'event': {
      const s = EVENTS.get(name);
      if (!s) throw new Error(`The API has no event ${name}`);
      return { kind, name, description: s.description ?? '', fields: fieldsOf(s, 'event') };
    }
    case 'type':
      if (!defs[name] || FAMILIES.has(name)) throw new Error(`The API has no type ${name}`);
      return typeEntry(name);
  }
}

/** A name as a URL segment: `project.open` is project-open, `addClip` add-clip, `EditorView` editor-view. */
export function slugOf(name: string): string {
  return name
    .replace(/\./g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/** The folder each kind's pages live in, under /docs/api. */
export const FOLDER = { method: 'methods', command: 'edits', type: 'types' } as const;
export type PagedKind = keyof typeof FOLDER;

export function hrefOf(kind: PagedKind, name: string): string {
  return `/docs/api/${FOLDER[kind]}/${slugOf(name)}`;
}

/** Where a type is documented. The variant families have pages of their own. */
export function typeHref(name: string): string {
  if (name === 'Command') return '/docs/api/edits';
  if (name === 'Request') return '/docs/api/methods';
  if (name === 'Event') return '/docs/api/events#events';
  if (name === 'ErrorCode') return '/docs/api/events#errors';
  return hrefOf('type', name);
}

// ── groups: how the index pages and the sidebar arrange each kind ──

export interface Group {
  title: string;
  /** A sentence or two about the group, as written on the index page; markdown inline. */
  lead?: string;
  names: string[];
}

const AREAS: Record<string, string> = {
  version: 'Start',
  project: 'Projects',
  edit: 'Editing',
  media: 'Media',
  catalogue: 'Effects',
  template: 'Templates',
  export: 'Export',
  preview: 'Preview',
};

/**
 * The groups of one kind. Methods group by their area (`project.*`, `export.*`); commands and
 * types by src/data/api-groups.json, the arrangement the reference was written in, with
 * anything the schema has that the file does not place gathered at the end, so a new command is
 * listed the day it is synced.
 */
export function groupsOf(kind: PagedKind): Group[] {
  if (kind === 'method') {
    const groups = new Map<string, string[]>();
    for (const name of methodNames) {
      const area = AREAS[name.split('.')[0]] ?? 'More';
      groups.set(area, [...(groups.get(area) ?? []), name]);
    }
    return [...groups].map(([title, names]) => ({ title, names }));
  }
  const all = kind === 'command' ? commandNames : typeNames;
  const placed: [string, string][] = (groupFile as any)[kind];
  const leads: Record<string, string> = (groupFile as any).leads?.[kind] ?? {};
  const groups = new Map<string, string[]>();
  for (const [group, name] of placed) {
    if (!all.includes(name)) continue;
    groups.set(group, [...(groups.get(group) ?? []), name]);
  }
  const rest = all.filter((name) => !placed.some(([, placedName]) => placedName === name));
  if (rest.length) groups.set(kind === 'command' ? 'More commands' : 'More types', rest);
  return [...groups].map(([title, names]) => ({ title, names, lead: leads[title] || undefined }));
}

/** Every page of one kind, in the order the sidebar and the previous and next links walk them. */
export function orderOf(kind: PagedKind): string[] {
  return groupsOf(kind).flatMap((group) => group.names);
}

// ── descriptions: rustdoc to the page's words ──

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `snake_case` in a doc comment is the Rust name; the wire's is camelCase. */
function wireName(code: string): string {
  if (!/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(code)) return code;
  return code.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/** `Request::ProjectOpen` is `project.open` to a caller; `Command::AddClip` is `addClip`. */
function rustPath(path: string): string {
  const parts = path
    .split('::')
    .filter((part) => part !== 'crate' && part !== 'self' && part !== 'super');
  const at = parts.findIndex((part) => part === 'Request' || part === 'Command');
  const variant = at >= 0 ? parts[at + 1] : undefined;
  if (variant && parts[at] === 'Request') {
    const words = variant
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(' ');
    const method = `${words[0]}.${words[1] ?? ''}${words
      .slice(2)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join('')}`;
    if (METHODS.has(method)) return method;
  }
  if (variant && parts[at] === 'Command') {
    const op = variant[0].toLowerCase() + variant.slice(1);
    if (COMMANDS.has(op)) return op;
  }
  // `ClipKind::Transition` is a value of ClipKind: the enum is what a reader can look up.
  const last = parts[parts.length - 1];
  const owner = parts[parts.length - 2];
  if (owner && defs[owner] && !FAMILIES.has(owner)) return owner;
  return last;
}

/** One paragraph of a doc comment as HTML: code, emphasis and links, nothing else. */
function inline(text: string): string {
  // Rustdoc's intra-doc links lose their brackets; their target is named in the reader's terms.
  const plain = text.replace(
    /\[`([^`\]]+)`\](?!\()/g,
    (_, path: string) => `\`${rustPath(path)}\``,
  );
  const parts = plain.split(/(`[^`]+`)/g);
  return parts
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        const code = wireName(part.slice(1, -1));
        const href =
          defs[code] && !FAMILIES.has(code)
            ? typeHref(code)
            : METHODS.has(code)
              ? hrefOf('method', code)
              : COMMANDS.has(code)
                ? hrefOf('command', code)
                : undefined;
        if (href) return `<a href="${href}"><code>${escape(code)}</code></a>`;
        return `<code>${escape(code)}</code>`;
      }
      return escape(part)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[\s(])[*_]([^*_\s][^*_]*?)[*_](?=[\s).,;:]|$)/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
    })
    .join('');
}

/** A doc comment as HTML paragraphs and lists; its line breaks are the source's, not the reader's. */
export function prose(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n');
      if (lines.every((line) => /^\s*[-*] /.test(line) || /^\s{2,}\S/.test(line))) {
        const items: string[] = [];
        for (const line of lines) {
          if (/^\s*[-*] /.test(line)) items.push(line.replace(/^\s*[-*] /, ''));
          else items[items.length - 1] += ` ${line.trim()}`;
        }
        return `<ul>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`;
      }
      return `<p>${inline(lines.map((line) => line.trim()).join(' '))}</p>`;
    })
    .join('');
}

/** The first sentence of a doc comment, for a cheat sheet. */
export function summary(text: string): string {
  const flat = text
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/\s*\n\s*/g, ' ');
  const end = flat.search(/[.:;](\s|$)/);
  return inline(end > 0 ? flat.slice(0, end) : flat);
}

/** The first sentence of a doc comment as plain text, for a meta description. */
export function plainSummary(text: string): string {
  return summary(text)
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

/** A type as HTML: names link to their entry on the Types page. */
export function typeHtml(t: TypeRef): string {
  switch (t.kind) {
    case 'plain':
      return `<span class="api-type-plain">${escape(t.text)}</span>`;
    case 'ref':
      return `<a class="api-type-ref" href="${typeHref(t.name)}">${escape(t.name)}</a>`;
    case 'array':
      return `${typeHtml(t.of)}<span class="api-type-plain">[]</span>`;
    case 'map':
      return `<span class="api-type-plain">map of</span> ${typeHtml(t.of)}`;
    case 'literals':
      return t.values
        .map((v) => `<code>${escape(v)}</code>`)
        .join('<span class="api-type-or"> | </span>');
    case 'union':
      return t.of.map(typeHtml).join('<span class="api-type-or"> or </span>');
  }
}
