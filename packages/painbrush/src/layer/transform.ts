import {
  getPixelXYCoords,
  getPixelColor,
  getPixelFromSingleChannelLayer,
  type XYCoords,
  COORDS_ZERO,
} from "../pixel.ts";
import {
  makeBlankLayer,
  makeRectangleLayer,
} from "./make-rectangle.ts";
import {
  blendColor,
  COLOR_ALPHA,
  type Color,
} from "../color/utils.ts";
import {
  solidFillBrush,
  alphaBrush,
  type Brush,
} from "../color/brush.ts";
import type {
  Layer,
  FourChannelLayer,
  SingleChannelLayer,
} from "../layer.ts";

/**
 * Applies what i think is a nearest-neighbor transform to the layer. only integer transforms _really_ work for precise results but you can get some cool effects with floats
 * */
export const scaleLayer = (
  source: Layer,
  { x: scaleX, y: scaleY }: XYCoords,
): Layer => {
  return makeRectangleLayer(
    {
      x: ~~(source.width * scaleX),
      y: ~~(source.height * scaleY),
    },
    (index, meta) => {
      const { x, y } = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelColor(
        { x: Math.floor(x / scaleX), y: Math.floor(y / scaleY) },
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
    const coords = getPixelXYCoords(index, layer);
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
 * moving stuff
 */
export const padLayer = (source: Layer, offset: XYCoords) => {
  const target = makeBlankLayer({
    x: source.width + offset.x * 2,
    y: source.height + offset.y * 2,
  });
  punchLayerOver(target, source, {
    offset,
  });
  return target;
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
  bgBrush: Brush = alphaBrush(),
): Layer => {
  return makeRectangleLayer(
    { x: Math.floor(layer.width), y: Math.floor(layer.height) },
    (index, meta) => {
      const coords = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelFromSingleChannelLayer(
        coords,
        layer,
      );

      return maybeTargetPixel
        ? fgBrush(index, meta)
        : bgBrush(index, meta);
    },
  );
};
type LayerParams = {
  offset?: XYCoords;
};

/*
Faster but destructive. No blend modes, no checks, super useful if painting over canvases tho. overrides source.
*/
export const punchLayerOver = (
  source: Layer,
  target: Layer,
  { offset = COORDS_ZERO }: LayerParams = {},
): void => {
  const data = source.data;
  for (
    let index = 0;
    index < source.width * source.height * 3;
    index = index + 3
  ) {
    const coords = getPixelXYCoords(index, source);
    const maybeTargetPixelColor = getPixelColor(
      { x: coords.x - offset.x, y: coords.y - offset.y },
      target,
    );
    if (maybeTargetPixelColor) {
      data[index] = maybeTargetPixelColor[0];
      data[index + 1] = maybeTargetPixelColor[1];
      data[index + 2] = maybeTargetPixelColor[2];
    }
  }
};

/*
Overlay a layer over another, apply an offset and maybe eventually a blend mode??
*/
export const overlayLayerOver = (
  source: Layer,
  target: Layer,
  { offset = COORDS_ZERO }: LayerParams = {},
) => {
  const data = [];
  for (
    let index = 0;
    index < source.width * source.height * 3;
    index = index + 3
  ) {
    const coords = getPixelXYCoords(index, source);
    const maybeTargetPixelColor = getPixelColor(
      { x: coords.x - offset.x, y: coords.y - offset.y },
      target,
    );

    const sourcePixelColor = getPixelColor(
      coords,
      source,
    ) as NonNullable<Color>;
    const newColor = blendColor(
      maybeTargetPixelColor,
      sourcePixelColor,
    );
    data[index] = newColor[0];
    data[index + 1] = newColor[1];
    data[index + 2] = newColor[2];
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
    console.warn("You tried to overlay 0 layers wtf");
    return makeBlankLayer(COORDS_ZERO);
  }
  let [canvas, canvasParams] = first;
  if (canvasParams != null) {
    console.warn(
      "Your initial canvas had layer transform parameters." +
        "\n" +
        "If you want to do that, place that layer it on top of a blank non-transformed layer",
    );
  }

  for (let arg of args) {
    canvas = overlayLayerOver(canvas, arg[0], arg[1]);
  }
  return canvas;
};
