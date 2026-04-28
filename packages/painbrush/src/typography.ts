import { readFile } from "fs/promises";
import type { SingleChannelImage } from "./layer.ts";
import type { PackerCharactersWithTrim } from "../src-packer/_.js";
import path from "path";

export type FontHandle =
  | Buffer<ArrayBuffer>
  | string
  | { toString: () => string }
  | PxFontFile;

export type FontMetrics = {
  height: number;
  width: number;
  spaces: number;
};

export type PxFontFile = {
  alphabet: string;
  characters: PackerCharactersWithTrim;
  metrics: FontMetrics;
};

export interface Font {
  getCharacter: (c: string) => SingleChannelImage;
}

export const loadBuiltInFont = async () => {
  return await useFont(
    readFile(
      path.resolve(import.meta.dirname, "../static/poxel.pxfont"),
    ),
  );
};

const unpackFontHandle = async (
  handle: Promise<FontHandle>,
): Promise<PxFontFile> => {
  const file = await handle;
  if (file instanceof Object && "alphabet" in file) {
    return file;
  }
  return JSON.parse((await handle).toString()) as PxFontFile;
};

export const useFont = async (
  handle: Promise<FontHandle>,
): Promise<Font> => {
  const chars = await unpackFontHandle(handle);

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
    getCharacter: (c: string): SingleChannelImage => {
      return {
        ...getCharacterFromFont(c),
        id: Math.random(),
      } as SingleChannelImage;
    },
  };

  return FONT;
};
