import type { Color } from "./brush.ts";
import type {
  Coords,
  LayerMeta,
  Layer,
  SingleChannelLayer,
} from "./d.ts";

export const getLayerPixelData = (
  index: number,
  { width }: LayerMeta,
): {
  pixelIndex: number;
  pos: Coords;
} => {
  const pixelIndex = Math.floor(index / 3);

  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);

  return { pos: [x, y], pixelIndex };
};

export const getPixelFromLayer = (
  coords: Coords,
  layer: Layer,
): Color | null => {
  const normalCoords = normalize(coords, layer);
  if (!normalCoords) return null;
  const [x, y] = normalCoords;

  const pos = (x + y * layer.width) * 3;
  return [layer.data[pos], layer.data[pos + 1], layer.data[pos + 2]];
};

export const getPixelFromSingleChannelLayer = (
  coords: Coords,
  layer: SingleChannelLayer,
): number | null => {
  const normalCoords = normalize(coords, layer);
  if (!normalCoords) return null;
  const [x, y] = normalCoords;

  const pos = x + y * layer.width;
  return layer.data[pos];
};

const normalize = (coords: Coords, layer: Layer): Coords | null => {
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
