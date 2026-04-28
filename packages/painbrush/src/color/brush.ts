import type { LayerMeta } from "../layer.ts";
import { getPixelXYCoords } from "../pixel.ts";
import { type Color, COLOR_ALPHA, COLOR_BLACK } from "./utils.ts";

/**
Anything that paints on a layer is a brush function. Brushes get the pixel position and layer metadata and decide what color to paint.

Normally you just wanna use a solid color and theres solidFillBrush for that. check out other builtins in this file.
*/
export type Brush = (index: number, layer: LayerMeta) => Color;

export const solidFillBrush =
  (color: Color): Brush =>
  () =>
    color;

export const borderBrush =
  (
    size: number = 1,
    borderColor: Color = COLOR_BLACK,
    innerColor: Color = COLOR_ALPHA,
  ): Brush =>
  (index, layer) => {
    const {
      coords: [x, y],
    } = getPixelXYCoords(index, layer);
    if (y < size || layer.height - size <= y) {
      return borderColor;
    }
    if (x < size || layer.width - size <= x) {
      return borderColor;
    }
    return innerColor;
  };

export const alphaBrush = (): Brush => () => COLOR_ALPHA;
