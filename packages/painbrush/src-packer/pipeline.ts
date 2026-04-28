import path from "path";
import { decode } from "fast-bmp";
import { solidFillBrush } from "../src/color.ts";
import { toImage } from "../src/image.ts";
import {
  padLayer,
  makeTextLayer,
  overlayLayerOver,
  makeRectangleLayer,
} from "../src/layer.ts";
import { type PxFontFile, useFont } from "../src/typography.ts";
import type {
  PackerCharacter,
  PackerCharactersWithTrim,
  PackerFileOp,
  PackerIntakeData,
} from "./_.js";

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

    let newChar = [];
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
  { fontName, fontMeta }: PackerIntakeData,
): PackerFileOp<string> => {
  const fontFileAt = path.join(
    process.cwd() + "/fonts/" + fontName + ".pxfont",
  );
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
  [filename, pxFontFile]: PackerFileOp<string>,
  { fontName, fontMeta }: PackerIntakeData,
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
      solidFillBrush(fontMeta.specimen?.color ?? [0, 0, 0]),
      {
        maxLengthPx: fontMeta.metrics.width * 12,
        breakLinesOn: "", // break on anything
      },
    ),
    { x: fontMeta.metrics.width, y: fontMeta.metrics.height },
  );

  const specimenImg = overlayLayerOver(
    makeRectangleLayer(
      {
        x: specimenImgPd.width,
        y: specimenImgPd.height,
      },
      solidFillBrush(
        fontMeta.specimen?.background ?? [255, 255, 255],
      ),
    ),
    specimenImgPd,
  );

  const specimenFileAt = path.join(
    process.cwd() + "/fonts/" + fontName + "-specimen.bmp",
  );

  return [specimenFileAt, toImage(specimenImg)];
};
