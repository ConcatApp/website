/**
 * The free single-page tools under /tools, grouped and ordered as the index lists them. Each runs
 * entirely in the browser: the video tools read and write files with Mediabunny and the browser's
 * own encoders (src/scripts/media.ts), and nothing is uploaded. Pages live at
 * src/pages/tools/<slug>.astro and use src/layouts/Tool.astro.
 */
import type { GuideIcon } from '@/lib/guide-icons';

export type ToolGroup = 'Video' | 'Writing' | 'Calculators';
export const TOOL_GROUPS: ToolGroup[] = ['Video', 'Writing', 'Calculators'];

export interface Tool {
  slug: string;
  group: ToolGroup;
  /** The page's h1 and the card title. */
  title: string;
  /** One line for the card and the page lead. */
  lead: string;
  /** The meta description, written for search results. */
  description: string;
  icon: GuideIcon;
}

export const TOOLS: Tool[] = [
  {
    slug: 'compress-video',
    group: 'Video',
    title: 'Compress a video',
    lead: 'Make a video smaller, or fit it under a size limit, without uploading it.',
    description:
      'Compress MP4, MOV and WebM videos in your browser: pick a quality or a size limit and a resolution. Free, no upload, no watermark, no sign-up.',
    icon: 'compress',
  },
  {
    slug: 'convert-video',
    group: 'Video',
    title: 'Video converter',
    lead: 'Turn MOV, MKV and WebM into MP4, or MP4 into WebM or MOV.',
    description:
      'Convert videos between MP4, WebM and MOV in your browser. Files that only need a new container are rewrapped in seconds without losing quality. No upload.',
    icon: 'switch',
  },
  {
    slug: 'trim-video',
    group: 'Video',
    title: 'Trim a video',
    lead: 'Cut the start and the end off a video, right in the browser.',
    description:
      'Trim a video online without uploading it: play it, set where it starts and ends, and download the cut as MP4, WebM or MOV. Free, no watermark.',
    icon: 'cut',
  },
  {
    slug: 'extract-audio',
    group: 'Video',
    title: 'Extract audio from a video',
    lead: 'Save the sound of a video as MP3, M4A or WAV.',
    description:
      'Extract the audio from a video as MP3, M4A (AAC) or WAV, in your browser. Works with MP4, MOV, MKV and WebM. No upload, no sign-up.',
    icon: 'sounds',
  },
  {
    slug: 'video-to-gif',
    group: 'Video',
    title: 'Video to GIF',
    lead: 'Turn a few seconds of a video into an animated GIF.',
    description:
      'Make an animated GIF from a video in your browser: pick the start, the length, the frame rate and the width. No upload and no watermark.',
    icon: 'gif',
  },
  {
    slug: 'video-info',
    group: 'Video',
    title: 'Video file inspector',
    lead: "See a video's codec, resolution, frame rate, bitrate and audio format.",
    description:
      "Check a video's codec, resolution, frame rate, bitrate, duration and audio track without uploading it. Reads MP4, MOV, MKV and WebM in your browser.",
    icon: 'scan',
  },
  {
    slug: 'script-length-counter',
    group: 'Writing',
    title: 'Script length counter',
    lead: 'Words, characters, lines and how long a script takes to read aloud.',
    description:
      'Count the words, characters, sentences, lines and paragraphs in a script, and see how long it takes to read aloud for a voiceover, a TikTok or a YouTube video.',
    icon: 'count',
  },
  {
    slug: 'subtitle-converter',
    group: 'Writing',
    title: 'SRT and VTT subtitle converter',
    lead: 'Convert SRT to WebVTT and back, and shift every caption earlier or later.',
    description:
      'Convert subtitles between SRT and WebVTT and shift their timing in one step. Open a file or paste the text; it never leaves your browser.',
    icon: 'subtitles',
  },
  {
    slug: 'video-file-size-calculator',
    group: 'Calculators',
    title: 'Video file size calculator',
    lead: 'How big a video will be at a bitrate, or the bitrate that fits it under a size.',
    description:
      'Work out a video file size from its length and bitrate, or the bitrate to export at so it fits under a size limit. Free, in your browser.',
    icon: 'calculator',
  },
  {
    slug: 'aspect-ratio-calculator',
    group: 'Calculators',
    title: 'Aspect ratio calculator',
    lead: 'Resize to any ratio without stretching: 16:9, 9:16, 1:1, 4:5 and the rest.',
    description:
      'Find the width or height for any aspect ratio, simplify a resolution to its ratio, and see the standard sizes for 16:9, 9:16, 1:1, 4:5 and 4:3 video.',
    icon: 'ratio',
  },
  {
    slug: 'timecode-calculator',
    group: 'Calculators',
    title: 'Timecode calculator',
    lead: 'Timecode, frames and seconds at any frame rate, and the length between two timecodes.',
    description:
      'Convert between timecode (HH:MM:SS:FF), frame counts and seconds at 23.976, 24, 25, 29.97, 30, 50, 59.94 or 60 fps, and measure the duration between two timecodes.',
    icon: 'clock',
  },
];

export const toolHref = (tool: Tool) => `/tools/${tool.slug}`;
