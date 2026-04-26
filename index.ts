import { encode } from "fast-bmp";
import fs from "fs";
import {
  createRGBLayer,
  createTextLayer,
  solidFillBrush,
} from "./layers/draw.ts";
import { overlayLayerOver } from "./layers/transforms.ts";

const bg = createRGBLayer(200, 50);

const blue = createTextLayer(
  Date.now().toString() + "0sdsd02f1",
  solidFillBrush([0, 125, 60]),
  solidFillBrush([0, 0, 120]),
);
const red = createRGBLayer(2, 2, solidFillBrush([255, 30, 40]));

const imageData = {
  ...overlayLayerOver(overlayLayerOver(bg, blue, { x: 10, y: 10 }), red, {
    x: 1,
    y: 1,
  }),
  bitsPerPixel: 24,
  compression: 0,
  colorMasks: [],
  components: 1,
  yPixelsPerMeter: 2834,
  xPixelsPerMeter: 2834,
};

const encoded = encode(imageData);
fs.writeFileSync("image.bmp", encoded);
