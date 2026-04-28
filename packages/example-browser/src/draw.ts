import { readFile, writeFile } from "fs/promises";
import {
  borderBrush,
  COLOR_BLACK,
  COLOR_WHITE,
  colorFromRgb,
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
  paintLayer,
  makeBlankLayer,
  type Layer,
} from "painbrush/layer";
import { getPixelXYCoords } from "painbrush/pixel";
import { useFont, type FontHandle } from "painbrush/typography";

export const makeRenderCall = async (
  poxelHandle: Promise<FontHandle>,
  lucasHandle: Promise<FontHandle>,
) => {
  const [POXEL, LUCAS] = await Promise.all(
    [poxelHandle, lucasHandle].map(useFont),
  );
  return async ({
    bgColor,
    pos,
    posY,
    zoom,
  }: {
    bgColor: number;
    pos: number;
    posY: number;
    zoom: number;
  }) => {
    const sun = makeRectangleLayer(
      { x: 30, y: 30 },
      borderBrush(3, 0xffff00),
    );

    const text = makeTextLayer(
      "the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop",
      POXEL,
      solidFillBrush(0xffffff),
      {
        maxLengthPx: 200,
      },
    );

    const bg = makeRectangleLayer(
      { x: 280, y: 360 },
      (index, layer) => {
        const { x, y } = getPixelXYCoords(index, layer);
        return colorFromRgb(
          (x / layer.width) * 255,
          (y / layer.height) * 255,
          bgColor,
        );
      },
    );

    const clock = scaleLayer(
      makeTextLayer(
        Date.now().toString(),
        LUCAS,
        solidFillBrush(COLOR_WHITE),
        {
          breakLinesOn: "", // break on anything
          maxLengthPx: 50,
        },
      ),
      { x: zoom, y: zoom },
    );
    const clockShadow = paintLayer(clock, (existingColor) =>
      isAlphaColor(existingColor)
        ? () => existingColor
        : solidFillBrush(0x000000),
    );
    const clockWithShadow = overlayLayersOver(
      [clock],
      [clockShadow, { offset: { x: 2, y: 2 } }],
      [makeBlankLayer({ x: clock.width + 2, y: clock.height + 2 })],
    );

    /*
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
 */

    const withTitle = (layer: Layer, title: string) => {
      const titleLayer = makeTextLayer(
        title.toUpperCase(),
        POXEL,
        solidFillBrush(COLOR_BLACK),
      );
      const gap = 4;
      return overlayLayersOver(
        [titleLayer],
        [layer, { offset: { x: 0, y: titleLayer.height + gap } }],
        [
          makeBlankLayer({
            x: Math.max(titleLayer.width, layer.width),
            y: titleLayer.height + gap + layer.height,
          }),
        ],
      );
    };

    const textWithTitle = withTitle(text, "little text");
    const clockWithTitle = withTitle(clockWithShadow, "Clock");
    // const imagesWithTitle = withTitle(
    //   scaleLayer(images, [6, 12]),
    //   "Goombas",
    // );

    const layers = overlayLayersOver(
      [
        sun,
        {
          offset: { x: pos, y: posY },
        },
      ],
      [
        textWithTitle,
        {
          offset: {
            x: 10,
            y: 10,
          },
        },
      ],
      [
        clockWithTitle,
        {
          offset: {
            x: 10,
            y: 10 + textWithTitle.height + 10,
          },
        },
      ],
      // [
      //   imagesWithTitle,
      //   {
      //     offset: [
      //       10,
      //       10 + textWithTitle.height + 10 + clockWithTitle.height + 10,
      //     ],
      //   },
      // ],
      [bg],
    );

    return toImage(layers);
  };
};
