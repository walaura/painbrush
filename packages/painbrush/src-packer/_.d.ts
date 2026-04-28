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
    color: [number, number, number];
    background: [number, number, number];
  };
};

export type PackerIntakeData = {
  img: NonSharedBuffer;
  fontMeta: FontMetaJSON;
  fontName: string;
  cwd: string;
  outDir: string;
};

export type PackerCharacter = (o | 1)[];

export type PackerCharactersWithTrim = [
  trim: number,
  char: PackerCharacter,
][];

export type PackerFileOp<Contents> = [
  name: string,
  contents: Contents,
];
