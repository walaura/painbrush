import { decode } from "fast-bmp";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

const FONT_NAME = "poxel";

/**
 * This needs to be an indexed 1 bit bmp
 * good luck lololololol
 * I used aseprite on indexed color
 */
const img = await readFile("./raw-fonts/" + FONT_NAME + ".bmp");
const fontMeta = JSON.parse(
  (await readFile("./raw-fonts/" + FONT_NAME + ".json")).toString(),
) as {
  height: number;
  width: number;
  cols: number;
  /**
   * Long string with the letters represented in the bmp in the same order
   */
  alphabet: string;
  /**
   * Keyed object specifying how many trailing horizontal pixel columns to trim from the character, for narrow characters
   */
  trim: {
    [key: string]: number;
  };
};

const data = decode(img);

const rawCharacters: (0 | 1)[][] = [[]];

const colspan = fontMeta.cols * fontMeta.width;

(data.data as Uint8Array).forEach((item, index) => {
  const pixelX = index % colspan;
  const pixelY = Math.floor(index / colspan);

  const charX = Math.floor(pixelX / fontMeta.width);
  const charY = Math.floor(pixelY / fontMeta.height);

  const charXPixelOffset = pixelX - charX * fontMeta.width;
  const charYPixelOffset = pixelY - charY * fontMeta.height;

  const charPos = charX + charY * fontMeta.cols;

  if (!rawCharacters[charPos]) {
    rawCharacters[charPos] = [];
  }

  const charPixelPos =
    charXPixelOffset + charYPixelOffset * fontMeta.width;

  rawCharacters[charPos][charPixelPos] = item as 0 | 1;
});

const print = (c: any[]) => {
  c.forEach((element, index) => {
    process.stdout.write(`${element ? "X" : " "}`);
    if (index % fontMeta.width === 0) {
      console.log("");
    }
  });
};

rawCharacters.forEach((c) => {
  // print(c);
});

const characters = rawCharacters.map((char, index) => {
  const letter = fontMeta.alphabet[index];
  const maybeTrim = fontMeta.trim[letter];
  if (!maybeTrim) {
    return [fontMeta.width, char];
  }

  let newChar = [];
  for (let i = 0; i < char.length; i++) {
    const pos = i % fontMeta.width;
    if (pos < fontMeta.width - maybeTrim) {
      newChar.push(char[i]);
    }
  }
  return [fontMeta.width - maybeTrim, newChar];
});

type Character = [width: number, (0 | 1)[]];

const exportt = {
  CHAR_HEIGHT: fontMeta.height,
  CHAR_WIDTH: fontMeta.width,
  alphabet: "?1234567890ABCDEFGHIJKLMNOPQRSTUV",
  characters,
};

await writeFile(
  "./fonts/" + FONT_NAME + ".json",
  JSON.stringify(exportt, null, 2),
);
