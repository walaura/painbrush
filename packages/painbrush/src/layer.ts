import type { Color } from "./color.ts";
import type { XYCoords } from "./pixel.ts";

type LayerId = number;

export interface LayerMeta extends XYCoords {
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

export * from "./layer/make/image.ts";
export * from "./layer/make/empty.ts";
export * from "./layer/make/text.ts";
export * from "./layer/transform.ts";
