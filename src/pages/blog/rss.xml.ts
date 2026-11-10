/**
 * The blog's feed, RSS 2.0, written by hand: a title, a link, a date and the description of
 * every post, newest first. No feed library for a list this short.
 */
import type { APIRoute } from 'astro';
import { postHref, posts } from '@/lib/blog';

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://concat.standalones.org');
  const items = (await posts())
    .map((post) => {
      const url = new URL(`${postHref(post)}/`, base).toString();
      return [
        '    <item>',
        `      <title>${escape(post.data.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${post.data.date.toUTCString()}</pubDate>`,
        `      <description>${escape(post.data.description)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>Concat blog</title>',
    `    <link>${new URL('/blog/', base)}</link>`,
    `    <atom:link href="${new URL('/blog/rss.xml', base)}" rel="self" type="application/rss+xml" />`,
    '    <description>What changed in Concat, why, and what it means when you edit.</description>',
    '    <language>en</language>',
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
