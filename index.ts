import { encode } from "fast-bmp";
import fs from "fs";
import {
  createRGBLayer,
  createTextLayer,
  solidFillBrush,
} from "./layers/draw.ts";
import { overlayLayerOver, scaleLayer } from "./layers/transforms.ts";

const bg = createRGBLayer(200, 50, () => [0, 125, 255]);

const blue = createTextLayer(
  "HELLO HI asdf",
  solidFillBrush([0, 125, 60]),
  solidFillBrush([0, 0, 120]),
);
const red = createRGBLayer(2, 2, solidFillBrush([255, 30, 40]));

const imageData = {
  ...overlayLayerOver(
    overlayLayerOver(bg, scaleLayer(blue, 1), { x: 10, y: 10 }),
    red,
    {
      x: 1,
      y: 1,
    },
  ),
  bitsPerPixel: 24,
  compression: 0,
  colorMasks: [],
  components: 1,
  yPixelsPerMeter: 2834,
  xPixelsPerMeter: 2834,
};

const encoded = encode(imageData);
fs.writeFileSync("image.bmp", encoded);
