import fs from "fs";
import { createLayer, createTextLayer } from "./src/layer/create.ts";
import {
  solidFillBrush,
  transparentBrush,
  type Color,
} from "./src/color.ts";
import { scaleLayer } from "./src/layer/transform.ts";
import { overlayLayersOver } from "./src/layer/transform.ts";
import { getPixelXYCoords } from "./src/pixel.ts";
import { toImage } from "./src/image.ts";

const bg = createLayer([360, 360], (index, layer) => {
  const {
    pos: [x, y],
  } = getPixelXYCoords(index, layer);
  return [
    (x / layer.width) * 255,
    (y / layer.height) * 255,
    255,
  ] as Color;
});

const text = scaleLayer(
  await createTextLayer(
    "the quick brown fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    solidFillBrush([255, 255, 255]),
    {
      maxLength: 110,
      bgPlateBrush: (index, layer) => {
        return transparentBrush()();
        const {
          pos: [x, y],
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
  await createTextLayer(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG",
    solidFillBrush([255, 255, 255]),
  ),
  [1, 1],
);
// const textShadow = paintLayer(text, (existingColor) =>
//   isAlphaColor(existingColor)
//     ? () => existingColor
//     : solidFillBrush([255, 255, 255]),
// );
const date = await createTextLayer(
  Date.now().toString(),
  solidFillBrush([255, 255, 255]),
);
const sun = createLayer([30, 30], solidFillBrush([255, 255, 0]));

const layers = overlayLayersOver(
  [text, { offset: [10, 10] }],
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

fs.writeFileSync("image.bmp", toImage(layers));
