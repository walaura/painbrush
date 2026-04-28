# Painbrush

<div align="center">
  
![""](https://github.com/walaura/painbrush/raw/main/packages/painbrush/doc/logo.png)

_to my knowledge, the only node-based bitmap raster drawing program - i do not wish to be challenged on this._

</div>

# HEY!! this is still undergoing lots of active dev so updates may break. im sticking to semver as much as a i can but yk take care

You can use this lib to generate images and text in the much loved bmp format. It's handy for og images for example, if you want that retro look ig.

## Getting started

```ts
import { writeFile } from "fs/promises";
import { toImage } from "painbrush/image";
import { makeTextLayer } from "painbrush/layer";
import { loadBuiltInFont } from "painbrush/typography";

const clock = makeTextLayer(
  Date.now().toString(),
  await loadBuiltInFont(),
);

await writeFile("image.bmp", toImage(clock));
```

Your code wont look that clean tho, see [this example file](https://github.com/walaura/painbrush/blob/main/packages/example/index.ts) for detailed comments. Whole directory is really good stuff. I'm not a good doc writer

There's more good stuff in there and the code is typescripted and somewhat commented so just have a play around

### Painbrush in use

- The aforementioned [example](https://github.com/walaura/painbrush/blob/main/packages/example/index.ts)
- i intend to put this on my website at a minimum but unfortunately i am awaiting for npm support to recover access to my account because i didnt set up a passkey or something
- Packing a font creates a specimen file. [see how at the end of this](https://github.com/walaura/painbrush/blob/main/packages/painbrush/packer.ts).

## Packing a font?

Ah my pride and joy. You can see how this is set up in the [examples project](https://github.com/walaura/painbrush/blob/main/packages/example) as well. Painbrush uses a custom pixel font format.

First you will need a pixel font. I make mine in aseprite and left them here if you wanna play around with them. Annoyingly you need to work in 2 bits (indexed color, 2 colors) or things won't work. your sprite can be in any format you want as long as its a consistent grid of letters, in any order.

<div align=center>

![""](https://github.com/walaura/painbrush/raw/main/packages/painbrush/doc/pixel.png)

</div>

Save this as a bmp and next we need a little manifest for it, which is a json file with the same name except its json you get this right

```js
{
  "metrics": {
    "height": 9, // height of the grid you made
    "width": 7, // width of the grid you made
    "spaces": 4 // how wide you want spaces to be
  },
  "cols": 11, // how many columns in your grid
  "alphabet": [
    // write out the letters you drew in the same order, include gaps
    "?1234567890",
    "!          ",
  ],
  // for characters that are too thin to look good as monospace, define how many pixels to shave off their right edge
  "trim": {
    "!": 3,
    "__DEFAULT__": 1 // if most of your characters need trim set this and then override the rest
  }
}

```

there's some example manifests [here](https://github.com/walaura/painbrush/blob/main/packages/example/test-junk/raw-fonts) that use these features (and even some more!)

when you are done run `painbrush-font-packer`. you can install this globally or reference it in your package.json, i dont really care what you do tbh

```
painbrush-font-packer -f ./fonts/pongers -o /assets

✓ Found bmp, json is valid
✓ 69 characters in pongers
✓ Wrote pxfont file at /projects/monalisa/assets/pongers.pxfont
✓ Wrote specimen file at /projects/monalisa/assets/pongers-specimen.bmp (check it out!)

✓ You can now use pongers as a font
```

You'll get a cool specimen file for your troubles, with all the characters. this is great to keep open if you are messing with the spacing too:

<div align=center>

![""](https://github.com/walaura/painbrush/raw/main/packages/example/fonts/poxel-specimen.bmp)

</div>

And then just import it.

## Thats all!

I'd love to know if this brought you joy or you are using it! ping me on bsky ([@freezydorito.lol](https://bsky.app/profile/freezydorito.lol)) if you do!!
