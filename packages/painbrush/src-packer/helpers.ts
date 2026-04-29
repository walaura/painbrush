import chalk from "chalk";
import type { FontMetrics } from "../src/typography.ts";

export type FontMetaJSON = {
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
    color: [number, number, number];
    background: [number, number, number];
  };
};

export type PackerIntakeData = {
  img: NonSharedBuffer;
  fontMeta: FontMetaJSON;
  fontName: string;
  cwd: string;
  outDir: string;
};

export type PackerCharacter = (0 | 1)[];

export type PackerCharactersWithTrim = [
  trim: number,
  char: PackerCharacter,
][];

export type PackerFileOp<Contents> = [
  name: string,
  contents: Contents,
];

export const printCharacter = (char: (0 | 1)[], width: number) => {
  for (let index = 0; index < char.length; index++) {
    const element = char[index];
    if (index !== 0 && index % width === 0) {
      process.stdout.write(` - ${index} - ${width}` + "\n");
    }
    process.stdout.write(element ? chalk.bgYellowBright("◼") : "◻");
  }
};

const report = (type: 0 | 1 | 2) => (msg: string) => {
  const prefix = {
    0: chalk.green(`✓ `),
    1: chalk.red(`☠ `),
    2: chalk.blue(`ℹ︎ `),
  }[type];
  console.log(prefix + msg);
};

export const reportYay = report(0);
export const reportNay = (msg: string) => {
  report(1)(msg);
};
export const reportInfo = report(2);
