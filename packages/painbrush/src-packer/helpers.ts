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

const report = (type: 0 | 1 | 2) => (msg: string) => {
  const prefix = {
    0: chalk.green(`✓ `),
    1: chalk.red(`☠ `),
    2: chalk.blue(`ℹ︎ `),
  }[type];
  console.log(prefix + msg);
};

export const reportYay = report(0);
export const reportNay = (msg: string) => {
  report(1)(msg);
};
export const reportInfo = report(2);
