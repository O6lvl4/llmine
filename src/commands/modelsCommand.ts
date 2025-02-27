import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

import { createAIClient } from "../utils/aiClient";

export function modelsCommand(program: Command) {
  program
    .command("models")
    .description("利用可能なモデルを表示")
    .option("-p, --provider <provider>", "使用するプロバイダ (openai / azure)")
    .action(async (options) => {
      try {
        const spinner = ora("モデル一覧を取得しています...").start();

        // AIクライアント生成（引数は1つのみ）
        const aiClient = createAIClient(options.provider);

        // listModels が実装されている場合のみ呼び出し
        if (!aiClient.listModels) {
          spinner.stop();
          console.log(
            chalk.yellow("このプロバイダではモデル一覧を取得できません。"),
          );
          return;
        }

        const models = await aiClient.listModels();
        spinner.stop();

        console.log(chalk.cyan("利用可能なモデル/デプロイ:"));
        console.log(chalk.cyan("----------------"));
        models.forEach((m) => {
          console.log(`  - ${m}`);
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "不明なエラー";
        console.error(chalk.red(`エラー: ${errorMessage}`));
      }
    });
}
