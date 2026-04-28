import { solidFillBrush } from "painbrush/color";
import { makeTextLayer } from "painbrush/layer";
import { loadBuiltInFont } from "painbrush/typography";

console.time("Loading poxel");
const POXEL = await loadBuiltInFont();
console.timeEnd("Loading poxel");

console.time("Long sentence 100x");
for (let i = 0; i < 100; i++) {
  makeTextLayer(
    "the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop",
    POXEL,
    solidFillBrush([255, 255, 255]),
    {
      maxLengthPx: 200,
    },
  );
}
console.timeEnd("Long sentence 100x");
