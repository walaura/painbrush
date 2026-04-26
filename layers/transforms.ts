import type {
  Brush,
  Color,
  Coords,
  RGBLayer,
  SingleChannelLayer,
} from "./d.ts";
import { getLayerPixelData, getPixelFromLayer } from "./data.ts";
import { createRGBLayer, solidFillBrush } from "./draw.ts";

/*
Put a layer over another, apply an offset and a blend mode if desired
*/
export const overlayLayerOver = (
  source: RGBLayer,
  target: RGBLayer,
  offset: Coords = { x: 0, y: 0 },
) => {
  const newData = source.data.map((pixel, index) => {
    const { x, y, currentSubpixelElement } = getLayerPixelData(index, source);
    const maybeTargetPixel = getPixelFromLayer(
      {
        x: x - offset.x,
        y: y - offset.y,
      },
      target,
    );
    if (maybeTargetPixel) {
      return maybeTargetPixel[currentSubpixelElement];
    }
    return pixel;
  });

  return { ...source, data: newData };
};

export const scaleLayer = (source: RGBLayer, scale: number): RGBLayer => {
  return createRGBLayer(
    Math.floor(source.width * scale),
    Math.floor(source.height * scale),
    (index, meta) => {
      const { x, y } = getLayerPixelData(index, meta);
      const maybeTargetPixel = getPixelFromLayer(
        {
          x: Math.floor(x / scale),
          y: Math.floor(y / scale),
        },
        source,
      );

      return maybeTargetPixel ?? [0, 255, 0];
    },
  );
};

/* turns a 1 bit layer into a 3 bit layer */
export const inflateLayer = <L = SingleChannelLayer>(
  layer: L,
  fillerFn?: Brush<L> = solidFillBrush([255, 255, 0]),
) => {};
