import { readFile } from "fs/promises";
import type { SingleChannelLayer } from "./_.js";

export type FontMetrics = {
  height: number;
  width: number;
  spaces: number;
};
export type PxFontFile = {
  alphabet: string;
  characters: [number, number[]][];
  metrics: FontMetrics;
};

export interface Font {
  getCharacter: (c: string) => SingleChannelLayer;
}

export const loadBuiltInFont = async () =>
  await loadFont(readFile("./fonts/poxel.pxfont"));

export const loadFont = async (
  pxFontFile: Promise<Buffer<ArrayBuffer>>,
): Promise<Font> => {
  const chars = JSON.parse(
    (await pxFontFile).toString(),
  ) as PxFontFile;

  const charmap = Object.fromEntries(
    chars.alphabet.split("").map((l, index) => {
      const char = chars.characters[index];
      return [
        l,
        {
          isSingleChannel: true,
          data: char[1],
          width: char[0],
          height: chars.metrics.height,
        },
      ];
    }),
  );
  charmap[" "] = {
    isSingleChannel: true,
    data: [],
    width: chars.metrics.spaces,
    height: 0,
  };

  const getCharacterFromFont = (c: string) => {
    if (c in charmap) {
      return charmap[c];
    }
    const upper = c.toUpperCase();
    if (upper in charmap) {
      return charmap[upper];
    }
    const lower = c.toLowerCase();
    if (lower in charmap) {
      return charmap[lower];
    }
    return charmap[chars.alphabet[0]];
  };

  const FONT = {
    getCharacter: (c: string): SingleChannelLayer => {
      return {
        ...getCharacterFromFont(c),
        id: Math.random(),
      } as SingleChannelLayer;
    },
  };

  return FONT;
};
