import { report, WarnError } from "../sys/report.ts";
import type { Brush, Coords, Layer, SingleChannelLayer } from "./d.ts";
import { getLayerPixelData, getPixelFromLayer } from "./data.ts";
import { createLayer, solidFillBrush } from "./draw.ts";

type LayerParams = { offset?: Coords };

/*
Put a layer over another, apply an offset and a blend mode if desired
*/
export const overlayLayerOver = (
  source: Layer,
  target: Layer,
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

export const overlayLayersOver = (...args: [Layer, LayerParams?][]) => {
  const flippedArgs = args.reverse();
  let first = flippedArgs.shift();
  if (first == null) {
    return null;
  }
  let [canvas, canvasParams] = first;
  if (canvasParams != null) {
    report(() => {
      throw new WarnError(
        "Your initial canvas had layer transform parameters." +
          "\n" +
          "If you want to do that, place that layer it on top of a blank non-transformed layer",
      );
    });
  }

  for (let [layer, params] of args) {
    canvas = overlayLayerOver(canvas, layer, params);
  }
  return canvas;
};

/**
 * Applies what i think is a nearest-neighbor transform to the layer. only integrer transforms _really_ work for precise results but you can get some cool effects with floats
 * */
export const scaleLayer = (source: Layer, [scaleX, scaleY]: Coords): Layer => {
  return createLayer(
    Math.floor(source.width * scaleX),
    Math.floor(source.height * scaleY),
    (index, meta) => {
      const {
        pos: [x, y],
      } = getLayerPixelData(index, meta);
      const maybeTargetPixel = getPixelFromLayer(
        [Math.floor(x / scaleX), Math.floor(y / scaleY)],
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
