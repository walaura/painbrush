import { COLOR_BLACK } from "../../color.ts";
import {
  type Brush,
  solidFillBrush,
  alphaBrush,
} from "../../color/brush.ts";
import type { Layer } from "../../layer.ts";
import type { XYCoords } from "../../pixel.ts";

/**
This makes a rectangle with any fill. 
Useful for the initial canvas
*/
export const makeBlankLayer = (
  size: XYCoords,
  brush: Brush = solidFillBrush(COLOR_BLACK),
): Layer => {
  const pixels = [];
  const meta = {
    ...size,
    id: Math.random(),
    __isLayer: true as const,
  };

  for (let index = 0; index < size.x * size.y; index = index + 1) {
    pixels.push(brush(index, meta));
  }

  return {
    ...meta,
    pixels,
  };
};

/**
 * Utility method to make a blank rectangle, makes a great bg
 */
export const makeBlankLayerWithAlpha = (coords: XYCoords) =>
  makeBlankLayer(coords, alphaBrush());
