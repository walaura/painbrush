import type { Brush, Color, LayerMeta, Layer, Coords } from "./d.ts";
import { getLayerPixelData } from "./data.ts";
import { useFont } from "../type/type.ts";
import {
  inflateLayer,
  overlayLayerOver,
  overlayLayersOver,
} from "./transforms.ts";
import { FatalError } from "../sys/report.ts";

export const solidFillBrush = (color: Color) => () => color;

/**
 * NOTE: BG Brush will run twice.
 * Once For the whole bg and then on each character box. this is fine for solid colors but anything fancier may get messy
 */
export const createTextLayer = (
  text: string,
  fgBrush: Brush = solidFillBrush([255, 255, 255]),
  bgBrush: Brush = solidFillBrush([0, 0, 0]),
): Layer => {
  const textLength = text.length;
  const {
    metrics: { monoSize },
    getCharacter,
  } = useFont("chars");

  const layerWidth = monoSize.x * textLength;
  const layerHeight = monoSize.y;

  let offsetX = 0;

  let height = 0;
  let width = 0;

  let charLayers: Parameters<typeof overlayLayersOver> = [];
  for (let character of text) {
    const char = inflateLayer(getCharacter(character), fgBrush, bgBrush);

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
  const textLayer = overlayLayersOver(...[...charLayers, [bg] as [Layer]]);

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

  for (let index = 0; index < width * height * 3; index++) {
    const { currentSubpixelElement } = getLayerPixelData(index, meta);
    data.push(brush(index, meta)[currentSubpixelElement]);
  }

  return {
    ...meta,
    data,
  };
};
