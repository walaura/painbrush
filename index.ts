import { encode } from "fast-bmp";
import fs from "fs";
import chars from "./font/chars.json" with { type: "json" };
import { getLayerPixelData, getPixelFromLayer } from "./layers/data.ts";
import { createRGBLayer, solidFillBrush } from "./layers/draw.ts";
import type { Coords, Layer, RGBLayer } from "./layers/d.ts";
import { overlayLayerOver } from "./layers/transforms.ts";

const CHAR_HEIGHT = 8;
const CHAR_WIDTH = 6;

const SUBPIXELS = 3;

const text = Date.now().toString();
const TEXT_SIZE = [...text].length;

const LAYER_WIDTH = TEXT_SIZE * CHAR_WIDTH;
const LAYER_HEIGHT = CHAR_HEIGHT;

let pxData = [];

//const character = chars.characters[1];

for (let index = 0; index < LAYER_WIDTH * LAYER_HEIGHT * 3; index++) {
  const {
    x: pixelX,
    y: pixelY,
    currentSubpixelElement,
  } = getLayerPixelData(index, {
    width: LAYER_WIDTH,
    height: LAYER_HEIGHT,
    channels: 3,
  });

  const charX = Math.floor(pixelX / CHAR_WIDTH);

  const charXPixelOffset = pixelX - charX * CHAR_WIDTH;
  const charYPixelOffset = pixelY - 0 * CHAR_HEIGHT;

  const charPixelPos = charXPixelOffset + charYPixelOffset * CHAR_WIDTH;

  const character = chars.characters[text[charX]];
  pxData.push(
    (character[charPixelPos] ? [255, 0, 255] : [0, 0, 0])[
      currentSubpixelElement
    ],
  );
}

const blue = createRGBLayer(4, 4, solidFillBrush([0, 30, 200]));
const red = createRGBLayer(2, 2, solidFillBrush([255, 30, 40]));

const imageData = {
  //width: LAYER_WIDTH,
  //height: LAYER_HEIGHT,
  //data,
  //channels: 3,
  ...overlayLayerOver(blue, red, { x: 1, y: 1 }),
  bitsPerPixel: 24,
  compression: 0,
  colorMasks: [],
  components: 1,
  yPixelsPerMeter: 2834,
  xPixelsPerMeter: 2834,
};

const encoded = encode(imageData);
fs.writeFileSync("image.bmp", encoded);
