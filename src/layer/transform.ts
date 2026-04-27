import type {
  XYCoords,
  Layer,
  SingleChannelLayer,
  FourChannelLayer,
} from "../_d.ts";
import {
  getPixelXYCoords,
  getPixelColor,
  getPixelFromSingleChannelLayer,
} from "../pixel.ts";
import { makeRectangleLayer } from "./make-rectangle.ts";
import {
  blendColor,
  COLOR_ALPHA,
  type Color,
} from "../color/utils.ts";
import {
  solidFillBrush,
  transparentBrush,
  type Brush,
} from "../color/brush.ts";
import { report, WarnError } from "../sys/report.ts";

/**
 * Applies what i think is a nearest-neighbor transform to the layer. only integrer transforms _really_ work for precise results but you can get some cool effects with floats
 * */
export const scaleLayer = (
  source: Layer,
  [scaleX, scaleY]: XYCoords,
): Layer => {
  return makeRectangleLayer(
    [
      Math.floor(source.width * scaleX),
      Math.floor(source.height * scaleY),
    ],
    (index, meta) => {
      const {
        coords: [x, y],
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
    const { coords } = getPixelXYCoords(index, layer);
    const sourcePixelColor = getPixelColor(
      coords,
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
 * Helper for quickly spazzing out layouts, easier than manually
 * moving it
 */
export const padLayer = (
  source: Layer,
  [spacingX, spacingY]: XYCoords,
  bgBrush: Brush = transparentBrush(),
) => {
  const target = makeRectangleLayer(
    [
      source.width + spacingX * 2,
      source.height + spacingY * 2,
    ],
    bgBrush,
  );
  return overlayLayerOver(target, source, {
    offset: [spacingX, spacingY],
  });
};

/**
 * Turns a 4 bit layer into a 3 bit layer.
 * */
export const deflateLayer = (layer: FourChannelLayer): Layer => {
  let data = [];
  for (let i = 0; i < [...layer.data].length; i += 4) {
    if (layer.data[i + 3] === 0) {
      data.push(...COLOR_ALPHA);
      continue;
    }
    data.push(layer.data[i]);
    data.push(layer.data[i + 1]);
    data.push(layer.data[i + 2]);
  }
  const { isFourChannel, ...otherLayerStuff } = layer;
  return {
    ...otherLayerStuff,
    data,
  };
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
  return makeRectangleLayer(
    [Math.floor(layer.width), Math.floor(layer.height)],
    (index, meta) => {
      const {
        coords: [x, y],
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
    const { coords } = getPixelXYCoords(index, source);
    const sourcePixelColor = getPixelColor(
      coords,
      source,
    ) as NonNullable<Color>;
    const maybeTargetPixelColor = getPixelColor(
      [coords[0] - offsetX, coords[1] - offsetY],
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

/**
 * Join a bunch of layers.
 * Note that this is reversed (front to back) so it matches how most layers work in software. its confusing if you think about it but makes sense if you do
 */
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
