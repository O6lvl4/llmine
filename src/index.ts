#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";

// コマンド群
import { defaultCommand } from "./commands/defaultCommand";
import { keysCommand } from "./commands/keysCommand";
import { modelsCommand } from "./commands/modelsCommand";
import { helpCommand } from "./commands/helpCommand";

const program = new Command();

// 基本情報
program
  .name("llmine")
  .description("コマンドラインからLLMにアクセス")
  .version("1.0.2");

// コマンドの登録
helpCommand(program); // help コマンド (llmine help)
keysCommand(program); // keys コマンド (llmine keys ...)
modelsCommand(program); // models コマンド (llmine models)
defaultCommand(program); // デフォルトコマンド ([prompt])

// 引数なしの場合はヘルプを表示
if (process.argv.length <= 2) {
  console.log(
    chalk.cyan(figlet.textSync("llmine", { horizontalLayout: "full" })),
  );
  program.help(); // ここでヘルプを表示して終了
}

// コマンドを解析
program.parse(process.argv);
