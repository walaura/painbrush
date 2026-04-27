#!/usr/bin/env node

import { program } from "commander";
import { decode } from "fast-bmp";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { makeTextLayer } from "./src/layer/make-text.ts";
import { toImage } from "./src/image.ts";
import { solidFillBrush } from "./src/color/brush.ts";
import { padLayer } from "./src/layer/transform.ts";
import chalk from "chalk";
import {
  printCharacter,
  reportNay,
  reportYay,
} from "./src-packer/helpers.ts";
import type { FontMetaJSON } from "./src-packer/_.js";
import path from "node:path";
import { loadFont, type PxFontFile } from "./src/typography.ts";

program.addHelpText(
  "beforeAll",
  `${chalk.cyanBright("> font packer")}
If you aren't sure how to author a font check out the docs 
or try repacking the bundled ones yourself.
You can download them from the repo!!
  `,
);
program.showHelpAfterError();
program.requiredOption(
  "-f, --font <font-name>",
  "path to the raw font files, make sure theres a bmp AND a json!!",
);
program.option(
  "-o, --out <directory>",
  "path to the output directory, your font will show up there",
  "fonts",
);
program.option(
  "-p, --print",
  "Stream the characters into the terminal during parsing",
);
program.parse();

const options = program.opts();

/**
 * This needs to be an indexed 1 bit bmp
 * good luck lololololol
 * I used aseprite on indexed color
 */

const inPath = path.join(process.cwd(), options.font);
const fontName = path.parse(options.font.split("/").pop()).name;

const { img, fontMeta } = await (async () => {
  const img = await readFile(inPath + ".bmp");

  const fontMeta = JSON.parse(
    (await readFile(inPath + ".json")).toString(),
  ) as FontMetaJSON;

  return { img, fontMeta };
})().catch((e) => {
  reportNay(`JSON/BMP for ${fontName} missing`);
  throw e;
});

reportYay(`Found bmp, json is valid`);

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

const alphabet = fontMeta.alphabet.join("");

const characters = rawCharacters.map((char, index) => {
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

if (options.print) {
  characters.forEach((char, index) => {
    printCharacter(char[1], char[0]);

    console.log("- " + alphabet[index]);
    console.log("");
  });
}

reportYay(`${characters.length} characters in ${fontName}`);

const fontFileAt = path.join(
  process.cwd() + "/fonts/" + fontName + ".pxfont",
);
await writeFile(
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
).catch((e) => {
  reportNay(
    `Font out directory does not exist at ${chalk.underline(path.parse(fontFileAt).dir)}`,
  );
  throw e;
});

reportYay(`Wrote pxfont file at ${chalk.underline(fontFileAt)}`);

const specimenImg = padLayer(
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
    await loadFont(readFile(fontFileAt)),
    solidFillBrush(fontMeta.specimen?.color ?? [0, 0, 0]),
    {
      maxLengthPx: metrics.width * 12,
      breakLinesOn: "", // break on anything
    },
  ),
  [metrics.width, metrics.height],
  solidFillBrush(fontMeta.specimen?.background ?? [255, 255, 255]),
);

const specimenFileAt = path.join(
  process.cwd() + "/fonts/" + fontName + "-specimen.bmp",
);
await writeFile(
  "./fonts/" + fontName + "-specimen.bmp",
  toImage(specimenImg),
);

reportYay(
  `Wrote specimen file at ${chalk.cyan.underline(specimenFileAt)} (check it out!)`,
);

console.log("");
reportYay(`You can now use ${chalk.yellow(fontName)} as a font`);
console.log("");
