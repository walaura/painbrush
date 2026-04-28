import { encode } from "fast-bmp";
import {
  makeRectangleLayer,
  type FourChannelImage,
  type Layer,
  type SingleChannelImage,
} from "./layer.ts";
import {
  alphaBrush,
  COLOR_ALPHA,
  COLOR_BLACK,
  colorFromRgb,
  isAlphaColor,
  solidFillBrush,
  type Brush,
} from "./color.ts";
import {
  getPixelXYCoords,
  getPixelFromSingleChannelImage,
  type XYCoords,
} from "./pixel.ts";

export const toImage = (
  layer: Layer,
): Uint8Array<ArrayBufferLike> => {
  const data = layer.pixels
    .map((px) => {
      const r = (px >> 24) & 0xff;
      const g = (px >> 16) & 0xff;
      const b = (px >> 8) & 0xff;

      if (isAlphaColor(px)) {
        return [r, g, b];
      }
      const a = px & 0xff;
      return [g, b, a];
    })
    .flat();

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
export const deflateImage = (image: FourChannelImage): Layer => {
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
  const { isFourChannel, ...otherLayerStuff } = image;
  return {
    ...otherLayerStuff,
    pixels,
  };
};

/**
 * Turns a 1 bit image into a layer.
 * */
export const inflateImage = (
  layer: SingleChannelImage,
  fgBrush: Brush = solidFillBrush(COLOR_BLACK),
  bgBrush: Brush = alphaBrush(),
): Layer => {
  return makeRectangleLayer(
    { x: Math.floor(layer.width), y: Math.floor(layer.height) },
    (index, meta) => {
      const coords = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelFromSingleChannelImage(
        coords,
        layer,
      );

      return maybeTargetPixel
        ? fgBrush(index, meta)
        : bgBrush(index, meta);
    },
  );
};
export type LayerParams = {
  offset?: XYCoords;
};
