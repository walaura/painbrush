import { encode } from "fast-bmp";
import fs from "fs";
import {
  createRGBLayer,
  createTextLayer,
  solidFillBrush,
} from "./layers/draw.ts";
import { overlayLayerOver, scaleLayer } from "./layers/transforms.ts";

const bg = createRGBLayer(360, 360, () => [0, 125, 255]);

const text = createTextLayer(
  "HELLO HI asdf",
  solidFillBrush([0, 125, 60]),
  solidFillBrush([0, 0, 120]),
);
const sun = createRGBLayer(30, 30, solidFillBrush([255, 255, 0]));

const imageData = {
  ...overlayLayerOver(
    overlayLayerOver(bg, scaleLayer(text, 4), { x: 10, y: 10 }),
    sun,
    {
      x: 20,
      y: 40,
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
