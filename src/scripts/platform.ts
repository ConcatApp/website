/**
 * Best-effort client detection of operating system and CPU architecture.
 * Used to pre-select the download picker and to point the hero button at the right file.
 * Nothing here is authoritative: the UI always lets the visitor change the choice.
 */
export type PlatformId = 'windows' | 'macos' | 'linux' | 'android' | 'ios';

type UaData = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; bitness?: string }>;
};

function uaData(): UaData | undefined {
  return (navigator as Navigator & { userAgentData?: UaData }).userAgentData;
}

/** Operating system. Falls back to Windows, the largest download share. */
export function detectPlatform(): PlatformId {
  const ua = navigator.userAgent;
  const platform = (uaData()?.platform || navigator.platform || '').toLowerCase();

  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac/.test(platform) && navigator.maxTouchPoints > 1) return 'ios'; // iPadOS reports as Mac
  if (/win/.test(platform) || /windows/i.test(ua)) return 'windows';
  if (/mac/.test(platform) || /mac os/i.test(ua)) return 'macos';
  if (/linux|x11|cros/.test(platform) || /linux/i.test(ua)) return 'linux';
  return 'windows';
}

/**
 * CPU family from User-Agent Client Hints (Chromium) or the UA string (Firefox on Linux/Windows ARM).
 * Frozen UA strings never say "x64" on Windows ARM or "arm" on Apple Silicon, so this stays
 * undefined whenever there is no positive signal.
 */
async function detectCpu(): Promise<'arm' | 'x86' | undefined> {
  try {
    const hints = await uaData()?.getHighEntropyValues?.(['architecture']);
    if (hints?.architecture) return /arm/i.test(hints.architecture) ? 'arm' : 'x86';
  } catch {
    // hint refused or unavailable
  }
  const ua = navigator.userAgent;
  if (/aarch64|arm64|armv8/i.test(ua)) return 'arm';
  if (/x86_64|amd64|win64/i.test(ua)) return 'x86';
  return undefined;
}

/** WebGL renderer string, the only public hint Firefox and Chrome give about a Mac's chip. */
function webglRenderer(): string {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const info = gl?.getExtension('WEBGL_debug_renderer_info');
    return info ? String(gl?.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  } catch {
    return '';
  }
}

/**
 * Architecture id as used by the release manifest for the given platform, or undefined when the
 * platform ships one build or nothing reliable could be read.
 *   windows / linux: 'x86_64' | 'aarch64'
 *   macos:           'arm64' | 'x86_64'
 */
export async function detectArch(platform: PlatformId): Promise<string | undefined> {
  if (platform === 'windows' || platform === 'linux') {
    const cpu = await detectCpu();
    return cpu === 'arm' ? 'aarch64' : cpu === 'x86' ? 'x86_64' : undefined;
  }

  if (platform === 'macos') {
    const cpu = await detectCpu();
    if (cpu === 'arm') return 'arm64';
    if (cpu === 'x86') return 'x86_64';
    // Safari reports a generic "Apple GPU" on every Mac, so only specific names count.
    const renderer = webglRenderer();
    if (/Apple M\d/i.test(renderer)) return 'arm64';
    if (/Intel|AMD|Radeon/i.test(renderer)) return 'x86_64';
    return undefined;
  }

  return undefined;
}
