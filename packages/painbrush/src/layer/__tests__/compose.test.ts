import { describe, it, expect, vi } from 'vitest';
import { makeLayer } from 'painbrush/layer';
import { readFile, writeFile } from 'fs/promises';
import { exportImage } from 'painbrush/image';
import { brush, SET_COLORS } from 'painbrush/color';
import { composeLayer } from 'painbrush/layer';

// Stub Math.random for consistent results
vi.stubGlobal(`Math`, {
  random: () => 0.5,
  floor: Math.floor,
  ceil: Math.ceil,
  max: Math.max,
  min: Math.min,
});

describe(`composeLayer functions`, () => {
  describe(`punchLayerOver`, () => {
    it(`should punch a layer over another layer`, async () => {
      const buffer = await readFile(
        import.meta.dirname + `/goomba-24.bmp`,
      );
      const backgroundLayer = makeLayer.image(buffer);
      const foregroundLayer = makeLayer.blank(
        { x: 3, y: 3 },
        brush.border(1, SET_COLORS.GREEN),
      );

      // Create a copy of the background to test with
      const testBackground = { ...backgroundLayer };

      composeLayer.punch(testBackground, foregroundLayer, {
        offset: { x: 5, y: 5 },
      });

      const bmp = exportImage(testBackground);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-punched-layer.bmp`,
        bmp,
      );
      expect(
        JSON.stringify(testBackground, null, 2),
      ).toMatchSnapshot();
    });
  });

  describe(`overlayLayerOver`, () => {
    it(`should overlay a layer over another layer`, async () => {
      const buffer = await readFile(
        import.meta.dirname + `/goomba-24.bmp`,
      );
      const backgroundLayer = makeLayer.image(buffer);
      const foregroundLayer = makeLayer.blank(
        { x: 3, y: 3 },
        brush.border(1, SET_COLORS.GREEN),
      );

      const overlaidLayer = composeLayer.overlay(
        backgroundLayer,
        foregroundLayer,
        { offset: { x: 5, y: 5 } },
      );

      const bmp = exportImage(overlaidLayer);
      await writeFile(
        import.meta.dirname +
          `/__snapshots__/snap-overlaid-layer.bmp`,
        bmp,
      );
      expect(
        JSON.stringify(overlaidLayer, null, 2),
      ).toMatchSnapshot();
    });
  });

  describe(`overlayLayersOver`, () => {
    it(`should overlay multiple layers`, async () => {
      const buffer = await readFile(
        import.meta.dirname + `/goomba-24.bmp`,
      );
      const backgroundLayer = makeLayer.image(buffer);
      const layer1 = makeLayer.blank(
        { x: 3, y: 3 },
        () => SET_COLORS.RED,
      );
      const layer2 = makeLayer.blank(
        { x: 2, y: 2 },
        () => SET_COLORS.BLUE,
      );

      // Test with overlayLayersOver function
      const resultLayer = composeLayer.overlayStack(
        [backgroundLayer],
        [layer1, { offset: { x: 5, y: 5 } }],
        [layer2, { offset: { x: 10, y: 10 } }],
      );

      const bmp = exportImage(resultLayer);
      await writeFile(
        import.meta.dirname +
          `/__snapshots__/snap-overlay-layers.bmp`,
        bmp,
      );
      expect(JSON.stringify(resultLayer, null, 2)).toMatchSnapshot();
    });
  });
});
