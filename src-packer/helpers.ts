import chalk from "chalk";

export const printCharacter = (char: (0 | 1)[], width: number) => {
  for (let index = 0; index < char.length; index++) {
    const element = char[index];
    if (index !== 0 && index % width === 0) {
      process.stdout.write(` - ${index} - ${width}` + "\n");
    }
    process.stdout.write(element ? chalk.bgYellowBright("◼") : "◻");
  }
  console.log("");
};
