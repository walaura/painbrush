import { readFile, writeFile } from "node:fs/promises";

const pkg = await readFile("./package.json", "utf8");

await writeFile("./dist/.package.json", pkg);
