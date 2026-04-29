import {
  brush,
  convertColor,
  isAlpha,
  SET_COLORS,
} from 'painbrush/color';
import { exportImage } from 'painbrush/image';
import {
  composeLayer,
  makeLayer,
  transformLayer,
  type Layer,
} from 'painbrush/layer';
import { getXYCoords } from 'painbrush/pixel';
import { useFont } from 'painbrush/font';

export const makeRenderCall = async (
  poxelHandle: Promise<Parameters<typeof useFont>[0]>,
  lucasHandle: Promise<Parameters<typeof useFont>[0]>,
) => {
  const [POXEL, LUCAS] = await Promise.all(
    [poxelHandle, lucasHandle].map((f) => useFont(f)),
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
    const sun = makeLayer.blank(
      { x: 30, y: 30 },
      brush.border(3, 0xffff00),
    );

    const text = makeLayer.text(
      'the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop',
      POXEL,
      brush.solidFill(0xffffff),
      {
        maxLengthPx: 200,
      },
    );

    const bg = makeLayer.blank({ x: 280, y: 360 }, (index, layer) => {
      const { x, y } = getXYCoords(index, layer);
      return convertColor.fromRGB(
        (x / layer.x) * 255,
        (y / layer.y) * 255,
        bgColor,
      );
    });

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
      { x: zoom, y: zoom },
    );
    const clockShadow = transformLayer.paint(
      clock,
      (existingColor) =>
        isAlpha(existingColor)
          ? () => existingColor
          : brush.solidFill(0x000000),
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
  [makeBlankLayerWithAlpha([16 * 3, 16])],
) as Layer;
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
    // const imagesWithTitle = withTitle(
    //   scaleLayer(images, [6, 12]),
    //   "Goombas",
    // );

    const layers = composeLayer.overlayStack(
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
            y: 10 + textWithTitle.y + 10,
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

    return exportImage(layers);
  };
};
