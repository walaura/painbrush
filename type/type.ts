import chars from "../fonts/chars.json" with { type: "json" };
import type { SingleChannelLayer } from "../layers/d.ts";
import { createLayer } from "../layers/draw.ts";

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

/**
 * this is a list of widths of letters within an unbreakable part of a string (aka, stuff between spaces) but also lazy text rendering where we assume theres no line-breaks
 */
type UnbreakableMeasures = number[];
/**
 * and this is a list of UnbreakableMeasures that you can use to break apart your word if it doesnt fit
 */
type BreakableMeasures = UnbreakableMeasures[];

const charmap = Object.fromEntries(
  chars.alphabet.split("").map((l, index) => {
    return [l, chars.characters[index]];
  }),
);

export const useFont = (typeface: "chars"): Font => {
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
      const char = getCharacterFromFont(c);
      return {
        isSingleChannel: true,
        data: char,
        width: chars.CHAR_WIDTH,
        height: chars.CHAR_HEIGHT,
      };
    },
  };
};
