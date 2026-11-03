/**
 * In-browser media work for the free tools: reading a file's details, converting, compressing,
 * trimming, pulling the sound out and making GIFs. Mediabunny reads and writes the containers and
 * drives the browser's own WebCodecs encoders and decoders (hardware ones where the machine has
 * them), so nothing leaves the machine. It is imported on first use, so a tool page downloads it
 * only once a file is opened.
 */
import type { InputVideoTrack, OutputFormat } from 'mediabunny';

export type Container = 'mp4' | 'webm' | 'mov' | 'm4a' | 'mp3' | 'wav';

export interface Info {
  name: string;
  size: number;
  format: string;
  mime: string;
  duration: number;
  video?: {
    codec: string;
    width: number;
    height: number;
    rotation: number;
    fps: number;
    bitrate: number;
  };
  audio?: {
    codec: string;
    channels: number;
    sampleRate: number;
    bitrate: number;
  };
}

export interface ConvertOptions {
  container: Container;
  video?: {
    discard?: boolean;
    /** Scale so the short edge is this many pixels; never scales up. */
    shortEdge?: number;
    /** Bits per second. */
    bitrate?: number;
    /** Hold the bitrate steady rather than letting it vary, for a size that must not be exceeded. */
    constant?: boolean;
    quality?: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    frameRate?: number;
  };
  audio?: { discard?: boolean; bitrate?: number };
  trim?: { start?: number; end?: number };
  /** Always re-encode; otherwise streams the output can hold are copied as they are. */
  transcode?: boolean;
}

export interface Result {
  blob: Blob;
  name: string;
}

/** A running job: its result, and a way to stop it. */
export interface Job {
  done: Promise<Result>;
  cancel: () => void;
}

const lib = () => import('mediabunny');

/** Why this browser cannot run a conversion here, or null when it can. */
export function unsupported(): string | null {
  if (typeof VideoDecoder === 'undefined' || typeof VideoEncoder === 'undefined')
    return 'This browser cannot encode video on the page. A recent Chrome, Edge, Safari or Firefox can.';
  return null;
}

async function open(file: File) {
  const mb = await lib();
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  if (!(await input.canRead())) {
    input.dispose();
    throw new Error('This file is not a video or audio format the page can read.');
  }
  return { mb, input };
}

const CODEC_NAMES: Record<string, string> = {
  avc: 'H.264',
  hevc: 'HEVC (H.265)',
  vp8: 'VP8',
  vp9: 'VP9',
  av1: 'AV1',
  prores: 'ProRes',
  aac: 'AAC',
  opus: 'Opus',
  mp3: 'MP3',
  vorbis: 'Vorbis',
  flac: 'FLAC',
  ac3: 'Dolby Digital (AC-3)',
  eac3: 'Dolby Digital Plus (E-AC-3)',
  dts: 'DTS',
};
export const codecName = (codec: string | null | undefined) =>
  codec
    ? (CODEC_NAMES[codec] ?? (codec.startsWith('pcm') ? 'PCM (uncompressed)' : codec))
    : 'Unknown';

export async function probe(file: File): Promise<Info> {
  const { input } = await open(file);
  try {
    const format = await input.getFormat();
    const duration = await input.computeDuration();
    const info: Info = {
      name: file.name,
      size: file.size,
      format: format.name,
      mime: await input.getMimeType(),
      duration,
    };
    const v = await input.getPrimaryVideoTrack();
    if (v) {
      const stats = await v.computePacketStats(600);
      info.video = {
        codec: codecName(await v.getCodec()),
        width: await v.getDisplayWidth(),
        height: await v.getDisplayHeight(),
        rotation: await v.getRotation(),
        fps: stats.averagePacketRate,
        bitrate: stats.averageBitrate,
      };
    }
    const a = await input.getPrimaryAudioTrack();
    if (a) {
      const stats = await a.computePacketStats(600);
      info.audio = {
        codec: codecName(await a.getCodec()),
        channels: a.numberOfChannels,
        sampleRate: a.sampleRate,
        bitrate: stats.averageBitrate,
      };
    }
    return info;
  } finally {
    input.dispose();
  }
}

const EXTENSION: Record<Container, string> = {
  mp4: 'mp4',
  webm: 'webm',
  mov: 'mov',
  m4a: 'm4a',
  mp3: 'mp3',
  wav: 'wav',
};
const MIME: Record<Container, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4a: 'audio/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

