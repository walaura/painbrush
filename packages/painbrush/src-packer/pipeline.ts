import path from 'path/posix';
import { decode } from 'fast-bmp';
import type {
  PackerCharacter,
  PackerCharactersWithTrim,
  PackerFileOp,
  PackerIntakeData,
} from './helpers.ts';
// eslint-disable-next-line no-restricted-imports
import type { PxFontFile } from '../src/font/font.ts';
import { makeLayer, transformLayer } from '../api/layer.ts';
import { useFont } from '../api/font.ts';
import { brush, convertColor, SET_COLORS } from '../api/color.ts';
import { exportImage } from '../api/image.ts';

export const generateCharacters = async ({
  img,
  fontMeta,
}: PackerIntakeData): Promise<PackerCharactersWithTrim> => {
  const { metrics } = fontMeta;
  const data = decode(img);
  const rawCharacters: PackerCharacter[] = [[]];

  const colspan = fontMeta.cols * metrics.width;

  (data.data as Uint8Array).forEach((item, index) => {
    const pixelX = index % colspan;
    const pixelY = ~~(index / colspan);

    const charX = ~~(pixelX / metrics.width);
    const charY = ~~(pixelY / metrics.height);

    const charXPixelOffset = pixelX - charX * metrics.width;
    const charYPixelOffset = pixelY - charY * metrics.height;

    const charPos = charX + charY * fontMeta.cols;

    if (!rawCharacters[charPos]) {
      rawCharacters[charPos] = [];
    }

    const charPixelPos =
      charXPixelOffset + charYPixelOffset * metrics.width;

    rawCharacters[charPos][charPixelPos] = item as PackerCharacter[0];
  });

  const alphabet = fontMeta.alphabet.join(``);

  return rawCharacters.map((char, index) => {
    const letter = alphabet[index];

    const maybeTrim =
      fontMeta.trim[letter] ?? fontMeta.trim[`__DEFAULT__`];
    if (!maybeTrim) {
      return [metrics.width, char];
    }

    const newChar = [];
    for (let i = 0; i < char.length; i++) {
      const pos = i % metrics.width;
      if (pos < metrics.width - maybeTrim) {
        newChar.push(char[i]);
      }
    }
    return [metrics.width - maybeTrim, newChar as PackerCharacter];
  });
};

export const generatePxFontFile = (
  characters: PackerCharactersWithTrim,
  { fontName, fontMeta, cwd, outDir }: PackerIntakeData,
): PackerFileOp<string> => {
  const fontFileAt = path.join(cwd, outDir, fontName + `.pxfont`);
  const alphabet = fontMeta.alphabet.join(``);
  const metrics = fontMeta.metrics;

  return [
    fontFileAt,
    JSON.stringify(
      {
        metrics,
        alphabet,
        characters,
      } as PxFontFile,
      null,
      2,
    ),
  ];
};

export const generateSpecimenImage = async (
  [_, pxFontFile]: PackerFileOp<string>,
  { fontName, fontMeta, cwd, outDir }: PackerIntakeData,
): Promise<PackerFileOp<Uint8Array<ArrayBufferLike>>> => {
  const alphabet = fontMeta.alphabet.join(``);

  const pangram = 'Blitz prende ex-vesgo com cheque fajuto';

  const writeOut =
    fontName.toUpperCase() +
    `\n\n` +
    pangram +
    `\n\n` +
    `૴? ` +
    alphabet
      .split(``)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort()
      .join(``);

  const specimenImg = transformLayer.setBackground(
    transformLayer.pad(
      await makeLayer.text(
        writeOut,
        await useFont(Promise.resolve(pxFontFile)),
        brush.solidFill(
          fontMeta.specimen?.color
            ? convertColor.fromRGB(...fontMeta.specimen.color)
            : SET_COLORS.BLACK,
        ),
        {
          maxLengthPx: fontMeta.metrics.width * 12,
          breakLinesOn: ``, // break on anything
        },
      ),
      { x: fontMeta.metrics.width, y: fontMeta.metrics.height },
    ),
    brush.solidFill(
      fontMeta.specimen?.background
        ? convertColor.fromRGB(...fontMeta.specimen.background)
        : SET_COLORS.WHITE,
    ),
  );

  const specimenFileAt = path.join(
    cwd,
    outDir,
    fontName + `-specimen.bmp`,
  );

  return [specimenFileAt, exportImage(specimenImg)];
};
