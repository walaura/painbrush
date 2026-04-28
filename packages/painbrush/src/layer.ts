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

export interface SingleChannelLayer extends LayerMeta {
  data: number[];
  isSingleChannel: true;
}
export interface FourChannelLayer extends LayerMeta {
  data: number[];
  isFourChannel: true;
}

export interface Layer extends LayerMeta {
  data: number[];
}

export * from "./layer/make-image.ts";
export * from "./layer/make-rectangle.ts";
export * from "./layer/make-text.ts";
export * from "./layer/transform.ts";
