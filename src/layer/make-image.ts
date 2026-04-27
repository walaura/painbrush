import { decode } from "fast-bmp";
import { deflateLayer, inflateLayer } from "./transform.ts";
import type { Layer } from "../_d.ts";

export const makeImageLayer = (
  buffer: Buffer<ArrayBuffer>,
): Layer => {
  const imageData = decode(buffer);

  if (imageData.bitsPerPixel === 1) {
    console.warn(
      "Inflating 1bit image to 24. Will use default colors in inflateLayer",
    );
    return inflateLayer({
      //@ts-expect-error
      data: [...imageData.data],
      ...imageData,
      isSingleChannel: true,
      id: Math.random(),
    });
  }
  if (imageData.bitsPerPixel === 24) {
    return {
      ...imageData,
      data: [...imageData.data],
      id: Math.random(),
    } as Layer;
  }

  if (imageData.bitsPerPixel === 32) {
    console.warn(
      "Deflating 32bit image to 24bit. Alpha will be guessed (did u know bmps have alpha??)",
    );
    return deflateLayer({
      ...imageData,
      data: [...imageData.data],
      isFourChannel: true,
      id: Math.random(),
    });
  }

  throw new Error(
    `Unsupported image type (${imageData.bitsPerPixel}bpp), try using fast-bmp alone to get a 1/24/32 bit buffer`,
  );
};
