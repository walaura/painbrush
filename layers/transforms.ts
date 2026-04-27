import type { Brush, Coords, RGBLayer, SingleChannelLayer } from "./d.ts";
import { getLayerPixelData, getPixelFromLayer } from "./data.ts";
import { createRGBLayer, solidFillBrush } from "./draw.ts";

type LayerParams = { offset?: Coords };

/*
Put a layer over another, apply an offset and a blend mode if desired
*/
export const overlayLayerOver = (
  source: RGBLayer,
  target: RGBLayer,
  { offset = [0, 0] }: LayerParams = {},
) => {
  const newData = source.data.map((pixel, index) => {
    const [offsetX, offsetY] = offset;
    const {
      pos: [x, y],
      currentSubpixelElement,
    } = getLayerPixelData(index, source);
    const maybeTargetPixel = getPixelFromLayer(
      [x - offsetX, y - offsetY],
      target,
    );
    if (maybeTargetPixel) {
      return maybeTargetPixel[currentSubpixelElement];
    }
    return pixel;
  });

  return { ...source, data: newData };
};

export const overlayLayersOver = (...args: [RGBLayer, LayerParams?][]) => {
  for (let [layer, params] of args) {
    console.log(params);
  }
};

export const scaleLayer = (source: RGBLayer, scale: number): RGBLayer => {
  return createRGBLayer(
    Math.floor(source.width * scale),
    Math.floor(source.height * scale),
    (index, meta) => {
      const {
        pos: [x, y],
      } = getLayerPixelData(index, meta);
      const maybeTargetPixel = getPixelFromLayer(
        [Math.floor(x / scale), Math.floor(y / scale)],
        source,
      );

      return maybeTargetPixel ?? [0, 255, 0];
    },
  );
};

/* turns a 1 bit layer into a 3 bit layer */
export const inflateLayer = <L = SingleChannelLayer>(
  layer: L,
  fillerFn: undefined | Brush<L> = solidFillBrush([255, 255, 0]),
) => {};
