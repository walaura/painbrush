import { type Color } from 'painbrush/color';
import { makeLayer, type Layer } from 'painbrush/layer';
import {
  COORDS_ZERO,
  getColor,
  getIndexFromCoords,
  getXYCoords,
  type XYCoords,
} from 'painbrush/pixel';
import { blendColor } from '../color/color.ts';

export type LayerComposeParams = {
  offset?: XYCoords;
};

export const punchLayerOver = (
  back: Layer,
  front: Layer,
  { offset = COORDS_ZERO }: LayerComposeParams = {},
): void => {
  const pixels = back.pixels;
  for (let index = 0; index < front.x * front.y; index = index + 1) {
    const coords = getXYCoords(index, front);
    const frontPixelColor = getColor(coords, front) as Color;

    const backPixelIndex = getIndexFromCoords(
      {
        x: coords.x + offset.x,
        y: coords.y + offset.y,
      },
      back,
    );

    pixels[backPixelIndex] = frontPixelColor;
  }
};

export const overlayLayerOver = (
  back: Layer,
  front: Layer,
  { offset = COORDS_ZERO }: LayerComposeParams = {},
) => {
  const pixels = [...back.pixels];
  for (let index = 0; index < front.x * front.y; index = index + 1) {
    const coords = getXYCoords(index, front);
    const coordsAtBack = {
      x: coords.x + offset.x,
      y: coords.y + offset.y,
    };

    const frontPixelColor = getColor(coords, front) as Color;
    const backPixelColor = getColor(coordsAtBack, back);
    if (backPixelColor === null) {
      continue;
    }

    const backPixelIndex = getIndexFromCoords(coordsAtBack, back);
    const newColor = blendColor(frontPixelColor, backPixelColor);
    pixels[backPixelIndex] = newColor;
  }

  return { ...back, pixels };
};

export const overlayLayersOver = (
  ...args: [Layer, LayerComposeParams?][]
) => {
  const flippedArgs = args.reverse();
  const first = flippedArgs.shift();
  if (first == null) {
    console.warn(`You tried to overlay 0 layers wtf`);
    return makeLayer.blankWithAlpha(COORDS_ZERO);
  }
  let [canvas, canvasParams] = first;
  if (canvasParams != null) {
    console.warn(
      `Your initial canvas had layer transform parameters.` +
        `\n` +
        `If you want to do that, place that` +
        `layer it on top of a blank non-transformed layer`,
    );
  }

  for (const arg of args) {
    canvas = overlayLayerOver(canvas, arg[0], arg[1]);
  }
  return canvas;
};
