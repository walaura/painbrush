import { getXYCoords } from 'painbrush/pixel';
import type { LayerMeta } from '../layer/layer.d.ts';
import { SET_COLORS, type Color } from 'painbrush/color';

/**
  Anything that paints on a layer is a brush 
  function. Brushes get the pixel position 
  and layer metadata and decide what color to paint.

  Normally you just wanna use a solid color and 
  theres solidFillBrush for that. check out 
  other builtins in this file.
  */
export type Brush = (index: number, layer: LayerMeta) => Color;

export const solidFillBrush =
  (color: Color): Brush =>
  () =>
    color;

export const borderBrush =
  (
    size: number = 1,
    borderColor: Color = SET_COLORS.BLACK,
    innerColor: Color = SET_COLORS.ALPHA,
  ): Brush =>
  (index, layer) => {
    const { x, y } = getXYCoords(index, layer);
    if (y < size || layer.y - size <= y) {
      return borderColor;
    }
    if (x < size || layer.x - size <= x) {
      return borderColor;
    }
    return innerColor;
  };

export const alphaBrush = (): Brush => () => SET_COLORS.ALPHA;
