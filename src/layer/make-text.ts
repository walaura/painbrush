import type { Layer } from "../_d.ts";
import { useFont } from "../typography.ts";
import { inflateLayer } from "./transform.ts";
import { overlayLayersOver } from "./transform.ts";
import { FatalError } from "../sys/report.ts";
import {
  solidFillBrush,
  transparentBrush,
  type Brush,
} from "../color/brush.ts";
import { makeRectangleLayer } from "./make-rectangle.ts";

type TextLayerProps = {
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
};

/**
 * Writes the text, for now in the default and only font
 */
export const makeTextLayer = async (
  text: string,
  brush: Brush = solidFillBrush([255, 255, 255]),
  {
    letterPlateBrush = transparentBrush(),
    bgPlateBrush = transparentBrush(),
    maxLength = Infinity,
  }: TextLayerProps = {},
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

    const newline = () => {
      maxWidth = Math.max(offsetX, maxWidth);
      offsetX = 0;
      lines++;
    };

    /* 
    lazy newlines on char for now, 
    commit the line sizes and move on 
    */
    const nextOffsetX = offsetX + char.width;
    if (nextOffsetX > maxLength) {
      newline();
    }
    if (character === "\n") {
      newline();
      continue;
    }

    charLayers.push([
      char,
      {
        offset: [offsetX, lineHeight * (lines - 1)],
      },
    ]);
    offsetX += char.width;
  }

  let bg = makeRectangleLayer(
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
