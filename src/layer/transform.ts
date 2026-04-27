import type { XYCoords, Layer, SingleChannelLayer } from "../_d.ts";
import {
  getPixelXYCoords,
  getPixelColor,
  getPixelFromSingleChannelLayer,
} from "../pixel.ts";
import { createLayer } from "./create.ts";
import {
  blendColor,
  solidFillBrush,
  transparentBrush,
  type Brush,
  type Color,
} from "../color.ts";
import { report, WarnError } from "../sys/report.ts";

/**
 * Applies what i think is a nearest-neighbor transform to the layer. only integrer transforms _really_ work for precise results but you can get some cool effects with floats
 * */
export const scaleLayer = (
  source: Layer,
  [scaleX, scaleY]: XYCoords,
): Layer => {
  return createLayer(
    [
      Math.floor(source.width * scaleX),
      Math.floor(source.height * scaleY),
    ],
    (index, meta) => {
      const {
        pos: [x, y],
      } = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelColor(
        [Math.floor(x / scaleX), Math.floor(y / scaleY)],
        source,
      );

      return maybeTargetPixel ?? [0, 255, 0];
    },
  );
};

export const paintLayer = (
  layer: Layer,
  painter: (existingColor: Color) => Brush,
): Layer => {
  const data = [];
  for (
    let index = 0;
    index < layer.width * layer.height * 3;
    index = index + 3
  ) {
    const { pos } = getPixelXYCoords(index, layer);
    const sourcePixelColor = getPixelColor(
      pos,
      layer,
    ) as NonNullable<Color>;

    const newColor = painter(sourcePixelColor)(index, layer);
    data.push(newColor[0]);
    data.push(newColor[1]);
    data.push(newColor[2]);
  }

  return { ...layer, data };
};

/**
 * Turns a 1 bit layer into a 3 bit layer.
 *
 * Note!!! 1 bit layers are only really supported for fonts bc its a pain to reason about both at once
 * */
export const inflateLayer = (
  layer: SingleChannelLayer,
  fgBrush: Brush = solidFillBrush([255, 255, 255]),
  bgBrush: Brush = transparentBrush(),
): Layer => {
  return createLayer(
    [Math.floor(layer.width), Math.floor(layer.height)],
    (index, meta) => {
      const {
        pos: [x, y],
      } = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelFromSingleChannelLayer(
        [x, y],
        layer,
      );

      return maybeTargetPixel
        ? fgBrush(index, meta)
        : bgBrush(index, meta);
    },
  );
};
type LayerParams = { offset?: XYCoords };

/*
Put a layer over another, apply an offset and a blend mode if desired
*/
export const overlayLayerOver = (
  source: Layer,
  target: Layer,
  { offset = [0, 0] }: LayerParams = {},
) => {
  const data = [];
  const [offsetX, offsetY] = offset;
  for (
    let index = 0;
    index < source.width * source.height * 3;
    index = index + 3
  ) {
    const { pos } = getPixelXYCoords(index, source);
    const sourcePixelColor = getPixelColor(
      pos,
      source,
    ) as NonNullable<Color>;
    const maybeTargetPixelColor = getPixelColor(
      [pos[0] - offsetX, pos[1] - offsetY],
      target,
    );

    const newColor = blendColor(
      maybeTargetPixelColor,
      sourcePixelColor,
    );
    data.push(newColor[0]);
    data.push(newColor[1]);
    data.push(newColor[2]);
  }

  return { ...source, data };
};

export const overlayLayersOver = (
  ...args: [Layer, LayerParams?][]
) => {
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
