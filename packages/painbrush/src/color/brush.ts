import type { LayerMeta } from "../_.js";
import { getPixelXYCoords } from "../pixel.ts";
import {
  type Color,
  type AlphaColor,
  COLOR_ALPHA,
  COLOR_BLACK,
} from "./utils.ts";

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

export const transparentBrush = (): Brush => () => COLOR_ALPHA;
