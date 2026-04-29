/*
eslint-disable no-restricted-imports
*/
import {
  punchLayerOver,
  overlayLayerOver,
  overlayLayersOver,
} from '../src/layer/compose.ts';
import {
  makeBlankLayer,
  makeBlankLayerWithAlpha,
} from '../src/layer/make/blank.ts';
import { makeImageLayer } from '../src/layer/make/image.ts';
import { makeTextLayer } from '../src/layer/make/text.ts';
import {
  scaleLayer,
  paintLayer,
  padLayer,
  setBackgroundOfLayer,
} from '../src/layer/transform.ts';

export type * from '../src/layer/make/blank.ts';

import type { Color } from 'painbrush/color';
import type { XYCoords } from 'painbrush/pixel';

type LayerId = number;

export interface LayerMeta extends XYCoords {
  __isLayer: true;
}
export interface Layer extends LayerMeta {
  /**
   * This is a Math.rand() that can
   * be used on brushes to apply per-layer effects
   */
  id: LayerId;
  pixels: Color[];
}

/**
Operations to make new layers
*/
export const makeLayer = {
  /**
  This makes a basic layer with any fill brush. Great base canvas
  */
  blank: makeBlankLayer,

  /**
  This makes a blank layer thats transparent in one shot
  */
  blankWithAlpha: makeBlankLayerWithAlpha,

  /**
  Loads up a bmp file as a layer, only some 
  bits are supported! but anything from mspaint should be fine
  */
  image: makeImageLayer,

  /**
   * Writes text on a layer
   */
  text: makeTextLayer,
};

/**
Operations to transform and otherwise mess with layers
*/
export const transformLayer = {
  /**
  Applies what i think is a nearest-neighbor transform 
  to the layer. only integer transforms _really_ work 
  for precise results but you can get some cool effects with floats
  */
  scale: scaleLayer,

  /**
  Loop over layer pixels to paint them in a different way
  */
  paint: paintLayer,

  /**
  Adds a padding to all four sides of any layer in a
  transparent background, you can composite this layer
  with addBackgroundToLayer
  */
  pad: padLayer,

  /**
    Puts a background color under a transparent layer,
    great for using with padLayer
  */
  setBackground: setBackgroundOfLayer,
};

/**
Operations to compose layers together
*/
export const composeLayer = {
  /*
  OVERRIDES SOURCE!!

  Fast but destructive. No blend modes, no checks,
  super useful if painting over canvases tho.
  
  OVERRIDES SOURCE!!
  */
  punch: punchLayerOver,

  /*
  Overlay a layer over another, apply an offset
  and maybe eventually a blend mode??
  */
  overlay: overlayLayerOver,

  /**
  Join a bunch of layers.
  
  Note that this is reversed (front to back) so
  it matches how most layers work in software.
  its confusing if you think about it but makes sense if you do
  */
  overlayStack: overlayLayersOver,
};
