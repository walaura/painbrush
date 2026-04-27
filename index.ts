import { encode } from "fast-bmp";
import fs from "fs";
import {
  createRGBLayer,
  createTextLayer,
  solidFillBrush,
} from "./layers/draw.ts";
import {
  overlayLayerOver,
  overlayLayersOver,
  scaleLayer,
} from "./layers/transforms.ts";

const bg = createRGBLayer(360, 360, () => [0, 125, 255]);

const text = createTextLayer(
  "HELLO HI asdf",
  solidFillBrush([0, 125, 60]),
  solidFillBrush([0, 0, 120]),
);
const date = createTextLayer(
  Date.now().toString(),
  solidFillBrush([255, 255, 255]),
  solidFillBrush([0, 0, 0]),
);
const sun = createRGBLayer(30, 30, solidFillBrush([255, 255, 0]));

const layers = overlayLayersOver(
  [date, { offset: [10, 50] }],
  [sun],
  [scaleLayer(text, 4), { offset: [10, 10] }],
  [bg],
);

const imageData = {
  ...overlayLayerOver(overlayLayerOver(bg, scaleLayer(text, 4), {}), sun, {
    offset: [20, 40],
  }),
  bitsPerPixel: 24,
  compression: 0,
  colorMasks: [],
  components: 1,
  yPixelsPerMeter: 2834,
  xPixelsPerMeter: 2834,
};

const encoded = encode({
  ...imageData,
  data: new Uint8Array(imageData.data),
});
fs.writeFileSync("image.bmp", encoded);
