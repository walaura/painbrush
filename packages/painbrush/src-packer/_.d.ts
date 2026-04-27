export type FontMetaJSON = {
  metrics: FontMetrics;
  cols: number;
  /**
   * row-separated array of strings representing the characters shown in the bmp
   */
  alphabet: string[];
  /**
   * Keyed object specifying how many trailing horizontal pixel columns to trim from the character, for narrow characters
   */
  trim: {
    [key: string]: number;
  };
  /**
   * Configure how the specimen image will show up
   */
  specimen: {
    color: Color;
    background: Color;
  };
};
