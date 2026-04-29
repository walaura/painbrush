import { encode } from 'fast-bmp';
import { type Layer } from './layer.ts';
import { colorToRgb } from './color.ts';

/**
  Exports a layer to a bmp image, keeps size and forces 24 bit.
  See fast-bmp for more options
  */
export const toImage = (
  layer: Layer,
): Uint8Array<ArrayBufferLike> => {
  const data = [];

  for (const pixel of layer.pixels) {
    data.push(...colorToRgb(pixel));
  }

  const encoded = encode({
    width: layer.x,
    height: layer.y,
    bitsPerPixel: 24,
    compression: 0,
    colorMasks: [],
    components: 1,
    channels: 3,
    data: new Uint8Array(data),
  });

  return encoded;
};

export interface ImageMeta {
  width: number;
  height: number;
}
export interface SingleChannelImage extends ImageMeta {
  data: number[];
  channels: 1;
}
export interface MultiChannelImage extends ImageMeta {
  data: number[];
  channels: 3 | 4;
}
