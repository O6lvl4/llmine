// src/utils/aiClient.ts
import chalk from "chalk";
import { config } from "./config";
import { createOpenAI } from "@ai-sdk/openai";
import { createAzure } from "@ai-sdk/azure";
import { LanguageModelV1, LanguageModelV1Prompt } from "ai";

export type ProviderType = "openai" | "azure";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * AIClient インターフェイス
 */
export interface AIClient {
  createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string>;
  listModels?(): Promise<string[]>;
}

/**
 * チャットメッセージ配列を LanguageModelV1Prompt に変換するユーティリティ関数
 * ※各メッセージは role と、内容を text-part として設定
 */
function convertMessagesToPrompt(
  messages: ChatMessage[],
): LanguageModelV1Prompt {
  return messages.map((m) => ({
    role: m.role,
    content: [{ type: "text", text: m.content }],
  }));
}

/**
 * OpenAI 用クライアント
 */
class VercelOpenAIClient implements AIClient {
  private openai;
  constructor(apiKey: string) {
    this.openai = createOpenAI({ apiKey });
  }
  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string> {
    const prompt = convertMessagesToPrompt(messages);
    // CLI 指定または設定ファイルのデフォルトを解決
    const resolvedModelId = config.defaultOpenAIModelId ?? "gpt-4";
    const model: LanguageModelV1 = this.openai(resolvedModelId, {});
    console.log(chalk.green("model: ", JSON.stringify(model)));
    const result = await model.doGenerate({
      inputFormat: "prompt",
      mode: { type: "regular" },
      prompt,
      temperature,
    });
    return result.text || "";
  }
  async listModels(): Promise<string[]> {
    return ["gpt-3.5-turbo", "gpt-4"];
  }
}

/**
 * Azure OpenAI 用クライアント
 */
class VercelAzureOpenAIClient implements AIClient {
  private azure;
  private modelId?: string;

  constructor(
    resourceName: string,
    apiKey: string,
    apiVersion: string,
    modelId?: string,
  ) {
    this.azure = createAzure({
      resourceName,
      apiKey,
      apiVersion: apiVersion || "2024-10-01-preview",
    });
    this.modelId = modelId;
  }
  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
  ): Promise<string> {
    const prompt = convertMessagesToPrompt(messages);
    if (!this.modelId) {
      throw new Error("Azure OpenAI モデルIDが設定されていません");
    }
    // チャット用エンドポイントの場合は chatCompletion() を利用する
    const model: LanguageModelV1 = this.azure(this.modelId, {});
    const result = await model.doGenerate({
      inputFormat: "prompt",
      mode: { type: "regular" },
      prompt,
      temperature,
    });
    return result.text || "";
  }
  async listModels(): Promise<string[]> {
    return [config.azureOpenAIResourceName || "unknown"];
  }
}

/**
 * 設定ファイルやオプションからプロバイダを判定し、
 * 適切な AIClient を生成するユーティリティ関数
 */
export function createAIClient(provider?: ProviderType): AIClient {
  const resolvedProvider = provider ?? config.defaultProvider ?? "openai";
  if (resolvedProvider === "openai") {
    if (!config.openaiApiKey) {
      console.error(
        chalk.red(
          "OpenAI API Keyが設定されていません。`llmine keys set openai`で設定してください。",
        ),
      );
      process.exit(1);
    }
    return new VercelOpenAIClient(config.openaiApiKey);
  } else {
    const resource = config.azureOpenAIResourceName;
    if (
      !resource ||
      !config.azureOpenAIKey ||
      !config.azureOpenAIVersion ||
      !config.azureDeploymentModelId
    ) {
      console.error(
        chalk.red(
          "Azure OpenAIの設定が不足しています。`llmine keys set azure`で設定してください。",
        ),
      );
      process.exit(1);
    }
    return new VercelAzureOpenAIClient(
      resource,
      config.azureOpenAIKey,
      config.azureOpenAIVersion,
      config.azureDeploymentModelId,
    );
  }
}
