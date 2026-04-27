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

/**
 * [x,y] - dont get them backwards
 */
export type XYCoords = [x: number, y: number];
