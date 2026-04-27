import { decode } from "fast-bmp";
import { deflateLayer, inflateLayer } from "./transform.ts";
import { FatalError, report, WarnError } from "../sys/report.ts";
import type { Layer } from "../_d.ts";

export const makeImageLayer = (
  buffer: Buffer<ArrayBuffer>,
): Layer => {
  const imageData = decode(buffer);

  if (imageData.bitsPerPixel === 1) {
    report(() => {
      throw new WarnError(
        "Inflating 1bit image to 24" +
          "\n" +
          "will use default colors in inflateLayer",
      );
    });
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
    report(() => {
      throw new WarnError(
        "Deflating 32 image to 24" +
          "\n" +
          "alpha will be discarded (did u know bmps have alpha??)",
      );
    });
    return deflateLayer({
      ...imageData,
      data: [...imageData.data],
      isFourChannel: true,
      id: Math.random(),
    });
  }

  throw new FatalError(
    `Unsupported image type (${imageData.bitsPerPixel}bpp), try using fast-bmp alone to get a 1/24/32 bit buffer`,
  );
};
