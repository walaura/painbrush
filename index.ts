import { encode } from "fast-bmp";
import fs from "fs";
import chars from "./font/chars.json" with { type: "json" };

const CHAR_HEIGHT = 8;
const CHAR_WIDTH = 6;

const SUBPIXELS = 3;

const text = "6969";
const TEXT_SIZE = [...text].length;

const LAYER_WIDTH = TEXT_SIZE * CHAR_WIDTH;
const LAYER_HEIGHT = CHAR_HEIGHT;

let pxData = [];

//const character = chars.characters[1];

for (let index = 0; index < LAYER_WIDTH * LAYER_HEIGHT * 3; index++) {
  const currentSubpixelElement = index % SUBPIXELS;
  const pixelIndex = Math.floor(index / SUBPIXELS);

  const pixelX = pixelIndex % LAYER_WIDTH;
  const pixelY = Math.floor(pixelIndex / LAYER_WIDTH);

  const charX = Math.floor(pixelX / CHAR_WIDTH);

  const charXPixelOffset = pixelX - charX * CHAR_WIDTH;
  const charYPixelOffset = pixelY - 0 * CHAR_HEIGHT;

  const charPixelPos = charXPixelOffset + charYPixelOffset * CHAR_WIDTH;

  const character = chars.characters[text[charX]];
  const color = pxData.push(
    (character[charPixelPos] ? [255, 0, 255] : [0, 0, 0])[
      currentSubpixelElement
    ],
  );
}

//prettier-ignore
const data = new Uint8Array(pxData);

const imageData = {
  width: LAYER_WIDTH,
  height: LAYER_HEIGHT,
  bitsPerPixel: 24,
  compression: 0,
  colorMasks: [],
  channels: 3,
  components: 1,
  data,
  yPixelsPerMeter: 2834,
  xPixelsPerMeter: 2834,
};

const encoded = encode(imageData);
fs.writeFileSync("image.bmp", encoded);
