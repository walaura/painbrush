export interface ImageMeta {
  width: number;
  height: number;
}
export interface SingleChannelImage extends ImageMeta {
  data: number[];
  channels: 1;
}
export interface MultiChannelImage extends ImageMeta {
  data: number[];
  channels: 3 | 4;
}
