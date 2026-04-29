import path from "path/posix";
import { decode } from "fast-bmp";
import {
  COLOR_BLACK,
  COLOR_WHITE,
  colorFromRgb,
  solidFillBrush,
} from "../src/color.ts";
import { toImage } from "../src/image.ts";
import {
  padLayer,
  makeTextLayer,
  overlayLayerOver,
  makeBlankLayer,
} from "../src/layer.ts";
import { type PxFontFile, useFont } from "../src/typography.ts";
import type {
  PackerCharacter,
  PackerCharactersWithTrim,
  PackerFileOp,
  PackerIntakeData,
} from "../dist/src-packer/helpers.js";

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

    rawCharacters[charPos][charPixelPos] = item as 0 | 1;
  });

  const alphabet = fontMeta.alphabet.join("");

  return rawCharacters.map((char, index) => {
    const letter = alphabet[index];

    const maybeTrim =
      fontMeta.trim[letter] ?? fontMeta.trim["__DEFAULT__"];
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
    return [metrics.width - maybeTrim, newChar];
  });
};

export const generatePxFontFile = (
  characters: PackerCharactersWithTrim,
  { fontName, fontMeta, cwd, outDir }: PackerIntakeData,
): PackerFileOp<string> => {
  const fontFileAt = path.join(cwd, outDir, fontName + ".pxfont");
  const alphabet = fontMeta.alphabet.join("");
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
  const alphabet = fontMeta.alphabet.join("");

  const specimenImgPd = padLayer(
    await makeTextLayer(
      fontName.toUpperCase() +
        "\n" +
        "\n" +
        "? " +
        alphabet
          .split("")
          .map((s) => s.trim())
          .filter(Boolean)
          .sort()
          .join(""),
      await useFont(Promise.resolve(pxFontFile)),
      solidFillBrush(
        fontMeta.specimen?.color
          ? colorFromRgb(...fontMeta.specimen.color)
          : COLOR_BLACK,
      ),
      {
        maxLengthPx: fontMeta.metrics.width * 12,
        breakLinesOn: "", // break on anything
      },
    ),
    { x: fontMeta.metrics.width, y: fontMeta.metrics.height },
  );

  const specimenImg = overlayLayerOver(
    makeBlankLayer(
      {
        x: specimenImgPd.x,
        y: specimenImgPd.y,
      },
      solidFillBrush(
        fontMeta.specimen?.background
          ? colorFromRgb(...fontMeta.specimen.background)
          : COLOR_WHITE,
      ),
    ),
    specimenImgPd,
  );

  const specimenFileAt = path.join(
    cwd,
    outDir,
    fontName + "-specimen.bmp",
  );

  return [specimenFileAt, toImage(specimenImg)];
};
