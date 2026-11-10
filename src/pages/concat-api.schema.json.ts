/**
 * The API contract, served where its `$id` says it lives, so an editor or a code generator can
 * fetch it: https://concat.standalones.org/concat-api.schema.json. The same file the /docs
 * reference is read from.
 */
import type { APIRoute } from 'astro';
import schema from '@/data/concat-api.schema.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(schema, null, 2), {
    headers: { 'Content-Type': 'application/schema+json; charset=utf-8' },
  });
