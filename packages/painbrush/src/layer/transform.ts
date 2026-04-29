import {
  SET_COLORS,
  type Color,
  type Brush,
  brush,
} from 'painbrush/color';
import { composeLayer, makeLayer, type Layer } from 'painbrush/layer';
import {
  COORDS_ZERO,
  type XYCoords,
  getColor,
  getXYCoords,
} from 'painbrush/pixel';
import type { LayerMeta } from './layer.js';
import { getPixelColor, getPixelXYCoords } from '../pixel.ts';

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

export const stack =
  (stackAxis: keyof XYCoords) =>
  (sources: Layer[], gap: number = 0) => {
    const counterAxis: keyof XYCoords = stackAxis === 'x' ? 'y' : 'x';
    const stackAxisLength = sources.reduce((a, b, c) => {
      // add them up
      return (
        a +
        (c === sources.length - 1 ? b[stackAxis] : b[stackAxis] + gap)
      );
    }, 0);

    const counterAxisLength = Math.max(
      ...sources.map((s) => s[counterAxis]),
    );

    const bg = makeLayer.blankWithAlpha({
      [counterAxis]: counterAxisLength,
      [stackAxis]: stackAxisLength,
    } as unknown as XYCoords);

    let spacing = 0;
    for (const source of sources) {
      composeLayer.punch(bg, source, {
        offset: {
          [counterAxis]: 0,
          [stackAxis]: spacing,
        } as unknown as XYCoords,
      });
      spacing += source[stackAxis] + gap;
    }

    return bg;
  };

export const rotate = (source: Layer, tilt: 0 | 90 | 180 | 270) => {
  switch (tilt) {
    case 90: {
      return makeLayer.blank(
        { x: source.y, y: source.x },
        (index, layer) => {
          const currentCoords = getPixelXYCoords(index, layer);

          return getPixelColor(
            {
              x: layer.y - 1 - currentCoords.y,
              y: layer.x - 1 - currentCoords.x,
            },
            source,
          ) as Color;
        },
      );
    }
    case 180: {
      return makeLayer.blank(source, (index, layer) => {
        const currentCoords = getPixelXYCoords(index, layer);

        return getPixelColor(
          {
            y: layer.y - 1 - currentCoords.y,
            x: layer.x - 1 - currentCoords.x,
          },
          source,
        ) as Color;
      });
    }
    case 270: {
      return makeLayer.blank(
        { x: source.y, y: source.x },
        (index, layer) => {
          const currentCoords = getPixelXYCoords(index, layer);
          return getPixelColor(
            {
              x: currentCoords.y,
              y: currentCoords.x,
            },
            source,
          ) as Color;
        },
      );
    }
    default: {
      return source;
    }
  }
};

export const cropLayer = (
  source: Layer,
  newDimensions: XYCoords,
  {
    offset = COORDS_ZERO,
  }: {
    offset?: XYCoords;
  } = {},
) => {
  return makeLayer.blank(newDimensions, (index, target) => {
    const coords = getXYCoords(index, target);
    const colorFromSource = getPixelColor(
      {
        x: coords.x - offset.x,
        y: coords.y - offset.y,
      },
      source,
    );

    return colorFromSource ?? SET_COLORS.ALPHA;
  });
};
