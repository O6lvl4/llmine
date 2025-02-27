import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";

/**
 * help サブコマンド
 * llmine help でメインのヘルプを表示する
 */
export function helpCommand(program: Command) {
  program
    .command("help")
    .description("ヘルプを表示")
    .action(() => {
      program.help(); // Commander.js の組み込みヘルプを呼び出す
    })
    .hook("preAction", () => {
      console.log(
        chalk.cyan(figlet.textSync("llmine", { horizontalLayout: "full" })),
      );
    });
}
