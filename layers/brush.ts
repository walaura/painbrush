/**
 *
 * TYPES!
 */

import type { LayerMeta } from "./d.ts";

/**
 * This is cheeky, but this would be impossible in normal colorspace and makes the math so easy
 */
type AlphaColor = [-1, -1, -1];
export type RGBColor = [r: number, g: number, b: number];
export type Color = RGBColor | AlphaColor;

export type Brush = (index: number, layer: LayerMeta) => Color;

/**
 *
 * BRUSHES!
 */
const ALPHA_COLOR: AlphaColor = [-1, -1, -1];
export const solidFillBrush = (color: Color) => () => color;
export const transparentBrush = () => (): Color => ALPHA_COLOR;

/**
 *
 * UTILS!
 */
export const isAlphaColor = (color: Color): color is AlphaColor => {
  return color[0] === -1;
};
export const isColorMatch = (color1: Color, color2: Color) => {
  return (
    color1[0] === color2[0] &&
    color1[1] === color2[1] &&
    color1[2] === color2[2]
  );
};

export const blendColor = (
  top: null | undefined | Color,
  bottom: Color,
): Color => {
  if (top == null) {
    return bottom;
  }
  if (isAlphaColor(top)) {
    return bottom;
  }

  return top;
};