/** The file's name with a new extension and a note, e.g. "clip (compressed).mp4". */
export function outputName(file: File, container: Container | 'gif', note: string) {
  const base = file.name.replace(/\.[^.]+$/, '') || 'video';
  return `${base} (${note}).${container === 'gif' ? 'gif' : EXTENSION[container]}`;
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

async function scaledSize(track: InputVideoTrack, shortEdge: number) {
  const w = await track.getDisplayWidth();
  const h = await track.getDisplayHeight();
  if (Math.min(w, h) <= shortEdge) return {};
  return w >= h
    ? { width: even((w * shortEdge) / h), height: even(shortEdge) }
    : { width: even(shortEdge), height: even((h * shortEdge) / w) };
}

/** Converts a file per `options`; `onProgress` gets 0 to 1. */
export function convert(
  file: File,
  options: ConvertOptions,
  note: string,
  onProgress: (progress: number) => void,
): Job {
  let cancel = () => {};
  let canceled = false;
  const done = (async (): Promise<Result> => {
    const { mb, input } = await open(file);
    try {
      let format: OutputFormat;
      switch (options.container) {
        case 'webm':
          format = new mb.WebMOutputFormat();
          break;
        case 'mov':
          format = new mb.MovOutputFormat({ fastStart: 'in-memory' });
          break;
        case 'mp3':
          if (!(await mb.canEncodeAudio('mp3'))) {
            const { registerMp3Encoder } = await import('@mediabunny/mp3-encoder');
            registerMp3Encoder();
          }
          format = new mb.Mp3OutputFormat();
          break;
        case 'wav':
          format = new mb.WavOutputFormat();
          break;
        default:
          format = new mb.Mp4OutputFormat({ fastStart: 'in-memory' });
      }
      const output = new mb.Output({ format, target: new mb.BufferTarget() });
      const audioOnly = ['m4a', 'mp3', 'wav'].includes(options.container);
      const v = options.video ?? {};
      const a = options.audio ?? {};
      const conversion = await mb.Conversion.init({
        input,
        output,
        tracks: 'primary',
        showWarnings: false,
        trim: options.trim,
        ...(options.transcode ? { copy: false as const } : {}),
        video: async (track) =>
          audioOnly || v.discard
            ? { discard: true }
            : {
                ...(v.shortEdge ? await scaledSize(track, v.shortEdge) : {}),
                ...(v.shortEdge ? { fit: 'fill' as const } : {}),
                ...(v.bitrate
                  ? {
                      quality: new mb.Quality({
                        bitrate: v.bitrate,
                        bitrateMode: v.constant ? 'constant' : 'variable',
                      }),
                    }
                  : {}),
                ...(v.quality ? { quality: new mb.Quality(v.quality) } : {}),
                ...(v.frameRate ? { frameRate: v.frameRate } : {}),
              },
        audio: a.discard
          ? { discard: true }
          : {
              ...(a.bitrate ? { quality: new mb.Quality({ bitrate: a.bitrate }) } : {}),
              ...(options.container === 'm4a' ? { codec: 'aac' as const } : {}),
            },
      });
      if (!conversion.isValid) {
        const reasons = conversion.discardedTracks.map((t) => t.reason).join(', ');
        throw new Error(
          reasons.includes('no_encodable_target_codec')
            ? 'This browser has no encoder for that format. Try MP4, or another browser.'
            : reasons.includes('undecodable_source_codec')
              ? "This browser cannot decode this file's codec (HEVC often needs Safari or Edge with the HEVC extension). Try another browser."
              : `This file cannot be converted that way (${reasons || 'no usable tracks'}).`,
        );
      }
      cancel = () => {
        canceled = true;
        void conversion.cancel();
      };
      if (canceled) throw new Error('Canceled.');
      conversion.onProgress = (p) => onProgress(p);
      await conversion.execute();
      const buffer = output.target.buffer;
      if (!buffer) throw new Error('The conversion produced no file.');
      return {
        blob: new Blob([buffer], { type: MIME[options.container] }),
        name: outputName(file, options.container, note),
      };
    } catch (error) {
      if (canceled || (error instanceof Error && error.name === 'ConversionCanceledError'))
        throw new Error('Canceled.');
      throw error;
    } finally {
      input.dispose();
    }
  })();
  return { done, cancel: () => cancel() };
}

export interface GifOptions {
  start: number;
  end: number;
  fps: number;
  width: number;
}

/** Renders a stretch of the video as an animated GIF with a palette per frame. */
export function toGif(file: File, options: GifOptions, onProgress: (p: number) => void): Job {
  let canceled = false;
  const done = (async (): Promise<Result> => {
    const { mb, input } = await open(file);
    const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
    try {
      const track = await input.getPrimaryVideoTrack();
      if (!track) throw new Error('This file has no picture to turn into a GIF.');
      if (!(await track.canDecode())) throw new Error('This browser cannot decode this video.');
      const w = await track.getDisplayWidth();
      const h = await track.getDisplayHeight();
      const width = Math.min(options.width, w);
      const height = Math.max(2, Math.round((h * width) / w));
      const sink = new mb.CanvasSink(track, { width, height, fit: 'fill' });
      const step = 1 / options.fps;
      const times: number[] = [];
      for (let t = options.start; t < options.end; t += step) times.push(t);
      const gif = GIFEncoder();
      const delay = Math.round(1000 / options.fps);
      let i = 0;
      for await (const frame of sink.canvasesAtTimestamps(times)) {
        if (canceled) throw new Error('Canceled.');
        i += 1;
        if (!frame) continue;
        const ctx = frame.canvas.getContext('2d', { willReadFrequently: true }) as
          CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
        const { data } = ctx.getImageData(0, 0, width, height);
        const palette = quantize(data, 256);
        gif.writeFrame(applyPalette(data, palette), width, height, { palette, delay });
        onProgress(i / times.length);
      }
      gif.finish();
      return {
        blob: new Blob([gif.bytes() as Uint8Array<ArrayBuffer>], { type: 'image/gif' }),
        name: outputName(file, 'gif', 'gif'),
      };
    } finally {
      input.dispose();
    }
  })();
  return {
    done,
    cancel: () => {
      canceled = true;
    },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${Math.round(bytes / 1e3)} KB`;
  return `${bytes} bytes`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'Unknown';
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s / 60) % 60;
  const rest = (s % 60).toFixed(s < 60 ? 2 : 0).padStart(s < 60 ? 5 : 2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`;
}
