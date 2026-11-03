/**
 * The icon names a guide can carry in its frontmatter (`icon:`). GuideIcon.astro maps each name to
 * its Lucide icon; the list lives here, free of components, so the content schema can import it.
 */
export const GUIDE_ICONS = [
  'book',
  'install',
  'play',
  'layout',
  'requirements',
  'captions',
  'speech',
  'mic',
  'voice',
  'models',
  'sounds',
  'text',
  'effects',
  'cutout',
  'mask',
  'keyframes',
  'vertical',
  'stabilize',
  'enhance',
  'cut',
  'export',
  'keyboard',
  'settings',
  'phone',
  'update',
  'help',
  'script',
  'switch',
  'film',
  'podcast',
  'screen',
  'linux',
  'privacy',
  'codec',
  'glossary',
  'ratio',
] as const;

export type GuideIcon = (typeof GUIDE_ICONS)[number];
