/**
  hex values from -1 (see alpha to 0xffffff) matching web colors
 */
export type Color = number;

/**
  This is cheeky, but this would 
  be impossible in normal colorspace and makes the math so easy
 */
export type AlphaColor = -1;

/**
  Some quick commonly used colors
 */
export const SET_COLORS = {
  ALPHA: -1 as AlphaColor,
  WHITE: 0xffffff as Color,
  BLACK: 0x000000 as Color,
  RED: 0xff0000 as Color,
  GREEN: 0x00ff00 as Color,
  BLUE: 0x0000ff as Color,
};

/**
  Alphas are a cursed implementation detail that 
  gets treated differently at blending.
  rn its just -1 but maybe in the future this can 
  be loaded with alpha depth? or not. lol that sounds cursed.
  */
export const isAlphaColor = (color: Color): color is AlphaColor => {
  return color === -1;
};

export const colorFromRgb = (
  r: number,
  g: number,
  b: number,
): Color => {
  return (r << 16) | (g << 8) | b;
};

/**
  Hex to RGB
 */
export const colorToRgb = (
  color: Color,
): [number, number, number] => {
  const r = (color >> 24) & 0xff;
  const g = (color >> 16) & 0xff;
  const b = (color >> 8) & 0xff;

  if (isAlphaColor(color)) {
    return [r, g, b];
  }
  const a = color & 0xff;
  return [g, b, a];
};

/**
  Layers use this to mix two colors together. 
  this is where the alpha magic happens and where blend modes can go
 */
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

export const makeRandomColor = (r: number) => {
  return ~~(r * 0xffffff);
};
