import { Command } from "commander";
import chalk from "chalk";
import { prompt } from "inquirer";

import { config, saveConfig } from "../utils/config";

export function keysCommand(program: Command) {
  const keys = program
    .command("keys")
    .description("異なるモデル用のAPI Keyを管理");

  keys
    .command("set <provider>")
    .description("プロバイダーのAPI Keyを設定 (openai / azure)")
    .action(async (provider: string) => {
      switch (provider.toLowerCase()) {
        case "openai": {
          const answers = await prompt([
            {
              type: "password",
              name: "apiKey",
              message: "OpenAI API Keyを入力してください:",
              mask: "*",
            },
          ]);

          config.defaultProvider = "openai";
          config.openaiApiKey = answers.apiKey;
          saveConfig(config);
          console.log(chalk.green("OpenAI API Keyが設定されました。"));
          break;
        }
        case "azure": {
          const answers = await prompt([
            {
              type: "input",
              name: "resourceName",
              message:
                "Azure OpenAI リソース名を入力してください (例: azureopenai20250226 ):",
            },
            {
              type: "password",
              name: "apiKey",
              message: "Azure OpenAI API Keyを入力してください:",
              mask: "*",
            },
            {
              type: "input",
              name: "deployment",
              message:
                "Azure OpenAI Deployment Nameを入力してください (例: chat-gpt-35 ):",
            },
            {
              type: "input",
              name: "apiVersion",
              message:
                "Azure OpenAI APIバージョンを入力してください (例: 2024-05-01-preview ):",
            },
          ]);

          config.defaultProvider = "azure";
          config.azureOpenAIResourceName = answers.resourceName.trim();
          config.azureOpenAIKey = answers.apiKey.trim();
          config.azureOpenAIDeployment = answers.deployment.trim();
          config.azureOpenAIVersion = answers.apiVersion.trim();
          saveConfig(config);
          console.log(chalk.green("Azure OpenAI が設定されました。"));
          break;
        }
        default:
          console.log(
            chalk.yellow(`サポートされていないプロバイダー: ${provider}`),
          );
      }
    });

  keys
    .command("list")
    .description("設定されているAPI Keyを表示")
    .action(() => {
      console.log(chalk.cyan("現在の設定:"));
      console.log(chalk.cyan("---------------------"));
      console.log(
        chalk.cyan(
          `デフォルトプロバイダ: ${config.defaultProvider || "未設定"}`,
        ),
      );

      // OpenAI
      if (config.openaiApiKey) {
        console.log(
          chalk.cyan(
            `OpenAI: ${"*".repeat(8) + config.openaiApiKey.slice(-4)}`,
          ),
        );
      } else {
        console.log(chalk.cyan("OpenAI: 未設定"));
      }

      // Azure
      if (config.azureOpenAIResourceName && config.azureOpenAIKey) {
        console.log(
          chalk.cyan(
            `Azure: resource=${config.azureOpenAIResourceName}, key=${"*".repeat(8) + config.azureOpenAIKey.slice(-4)}`,
          ),
        );
        console.log(
          chalk.cyan(
            `       deployment=${config.azureOpenAIDeployment || "未設定"}`,
          ),
        );
      } else {
        console.log(chalk.cyan("Azure: 未設定"));
      }
    });

  // keysコマンド単体の呼び出し時
  keys.action(() => {
    console.log(chalk.yellow("使用例: llmine keys set openai"));
    console.log(chalk.yellow("使用例: llmine keys set azure"));
    console.log(chalk.yellow("使用例: llmine keys list"));
  });
}
