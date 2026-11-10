/**
 * The blog's posts, newest first, and how a post's date is written. Shared by the index, each
 * post's "More from the blog", the feed and the HTML sitemap.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

export async function posts(): Promise<Post[]> {
  const entries = await getCollection('blog');
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postHref(post: Post): string {
  return `/blog/${post.id}`;
}

/** "10 November 2026": the day, the month in words, the year. */
export function postDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
