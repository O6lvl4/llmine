// src/commands/defaultCommand.ts
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createAIClient } from "../utils/aiClient";

export function defaultCommand(program: Command) {
  program
    .argument("[prompt]", "プロンプト")
    .option("-m, --model <model>", "モデルを指定", "gpt-3.5-turbo")
    .option("-t, --temperature <temp>", "温度パラメータ (0-2)", "0.7")
    .option(
      "-p, --provider <provider>",
      "使用するプロバイダ (openai / azure)",
      "openai",
    )
    .action(async (promptText, options) => {
      // STDINにパイプがあれば読み込み
      if (!process.stdin.isTTY) {
        let pipedData = "";
        for await (const chunk of process.stdin) {
          pipedData += chunk;
        }
        pipedData = pipedData.trim();
        // コマンドライン引数がある場合は連結、なければパイプの内容のみ
        promptText = promptText
          ? `${promptText}\n\n${pipedData}`
          : pipedData;
      }

      if (!promptText) {
        // Prompt がなければ help を表示
        program.help();
        return;
      }

      const spinner = ora("LLMからの応答を待っています...")
      try {
        // createAIClient は 1 つの引数のみ
        const aiClient = createAIClient(options.provider);
        spinner.start();

        // createChatCompletion の引数は [messages], temperature, modelId の順です
        const answer = await aiClient.createChatCompletion(
          [{ role: "user", content: promptText }],
          parseFloat(options.temperature),
          options.model,
        );

        spinner.stop();
        if (process.stdout.isTTY) {
        console.log(chalk.green("\n回答:"));
        }
        console.log(answer);
      } catch (error: unknown) {
        spinner.stop();
        const errorMessage =
          error instanceof Error ? error.message : "不明なエラー";
        console.error(chalk.red(`エラー: ${errorMessage}`));
      }
    });
}
