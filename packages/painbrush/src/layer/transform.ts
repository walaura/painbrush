import {
  getPixelXYCoords,
  getPixelColor,
  type XYCoords,
  COORDS_ZERO,
  getPixelIndexFromCoords,
} from '../pixel.ts';
import {
  makeBlankLayerWithAlpha,
  makeBlankLayer,
} from './make/empty.ts';
import { blendColor, COLOR_ALPHA, type Color } from '../color.ts';
import { solidFillBrush, type Brush } from '../color/brush.ts';
import type { Layer } from '../layer.ts';
import type { LayerParams } from '../image/import.ts';

/**
  Applies what i think is a nearest-neighbor transform 
  to the layer. only integer transforms _really_ work 
  for precise results but you can get some cool effects with floats
  */
export const scaleLayer = (
  source: Layer,
  { x: scaleX, y: scaleY }: XYCoords,
): Layer => {
  return makeBlankLayer(
    {
      x: ~~(source.x * scaleX),
      y: ~~(source.y * scaleY),
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

/**
  Loop over layer pixels to paint them in a different way
  */
export const paintLayer = (
  layer: Layer,
  painterFn: (existingColor: Color) => Brush,
): Layer => {
  const pixels = [];
  for (let index = 0; index < layer.x * layer.y; index = index + 1) {
    const newColor = painterFn(layer.pixels[index])(index, layer);
    pixels.push(newColor);
  }

  return { ...layer, pixels };
};

/**
  Adds a padding to all four sides of any layer in a
  transparent background, you can composite this layer
  with addBackgroundToLayer
*/
export const padLayer = (source: Layer, offset: XYCoords) => {
  const target = makeBlankLayerWithAlpha({
    x: source.x + offset.x * 2,
    y: source.y + offset.y * 2,
  });
  punchLayerOver(target, source, {
    offset,
  });
  return target;
};

/**
  Puts a background color under a transparent layer,
  great for using with padLayer
*/
export const addBackgroundToLayer = (
  source: Layer,
  bgBrush: Brush = solidFillBrush(0xff00ff),
) => overlayLayerOver(makeBlankLayer(source, bgBrush), source);

/*
  Faster but destructive. No blend modes, no checks, 
  super useful if painting over canvases tho. 
  
  OVERRIDES SOURCE!!
*/
export const punchLayerOver = (
  back: Layer,
  front: Layer,
  { offset = COORDS_ZERO }: LayerParams = {},
): void => {
  const pixels = back.pixels;
  for (let index = 0; index < front.x * front.y; index = index + 1) {
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
  Overlay a layer over another, apply an offset 
  and maybe eventually a blend mode??
*/
export const overlayLayerOver = (
  back: Layer,
  front: Layer,
  { offset = COORDS_ZERO }: LayerParams = {},
) => {
  const pixels = [...back.pixels];
  for (let index = 0; index < front.x * front.y; index = index + 1) {
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
  Join a bunch of layers.
  
  Note that this is reversed (front to back) so 
  it matches how most layers work in software. 
  its confusing if you think about it but makes sense if you do
 */
export const overlayLayersOver = (
  ...args: [Layer, LayerParams?][]
) => {
  const flippedArgs = args.reverse();
  const first = flippedArgs.shift();
  if (first == null) {
    console.warn(`You tried to overlay 0 layers wtf`);
    return makeBlankLayerWithAlpha(COORDS_ZERO);
  }
  let [canvas, canvasParams] = first;
  if (canvasParams != null) {
    console.warn(
      `Your initial canvas had layer transform parameters.` +
      `\n` +
      `If you want to do that, place that` + `layer it on top of a blank non-transformed layer`,
    );
  }

  for (const arg of args) {
    canvas = overlayLayerOver(canvas, arg[0], arg[1]);
  }
  return canvas;
};
