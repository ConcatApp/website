#!/usr/bin/env node
// Refreshes src/data/concat-api.schema.json, the API contract the /docs reference is read from,
// from what the app prints with `concat --schema`. The binary is $CONCAT_BIN, or a build in the
// app repo beside this one (../timeline, or $CONCAT_REPO). After a sync, `npm run api:check`
// names every method, command or type the pages do not cover yet.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const repo = process.env.CONCAT_REPO ?? join(root, '../timeline');
const exe = process.platform === 'win32' ? 'concat.exe' : 'concat';
const candidates = [
  process.env.CONCAT_BIN,
  ...['release', 'quick', 'debug'].map((profile) => join(repo, 'src/target', profile, exe)),
].filter(Boolean);
const bin = candidates.find((path) => existsSync(path));
if (!bin) {
  console.error(
    `No concat binary found. Build the app (cargo build --profile quick -p concat in ${repo}/src) or set CONCAT_BIN.`,
  );
  process.exit(1);
}

const text = execFileSync(bin, ['--schema'], { encoding: 'utf8', maxBuffer: 64 << 20 });
const schema = JSON.parse(text);
writeFileSync(
  join(root, 'src/data/concat-api.schema.json'),
  `${JSON.stringify(schema, null, 2)}\n`,
);
console.log(
  `Synced the API schema from ${bin}: Concat ${schema.concat}, API ${schema.apiVersion}.`,
);
