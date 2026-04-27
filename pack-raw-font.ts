#!/usr/bin/env node

import { program } from "commander";
import { decode } from "fast-bmp";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { makeTextLayer } from "./src/layer/make-text.ts";
import { toImage } from "./src/image.ts";
import { solidFillBrush } from "./src/color/brush.ts";
import { type Color } from "./src/color/utils.ts";
import { padLayer } from "./src/layer/transform.ts";
import type { FontMetrics, PxFontFile } from "./src/typography.ts";

program.requiredOption(
  "-n, --name <font-name>",
  "name of the font in /raw-fonts/ - make sure theres a bmp and json",
);
program.option("-p, --print", "Show the font characters");
program.parse();

const options = program.opts();
const FONT_NAME = options.name;

/**
 * This needs to be an indexed 1 bit bmp
 * good luck lololololol
 * I used aseprite on indexed color
 */
const img = await readFile("./raw-fonts/" + FONT_NAME + ".bmp");
type FontMetaJSON = {
  metrics: FontMetrics;
  cols: number;
  /**
   * row-separated array of strings representing the characters shown in the bmp
   */
  alphabet: string[];
  /**
   * Keyed object specifying how many trailing horizontal pixel columns to trim from the character, for narrow characters
   */
  trim: {
    [key: string]: number;
  };
  /**
   * Configure how the specimen image will show up
   */
  specimen: {
    color: Color;
    background: Color;
  };
};

const fontMeta = JSON.parse(
  (await readFile("./raw-fonts/" + FONT_NAME + ".json")).toString(),
) as FontMetaJSON;

const { metrics } = fontMeta;

const data = decode(img);
const rawCharacters: (0 | 1)[][] = [[]];

const colspan = fontMeta.cols * metrics.width;

(data.data as Uint8Array).forEach((item, index) => {
  const pixelX = index % colspan;
  const pixelY = Math.floor(index / colspan);

  const charX = Math.floor(pixelX / metrics.width);
  const charY = Math.floor(pixelY / metrics.height);

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

const print = (c: any[]) => {
  c.forEach((element, index) => {
    process.stdout.write(`${element ? "X" : " "}`);
    if (index % metrics.width === 0) {
      console.log("");
    }
  });
};

const alphabet = fontMeta.alphabet.join("");

const characters = rawCharacters.map((char, index) => {
  const letter = alphabet[index];
  if (options.print) {
    print(char);
    console.log("- " + letter);
  }

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

await writeFile(
  "./fonts/" + FONT_NAME + ".pxfont",
  JSON.stringify(
    {
      metrics,
      alphabet,
      characters,
    } as PxFontFile,
    null,
    2,
  ),
);

const specimenImg = padLayer(
  await makeTextLayer(
    FONT_NAME.toUpperCase() +
      "\n" +
      "\n" +
      "? " +
      alphabet
        .split("")
        .map((s) => s.trim())
        .filter(Boolean)
        .sort()
        .join(""),
    solidFillBrush(fontMeta.specimen?.color ?? [0, 0, 0]),
    {
      maxLength: metrics.width * 12,
    },
  ),
  [metrics.width, metrics.height],
  solidFillBrush(fontMeta.specimen?.background ?? [255, 255, 255]),
);

await writeFile(
  "./fonts/" + FONT_NAME + "-specimen.bmp",
  toImage(specimenImg),
);
