import type { Layer, XYCoords } from "../_d.ts";
import { useFont } from "../typography/typography.ts";
import { inflateLayer } from "./transform.ts";
import { overlayLayersOver } from "./transform.ts";
import { FatalError } from "../sys/report.ts";
import {
  blendColor,
  solidFillBrush,
  transparentBrush,
  type Brush,
} from "../color.ts";

/**
 * Writes the text, for now in the default and only font
 */
export const createTextLayer = async (
  text: string,
  brush: Brush = solidFillBrush([255, 255, 255]),
  {
    letterPlateBrush = transparentBrush(),
    bgPlateBrush = transparentBrush(),
    maxLength = Infinity,
  }: {
    /**
     * Total pixels before truncating the text
     */
    maxLength?: number;
    /**
     * Background behind each individual character
     */
    letterPlateBrush?: Brush;
    /**
     * Background for the whole bounding box of the text
     *  */
    bgPlateBrush?: Brush;
  } = {},
): Promise<Layer> => {
  const { getCharacter } = await useFont("poxel");

  let offsetX = 0;

  const lineHeight = getCharacter("X").height;

  let maxWidth = 0;
  let lines = 1;

  let charLayers: Parameters<typeof overlayLayersOver> = [];

  for (let character of text) {
    const char = inflateLayer(
      getCharacter(character),
      brush,
      letterPlateBrush,
    );

    /* 
    lazy newlines on char for now, 
    commit the line sizes and move on 
    */
    const nextOffsetX = offsetX + char.width;
    if (nextOffsetX > maxLength) {
      maxWidth = Math.max(nextOffsetX, maxWidth);
      offsetX = 0;
      lines++;
    }

    charLayers.push([
      char,
      {
        offset: [offsetX, lineHeight * (lines - 1)],
      },
    ]);
    offsetX += char.width;
  }

  let bg = createLayer(
    [
      (maxWidth = Math.max(offsetX, maxWidth)),
      lineHeight * lines,
    ],
    bgPlateBrush,
  );
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
  [width, height]: XYCoords,
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
