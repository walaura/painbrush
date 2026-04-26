import type { Brush, Color, RGBLayer } from "./d.ts";
import { getLayerPixelData } from "./data.ts";

export const solidFillBrush = (color: Color) => () => color;

export const createRGBLayer = (
  width: number,
  height: number,
  brush: Brush<RGBLayer>,
): RGBLayer => {
  let data = [];
  const meta = { width, height, channels: 3 };

  for (let index = 0; index < width * height * 3; index++) {
    const { currentSubpixelElement } = getLayerPixelData(index, meta);
    data.push(brush(index, meta)[currentSubpixelElement]);
  }

  return {
    ...meta,
    data,
  };
};
