import { readFile, writeFile } from "fs/promises";
import {
  borderBrush,
  SET_COLORS.BLACK,
  SET_COLORS.WHITE,
  colorFromRgb,
  isAlphaColor,
  solidFillBrush,
} from "painbrush/color";
import { export } from "painbrush/image";
import {
  makeBlankLayer,
  scaleLayer,
  makeTextLayer,
  overlayLayersOver,
  makeImageLayer,
  paintLayer,
  makeBlankLayerWithAlpha,
  type Layer,
} from "painbrush/layer";
import { getXYCoords } from "painbrush/pixel";
import {
  getDefaultFontHandleNode,
  useFont,
} from "../painbrush/src/painbrush/font.ts";

/*

FONT LOADING

You wanna get this out of the way once since its doing some parsing 
behind the scenes.

Poxel is bundled (as getDefaultFontHandleNode) so you can get writing ascii 
out of the park. 

Custom fonts are really fun to make! theres some easy-to-run 
examples (Including Lucas) on this project so you can have a 
starting point, check out nom run pack-font on this project.
*/

const [LUCAS, POXEL] = await Promise.all([
  useFont(readFile("./fonts/lucas.pxfont")),
  useFont(getDefaultFontHandleNode()),
]);

/*
LAYERS

Everything you add to an image is a layer first. layers have a 
width and height, can be transformed, and can be transparent. 
You will create a bunch of layers and then compose them at the end, 
but you can also compose them before. (you can't un-compose them 
tho!)

Everything is layers. In fairness your actual image is also a 
'layer', just with extra data
*/
const sun = makeBlankLayer(
  { x: 30, y: 30 },
  borderBrush(3, 0xffff00),
);

/*
TEXT

Not a lot to these ones, by default they wont wrap so make sure 
to set your maxLengthPx (in px) to break on spaces (config w/ breakLinesOn). 
or add linebreaks manually with \n and that'll do it too.

You can customize a bunch of brushes (well get to that) to paint 
the characters, the back plate of a character, or the bounding box 
of the text. lots of fun to be had!
*/

const text = makeTextLayer(
  "the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop",
  POXEL,
  solidFillBrush(SET_COLORS.BLACK),
  {
    maxLengthPx: 200,
  },
);

/*
BRUSHES

Brushes are an advanced concept you've seen around. 
Anything that paints on a layer is a brush function. 
Brushes get the pixel position and layer metadata and 
decide what color to paint based on that.

Normally you just wanna use a solid color and theres 
solidFillBrush for that. This is a fancier one that 
makes a gradient:
*/
const bg = makeBlankLayer({ x: 280, y: 360 }, (index, layer) => {
  const { x, y } = getXYCoords(index, layer);
  return colorFromRgb((x / layer.x) * 255, (y / layer.y) * 255, 255);
});

/*
Theres a lot of helpful methods like scaleLayer 
that let you manipulate layers like this is an 
actual image editor.
*/
const clock = scaleLayer(
  makeTextLayer(
    Date.now().toString(),
    LUCAS,
    solidFillBrush(SET_COLORS.WHITE),
    {
      breakLinesOn: "", // break on anything
      maxLengthPx: 50,
    },
  ),
  { x: 2, y: 2 },
);
const clockShadow = paintLayer(clock, (existingColor) =>
  isAlphaColor(existingColor)
    ? () => existingColor
    : solidFillBrush(SET_COLORS.BLACK),
);
const clockWithShadow = overlayLayersOver(
  [clock],
  [clockShadow, { offset: { x: 2, y: 2 } }],
  [
    makeBlankLayerWithAlpha({
      x: clock.x + 2,
      y: clock.y + 2,
    }),
  ],
);

/*
IMAGES

You can import other bmps like this. Note that 
anything thats not already 32 bit will go through
conversion and maybe get messed up?

I merged all three images in a single layer using
overlayLayersOver but you don't have to!
*/
const images = overlayLayersOver(
  [makeImageLayer(await readFile("./test-junk/goomba-rgb.bmp"))],
  [
    makeImageLayer(await readFile("./test-junk/goomba-24.bmp")),
    {
      offset: { x: 16, y: 0 },
    },
  ],
  [
    makeImageLayer(await readFile("./test-junk/goomba-8.bmp")),
    {
      offset: { x: 32, y: 0 },
    },
  ],
  [makeBlankLayerWithAlpha({ x: 16 * 3, y: 16 })],
) as Layer;

/*
You can go crazy with the nesting, make some 
layout helpers even.
If you are perf-focused you wanna keep your 
layer operations low, haven't benchmarked this 
or anything, it just feels nasty.
*/
const withTitle = (layer: Layer, title: string) => {
  const titleLayer = makeTextLayer(
    title.toUpperCase(),
    POXEL,
    solidFillBrush(SET_COLORS.BLACK),
  );
  const gap = 4;
  return overlayLayersOver(
    [titleLayer],
    [layer, { offset: { x: 0, y: titleLayer.y + gap } }],
    [
      makeBlankLayerWithAlpha({
        x: Math.max(titleLayer.x, layer.x),
        y: titleLayer.y + gap + layer.y,
      }),
    ],
  );
};

const textWithTitle = withTitle(text, "little text");
const clockWithTitle = withTitle(clockWithShadow, "Clock");
const imagesWithTitle = withTitle(
  scaleLayer(images, { x: 6, y: 12 }),
  "Goombas",
);

const layers = overlayLayersOver(
  [
    sun,
    {
      offset: { x: 200, y: 100 },
    },
  ],
  [
    textWithTitle,
    {
      offset: { x: 10, y: 10 },
    },
  ],
  [
    clockWithTitle,
    {
      offset: {
        x: 10,
        y: 10 + textWithTitle.y + 10,
      },
    },
  ],
  [
    imagesWithTitle,
    {
      offset: {
        x: 10,
        y: 10 + textWithTitle.y + 10 + clockWithTitle.y + 10,
      },
    },
  ],
  [bg],
);

await writeFile("image.bmp", export(layers));
