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
  }: {
    bgColor: number;
    pos: number;
  }) => {
    const sun = makeRectangleLayer(
      [30, 30],
      borderBrush(3, [255, 255, 0]),
    );

    const text = makeTextLayer(
      "the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop",
      POXEL,
      solidFillBrush([255, 255, 255]),
      {
        maxLengthPx: 200,
      },
    );

    const bg = makeRectangleLayer([280, 360], (index, layer) => {
      const {
        coords: [x, y],
      } = getPixelXYCoords(index, layer);
      return [
        (x / layer.width) * 255,
        (y / layer.height) * 255,
        bgColor,
      ] as Color;
    });

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
    // const imagesWithTitle = withTitle(
    //   scaleLayer(images, [6, 12]),
    //   "Goombas",
    // );

    const layers = overlayLayersOver(
      [
        sun,
        {
          offset: [200 - pos, 100],
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
