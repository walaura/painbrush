import { brush, type Brush, SET_COLORS } from 'painbrush/color';
import type { Layer } from 'painbrush/layer';
import type { XYCoords } from 'painbrush/pixel';

export const makeBlankLayer = (
  size: XYCoords,
  brushFn: Brush = brush.solidFill(SET_COLORS.BLACK),
): Layer => {
  const pixels = [];
  const meta = {
    ...size,
    id: Math.random(),
    __isLayer: true as const,
  };

  for (let index = 0; index < size.x * size.y; index = index + 1) {
    pixels.push(brushFn(index, meta));
  }

  return {
    ...meta,
    pixels,
  };
};

export const makeBlankLayerWithAlpha = (coords: XYCoords) =>
  makeBlankLayer(coords, brush.alphaSolidFill());
