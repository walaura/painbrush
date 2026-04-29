import {
  SET_COLORS,
  type Color,
  type Brush,
  brush,
} from 'painbrush/color';
import { composeLayer, makeLayer, type Layer } from 'painbrush/layer';
import {
  type XYCoords,
  getColor,
  getXYCoords,
} from 'painbrush/pixel';
import type { LayerMeta } from './layer.js';

export const scaleLayer = (
  source: Layer,
  { x: scaleX, y: scaleY }: XYCoords,
): Layer => {
  return makeLayer.blank(
    {
      x: ~~(source.x * scaleX),
      y: ~~(source.y * scaleY),
    },
    (index: number, meta: LayerMeta) => {
      const coords = getXYCoords(index, meta);
      const maybeTargetPixel = getColor(
        { x: ~~(coords.x / scaleX), y: ~~(coords.y / scaleY) },
        source,
      );
      return maybeTargetPixel ?? SET_COLORS.ALPHA;
    },
  );
};

export const paintLayer = (
  layer: Layer,
  painterFn: (existingColor: Color) => Brush,
): Layer => {
  const pixels = [];
  for (let index = 0; index < layer.x * layer.y; index = index + 1) {
    const newColor = painterFn(layer.pixels[index])(index, layer);
    pixels.push(newColor);
  }

  return { ...layer, pixels };
};

export const padLayer = (source: Layer, offset: XYCoords) => {
  const target = makeLayer.blankWithAlpha({
    x: source.x + offset.x * 2,
    y: source.y + offset.y * 2,
  });
  composeLayer.punch(target, source, {
    offset,
  });
  return target;
};

export const setBackgroundOfLayer = (
  source: Layer,
  bgBrush: Brush = brush.solidFill(0xff00ff),
) => composeLayer.overlay(makeLayer.blank(source, bgBrush), source);
