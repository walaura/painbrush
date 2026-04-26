import { AsyncResource } from "async_hooks";
import type { Color, Coords, LayerMeta, RGBLayer } from "./d.ts";

export type Layer = {
  data: number[];
  width: number;
  height: number;
  channels: 1 | 3;
};

export const getLayerPixelData = (
  index: number,
  { channels, width }: LayerMeta,
): Coords & {
  currentSubpixelElement: number;
  pixelIndex: number;
} => {
  const currentSubpixelElement = index % channels;
  const pixelIndex = Math.floor(index / channels);

  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);

  return { x, y, currentSubpixelElement, pixelIndex };
};

export const getPixelFromLayer = (
  { x, y }: Coords,
  layer: RGBLayer,
): Color | null => {
  if (x >= layer.width || x < 0) {
    return null;
  }
  if (y >= layer.height || y < 0) {
    return null;
  }

  const charPixelPos = (x + y * layer.width) * 3;

  console.log(x, y, charPixelPos);

  return [
    layer.data[charPixelPos],
    layer.data[charPixelPos + 1],
    layer.data[charPixelPos + 2],
  ];
};
