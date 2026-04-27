import { encode } from "fast-bmp";
import fs from "fs";
import { createLayer, createTextLayer, solidFillBrush } from "./layers/draw.ts";
import {
  overlayLayerOver,
  overlayLayersOver,
  scaleLayer,
} from "./layers/transforms.ts";

const bg = createLayer(360, 360, () => [0, 125, 255]);

const text = scaleLayer(
  createTextLayer(
    "HELLO HI asdf",
    solidFillBrush([0, 125, 60]),
    solidFillBrush([0, 0, 120]),
  ),
  [8, 4],
);
const date = createTextLayer(
  Date.now().toString(),
  solidFillBrush([255, 255, 255]),
  solidFillBrush([0, 0, 0]),
);
const sun = createLayer(30, 30, solidFillBrush([255, 255, 0]));

const layers = overlayLayersOver(
  [scaleLayer(date, [2, 4]), { offset: [10, text.height + 10] }],
  [text, { offset: [10, 10] }],
  [sun],
  [bg],
);

if (layers == null) {
  throw "no layer data";
}

const imageData = {
  ...layers,
  bitsPerPixel: 24,
  compression: 0,
  colorMasks: [],
  components: 1,
  yPixelsPerMeter: 2834,
  xPixelsPerMeter: 2834,
};

const encoded = encode({
  ...imageData,
  channels: 3,
  data: new Uint8Array(imageData.data),
});
fs.writeFileSync("image.bmp", encoded);
