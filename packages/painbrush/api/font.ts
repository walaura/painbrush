/*
eslint-disable no-restricted-imports
*/

import {
  useFont as useFont_INTERNAL,
  getDefaultFontHandleNode as getDefaultFontHandleNode_INTERNAL,
  DEFAULT_CHAR_RESOLVER as DEFAULT_CHAR_RESOLVER_INTERNAL,
} from '../src/font/font.ts';

/**
'Unpacks' a handle to a .pxfont file into images so it
can be used to draw.

You can override the char resolver by using 
DEFAULT_CHAR_RESOLVER as a starting point
*/
export const useFont = useFont_INTERNAL;

/**
 * This is poxel, a lil pixel font i whipped up to start with.
 * its very limited
 */
export const getDefaultFontHandleNode =
  getDefaultFontHandleNode_INTERNAL;

/**
 * Feel free to add to this in yours to maybe remove accents etc
 */
export const DEFAULT_CHAR_RESOLVER = DEFAULT_CHAR_RESOLVER_INTERNAL;

export { type Font } from '../src/font/font.ts';
