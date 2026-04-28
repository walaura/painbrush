// @ts-nocheck

//@ts-expect-error
import poxelHandle from "painbrush/_DEFAULT_FONT_.pxfont";
//@ts-expect-error`
import lucasHandle from "./lucas.pxfont";
import { makeRenderCall } from "./draw.ts";

const init = async () => {
  let c = window.lolw2.value;
  let b = window.lolw.value;

  const renderImage = await makeRenderCall(poxelHandle, lucasHandle);
  const updateImgTag = async () => {
    let img = await renderImage({
      bgColor: b,
      pos: c,
    });
    requestAnimationFrame(async () => {
      window.lol.src = `data:image/bmp;base64,${Buffer.from(img).toString("base64")}`;
    });
  };
  window.lolw.oninput = (a) => {
    b = a.target.value;
    updateImgTag();
  };
  window.lolw2.oninput = (a) => {
    c = a.target.value;
    updateImgTag();
  };
  updateImgTag();
};
init();
