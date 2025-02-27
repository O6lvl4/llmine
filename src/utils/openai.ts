import chalk from "chalk";
import OpenAI from "openai";
import { config } from "./config";

let openaiClient: OpenAI | null = null;

/**
 * OpenAIクライアントを初期化し、使い回す。
 */
export function initOpenAI(): OpenAI {
  if (!config.openaiApiKey) {
    console.error(
      chalk.red(
        "OpenAI API Keyが設定されていません。`llmine keys set openai`で設定してください。",
      ),
    );
    process.exit(1);
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: config.openaiApiKey,
    });
  }

  return openaiClient;
}
