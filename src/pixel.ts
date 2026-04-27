import type { Color } from "./color.ts";
import type {
  XYCoords,
  LayerMeta,
  Layer,
  SingleChannelLayer,
} from "./_d.ts";

export const getPixelXYCoords = (
  /**
   * index when looping over Layer.data
   */
  index: number,
  { width }: LayerMeta,
): {
  pixelIndex: number;
  pos: XYCoords;
} => {
  const pixelIndex = Math.floor(index / 3);

  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);

  return { pos: [x, y], pixelIndex };
};

export const getPixelColor = (
  coords: XYCoords,
  layer: Layer,
): Color | null => {
  const normalXYCoords = normalize(coords, layer);
  if (!normalXYCoords) return null;
  const [x, y] = normalXYCoords;

  const pos = (x + y * layer.width) * 3;
  return [layer.data[pos], layer.data[pos + 1], layer.data[pos + 2]];
};

export const getPixelFromSingleChannelLayer = (
  coords: XYCoords,
  layer: SingleChannelLayer,
): number | null => {
  const normalXYCoords = normalize(coords, layer);
  if (!normalXYCoords) return null;
  const [x, y] = normalXYCoords;

  const pos = x + y * layer.width;
  return layer.data[pos];
};

const normalize = (
  coords: XYCoords,
  layer: Layer,
): XYCoords | null => {
  const x = Math.floor(coords[0]);
  const y = Math.floor(coords[1]);

  if (x >= layer.width || x < 0) {
    return null;
  }
  if (y >= layer.height || y < 0) {
    return null;
  }

  return [x, y];
};
