import {
  COLOR_ALPHA,
  type Color,
  type Brush,
  brush,
} from '../../color.ts';
import {
  makeLayer,
  type Layer,
  type LayerMeta,
} from '../../layer.ts';
import {
  type XYCoords,
  getPixelXYCoords,
  getPixelColor,
} from '../../pixel.ts';
import { punchLayerOver, overlayLayerOver } from './compose.ts';
import {
  makeBlankLayer,
  makeBlankLayerWithAlpha,
} from './make/blank.ts';

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
      const coords = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelColor(
        { x: ~~(coords.x / scaleX), y: ~~(coords.y / scaleY) },
        source,
      );
      return maybeTargetPixel ?? COLOR_ALPHA;
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
  const target = makeBlankLayerWithAlpha({
    x: source.x + offset.x * 2,
    y: source.y + offset.y * 2,
  });
  punchLayerOver(target, source, {
    offset,
  });
  return target;
};

export const setBackgroundOfLayer = (
  source: Layer,
  bgBrush: Brush = brush.solidFill(0xff00ff),
) => overlayLayerOver(makeBlankLayer(source, bgBrush), source);
