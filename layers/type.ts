import chars from "../font/chars.json" with { type: "json" };

const charmap = Object.fromEntries(
  chars.alphabet.split("").map((l, index) => {
    return [l, chars.characters[index]];
  }),
);

export const useFont = (_: "chars") => {
  return {
    monoSize: {
      x: chars.CHAR_WIDTH,
      y: chars.CHAR_HEIGHT,
    },
    getCharacter: (c: string) => {
      if (c in charmap) {
        return charmap[c];
      }
      return chars.characters[0];
    },
  };
};
