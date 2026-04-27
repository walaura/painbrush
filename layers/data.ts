import type { Color, Coords, LayerMeta, Layer } from "./d.ts";

export const getLayerPixelData = (
  index: number,
  { width }: LayerMeta,
): {
  currentSubpixelElement: number;
  pixelIndex: number;
  pos: Coords;
} => {
  const currentSubpixelElement = index % 3;
  const pixelIndex = Math.floor(index / 3);

  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);

  return { pos: [x, y], currentSubpixelElement, pixelIndex };
};

export const getPixelFromLayer = (
  [x, y]: Coords,
  layer: Layer,
): Color | null => {
  if (x >= layer.width || x < 0) {
    return null;
  }
  if (y >= layer.height || y < 0) {
    return null;
  }

  const charPixelPos = (x + y * layer.width) * 3;

  return [
    layer.data[charPixelPos],
    layer.data[charPixelPos + 1],
    layer.data[charPixelPos + 2],
  ];
};
