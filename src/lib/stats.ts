/**
 * Numbers for the stats row: GitHub stars and the download total across every release. Fetched at
 * build time from the GitHub API and falling back to the committed snapshot in src/data when the
 * network or the rate limit gets in the way. Set GITHUB_TOKEN in the build environment to avoid the
 * 60 requests an hour unauthenticated limit on shared build machines.
 */
import fallback from '@/data/github-stats.json';

export interface GitHubStats {
  stars: number;
  downloads: number;
  fetchedAt: string;
}

const API = 'https://api.github.com/repos/jub0t/Concat';

interface Release {
  assets?: Array<{ download_count?: number }>;
}

export async function getStats(): Promise<{ stats: GitHubStats; live: boolean }> {
  try {
    const headers: Record<string, string> = {
      accept: 'application/vnd.github+json',
      'user-agent': 'concat-website-build',
    };
    // Read from the build machine's environment without pulling in Node type definitions.
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
      ?.env;
    const token = env?.GITHUB_TOKEN;
    if (token) headers.authorization = `Bearer ${token}`;
    const init = { headers, signal: AbortSignal.timeout(8000) };

    const [repoRes, releasesRes] = await Promise.all([
      fetch(API, init),
      fetch(`${API}/releases?per_page=100`, init),
    ]);
    if (repoRes.ok && releasesRes.ok) {
      const repo = (await repoRes.json()) as { stargazers_count?: number };
      const releases = (await releasesRes.json()) as Release[];
      const downloads = releases.reduce(
        (sum, r) => sum + (r.assets ?? []).reduce((n, a) => n + (a.download_count ?? 0), 0),
        0,
      );
      if (typeof repo.stargazers_count === 'number' && downloads > 0) {
        return {
          stats: { stars: repo.stargazers_count, downloads, fetchedAt: new Date().toISOString() },
          live: true,
        };
      }
    }
  } catch {
    // offline, rate limited, or a GitHub hiccup: use the snapshot
  }
  return { stats: fallback, live: false };
}

/** 23157 -> "23K+", 3813 -> "3.8K", 640 -> "640". */
export function formatCount(n: number, { plus = false }: { plus?: boolean } = {}): string {
  const suffix = plus ? '+' : '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M${suffix}`;
  if (n >= 10_000) return `${Math.floor(n / 1000)}K${suffix}`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K${suffix}`;
  return `${n}${suffix}`;
}
