/**
 * This is cheeky, but this would be impossible in normal colorspace and makes the math so easy
 */
export type AlphaColor = [-1, -1, -1];
export type RGBColor = [r: number, g: number, b: number];
export type Color = RGBColor | AlphaColor;

export const COLOR_ALPHA: AlphaColor = [-1, -1, -1];
export const COLOR_WHITE: Color = [255, 255, 255];
export const COLOR_BLACK: Color = [0, 0, 0];

/**
 * Alphas are a cursed implementation detail that gets treated differently at blending, rn its just -1,-1,-1 but maybe in the future this can be loaded with alpha depth? or not. lol that sounds cursed.
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

/**
 * Layers use this to mix two colors together. this is where the alpha magic happens and where blend modes can go
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
  const next = (seed: number) => {
    seed = Math.sin(seed) * 10000;
    return seed - ~~seed;
  };

  const g = next(r);
  const b = next(g);

  return [r, g, b].map((c) => c * 255) as Color;
};
