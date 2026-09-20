/**
 * Concat ships as binaries on GitHub Releases (no app stores).
 * Every release publishes a manifest.json next to the binaries. It is fetched at build time and
 * falls back to the committed snapshot in src/data when the network is unavailable.
 */
import fallbackManifest from '@/data/release-manifest.json';

export const REPO_URL = 'https://github.com/jub0t/Concat';
export const RELEASES_URL = `${REPO_URL}/releases`;
export const CHECKSUMS_URL = `${REPO_URL}/releases/latest/download/SHA256SUMS`;
export const DISCORD_URL = 'https://discord.gg/DVuPfpXfqP';
const MANIFEST_URL = `${REPO_URL}/releases/latest/download/manifest.json`;

export interface Binary {
  file: string;
  url: string;
  bytes: number;
  sha256: string;
}

export interface Manifest {
  schema: number;
  product: string;
  version: string;
  tag: string;
  binaries: Record<string, Record<string, Record<string, Binary>>>;
}

export type PlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

export interface FormatOption {
  id: string;
  label: string;
  binary: Binary;
}

export interface ArchOption {
  id: string;
  label: string;
  hint?: string;
  formats: FormatOption[];
}

export interface PlatformModel {
  id: PlatformId;
  name: string;
  /** One line under the name on the OS card ("Apple Silicon and Intel"). */
  summary: string;
  /** Label above the architecture choice ("Processor", "Chip", ...). */
  archPrompt: string;
  note?: string;
  command?: string;
  arches: ArchOption[];
}

export async function getManifest(): Promise<{ manifest: Manifest; live: boolean }> {
  try {
    const res = await fetch(MANIFEST_URL, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = (await res.json()) as Manifest;
      if (json?.binaries && json?.version) return { manifest: json, live: true };
    }
  } catch {
    // offline, rate limited, or a GitHub hiccup: use the snapshot
  }
  return { manifest: fallbackManifest as unknown as Manifest, live: false };
}

type FormatSpec = [kind: string, label: string];
interface ArchSpec {
  id: string;
  label: string;
  hint?: string;
  formats: FormatSpec[];
}

const DESKTOP_WINDOWS: FormatSpec[] = [
  ['setup', 'Installer'],
  ['msi', 'MSI package'],
];
const DESKTOP_LINUX: FormatSpec[] = [
  ['appimage', 'AppImage'],
  ['deb', 'Debian package'],
  ['rpm', 'RPM package'],
];

/** Display order matters: the first architecture and first format are the one-click defaults. */
const SPEC: Array<Omit<PlatformModel, 'arches'> & { arches: ArchSpec[] }> = [
  {
    id: 'windows',
    name: 'Windows',
    summary: 'x64 and ARM64',
    archPrompt: 'Processor',
    arches: [
      { id: 'x86_64', label: 'x64', hint: 'Intel and AMD', formats: DESKTOP_WINDOWS },
      {
        id: 'aarch64',
        label: 'ARM64',
        hint: 'Snapdragon and other ARM PCs',
        formats: DESKTOP_WINDOWS,
      },
    ],
  },
  {
    id: 'macos',
    name: 'macOS',
    summary: 'Apple Silicon and Intel',
    archPrompt: 'Chip',
    note: 'The build is unsigned. After moving Concat to Applications, clear the quarantine flag once:',
    command: 'xattr -dr com.apple.quarantine /Applications/Concat.app',
    arches: [
      {
        id: 'arm64',
        label: 'Apple Silicon',
        hint: 'M1 and later',
        formats: [['dmg', 'Disk image']],
      },
      { id: 'x86_64', label: 'Intel', formats: [['dmg', 'Disk image']] },
    ],
  },
  {
    id: 'linux',
    name: 'Linux',
    summary: 'AppImage, deb and rpm',
    archPrompt: 'Processor',
    arches: [
      { id: 'x86_64', label: 'x86_64', hint: 'Intel and AMD', formats: DESKTOP_LINUX },
      { id: 'aarch64', label: 'ARM64', hint: 'aarch64 machines', formats: DESKTOP_LINUX },
    ],
  },
  {
    id: 'android',
    name: 'Android',
    summary: 'APK, phones and tablets',
    archPrompt: 'Device',
    note: 'Phones and tablets. Android asks you to allow installs from this source the first time.',
    arches: [
      { id: 'arm64', label: 'ARM64', hint: 'phones and tablets', formats: [['apk', 'APK']] },
    ],
  },
  {
    id: 'ios',
    name: 'iOS',
    summary: 'IPA, beta',
    archPrompt: 'Device',
    note: 'Beta. Install the IPA by sideloading on iPhone or iPad.',
    arches: [{ id: 'arm64', label: 'iPhone and iPad', formats: [['ipa', 'IPA']] }],
  },
];

/** Platforms, architectures and files that actually exist in the manifest, in display order. */
export function getPlatforms(manifest: Manifest): PlatformModel[] {
  const out: PlatformModel[] = [];
  for (const p of SPEC) {
    const arches: ArchOption[] = [];
    for (const a of p.arches) {
      const formats: FormatOption[] = [];
      for (const [kind, label] of a.formats) {
        const binary = manifest.binaries[p.id]?.[a.id]?.[kind];
        if (binary) formats.push({ id: kind, label, binary });
      }
      if (formats.length > 0) arches.push({ id: a.id, label: a.label, hint: a.hint, formats });
    }
    if (arches.length > 0) out.push({ ...p, arches });
  }
  return out;
}

/** One-click default for a platform: first architecture, first format. */
export function defaultDownload(platform: PlatformModel): FormatOption {
  return platform.arches[0]!.formats[0]!;
}

export function formatBytes(bytes: number): string {
  return `${Math.round(bytes / 1_048_576)} MB`;
}
