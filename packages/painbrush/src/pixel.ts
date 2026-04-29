import type { Color } from "./color/utils.ts";
import type { Layer, ImageMeta, LayerMeta } from "./layer.ts";

export const COORDS_ZERO = { x: 0, y: 0 };

export type XYCoords = { x: number; y: number };

export const getPixelIndexFromCoords = (
  coords: XYCoords,
  { width }: Layer,
) => coords.y * width + coords.x;

export const getPixelXYCoords = (
  index: number,
  { width }: LayerMeta,
): XYCoords => {
  const pixelIndex = ~~index;
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
  return layer.pixels[getPixelIndexFromCoords(coords, layer)];
};

const normalize = (
  coords: XYCoords,
  layer: ImageMeta,
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
