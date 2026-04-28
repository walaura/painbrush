//@ts-expect-error
import poxelHandle from "painbrush/_DEFAULT_FONT_.pxfont";
//@ts-expect-error`
import lucasHandle from "./lucas.pxfont";
import { makeRenderCall } from "./draw.ts";

const init = async () => {
  const sliders = [...document.querySelectorAll("input")].map(
    (input) => parseFloat(input.value),
  );

  const renderImage = await makeRenderCall(poxelHandle, lucasHandle);
  const updateImgTag = async () => {
    let img = await renderImage({
      bgColor: sliders[0],
      pos: sliders[1],
      posY: sliders[2],
      zoom: sliders[3],
    });
    requestAnimationFrame(async () => {
      (document.querySelector("img") as HTMLImageElement).src =
        `data:image/bmp;base64,${Buffer.from(img).toString("base64")}`;
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
