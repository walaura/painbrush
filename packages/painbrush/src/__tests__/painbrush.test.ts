import { describe, it, expect, vi } from "vitest";

import {
  borderBrush,
  solidFillBrush,
  isAlphaColor,
  colorFromRgb,
  COLOR_WHITE,
  COLOR_BLACK,
} from "../color.ts";
import {
  makeBlankLayer,
  makeTextLayer,
  scaleLayer,
  paintLayer,
  overlayLayersOver,
  makeBlankLayerWithAlpha,
  type Layer,
  makeImageLayer,
} from "../layer.ts";
import { getPixelXYCoords } from "../pixel.ts";
import { readFile, writeFile } from "fs/promises";
import { toImage } from "../image.ts";
import { getDefaultFontHandleNode, useFont } from "../typography.ts";

vi.stubGlobal("Math", {
  random: () => 0.5,
  floor: Math.floor,
  ceil: Math.ceil,
  max: Math.max,
  min: Math.min,
});

describe("Painbrush", async () => {
  it("should generate an image that vaguely looks good", async () => {
    const POXEL = await useFont(getDefaultFontHandleNode());

    const sun = makeBlankLayer(
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

    const bg = makeBlankLayer({ x: 280, y: 360 }, (index, layer) => {
      const { x, y } = getPixelXYCoords(index, layer);
      return colorFromRgb(
        (x / layer.x) * 255,
        (y / layer.y) * 255,
        255,
      );
    });

    const clock = scaleLayer(
      makeTextLayer(
        "1234567890",
        POXEL,
        solidFillBrush(COLOR_WHITE),
        {
          breakLinesOn: "", // break on anything
          maxLengthPx: 50,
        },
      ),
      { x: 2, y: 3 },
    );
    const clockShadow = paintLayer(clock, (existingColor) =>
      isAlphaColor(existingColor)
        ? () => existingColor
        : solidFillBrush(COLOR_BLACK),
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

    const images = makeImageLayer(
      await readFile(import.meta.dirname + "/goomba-24.bmp"),
    );

    const withTitle = (layer: Layer, title: string) => {
      const titleLayer = makeTextLayer(
        title.toUpperCase(),
        POXEL,
        solidFillBrush(COLOR_BLACK),
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
    const imagesWithTitle = withTitle(images, "Goombas");

    const layers = overlayLayersOver(
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

    const bmp = toImage(layers);
    await writeFile(
      import.meta.dirname + "/__snapshots__/snap.bmp",
      bmp,
    );
    expect(JSON.stringify(layers, null, 2)).toMatchSnapshot();
  });
});
