import { COLOR_BLACK } from "../color/utils.ts";
import {
  type Brush,
  solidFillBrush,
  alphaBrush,
} from "../color/brush.ts";
import type { Layer } from "../layer.ts";
import type { XYCoords } from "../pixel.ts";

/**
This makes a rectangle with any fill. 
Useful for the initial canvas
*/
export const makeRectangleLayer = (
  { x: width, y: height }: XYCoords,
  brush: Brush = solidFillBrush(COLOR_BLACK),
): Layer => {
  let pixels = [];
  const meta = {
    width,
    id: Math.random(),
    height,
  };

  for (let index = 0; index < width * height; index = index + 1) {
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
export const makeBlankLayer = (coords: XYCoords) =>
  makeRectangleLayer(coords, alphaBrush());
