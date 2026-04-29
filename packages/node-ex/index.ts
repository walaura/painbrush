import { readFile, writeFile } from 'fs/promises';
import {
  brush,
  convertColor,
  isAlpha,
  SET_COLORS,
} from 'painbrush/color';
import { getDefaultFontHandleNode, useFont } from 'painbrush/font';
import { exportImage } from 'painbrush/image';
import {
  composeLayer,
  makeLayer,
  transformLayer,
  type Layer,
} from 'painbrush/layer';
import { getXYCoords } from 'painbrush/pixel';

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
  useFont(readFile('./fonts/lucas.pxfont')),
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
const sun = makeLayer.blank(
  { x: 30, y: 30 },
  brush.border(3, 0xffff00),
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

const text = makeLayer.text(
  'the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop',
  POXEL,
  brush.solidFill(SET_COLORS.BLACK),
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
brush.solidFill for that. This is a fancier one that 
makes a gradient:
*/
const bg = makeLayer.blank({ x: 280, y: 360 }, (index, layer) => {
  const { x, y } = getXYCoords(index, layer);
  return convertColor.fromRGB(
    (x / layer.x) * 255,
    (y / layer.y) * 255,
    255,
  );
});

/*
Theres a lot of helpful methods like transformLayer.scale 
that let you manipulate layers like this is an 
actual image editor.
*/
const clock = transformLayer.scale(
  makeLayer.text(
    Date.now().toString(),
    LUCAS,
    brush.solidFill(SET_COLORS.WHITE),
    {
      breakLinesOn: '', // break on anything
      maxLengthPx: 50,
    },
  ),
  { x: 2, y: 2 },
);
const clockShadow = transformLayer.paint(clock, (existingColor) =>
  isAlpha(existingColor)
    ? () => existingColor
    : brush.solidFill(SET_COLORS.BLACK),
);
const clockWithShadow = composeLayer.overlayStack(
  [clock],
  [clockShadow, { offset: { x: 2, y: 2 } }],
  [
    makeLayer.blankWithAlpha({
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
composeLayer.overlayStack but you don't have to!
*/
const images = composeLayer.overlayStack(
  [makeLayer.image(await readFile('./test-junk/goomba-rgb.bmp'))],
  [
    makeLayer.image(await readFile('./test-junk/goomba-24.bmp')),
    {
      offset: { x: 16, y: 0 },
    },
  ],
  [
    makeLayer.image(await readFile('./test-junk/goomba-8.bmp')),
    {
      offset: { x: 32, y: 0 },
    },
  ],
  [makeLayer.blankWithAlpha({ x: 16 * 3, y: 16 })],
) as Layer;

/*
You can go crazy with the nesting, make some 
layout helpers even.
If you are perf-focused you wanna keep your 
layer operations low, haven't benchmarked this 
or anything, it just feels nasty.
*/
const withTitle = (layer: Layer, title: string) => {
  const titleLayer = makeLayer.text(
    title.toUpperCase(),
    POXEL,
    brush.solidFill(SET_COLORS.BLACK),
  );
  const gap = 4;
  return composeLayer.overlayStack(
    [titleLayer],
    [layer, { offset: { x: 0, y: titleLayer.y + gap } }],
    [
      makeLayer.blankWithAlpha({
        x: Math.max(titleLayer.x, layer.x),
        y: titleLayer.y + gap + layer.y,
      }),
    ],
  );
};

const textWithTitle = withTitle(text, 'little text');
const clockWithTitle = withTitle(clockWithShadow, 'Clock');
const imagesWithTitle = withTitle(
  transformLayer.scale(images, { x: 6, y: 12 }),
  'Goombas',
);

const layers = composeLayer.overlayStack(
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

await writeFile('image.bmp', exportImage(layers));
