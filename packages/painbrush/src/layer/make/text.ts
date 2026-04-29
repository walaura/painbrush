import { brush, type Brush, SET_COLORS } from 'painbrush/color';
import { composeLayer, makeLayer, type Layer } from 'painbrush/layer';
import { importSingleChannelImage } from '../../image/import.ts';
import type { Font } from 'painbrush/font';

/**
 * Step through for props docs
 */
type TextLayerProps = {
  /**
   * Total pixels before truncating the text
   */
  maxLengthPx?: number;
  /**
   * Minimum width of the container
   */
  minLengthPx?: number;
  /**
   * Background behind each individual character
   */
  letterPlateBrush?: Brush;
  /**
   * Character to use to identify possible linebreaks.
   * Normally you just want a space ig??
   *  */
  breakLinesOn?: string;
};

type CharLayer = [
  Parameters<typeof composeLayer.punch>[1],
  NonNullable<Parameters<typeof composeLayer.punch>[2]>,
];

export const makeTextLayer = (
  text: string,
  font: Font,
  brushFn: Brush = brush.solidFill(SET_COLORS.BLACK),
  {
    letterPlateBrush = brush.alphaSolidFill(),
    maxLengthPx = Infinity,
    minLengthPx = 0,
    breakLinesOn = ` `,
  }: TextLayerProps = {},
): Layer => {
  const { getCharacter } = font;

  const lineHeight = getCharacter(`X`).height;

  const charLayers: CharLayer[] = [];

  const words = text
    .split(breakLinesOn)
    .map((word, idx, arr) =>
      arr.length === idx + 1 ? word : word + breakLinesOn,
    )
    .map((word) =>
      word
        .split(`\n`)
        .map((word, idx, arr) =>
          arr.length === idx + 1 ? word : [word, `\n`],
        ),
    )
    .flat(2);

  let lineOffset = 0;
  let maxWidth = 0;
  let lines = 1;
  for (const word of words) {
    const newline = () => {
      maxWidth = Math.max(lineOffset, maxWidth);
      lineOffset = 0;
      lines++;
    };
    const wordLayers = [];
    let wordOffset = 0;

    for (const character of word) {
      if (character === `\n`) {
        newline();
        continue;
      }
      const char = importSingleChannelImage(
        getCharacter(character),
        brushFn,
        letterPlateBrush,
      );

      wordLayers.push([
        char,
        wordOffset,
      ]);
      wordOffset += char.x;
    }

    const prevLineOffset = lineOffset;
    const verticalOffset = lineHeight * (lines - 1);
    lineOffset = lineOffset + wordOffset;
    if (lineOffset > maxLengthPx) {
      newline();
    }
    charLayers.push(
      ...wordLayers.map(
        (layer) =>
          [
            layer[0],
            {
              offset: {
                x: prevLineOffset + (layer[1] as number),
                y: verticalOffset,
              },
            },
          ] as CharLayer,
      ),
    );
  }

  const textLayer = makeLayer.blankWithAlpha({
    x: Math.max(minLengthPx, Math.max(lineOffset, maxWidth)),
    y: lineHeight * lines,
  });

  for (const layer of charLayers) {
    composeLayer.punch(textLayer, layer[0], layer[1]);
  }
  return textLayer;
};
