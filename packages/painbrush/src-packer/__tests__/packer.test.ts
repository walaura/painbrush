import { describe, it, expect } from 'vitest';
import {
  generateCharacters,
  generatePxFontFile,
  generateSpecimenImage,
} from '../pipeline.ts';
import { readFile } from 'node:fs/promises';
import path from 'path';
import type { PackerIntakeData } from '../../dist/src-packer/helpers.js';

describe(`Packer`, async () => {
  const intakeData: PackerIntakeData = await (async () => {
    const imgBuffer = await readFile(
      path.join(__dirname, `demo-sans.bmp`),
    );
    const jsonBuffer = await readFile(
      path.join(__dirname, `demo-sans.json`),
    );

    const fontMeta = JSON.parse(jsonBuffer.toString());

    const cwd = `C:/__TEST__/`;

    return {
      img: imgBuffer,
      fontMeta,
      fontName: `test-serif`,
      cwd,
      outDir: `not-fonts`,
    };
  })();

  it(`should generate characters from demo font`, async () => {
    const result = await generateCharacters(intakeData);
    expect(result).toMatchSnapshot();
    const pxFont = await generatePxFontFile(result, intakeData);
    expect(pxFont[0]).toEqual(
      `C:/__TEST__/not-fonts/test-serif.pxfont`,
    );
    expect(pxFont).toMatchSnapshot();
    const image = await generateSpecimenImage(pxFont, intakeData);
    expect(image[0]).toEqual(
      `C:/__TEST__/not-fonts/test-serif-specimen.bmp`,
    );
    expect(image).toMatchSnapshot();
  });
});
