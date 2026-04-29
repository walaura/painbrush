import { describe, it, expect, vi } from 'vitest';
import { makeLayer, transformLayer } from 'painbrush/layer';
import { readFile, writeFile } from 'fs/promises';
import { exportImage } from 'painbrush/image';
import { brush, SET_COLORS } from '../../../api/color.ts';

// Stub Math.random for consistent results
vi.stubGlobal(`Math`, {
  random: () => 0.5,
  floor: Math.floor,
  ceil: Math.ceil,
  max: Math.max,
  min: Math.min,
});

describe(`transformLayer functions`, async () => {
  const buffer = await readFile(
    import.meta.dirname + `/goomba-24.bmp`,
  );
  const originalLayer = transformLayer.setBackground(
    transformLayer.pad(makeLayer.image(buffer), {
      x: 1,
      y: 4,
    }),
    brush.border(1, SET_COLORS.GREEN),
  );

  describe(`scaling`, () => {
    it(`should scale a layer by 2x`, async () => {
      const transformedLayer = transformLayer.scale(originalLayer, {
        x: 2,
        y: 10,
      });

      const bmp = exportImage(transformedLayer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-scaled-layer.bmp`,
        bmp,
      );
      expect(
        JSON.stringify(transformedLayer, null, 2),
      ).toMatchSnapshot();
    });

    it(`should scale a layer by 0.5x`, async () => {
      const transformedLayer = transformLayer.scale(originalLayer, {
        x: 0.5,
        y: 2,
      });

      const bmp = exportImage(transformedLayer);
      await writeFile(
        import.meta.dirname +
          `/__snapshots__/snap-scaled-down-layer.bmp`,
        bmp,
      );
      expect(
        JSON.stringify(transformedLayer, null, 2),
      ).toMatchSnapshot();
    });
  });

  describe(`rotation`, () => {
    it(`should rotate a layer by all degrees`, async () => {
      const layers = [
        transformLayer.rotate(originalLayer, 0),
        transformLayer.rotate(originalLayer, 90),
        transformLayer.rotate(originalLayer, 180),
        transformLayer.rotate(originalLayer, 270),
      ];

      const out = transformLayer.stackHorizontal(layers);

      const bmp = exportImage(out);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-rotated-layer.bmp`,
        bmp,
      );
      expect(JSON.stringify(out, null, 2)).toMatchSnapshot();
    });
  });

  describe(`paint`, () => {
    it(`should repaint a layer based on contents`, async () => {
      const transformedLayer = transformLayer.paint(
        originalLayer,
        (color) => () => (color === 0xcbe8f7 ? 0x00ff00 : color),
      );

      const bmp = exportImage(transformedLayer);
      await writeFile(
        import.meta.dirname + `/__snapshots__/snap-painted-layer.bmp`,
        bmp,
      );
      expect(
        JSON.stringify(transformedLayer, null, 2),
      ).toMatchSnapshot();
    });
  });
});
