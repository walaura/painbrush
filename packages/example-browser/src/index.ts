//@ts-expect-error
import poxelHandle from "painbrush/_DEFAULT_FONT_.pxfont";
//@ts-expect-error`
import lucasHandle from "./lucas.pxfont";
import { makeRenderCall } from "./draw.ts";

const init = async () => {
  const sliders = [...document.querySelectorAll("input")].map(
    (input) => parseFloat(input.value),
  );

  let src: string = "";

  const renderImage = await makeRenderCall(poxelHandle, lucasHandle);
  const updateImgTag = async () => {
    let img = await renderImage({
      bgColor: sliders[0],
      pos: sliders[1],
      posY: sliders[2],
      zoom: sliders[3],
    });
    requestAnimationFrame(async () => {
      // @ts-expect-error
      const imgBlob = new Blob([img], {
        type: "image/bmp",
      });
      URL.revokeObjectURL(src);
      src = URL.createObjectURL(imgBlob);
      (document.querySelector("img") as HTMLImageElement).src = src;
    });
  };

  [...document.querySelectorAll("input")].map((input, index) =>
    input.addEventListener("input", (ev) => {
      sliders[index] = parseFloat(
        (ev.target as HTMLInputElement).value,
      );
      updateImgTag();
    }),
  );
  updateImgTag();
};
init();
