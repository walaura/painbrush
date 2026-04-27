import { readFile } from "fs/promises";
import type { SingleChannelLayer } from "../layers/d.ts";
import path from "path";

type FontMetrics = {
  space: number;
  monoSize: {
    x: number;
    y: number;
  };
};
interface Font {
  metrics: FontMetrics;
  getCharacter: (c: string) => SingleChannelLayer;
}

export const useFont = async (
  typeface: "demo-sans" | "poxel",
): Promise<Font> => {
  const chars = JSON.parse(
    (
      await readFile(
        path.resolve(
          import.meta.dirname,
          "./../fonts/" + typeface + ".pxfont",
        ),
      )
    ).toString(),
  ) as {
    alphabet: string;
    characters: [number, number[]][];
    CHAR_HEIGHT: number;
    CHAR_WIDTH: number;
  };

  const charmap = Object.fromEntries(
    chars.alphabet.split("").map((l, index) => {
      return [l, chars.characters[index]];
    }),
  );

  const getCharacterFromFont = (c: string) => {
    if (c in charmap) {
      return charmap[c];
    }
    const upper = c.toUpperCase();
    if (upper in charmap) {
      return charmap[upper];
    }
    return chars.characters[0];
  };

  const metrics = {
    space: 4,
    monoSize: {
      x: chars.CHAR_WIDTH,
      y: chars.CHAR_HEIGHT,
    },
  };

  return {
    metrics,
    getCharacter: (c: string): SingleChannelLayer => {
      if (c === " ") {
        return {
          isSingleChannel: true,
          data: [],
          width: metrics.space,
          height: 0,
        };
      }
      const char = getCharacterFromFont(c) as [number, number[]];
      return {
        isSingleChannel: true,
        data: char[1],
        width: char[0],
        height: chars.CHAR_HEIGHT,
      };
    },
  };
};
