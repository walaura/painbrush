type LayerId = number;

import { XYCoords } from '../../api/pixel.ts';

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
