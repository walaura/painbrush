import { readFile, writeFile } from "fs/promises";
import {
  borderBrush,
  isAlphaColor,
  solidFillBrush,
} from "painbrush/color";
import type { Color } from "painbrush/color";
import { toImage } from "painbrush/image";
import {
  makeRectangleLayer,
  scaleLayer,
  makeTextLayer,
  overlayLayersOver,
  makeImageLayer,
  paintLayer,
  makeBlankLayer,
} from "painbrush/layer";
import { getPixelXYCoords } from "painbrush/pixel";
import { loadBuiltInFont, loadFont } from "painbrush/typography";
import type { Layer } from "../painbrush/src/_.js";

/*

FONT LOADING

You wanna get this out of the way once since its doing some parsing 
behind the scenes.

Poxel is bundled (as loadBuiltInFont) so you can get writing ascii 
out of the park. 

Custom fonts are really fun to make! theres some easy-to-run 
examples (Including Lucas) on this project so you can have a 
starting point, check out nom run pack-font on this project.
*/

const [LUCAS, POXEL] = await Promise.all([
  loadFont(readFile("./fonts/lucas.pxfont")),
  loadBuiltInFont(),
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
const sun = makeRectangleLayer(
  [30, 30],
  borderBrush(3, [255, 255, 0]),
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
  solidFillBrush([255, 255, 255]),
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
const bg = makeRectangleLayer([280, 360], (index, layer) => {
  const {
    coords: [x, y],
  } = getPixelXYCoords(index, layer);
  return [
    (x / layer.width) * 255,
    (y / layer.height) * 255,
    255,
  ] as Color;
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
    solidFillBrush([255, 255, 255]),
    {
      breakLinesOn: "", // break on anything
      maxLengthPx: 50,
    },
  ),
  [2, 2],
);
const clockShadow = paintLayer(clock, (existingColor) =>
  isAlphaColor(existingColor)
    ? () => existingColor
    : solidFillBrush([0, 0, 0]),
);
const clockWithShadow = overlayLayersOver(
  [clock],
  [clockShadow, { offset: [2, 2] }],
  [makeBlankLayer([clock.width + 2, clock.height + 2])],
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
      offset: [16, 0],
    },
  ],
  [
    makeImageLayer(await readFile("./test-junk/goomba-8.bmp")),
    {
      offset: [32, 0],
    },
  ],
  [makeBlankLayer([16 * 3, 16])],
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
    solidFillBrush([0, 0, 0]),
  );
  const gap = 4;
  return overlayLayersOver(
    [titleLayer],
    [layer, { offset: [0, titleLayer.height + gap] }],
    [
      makeBlankLayer([
        Math.max(titleLayer.width, layer.width),
        titleLayer.height + gap + layer.height,
      ]),
    ],
  );
};

const textWithTitle = withTitle(text, "little text");
const clockWithTitle = withTitle(clockWithShadow, "Clock");
const imagesWithTitle = withTitle(
  scaleLayer(images, [6, 12]),
  "Goombas",
);

const layers = overlayLayersOver(
  [
    sun,
    {
      offset: [200, 100],
    },
  ],
  [
    textWithTitle,
    {
      offset: [
        10,
        10,
      ],
    },
  ],
  [
    clockWithTitle,
    {
      offset: [
        10,
        10 + textWithTitle.height + 10,
      ],
    },
  ],
  [
    imagesWithTitle,
    {
      offset: [
        10,
        10 + textWithTitle.height + 10 + clockWithTitle.height + 10,
      ],
    },
  ],
  [bg],
);

await writeFile("image.bmp", toImage(layers));
