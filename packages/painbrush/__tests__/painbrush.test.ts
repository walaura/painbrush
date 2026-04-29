import { describe, it, expect, vi } from 'vitest';

import {
  SET_COLORS,
  brush,
  convertColor,
  isAlpha,
} from 'painbrush/color';
import {
  composeLayer,
  makeLayer,
  transformLayer,
  type Layer,
} from 'painbrush/layer';
import { getXYCoords } from 'painbrush/pixel';
import { readFile, writeFile } from 'fs/promises';
import { exportImage } from 'painbrush/image';
import { getDefaultFontHandleNode, useFont } from 'painbrush/font';

vi.stubGlobal(`Math`, {
  random: () => 0.5,
  floor: Math.floor,
  ceil: Math.ceil,
  max: Math.max,
  min: Math.min,
});

describe(`Painbrush`, async () => {
  it(`should generate an image that vaguely looks good`, async () => {
    const POXEL = await useFont(getDefaultFontHandleNode());

    const sun = makeLayer.blank(
      { x: 30, y: 30 },
      brush.border(3, 0xffff00),
    );

    const text = makeLayer.text(
      `the quick brown spirindolious fox jumps over the lazy dog!? () THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG\nWhy are you reading this far you are not supposed to be reading this stop`,
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
        255,
      );
    });

    const clock = transformLayer.scale(
      makeLayer.text(
        `1234567890`,
        POXEL,
        brush.solidFill(SET_COLORS.WHITE),
        {
          breakLinesOn: ``, // break on anything
          maxLengthPx: 50,
        },
      ),
      { x: 2, y: 3 },
    );
    const clockShadow = transformLayer.paint(
      clock,
      (existingColor) =>
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

    const images = makeLayer.image(
      await readFile(import.meta.dirname + `/goomba-24.bmp`),
    );

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

    const textWithTitle = withTitle(text, `little text`);
    const clockWithTitle = withTitle(clockWithShadow, `Clock`);
    const imagesWithTitle = withTitle(images, `Goombas`);

    const layers = composeLayer.overlayStack(
      [
        sun,
        {
          offset: { x: 30, y: 30 },
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

    const bmp = exportImage(layers);
    await writeFile(
      import.meta.dirname + `/__snapshots__/snap.bmp`,
      bmp,
    );
    expect(
      JSON.stringify(
        transformLayer.scale(layers, { x: 0.1, y: 0.1 }),
        null,
        2,
      ),
    ).toMatchSnapshot();
  });
});
