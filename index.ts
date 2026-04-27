import { encode } from "fast-bmp";
import fs from "fs";
import {
  createLayer,
  createTextLayer,
} from "./layers/create-layer.ts";
import {
  isAlphaColor,
  solidFillBrush,
  type Color,
} from "./layers/brush.ts";
import { paintLayer, scaleLayer } from "./layers/transform-layer.ts";
import { overlayLayersOver } from "./layers/transform-layer.ts";
import { getLayerPixelData } from "./layers/data.ts";

const bg = createLayer([360, 360], (index, layer) => {
  const {
    pos: [x, y],
  } = getLayerPixelData(index, layer);
  return [
    (x / layer.width) * 255,
    (y / layer.height) * 255,
    255,
  ] as Color;
});

const text = scaleLayer(
  createTextLayer("HELLO HI asdf", solidFillBrush([0, 0, 60])),
  [3, 4],
);
const textShadow = paintLayer(text, (existingColor) =>
  isAlphaColor(existingColor)
    ? () => existingColor
    : solidFillBrush([255, 255, 255]),
);
const date = createTextLayer(
  Date.now().toString(),
  solidFillBrush([255, 255, 255]),
  solidFillBrush([0, 0, 0]),
);
const sun = createLayer([30, 30], solidFillBrush([255, 255, 0]));

const layers = overlayLayersOver(
  [text, { offset: [10, 10] }],
  [textShadow, { offset: [12, 12] }],
  [scaleLayer(date, [2, 4]), { offset: [10, text.height + 10 + 4] }],
  [sun, { offset: [100, 200] }],
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
};

const encoded = encode({
  ...imageData,
  channels: 3,
  data: new Uint8Array(imageData.data),
});
fs.writeFileSync("image.bmp", encoded);
