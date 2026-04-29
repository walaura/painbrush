import type { Color } from "./color.ts";
import type { Layer, LayerMeta } from "./layer.ts";

export const COORDS_ZERO = { x: 0, y: 0 };

export interface XYCoords {
  x: number;
  y: number;
}

export const getPixelIndexFromCoords = (
  coords: XYCoords,
  layer: Layer,
) => coords.y * layer.x + coords.x;

export const getPixelXYCoords = (
  index: number,
  layer: LayerMeta,
): XYCoords => {
  const pixelIndex = ~~index;
  return {
    x: pixelIndex % layer.x,
    y: ~~(pixelIndex / layer.x),
  };
};

export const getPixelColor = (
  coords: XYCoords,
  layer: Layer,
): Color | null => {
  const normalXYCoords = normalize(coords, layer);
  if (!normalXYCoords) return null;
  return layer.pixels[getPixelIndexFromCoords(coords, layer)];
};

const normalize = (
  coords: XYCoords,
  layer: Layer,
): XYCoords | null => {
  const x = ~~coords.x;
  const y = ~~coords.y;

  if (x >= layer.x || x < 0) {
    return null;
  }
  if (y >= layer.y || y < 0) {
    return null;
  }

  return { x, y };
};
