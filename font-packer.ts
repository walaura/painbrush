import { decode } from "fast-bmp";
import { writeFile } from "node:fs/promises";
import { readFile } from "node:fs/promises";

const img = await readFile("./font/font.bmp");

const data = decode(img);

const CHAR_HEIGHT = 8;
const CHAR_WIDTH = 6;

const ROWS = 3;
const COLS = 11;

const characters: (0 | 1)[][] = [[]];

const colspan = COLS * CHAR_WIDTH;

(data.data as Uint8Array).forEach((item, index) => {
  const pixelX = index % colspan;
  const pixelY = Math.floor(index / colspan);

  const charX = Math.floor(pixelX / CHAR_WIDTH);
  const charY = Math.floor(pixelY / CHAR_HEIGHT);

  const charXPixelOffset = pixelX - charX * CHAR_WIDTH;
  const charYPixelOffset = pixelY - charY * CHAR_HEIGHT;

  const charPos = charX + charY * COLS;

  if (!characters[charPos]) {
    characters[charPos] = [];
  }

  const charPixelPos = charXPixelOffset + charYPixelOffset * CHAR_WIDTH;

  characters[charPos][charPixelPos] = item;
});

console.log("");
characters[12].forEach((element, index) => {
  process.stdout.write(`${element ? "X" : " "}`);
  if (index % CHAR_WIDTH === 0) {
    console.log("");
  }
});

const exportt = {
  CHAR_HEIGHT,
  CHAR_WIDTH,
  alphabet: "?1234567890ABCDEFGHIJKLMNOPQRSTUV",
  characters,
};

await writeFile("./font/chars.json", JSON.stringify(exportt, null, 2));
