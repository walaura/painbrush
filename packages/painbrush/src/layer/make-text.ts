import { inflateLayer } from "./transform.ts";
import { overlayLayersOver } from "./transform.ts";

import {
  solidFillBrush,
  alphaBrush,
  type Brush,
} from "../color/brush.ts";
import { makeRectangleLayer } from "./make-rectangle.ts";
import type { Font } from "../typography.ts";
import type { Layer } from "../layer.ts";

type TextLayerProps = {
  /**
   * Total pixels before truncating the text
   */
  maxLengthPx?: number;
  /**
   * Background behind each individual character
   */
  letterPlateBrush?: Brush;
  /**
   * Background for the whole bounding box of the text
   *  */
  bgPlateBrush?: Brush;
  /**
   * Character to use to identify possible linebreaks.
   * Normally you just want a space ig??
   *  */
  breakLinesOn?: string;
};

/**
 * Writes the text
 */
export const makeTextLayer = (
  text: string,
  font: Font,
  brush: Brush = solidFillBrush([255, 255, 255]),
  {
    letterPlateBrush = alphaBrush(),
    bgPlateBrush = alphaBrush(),
    maxLengthPx = Infinity,
    breakLinesOn = " ",
  }: TextLayerProps = {},
): Layer => {
  const { getCharacter } = font;

  const lineHeight = getCharacter("X").height;

  let charLayers: Parameters<typeof overlayLayersOver> = [];

  const words = text
    .split(breakLinesOn)
    .map((word, idx, arr) =>
      arr.length === idx + 1 ? word : word + breakLinesOn,
    )
    .map((word) =>
      word
        .split("\n")
        .map((word, idx, arr) =>
          arr.length === idx + 1 ? word : [word, "\n"],
        ),
    )
    .flat(2);

  let lineOffset = 0;
  let maxWidth = 0;
  let lines = 1;
  for (let word of words) {
    const newline = () => {
      maxWidth = Math.max(lineOffset, maxWidth);
      lineOffset = 0;
      lines++;
    };
    let wordLayers = [];
    let wordOffset = 0;

    for (let character of word) {
      if (character === "\n") {
        newline();
        continue;
      }
      const char = inflateLayer(
        getCharacter(character),
        brush,
        letterPlateBrush,
      );

      wordLayers.push([
        char,
        wordOffset,
      ]);
      wordOffset += char.width;
    }

    const prevLineOffset = lineOffset;
    const verticalOffset = lineHeight * (lines - 1);
    lineOffset = lineOffset + wordOffset;
    if (lineOffset > maxLengthPx) {
      newline();
    }
    charLayers.push(
      ...(wordLayers.map((layer) => [
        layer[0],
        {
          offset: [
            prevLineOffset + (layer[1] as number),
            verticalOffset,
          ],
        },
      ]) as Parameters<typeof overlayLayersOver>),
    );
  }

  let bg = makeRectangleLayer(
    [
      (maxWidth = Math.max(lineOffset, maxWidth)),
      lineHeight * lines,
    ],
    bgPlateBrush,
  );
  const textLayer = overlayLayersOver(
    ...[...charLayers, [bg] as [Layer]],
  );

  if (textLayer == null) {
    throw new Error("No text layers");
  }
  return textLayer;
};
