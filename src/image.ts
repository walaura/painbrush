import { encode } from "fast-bmp";
import type { Layer } from "./_d.ts";

export const toImage = (
  layer: Layer,
): Uint8Array<ArrayBufferLike> => {
  const imageData = {
    ...layer,
    bitsPerPixel: 24,
    compression: 0,
    colorMasks: [],
    components: 1,
  };

  const encoded = encode({
    ...imageData,
    channels: 3,
    data: new Uint8Array(imageData.data),
  });

  return encoded;
};
