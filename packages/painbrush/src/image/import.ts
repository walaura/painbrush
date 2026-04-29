import {
  COLOR_ALPHA,
  colorFromRgb,
  type Brush,
  COLOR_BLACK,
  brush,
} from 'painbrush/color';
import { makeLayer, type Layer } from 'painbrush/layer';
import type {
  MultiChannelImage,
  SingleChannelImage,
} from './image.js';

/**
 * Turns a bmp image into a layer.
 * */
export const importMultiChannelImage = (
  image: MultiChannelImage,
): Layer => {
  const pixels = [];
  for (let i = 0; i < [...image.data].length; i += image.channels) {
    if (image.channels === 4 && image.data[i] === 0) {
      pixels.push(COLOR_ALPHA);
      continue;
    }
    pixels.push(
      colorFromRgb(
        image.data[i],
        image.data[i + 1],
        image.data[i + 2],
      ),
    );
  }
  return {
    __isLayer: true as const,
    id: Math.random(),
    x: image.width,
    y: image.height,
    pixels,
  };
};

/**
 * Turns a 1 bit image into a layer.
 * */
export const importSingleChannelImage = (
  image: SingleChannelImage,
  fgBrush: Brush = brush.solidFill(COLOR_BLACK),
  bgBrush: Brush = brush.alphaSolidFill(),
): Layer => {
  return makeLayer.blank(
    { x: Math.floor(image.width), y: Math.floor(image.height) },
    (index, meta) => {
      return image.data[index]
        ? fgBrush(index, meta)
        : bgBrush(index, meta);
    },
  );
};
