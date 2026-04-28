import { blendColor } from "../color/utils.ts";
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
  [width, height]: XYCoords,
  brush: Brush = solidFillBrush([255, 255, 255]),
): Layer => {
  let data = [];
  const meta = {
    width,
    id: Math.random(),
    height,
    channels: 3,
  };

  for (let index = 0; index < width * height * 3; index = index + 3) {
    const color = blendColor(null, brush(index, meta));
    data.push(color[0]);
    data.push(color[1]);
    data.push(color[2]);
  }

  return {
    ...meta,
    data,
  };
};

/**
 * Utility method to make a blank rectangle, makes a great bg
 */
export const makeBlankLayer = (coords: XYCoords) =>
  makeRectangleLayer(coords, alphaBrush());
