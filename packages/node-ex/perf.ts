import { brush, SET_COLORS } from 'painbrush/color';
import { getDefaultFontHandleNode, useFont } from 'painbrush/font';
import { makeLayer, transformLayer } from 'painbrush/layer';

const TEST_FAC = 50;

console.time('Loading poxel');
const POXEL = await useFont(getDefaultFontHandleNode());
console.timeEnd('Loading poxel');

const wrap =
  (name: string, fn: () => void): (() => void) =>
  () => {
    console.time(name);
    fn();
    console.timeEnd(name);
  };
const longSentence = wrap('Long sentence', () => {
  for (let i = 0; i < TEST_FAC; i++) {
    makeLayer.text(
      'the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop',
      POXEL,
      brush.solidFill(SET_COLORS.WHITE),
      {
        maxLengthPx: 200,
      },
    );
  }
});

const st = makeLayer.text(
  'the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop',
  POXEL,
  brush.solidFill(SET_COLORS.WHITE),
  {
    maxLengthPx: 200,
  },
);

const scale2 = wrap('Scale 2X', () => {
  for (let i = 0; i < TEST_FAC; i++) {
    transformLayer.scale(st, { x: 2, y: 2 });
  }
});

const scale20 = wrap('Scale 20X', () => {
  for (let i = 0; i < TEST_FAC; i++) {
    transformLayer.scale(st, { x: 10, y: 10 });
  }
});

scale20();
// longSentence();
// scale2();
