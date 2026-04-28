import type { Color } from "./color/utils.ts";
import type {
  LayerMeta,
  Layer,
  SingleChannelLayer,
} from "./layer.ts";

export const COORDS_ZERO = { x: 0, y: 0 };

export type XYCoords = { x: number; y: number };

export const getPixelXYCoords = (
  index: number,
  { width }: LayerMeta,
): XYCoords => {
  const pixelIndex = ~~(index / 3);
  return {
    x: pixelIndex % width,
    y: ~~(pixelIndex / width),
  };
};

export const getPixelColor = (
  coords: XYCoords,
  layer: Layer,
): Color | null => {
  const normalXYCoords = normalize(coords, layer);
  if (!normalXYCoords) return null;
  const { x, y } = normalXYCoords;

  const pos = (x + y * layer.width) * 3;
  return [layer.data[pos], layer.data[pos + 1], layer.data[pos + 2]];
};

export const getPixelFromSingleChannelLayer = (
  coords: XYCoords,
  layer: SingleChannelLayer,
): number | null => {
  const normalXYCoords = normalize(coords, layer);
  if (!normalXYCoords) return null;
  const { x, y } = normalXYCoords;

  const pos = x + y * layer.width;
  return layer.data[pos];
};

const normalize = (
  coords: XYCoords,
  layer: Layer,
): XYCoords | null => {
  const x = ~~coords.x;
  const y = ~~coords.y;

  if (x >= layer.width || x < 0) {
    return null;
  }
  if (y >= layer.height || y < 0) {
    return null;
  }

  return { x, y };
};
