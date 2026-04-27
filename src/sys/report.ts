import chalk from "chalk";

export class WarnError extends Error {
  toString = () => this.message;
}

export class FatalError extends Error {
  toString = () => this.message;
}

export const report = (makeError: () => void) => {
  try {
    makeError();
  } catch (error) {
    if (error instanceof WarnError) {
      console.log("👋 (non fatal) ");

      const parts = error
        .toString()
        .split("\n")
        .map((s) => `   ${s}`);

      console.warn(chalk.yellow(parts.shift()));
      parts.forEach((p) => console.warn(p));
      console.log("");
      console.log(chalk.gray(error.stack));
      return;
    }
    throw error;
  }
};
