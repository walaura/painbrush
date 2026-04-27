export interface LayerMeta {
  width: number;
  height: number;
  isSingleChannel?: true;
}

export interface SingleChannelLayer extends LayerMeta {
  data: number[];
  isSingleChannel: true;
}

export interface Layer extends LayerMeta {
  data: number[];
}

/**
 * [x,y] - dont get the backwards
 */
export type XYCoords = [x: number, y: number];
