import { readFile, writeFile } from "fs/promises";
import {
  borderBrush,
  isAlphaColor,
  solidFillBrush,
} from "painbrush/color";
import type { Color } from "painbrush/color";
import { toImage } from "painbrush/image";
import {
  makeRectangleLayer,
  scaleLayer,
  makeTextLayer,
  overlayLayersOver,
  makeImageLayer,
  paintLayer,
  makeBlankLayer,
  overlayLayerOver,
} from "painbrush/layer";
import { getPixelXYCoords } from "painbrush/pixel";
import { loadBuiltInFont, loadFont } from "painbrush/typography";
import type { Layer } from "../painbrush/src/_.js";

let b = window.lolw.value;
window.lolw.oninput = (a) => {
  b = a.target.value;
  requestAnimationFrame(() => {
    draw();
  });
};
let c = window.lolw2.value;
window.lolw2.oninput = (a) => {
  c = a.target.value;
  requestAnimationFrame(() => {
    draw();
  });
};
const draw = async () => {
  const rect = makeRectangleLayer([280, 360], (index, layer) => {
    const {
      coords: [x, y],
    } = getPixelXYCoords(index, layer);
    return [
      (x / layer.width) * 255,
      (y / layer.height) * 255,
      b,
    ] as Color;
  });

  const boxy = makeRectangleLayer(
    [10, c],
    solidFillBrush([0, 255, 0]),
  );
  const buf = toImage(overlayLayerOver(rect, boxy));

  window.lol.src = `data:image/bmp;base64,${Buffer.from(buf).toString("base64")}`;
};
draw();
