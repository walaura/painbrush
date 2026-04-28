import type { Color } from "./color/utils.ts";
import type {
  LayerMeta,
  Layer,
  SingleChannelImage,
} from "./layer.ts";

export const COORDS_ZERO = { x: 0, y: 0 };

export type XYCoords = { x: number; y: number };

export const getPixelIndexFromCoords = (
  coords: XYCoords,
  { width }: LayerMeta,
) => {
  const xPosition = coords.y * width + coords.x;
  return xPosition;
};

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
  const { x, y } = normalXYCoords;

  const pos = x + y * layer.width;
  return layer.pixels[pos];
};

export const getPixelFromSingleChannelImage = (
  coords: XYCoords,
  layer: SingleChannelImage,
): number | null => {
  const normalXYCoords = normalize(coords, layer);
  if (!normalXYCoords) return null;
  const { x, y } = normalXYCoords;

  const pos = x + y * layer.width;
  return layer.data[pos];
};

const normalize = (
  coords: XYCoords,
  layer: LayerMeta,
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
