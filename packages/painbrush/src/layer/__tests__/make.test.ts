import { describe, it, expect, vi } from 'vitest';
import { makeLayer } from 'painbrush/layer';
import { readFile, writeFile } from 'fs/promises';
import { exportImage } from 'painbrush/image';
import { SET_COLORS } from 'painbrush/color';
import { getDefaultFontHandleNode, useFont } from 'painbrush/font';

// Stub Math.random for consistent results
vi.stubGlobal(`Math`, {
  random: () => 0.5,
  floor: Math.floor,
  ceil: Math.ceil,
  max: Math.max,
  min: Math.min,
});

describe(`makeLayer functions`, () => {
  describe(`blank layer creation`, () => {
    it(`should create a blank layer with custom brush`, async () => {
      const layer = makeLayer.blank(
        { x: 5, y: 5 },
        () => SET_COLORS.BLUE,
      );

      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-blank-layer.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });

    it(`should create a blank layer with alpha`, async () => {
      const layer = makeLayer.blankWithAlpha({ x: 3, y: 3 });
      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname +
          `/__snapshots__/snap-blank-layer-alpha.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });
  });

  describe(`image layer creation`, () => {
    it(`should create a layer from image buffer`, async () => {
      const buffer = await readFile(
        import.meta.dirname + `/goomba-24.bmp`,
      );
      const layer = makeLayer.image(buffer);

      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-image-layer.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });
  });

  describe(`text layer creation`, () => {
    it(`should create a text layer with default parameters`, async () => {
      const POXEL = await useFont(getDefaultFontHandleNode());
      const layer = makeLayer.text('test', POXEL);

      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-text-layer.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });
    it(`should create a text layer at the max specified size`, async () => {
      const POXEL = await useFont(getDefaultFontHandleNode());
      const layer = makeLayer.text(
        'test testtestt esttesttes ttest test',
        POXEL,
        undefined,
        {
          maxLengthPx: 120,
        },
      );

      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-text-layer-1.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });
    it(`should create a text layer without extra space`, async () => {
      const POXEL = await useFont(getDefaultFontHandleNode());
      const layer = makeLayer.text('test', POXEL, undefined, {
        maxLengthPx: 120,
      });

      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-text-layer-2.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });
    it(`should create a text layer leaving hanging space`, async () => {
      const POXEL = await useFont(getDefaultFontHandleNode());
      const layer = makeLayer.text('test', POXEL, undefined, {
        minLengthPx: 120,
      });

      const bmp = exportImage(layer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-text-layer-3.bmp`,
        bmp,
      );
      expect(JSON.stringify(layer, null, 2)).toMatchSnapshot();
    });
  });
});
