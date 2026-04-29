/*
eslint-disable no-restricted-imports
*/

import {
  alphaBrush,
  borderBrush,
  solidFillBrush,
} from '../src/color/brush.ts';
import {
  colorFromRgb,
  colorToRgb,
  makeRandomColor as makeRandomColor_INTERNAL,
  isAlphaColor as isAlphaColor_INTERNAL,
  SET_COLORS,
} from '../src/color/color.ts';

export { type Brush } from '../src/color/brush.ts';
export { type Color } from '../src/color/color.ts';

export const brush = {
  /**
  Paints the whole area in a single color. fast.
  */
  solidFill: solidFillBrush,
  /**
  Paints a border of x size
  */
  border: borderBrush,
  /**
  Paints a whole area in alpha
  */
  alphaSolidFill: alphaBrush,
};

export const convertColor = {
  /**
  RGB to Hex color
  */
  fromRGB: colorFromRgb,
  /**
  Hex color to RGB
  */
  toRGB: colorToRgb,
};

/**
Makes a random color using the layer id.
*/
export const makeRandom = makeRandomColor_INTERNAL;

/**
Checks if a color is alpha
*/
export const isAlpha = isAlphaColor_INTERNAL;

export { SET_COLORS };
