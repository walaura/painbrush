#!/usr/bin/env node

import { format } from "prettier";
import { program } from "commander";
import { decode } from "fast-bmp";
import { readdir, writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { makeTextLayer } from "./src/layer/make-text.ts";
import { toImage } from "./src/image.ts";
import { solidFillBrush } from "./src/color/brush.ts";
import { padLayer } from "./src/layer/transform.ts";
import type { PxFontFile } from "./src/typography.ts";
import chalk from "chalk";
import { printCharacter } from "./src-packer/helpers.ts";
import type { FontMetaJSON } from "./src-packer/_.js";
import path from "node:path";

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
  "-n, --name <font-name>",
  "name of the font in /raw-fonts/ - make sure theres a bmp and json",
);
program.option(
  "-p, --print",
  "Stream the characters into the terminal during parsing",
);
program.parse();

const options = program.opts();
const FONT_NAME = options.name;

/**
 * This needs to be an indexed 1 bit bmp
 * good luck lololololol
 * I used aseprite on indexed color
 */
const img = await readFile("./raw-fonts/" + FONT_NAME + ".bmp");

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

const alphabet = fontMeta.alphabet.join("");

const characters = rawCharacters.map((char, index) => {
  const letter = alphabet[index];

  const maybeTrim =
    fontMeta.trim[letter] ?? fontMeta.trim["__DEFAULT__"];
  if (!maybeTrim) {
    return [metrics.width, char];
  }
  return [metrics.width, char];

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

console.log(
  chalk.green(`✓ `) +
    `Found ${characters.length} characters in ${FONT_NAME}`,
);

const fontFileAt = path.join(
  import.meta.dirname + "/fonts/" + FONT_NAME + ".pxfont",
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
);

console.log(
  chalk.green(`✓ `) +
    `Wrote pxfont file at ${chalk.green(fontFileAt)}`,
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
    FONT_NAME,
    solidFillBrush(fontMeta.specimen?.color ?? [0, 0, 0]),
    {
      maxLength: metrics.width * 12,
    },
  ),
  [metrics.width, metrics.height],
  solidFillBrush(fontMeta.specimen?.background ?? [255, 255, 255]),
);

const specimenFileAt = path.join(
  import.meta.dirname + "/fonts/" + FONT_NAME + "-specimen.bmp",
);
await writeFile(
  "./fonts/" + FONT_NAME + "-specimen.bmp",
  toImage(specimenImg),
);

console.log(
  chalk.green(`✓ `) +
    `Wrote specimen file at ${chalk.cyan(specimenFileAt)} (check it out!)`,
);

const dtsFileAt = path.join(import.meta.dirname + "/fonts/d.ts");
let dts = (await readdir("./fonts"))
  .filter((f) => f.endsWith("pxfont"))
  .map((f) => f.split(".").shift())
  .filter(Boolean)
  .map((f) => `"${f}"`)
  .join("|");

dts = `export type TypefaceNames = ${dts}`;
dts = await format(dts, { parser: "babel-ts" });

await writeFile(dtsFileAt, dts);
console.log(
  chalk.green(`✓ `) + `Updated types ${chalk.white(dtsFileAt)}`,
);

console.log(
  "\n" +
    chalk.green(`✓ All good!! `) +
    `You can now use ${chalk.yellow(FONT_NAME)} as a font`,
);
