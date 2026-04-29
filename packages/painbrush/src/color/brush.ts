import type { LayerMeta } from '../layer.ts';
import { getPixelXYCoords } from '../pixel.ts';
import { type Color, COLOR_ALPHA, COLOR_BLACK } from '../color.ts';

/**
  Anything that paints on a layer is a brush 
  function. Brushes get the pixel position 
  and layer metadata and decide what color to paint.

  Normally you just wanna use a solid color and 
  theres solidFillBrush for that. check out 
  other builtins in this file.
  */
export type Brush = (index: number, layer: LayerMeta) => Color;

/**
  Paints the whole area in a single color. fast.
  */
export const solidFillBrush =
  (color: Color): Brush =>
    () =>
      color;

/**
  Paints a border of x size
  */
export const borderBrush =
  (
    size: number = 1,
    borderColor: Color = COLOR_BLACK,
    innerColor: Color = COLOR_ALPHA,
  ): Brush =>
    (index, layer) => {
      const { x, y } = getPixelXYCoords(index, layer);
      if (y < size || layer.y - size <= y) {
        return borderColor;
      }
      if (x < size || layer.x - size <= x) {
        return borderColor;
      }
      return innerColor;
    };

/**
  Paints a whole area in alpha
  */
export const alphaBrush = (): Brush => () => COLOR_ALPHA;
