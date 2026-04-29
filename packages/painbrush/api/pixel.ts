/*
eslint-disable no-restricted-imports
*/
import {
  getPixelColor,
  getPixelIndexFromCoords,
  getPixelXYCoords,
} from '../src/pixel.ts';

export const COORDS_ZERO = { x: 0, y: 0 };

export { type XYCoords } from '../src/pixel.ts';

/**
 Given a layer (color[]) and coords, 
 identify the pixel color of those coords
 */
export const getColor = getPixelColor;

/**
 Given a layer (color[]), 
 identify the x,y coords of the pixel at index
 */
export const getXYCoords = getPixelXYCoords;

/**
 Given a layer (color[]) and coords, 
 identify the pixel index of those coords
 */

export const getIndexFromCoords = getPixelIndexFromCoords;
