import fs from "fs";
import { makeTextLayer } from "./src/layer/make-text.ts";
import { makeRectangleLayer } from "./src/layer/make-rectangle.ts";
import { type Color } from "./src/color/utils.ts";
import {
  solidFillBrush,
  transparentBrush,
} from "./src/color/brush.ts";
import { scaleLayer } from "./src/layer/transform.ts";
import { overlayLayersOver } from "./src/layer/transform.ts";
import { getPixelXYCoords } from "./src/pixel.ts";
import { toImage } from "./src/image.ts";
import { readFile, writeFile } from "fs/promises";
import { makeImageLayer } from "./src/layer/make-image.ts";

const bg = makeRectangleLayer([360, 360], (index, layer) => {
  const {
    coords: [x, y],
  } = getPixelXYCoords(index, layer);
  return [
    (x / layer.width) * 255,
    (y / layer.height) * 255,
    255,
  ] as Color;
});

const text = scaleLayer(
  await makeTextLayer(
    "the quick brown fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    "poxel",
    solidFillBrush([255, 255, 255]),
    {
      maxLength: 110,
      bgPlateBrush: (index, layer) => {
        return transparentBrush()(index, layer);
        const {
          coords: [x, y],
        } = getPixelXYCoords(index, layer);
        return [
          0,
          (x / layer.width) * 255,
          (y / layer.height) * 255,
        ] as Color;
      },
    },
  ),
  [3, 3],
);

const textHi = scaleLayer(
  await makeTextLayer(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    "poxel",
    solidFillBrush([255, 255, 255]),
  ),
  [1, 1],
);
// const textShadow = paintLayer(text, (existingColor) =>
//   isAlphaColor(existingColor)
//     ? () => existingColor
//     : solidFillBrush([255, 255, 255]),
// );
const date = await makeTextLayer(
  Date.now().toString(),
  "poxel",
  solidFillBrush([255, 255, 255]),
);
const sun = makeRectangleLayer(
  [30, 30],
  solidFillBrush([255, 255, 0]),
);

const layers = overlayLayersOver(
  [makeImageLayer(await readFile("./junk/goomba-rgb.bmp"))],
  [
    text,
    { offset: [10, 10] },
  ],
  [textHi, { offset: [10, text.height + 10] }],
  [
    scaleLayer(date, [2, 4]),
    { offset: [10, textHi.height + 10 + text.height + 10 + 4] },
  ],
  [sun, { offset: [100, 200] }],
  [bg],
);

if (layers == null) {
  throw "no layer data";
}

await writeFile("image.bmp", toImage(layers));
