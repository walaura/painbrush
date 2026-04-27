import type { Layer, Coords } from "./d.ts";
import { getLayerPixelData } from "./data.ts";
import { useFont } from "../type/type.ts";
import { inflateLayer } from "./transform-layer.ts";
import { overlayLayersOver } from "./transform-layer.ts";
import { FatalError } from "../sys/report.ts";
import {
  blendColor,
  solidFillBrush,
  transparentBrush,
  type Brush,
} from "./brush.ts";

/**
 * Writes the text , for now in the default and only font
 */
export const createTextLayer = (
  text: string,
  fgBrush: Brush = solidFillBrush([255, 255, 255]),
  bgBrush: Brush = transparentBrush(),
): Layer => {
  const { getCharacter } = useFont("chars");

  let offsetX = 0;

  let height = 0;
  let width = 0;

  let charLayers: Parameters<typeof overlayLayersOver> = [];

  for (let character of text) {
    const char = inflateLayer(
      getCharacter(character),
      fgBrush,
      bgBrush,
    );

    /* height is constant per line */
    height = Math.max(height, char.height);

    /* width always grows */
    width += char.width;

    charLayers.push([
      char,
      {
        offset: [offsetX, 0],
      },
    ]);
    offsetX += char.width;
  }

  let bg = createLayer([width, height], bgBrush);
  const textLayer = overlayLayersOver(
    ...[...charLayers, [bg] as [Layer]],
  );

  if (textLayer == null) {
    throw new FatalError("No text layers");
  }
  return textLayer;
};

/**
This makes a rectangle with any fill. useful for your initial canvas
*/
export const createLayer = (
  [width, height]: Coords,
  brush: Brush = solidFillBrush([255, 255, 255]),
): Layer => {
  let data = [];
  const meta = { width, height, channels: 3 };

  for (let index = 0; index < width * height * 3; index = index + 3) {
    const color = blendColor(null, brush(index, meta));
    data.push(color[0]);
    data.push(color[1]);
    data.push(color[2]);
  }

  return {
    ...meta,
    data,
  };
};
