export interface LayerMeta {
  width: number;
  height: number;
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
export type Coords = [x: number, y: number];

export type Brush<L = LayerMeta> = (index: number, layer: L) => Color;

export type Color = [r: number, g: number, b: number];
