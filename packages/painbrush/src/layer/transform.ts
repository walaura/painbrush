import {
  getPixelXYCoords,
  getPixelColor,
  type XYCoords,
  COORDS_ZERO,
  getPixelIndexFromCoords,
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
import { type Brush } from "../color/brush.ts";
import type { Layer } from "../layer.ts";
import type { LayerParams } from "../image.ts";

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
      const coords = getPixelXYCoords(index, meta);
      const maybeTargetPixel = getPixelColor(
        { x: ~~(coords.x / scaleX), y: ~~(coords.y / scaleY) },
        source,
      );
      return maybeTargetPixel ?? COLOR_ALPHA;
    },
  );
};

export const paintLayer = (
  layer: Layer,
  painterFn: (existingColor: Color) => Brush,
): Layer => {
  const pixels = [];
  for (
    let index = 0;
    index < layer.width * layer.height;
    index = index + 1
  ) {
    const coords = getPixelXYCoords(index, layer);
    const sourcePixelColor = getPixelColor(
      coords,
      layer,
    ) as NonNullable<Color>;

    const newColor = painterFn(sourcePixelColor)(index, layer);
    pixels.push(newColor);
  }

  return { ...layer, pixels };
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

/*
Faster but destructive. No blend modes, no checks, super useful if painting over canvases tho. overrides source.
*/
export const punchLayerOver = (
  back: Layer,
  front: Layer,
  { offset = COORDS_ZERO }: LayerParams = {},
): void => {
  const pixels = back.pixels;
  for (
    let index = 0;
    index < front.width * front.height;
    index = index + 1
  ) {
    const coords = getPixelXYCoords(index, front);
    const frontPixelColor = getPixelColor(coords, front) as Color;

    const backPixelIndex = getPixelIndexFromCoords(
      {
        x: coords.x + offset.x,
        y: coords.y + offset.y,
      },
      back,
    );

    pixels[backPixelIndex] = frontPixelColor;
  }
};

/*
Overlay a layer over another, apply an offset and maybe eventually a blend mode??
*/
export const overlayLayerOver = (
  back: Layer,
  front: Layer,
  { offset = COORDS_ZERO }: LayerParams = {},
) => {
  const pixels = [...back.pixels];
  for (
    let index = 0;
    index < front.width * front.height;
    index = index + 1
  ) {
    const coords = getPixelXYCoords(index, front);
    const coordsAtBack = {
      x: coords.x + offset.x,
      y: coords.y + offset.y,
    };

    const frontPixelColor = getPixelColor(coords, front) as Color;
    const backPixelColor = getPixelColor(coordsAtBack, back);
    if (backPixelColor === null) {
      continue;
    }

    const backPixelIndex = getPixelIndexFromCoords(
      coordsAtBack,
      back,
    );
    const newColor = blendColor(frontPixelColor, backPixelColor);
    pixels[backPixelIndex] = newColor;
  }

  return { ...back, pixels };
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
