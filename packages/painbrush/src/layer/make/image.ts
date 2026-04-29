import { decode } from 'fast-bmp';
import {
  importMultiChannelImage,
  importSingleChannelImage,
} from '../../image/import.ts';
import type { Layer } from 'painbrush/layer';
import type {
  MultiChannelImage,
  SingleChannelImage,
} from '../../image/image.js';

export const makeImageLayer = (
  buffer: Buffer<ArrayBuffer>,
): Layer => {
  const imageData = decode(buffer);

  if (imageData.bitsPerPixel === 1) {
    console.warn(
      `Inflating 1bit image to 24. Will use default colors in importSingleChannelImage`,
    );
    return importSingleChannelImage({
      ...imageData,
      // @ts-expect-error this array sucks
      data: [...imageData.data],
    } as SingleChannelImage);
  }

  if (imageData.bitsPerPixel === 24) {
    return importMultiChannelImage({
      ...imageData,
      data: [...imageData.data],
    } as MultiChannelImage);
  }

  if (imageData.bitsPerPixel === 32) {
    console.warn(
      `Deflating 32bit image to 24bit. Alpha will be guessed (did u know bmps have alpha??)`,
    );
    return importMultiChannelImage({
      ...imageData,
      data: [...imageData.data],
    } as MultiChannelImage);
  }

  throw new Error(
    `Unsupported image type (${imageData.bitsPerPixel}bpp), try using fast-bmp alone to get a 1/24/32 bit buffer`,
  );
};
