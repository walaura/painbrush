import { readFile } from "fs/promises";
import type { SingleChannelLayer } from "./_d.ts";
import path from "path";

import type { TypefaceNames } from "../fonts/d.ts";
export type { TypefaceNames };

const FONT_CACHE = new Map<TypefaceNames, Font>();

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

interface Font {
  getCharacter: (c: string) => SingleChannelLayer;
}

export const useFont = async (
  typeface: TypefaceNames,
): Promise<Font> => {
  if (FONT_CACHE.has(typeface)) {
    return FONT_CACHE.get(typeface) as Font;
  }
  const chars = JSON.parse(
    (
      await readFile(
        path.resolve(
          import.meta.dirname,
          "./../fonts/" + typeface + ".pxfont",
        ),
      )
    ).toString(),
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
  FONT_CACHE.set(typeface, FONT);

  return FONT;
};
