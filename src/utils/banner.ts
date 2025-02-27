import chalk from "chalk";
import figlet from "figlet";

export function displayBanner(): void {
  console.log(
    chalk.cyan(figlet.textSync("llmine", { horizontalLayout: "full" })),
  );
}
