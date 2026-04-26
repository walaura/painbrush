export interface LayerMeta {
  width: number;
  height: number;
  channels: number;
}

export interface SingleChannelLayer extends LayerMeta {
  data: number[];
}

export interface RGBLayer extends LayerMeta {
  data: number[];
}

export type Coords = { x: number; y: number };

export type Layer = SingleChannelLayer | RGBLayer;

export type Brush<L = LayerMeta> = (index: number, layer: LayerMeta) => Color;

export type Color = [r: number, g: number, b: number];
