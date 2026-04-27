import chars from "../fonts/chars.json" with { type: "json" };
import type { SingleChannelLayer } from "../layers/d.ts";

type Font = {
  monoSize: {
    x: number;
    y: number;
  };
  getCharacter: (c: string) => number[];
  getCharacterLayer: (c: string) => SingleChannelLayer;
};

const charmap = Object.fromEntries(
  chars.alphabet.split("").map((l, index) => {
    return [l, chars.characters[index]];
  }),
);

export const useFont = (typeface: "chars"): Font => {
  const getCharacter = (c: string) => {
    if (c in charmap) {
      return charmap[c];
    }
    const upper = c.toUpperCase();
    if (upper in charmap) {
      return charmap[upper];
    }
    return chars.characters[0];
  };

  return {
    monoSize: {
      x: chars.CHAR_WIDTH,
      y: chars.CHAR_HEIGHT,
    },
    getCharacterLayer: (c: string): SingleChannelLayer => {
      const char = getCharacter(c);
      return {
        isSingleChannel: true,
        data: char,
        width: chars.CHAR_WIDTH,
        height: chars.CHAR_HEIGHT,
      };
    },
    getCharacter,
  };
};
