import { encode } from "fast-bmp";
import {
  makeRectangleLayer,
  type MultiChannelImage,
  type Layer,
  type SingleChannelImage,
} from "./layer.ts";
import {
  alphaBrush,
  COLOR_ALPHA,
  COLOR_BLACK,
  colorFromRgb,
  colorToRgb,
  solidFillBrush,
  type Brush,
} from "./color.ts";
import { type XYCoords } from "./pixel.ts";

export const toImage = (
  layer: Layer,
): Uint8Array<ArrayBufferLike> => {
  const data = [];

  for (const pixel of layer.pixels) {
    data.push(...colorToRgb(pixel));
  }

  const encoded = encode({
    ...layer,
    bitsPerPixel: 24,
    compression: 0,
    colorMasks: [],
    components: 1,
    channels: 3,
    data: new Uint8Array(data),
  });

  return encoded;
};

/**
 * Turns a bmp image into a layer.
 * */
export const deflateImage = (image: MultiChannelImage): Layer => {
  let pixels = [];
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
  const { width, height } = image;
  return {
    __isLayer: true as const,
    id: Math.random(),
    width,
    height,
    pixels,
  };
};

/**
 * Turns a 1 bit image into a layer.
 * */
export const inflateImage = (
  image: SingleChannelImage,
  fgBrush: Brush = solidFillBrush(COLOR_BLACK),
  bgBrush: Brush = alphaBrush(),
): Layer => {
  return makeRectangleLayer(
    { x: Math.floor(image.width), y: Math.floor(image.height) },
    (index, meta) => {
      return image.data[index]
        ? fgBrush(index, meta)
        : bgBrush(index, meta);
    },
  );
};
export type LayerParams = {
  offset?: XYCoords;
};
