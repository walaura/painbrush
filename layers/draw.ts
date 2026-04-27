import type { Brush, Color, LayerMeta, RGBLayer } from "./d.ts";
import { getLayerPixelData } from "./data.ts";
import { useFont } from "../type/type.ts";

export const solidFillBrush = (color: Color) => () => color;

/**
kk this is a fuck but il deal w it tomo
*/
export const createTextLayer = (
  text: string,
  fgBrush: Brush = solidFillBrush([255, 255, 255]),
  bgBrush: Brush = solidFillBrush([0, 0, 0]),
): RGBLayer => {
  const textLength = text.length;
  const { getCharacter, monoSize } = useFont("chars");

  const layerWidth = monoSize.x * textLength;
  const layerHeight = monoSize.y;

  let data = [];
  const layerMeta = {
    width: layerWidth,
    height: layerHeight,
    channels: 3,
  };

  for (let index = 0; index < layerWidth * layerHeight * 3; index++) {
    const {
      pos: [pixelX, pixelY],
      currentSubpixelElement,
    } = getLayerPixelData(index, layerMeta);

    const charX = Math.floor(pixelX / monoSize.x);

    const charXPixelOffset = pixelX - charX * monoSize.x;
    const charYPixelOffset = pixelY - 0 * monoSize.x;

    const charPixelPos = charXPixelOffset + charYPixelOffset * monoSize.x;
    console.log(text);
    const character = getCharacter(text[charX]);
    data.push(
      (character[charPixelPos]
        ? fgBrush(index, layerMeta)
        : bgBrush(index, layerMeta))[currentSubpixelElement],
    );
  }

  return {
    ...layerMeta,
    data,
  };
};

/**
This makes a rectangle with any fill. useful for your initial canvas
*/
export const createRGBLayer = (
  width: number,
  height: number,
  brush: Brush<LayerMeta> = solidFillBrush([255, 255, 255]),
): RGBLayer => {
  let data = [];
  const meta = { width, height, channels: 3 };

  for (let index = 0; index < width * height * 3; index++) {
    const { currentSubpixelElement } = getLayerPixelData(index, meta);
    data.push(brush(index, meta)[currentSubpixelElement]);
  }

  return {
    ...meta,
    data,
  };
};
