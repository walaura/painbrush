import { readFile } from 'fs/promises';

import path from 'path';
import type { PackerCharactersWithTrim } from '../../src-packer/helpers.ts';
import type { SingleChannelImage } from '../image/image.js';

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
  getMetrics: () => FontMetrics;
}

export type CharResolver = (
  charmap: CharMap,
) => (c: string) => SingleChannelImage;

/**
 * The map of characters to their glyph ({a: pictureOfAnA, ...}).
 * maybe treat this as opaque bc theres no way im sticking
 * w this as soon as i want emoji
 */
export type CharMap = {
  [k: string]: SingleChannelImage;
};

export const getDefaultFontHandleNode = () =>
  readFile(
    path.resolve(import.meta.dirname, `../../static/poxel.pxfont`),
  );

/**
 * Feel free to add to this in yours to maybe remove accents etc
 */
export const DEFAULT_CHAR_RESOLVER =
  (charmap: CharMap) =>
  (c: string): SingleChannelImage => {
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
    return (
      charmap[`?`] ?? charmap[`X`] ?? charmap[`x`] ?? charmap[` `]
    );
  };

export const useFont = async (
  handle: Promise<FontHandle>,
  charResolver: CharResolver = DEFAULT_CHAR_RESOLVER,
): Promise<Font> => {
  const chars = await unpackFontHandle(handle);

  const charmap: CharMap = Object.fromEntries(
    chars.alphabet.split(``).map((l, index) => {
      const char = chars.characters[index];
      return [
        l,
        {
          channels: 1,
          data: char[1],
          width: char[0],
          height: chars.metrics.height,
        },
      ];
    }),
  );
  charmap[` `] = {
    channels: 1,
    data: [],
    width: chars.metrics.spaces,
    height: 0,
  };

  const getCharacter = charResolver(charmap);
  const getMetrics = () => chars.metrics;
  return {
    getCharacter,
    getMetrics,
  };
};

const unpackFontHandle = async (
  handle: Promise<FontHandle>,
): Promise<PxFontFile> => {
  const file = await handle;
  if (file instanceof Object && `alphabet` in file) {
    return file;
  }
  return JSON.parse((await handle).toString()) as PxFontFile;
};
