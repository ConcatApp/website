/** gifenc ships no types; these cover the three functions src/scripts/media.ts uses. */
declare module 'gifenc' {
  export type Palette = number[][];
  export interface Encoder {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: { palette?: Palette; delay?: number; transparent?: boolean; repeat?: number },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  }
  export function GIFEncoder(): Encoder;
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors: number): Palette;
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: Palette): Uint8Array;
}
