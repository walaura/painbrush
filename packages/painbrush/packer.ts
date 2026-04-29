#!/usr/bin/env node

import { program } from 'commander';
import { writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import chalk from 'chalk';
import {
  reportNay,
  reportYay,
  type FontMetaJSON,
  type PackerIntakeData,
} from './src-packer/helpers.ts';
import path from 'node:path';
import {
  generateCharacters,
  generatePxFontFile,
  generateSpecimenImage,
} from './src-packer/pipeline.ts';

program.addHelpText(
  `beforeAll`,
  `${chalk.cyanBright(`> font packer`)}
If you aren't sure how to author a font check out the docs 
or try repacking the bundled ones yourself.
You can download them from the repo!!
  `,
);
program.showHelpAfterError();
program.requiredOption(
  `-f, --font <font-name>`,
  `path to the raw font files, make sure theres a bmp AND a json!!`,
);
program.option(
  `-o, --out <directory>`,
  `path to the output directory, your font will show up there`,
  `fonts`,
);
program.option(
  `-p, --print`,
  `Stream the characters into the terminal during parsing`,
);
program.parse();

const options = program.opts();

/**
 * This needs to be an indexed 1 bit bmp
 * good luck lololololol
 * I used aseprite on indexed color
 */

const fontName = path.parse(options.font.split(`/`).pop()).name;

const intakeData: PackerIntakeData = await (async () => {
  const cwd = process.cwd();
  const outDir = options.out ?? `fonts`;
  const inPath = path.join(cwd, options.font);
  const img = await readFile(inPath + `.bmp`);

  const fontMeta = JSON.parse(
    (await readFile(inPath + `.json`)).toString(),
  ) as FontMetaJSON;

  reportYay(`Found bmp, json is valid`);
  return {
    img,
    fontMeta,
    fontName,
    outDir,
    cwd,
  };
})().catch((e) => {
  reportNay(`JSON/BMP for ${fontName} missing`);
  throw e;
});

const characters = await generateCharacters(intakeData);

const fontWriteOp = generatePxFontFile(characters, intakeData);
await writeFile(...fontWriteOp).catch((e) => {
  reportNay(
    `Font out directory does not exist at ${chalk.underline(path.parse(fontWriteOp[0]).dir)}`,
  );
  throw e;
});

reportYay(`Wrote pxfont file at ${chalk.underline(fontWriteOp[0])}`);

const imageWriteOp = await generateSpecimenImage(
  fontWriteOp,
  intakeData,
);
await writeFile(...imageWriteOp);

reportYay(
  `Wrote specimen file at ${chalk.cyan.underline(imageWriteOp[0])} (check it out!)`,
);

console.log(``);
reportYay(`You can now use ${chalk.yellow(fontName)} as a font`);
console.log(``);
