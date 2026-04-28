//@ts-expect-error
import poxelHandle from "painbrush/_DEFAULT_FONT_.pxfont";
//@ts-expect-error`
import lucasHandle from "./lucas.pxfont";
import { makeRenderCall } from "./draw.ts";

const init = async () => {
  let a = (
    document.querySelector("input:nth-child(1)") as HTMLInputElement
  ).value;
  let b = (
    document.querySelector("input:nth-child(2)") as HTMLInputElement
  ).value;
  let c = (
    document.querySelector("input:nth-child(3)") as HTMLInputElement
  ).value;

  const renderImage = await makeRenderCall(poxelHandle, lucasHandle);
  const updateImgTag = async () => {
    let img = await renderImage({
      bgColor: parseFloat(a),
      pos: parseFloat(b),
      zoom: parseFloat(c),
    });
    requestAnimationFrame(async () => {
      (document.querySelector("img") as HTMLImageElement).src =
        `data:image/bmp;base64,${Buffer.from(img).toString("base64")}`;
    });
  };

  (
    document.querySelector("input:nth-child(1)") as HTMLInputElement
  ).oninput = ({ target }) => {
    a = (target as HTMLInputElement).value ?? 0;
    updateImgTag();
  };
  (
    document.querySelector("input:nth-child(2)") as HTMLInputElement
  ).oninput = ({ target }) => {
    b = (target as HTMLInputElement).value ?? 0;
    updateImgTag();
  };
  (
    document.querySelector("input:nth-child(3)") as HTMLInputElement
  ).oninput = ({ target }) => {
    c = (target as HTMLInputElement).value ?? 0;
    updateImgTag();
  };
  updateImgTag();
};
init();
