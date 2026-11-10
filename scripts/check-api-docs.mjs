#!/usr/bin/env node
// Fails when the API docs and the schema (src/data/concat-api.schema.json) disagree. Every
// method, edit command and type gets its own page from the schema, so what can go wrong is the
// hand-written part:
//   - a src/content/reference/<methods|edits|types>/<name>.mdx for a name the schema lacks (the
//     app renamed or dropped it), or one without exactly one <Api of="..." /> naming itself;
//   - an event the schema has with no <Api of="event:..." /> block on a docs page, or a block for
//     one it lacks.
// Run before every build.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const schema = JSON.parse(readFileSync(join(root, 'src/data/concat-api.schema.json'), 'utf8'));
const defs = schema.$defs;
const FAMILIES = new Set(['Request', 'Command', 'Event', 'ErrorCode']);
const variants = (family, key) =>
  new Set(defs[family].oneOf.map((alt) => alt.properties?.[key]?.const).filter(Boolean));

const names = {
  methods: ['method', variants('Request', 'method')],
  edits: ['command', variants('Command', 'op')],
  types: ['type', new Set(Object.keys(defs).filter((n) => !FAMILIES.has(n)))],
};
const events = variants('Event', 'event');

const files = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : /\.mdx?$/.test(name) ? [path] : [];
  });
const blocks = (text) => [...text.matchAll(/<Api\s+of="([^"]+)"/g)].map((m) => m[1]);
const problems = [];

for (const file of files(join(root, 'src/content/reference'))) {
  const rel = relative(join(root, 'src/content/reference'), file);
  const [folder, base] = rel.split('/');
  const name = base.replace(/\.mdx?$/, '');
  const known = names[folder];
  if (!known) {
    problems.push(`${rel}: not under methods/, edits/ or types/`);
    continue;
  }
  const [kind, set] = known;
  if (!set.has(name)) problems.push(`${rel}: the schema has no ${kind} ${name}`);
  const found = blocks(readFileSync(file, 'utf8'));
  if (found.length !== 1 || found[0] !== `${kind}:${name}`) {
    problems.push(
      `${rel}: needs exactly one <Api of="${kind}:${name}" />, has ${JSON.stringify(found)}`,
    );
  }
}

const seenEvents = new Set();
for (const file of files(join(root, 'src/content/docs'))) {
  for (const of of blocks(readFileSync(file, 'utf8'))) {
    const [kind, name] = of.split(/:(.*)/s);
    if (kind !== 'event') {
      problems.push(`${relative(root, file)}: ${of} has a page of its own; link to it instead`);
    } else if (!events.has(name)) {
      problems.push(`${relative(root, file)}: the schema has no event ${name}`);
    } else {
      seenEvents.add(name);
    }
  }
}
for (const name of events) {
  if (!seenEvents.has(name)) problems.push(`event ${name} has no <Api of="event:${name}" /> block`);
}

// The examples: every ```json block that is a request ("method") or a command ("op") uses only
// fields the schema has, two levels deep, so an example cannot outlive a rename.
const requestOf = new Map(defs.Request.oneOf.map((alt) => [alt.properties.method.const, alt]));
const commandOf = new Map(defs.Command.oneOf.map((alt) => [alt.properties.op.const, alt]));
const resolve = (s) => {
  if (!s) return undefined;
  if (s.$ref) return resolve(defs[s.$ref.replace('#/$defs/', '')]);
  const alts = s.anyOf ?? s.oneOf;
  if (alts) {
    const objects = alts.map(resolve).filter((alt) => alt?.properties);
    return objects.length === 1 ? objects[0] : undefined;
  }
  if (s.type === 'array' || (Array.isArray(s.type) && s.type.includes('array')))
    return resolve(s.items);
  return s.properties ? s : undefined;
};
const checkObject = (value, shape, where, depth) => {
  if (!shape?.properties || !value || typeof value !== 'object') return;
  for (const item of Array.isArray(value) ? value : [value]) {
    if (!item || typeof item !== 'object') continue;
    for (const [key, inner] of Object.entries(item)) {
      const field = shape.properties[key];
      if (!field) {
        if (!shape.additionalProperties) problems.push(`${where}: no field ${key}`);
        continue;
      }
      if (depth > 0) checkObject(inner, resolve(field), `${where}.${key}`, depth - 1);
    }
  }
};
for (const file of [
  ...files(join(root, 'src/content/reference')),
  ...files(join(root, 'src/content/docs')),
]) {
  const rel = relative(root, file);
  for (const [, block] of readFileSync(file, 'utf8').matchAll(/```json\n([\s\S]*?)```/g)) {
    let value;
    try {
      value = JSON.parse(block);
    } catch {
      continue; // a reply sketched with "…" is prose, not a request
    }
    // A JSON-RPC envelope carries the request in `params`, its method beside it.
    if (value.jsonrpc && value.method) value = { method: value.method, ...(value.params ?? {}) };
    const command = value.op ? value : value.command?.op ? value.command : undefined;
    if (value.method && requestOf.has(value.method)) {
      const { command: _, ...rest } = value;
      checkObject(rest, requestOf.get(value.method), `${rel} ${value.method}`, 2);
    }
    if (command) {
      if (!commandOf.has(command.op)) problems.push(`${rel}: no edit command ${command.op}`);
      else checkObject(command, commandOf.get(command.op), `${rel} ${command.op}`, 2);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(
    `The API docs and the schema (Concat ${schema.concat}, API ${schema.apiVersion}) disagree.`,
  );
  process.exit(1);
}
const pages = Object.values(names).reduce((n, [, set]) => n + set.size, 0);
console.log(`API docs agree with the schema: Concat ${schema.concat}, ${pages} reference pages.`);
