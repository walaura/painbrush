import { decode } from "fast-bmp";
import { deflateImage, inflateImage } from "../image.ts";
import type { Layer } from "../layer.ts";

export const makeImageLayer = (
  buffer: Buffer<ArrayBuffer>,
): Layer => {
  const imageData = decode(buffer);

  if (imageData.bitsPerPixel === 1) {
    console.warn(
      "Inflating 1bit image to 24. Will use default colors in inflateImage",
    );
    return inflateImage({
      //@ts-expect-error
      data: [...imageData.data],
      ...imageData,
      isSingleChannel: true,
    });
  }
  if (imageData.bitsPerPixel === 24) {
    // @ts-expect-error
    return deflateImage({
      ...imageData,
      data: [...imageData.data],
    });
  }

  if (imageData.bitsPerPixel === 32) {
    console.warn(
      "Deflating 32bit image to 24bit. Alpha will be guessed (did u know bmps have alpha??)",
    );
    return deflateImage({
      ...imageData,
      data: [...imageData.data],
      channels: imageData.channels as 3 | 4,
    });
  }

  throw new Error(
    `Unsupported image type (${imageData.bitsPerPixel}bpp), try using fast-bmp alone to get a 1/24/32 bit buffer`,
  );
};
