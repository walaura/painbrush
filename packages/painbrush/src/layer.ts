import type { Color } from "./color.ts";

type LayerId = number;

export interface LayerMeta {
  width: number;
  height: number;
  /**
   * This is a Math.rand() that can
   * be used on brushes to apply per-layer effects
   */
  id: LayerId;
  isSingleChannel?: true;
  isFourChannel?: true;
}

export interface SingleChannelImage extends LayerMeta {
  data: number[];
  isSingleChannel: true;
}
export interface FourChannelImage extends LayerMeta {
  data: number[];
  isFourChannel: true;
  channels: number;
}

export interface Layer extends LayerMeta {
  pixels: Color[];
}

export * from "./layer/make-image.ts";
export * from "./layer/make-rectangle.ts";
export * from "./layer/make-text.ts";
export * from "./layer/transform.ts";
