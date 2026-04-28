import { cp, readFile, writeFile } from "node:fs/promises";

const pkg = await readFile("./package.json", "utf8");

await writeFile("./dist/package.json", pkg.replaceAll(".ts", ".js"));
await cp("./static", "./dist/static", {
  recursive: true,
});
await cp("./readme.md", "./dist/readme.md", {
  recursive: true,
});
