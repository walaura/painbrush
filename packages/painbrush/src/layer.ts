import type { Color } from "./color.ts";

type LayerId = number;

export interface ImageMeta {
  width: number;
  height: number;
}

export interface SingleChannelImage extends ImageMeta {
  data: number[];
  channels: 1;
}
export interface MultiChannelImage extends ImageMeta {
  data: number[];
  channels: 3 | 4;
}

export interface LayerMeta extends Omit<ImageMeta, "channels"> {
  __isLayer: true;
}
export interface Layer extends LayerMeta {
  /**
   * This is a Math.rand() that can
   * be used on brushes to apply per-layer effects
   */
  id: LayerId;
  pixels: Color[];
}

export * from "./layer/make-image.ts";
export * from "./layer/make-rectangle.ts";
export * from "./layer/make-text.ts";
export * from "./layer/transform.ts";
