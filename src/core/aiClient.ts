// src/core/aiClient.ts
import {
  LanguageModelV2,
  LanguageModelV2Prompt,
  LanguageModelV2Content,
} from "@ai-sdk/provider";
import { createAzure } from "@ai-sdk/azure";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import {
  config,
  ProviderType,
  ProviderProfile,
  OpenAIProviderProfile,
  AzureProviderProfile,
  BedrockProviderProfile,
  OllamaProviderProfile,
  AnthropicProviderProfile,
} from "./config.js";
import {
  PROVIDER_FALLBACK_MODELS,
  PROVIDER_SAMPLE_MODELS,
} from "./providers.js";
import {
  getProviderProfileForType,
  getCurrentProviderProfile,
} from "./providerRegistry.js";

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
 * チャットメッセージ配列を LanguageModelV2Prompt に変換するユーティリティ関数
 * ※各メッセージは role と、内容を text-part として設定
 */
function convertMessagesToPrompt(
  messages: ChatMessage[],
): LanguageModelV2Prompt {
  return messages.map((message) => ({
    role: message.role,
    content: [{ type: "text", text: message.content }],
  }));
}

async function generateText(
  model: LanguageModelV2,
  prompt: LanguageModelV2Prompt,
  temperature: number,
): Promise<string> {
  const result = await model.doGenerate({
    prompt,
    temperature,
  });
  return extractText(result.content);
}

function extractText(parts: LanguageModelV2Content[]): string {
  return parts
    .map((part) => {
      if (part.type === "text") {
        return part.text;
      }
      return "";
    })
    .join("")
    .trim();
}

function resolveModelId(
  requestedModelId: string | undefined,
  configuredModelId: string | undefined,
  fallbackModelId: string | undefined,
  providerLabel: string,
): string {
  if (requestedModelId?.trim()) {
    return requestedModelId.trim();
  }
  if (configuredModelId?.trim()) {
    return configuredModelId.trim();
  }
  if (fallbackModelId?.trim()) {
    return fallbackModelId.trim();
  }
  throw new Error(
    `${providerLabel} のモデルが未設定です。コマンドの -m オプション、もしくは llmine provider add <provider> で既定モデルを設定してください。`,
  );
}

function resolveOpenAIProfile(): OpenAIProviderProfile | undefined {
  return getProviderProfileForType("openai") as
    | OpenAIProviderProfile
    | undefined;
}

function resolveAzureProfile(): AzureProviderProfile | undefined {
  return getProviderProfileForType("azure") as AzureProviderProfile | undefined;
}

function resolveAnthropicProfile(): AnthropicProviderProfile | undefined {
  return getProviderProfileForType("anthropic") as
    | AnthropicProviderProfile
    | undefined;
}

function resolveBedrockProfile(): BedrockProviderProfile | undefined {
  return getProviderProfileForType("bedrock") as
    | BedrockProviderProfile
    | undefined;
}

function resolveOllamaProfile(): OllamaProviderProfile | undefined {
  return getProviderProfileForType("ollama") as
    | OllamaProviderProfile
    | undefined;
}

/**
 * OpenAI 用クライアント
 */
class OpenAIClient implements AIClient {
  private readonly openai;
  private readonly defaultModel?: string;

  constructor(apiKey: string, defaultModel?: string) {
    this.openai = createOpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string> {
    const prompt = convertMessagesToPrompt(messages);
    const resolvedModelId = resolveModelId(
      modelId,
      this.defaultModel ?? config.defaultOpenAIModelId,
      PROVIDER_FALLBACK_MODELS.openai,
      "OpenAI",
    );
    const model: LanguageModelV2 = this.openai(resolvedModelId);
    return generateText(model, prompt, temperature);
  }

  async listModels(): Promise<string[]> {
    return [...PROVIDER_SAMPLE_MODELS.openai];
  }
}

/**
 * Azure OpenAI 用クライアント
 */
class AzureOpenAIClient implements AIClient {
  private readonly azure;
  private readonly defaultDeployment?: string;

  constructor(
    resourceName: string,
    apiKey: string,
    apiVersion: string,
    defaultDeployment?: string,
  ) {
    this.azure = createAzure({
      resourceName,
      apiKey,
      apiVersion: apiVersion || "2024-10-01-preview",
    });
    this.defaultDeployment = defaultDeployment;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string> {
    const prompt = convertMessagesToPrompt(messages);
    const deploymentId = resolveModelId(
      modelId,
      this.defaultDeployment ||
        config.azureDeploymentModelId ||
        config.azureOpenAIDeployment,
      undefined,
      "Azure OpenAI",
    );
    const model: LanguageModelV2 = this.azure(deploymentId);
    return generateText(model, prompt, temperature);
  }

  async listModels(): Promise<string[]> {
    const configuredDeployment =
      config.azureDeploymentModelId || config.azureOpenAIDeployment;
    const models = configuredDeployment
      ? [configuredDeployment, ...PROVIDER_SAMPLE_MODELS.azure]
      : [...PROVIDER_SAMPLE_MODELS.azure];
    return Array.from(new Set(models));
  }
}

class AnthropicClient implements AIClient {
  private readonly anthropic;
  private readonly defaultModel?: string;

  constructor(apiKey: string, defaultModel?: string) {
    this.anthropic = createAnthropic({ apiKey });
    this.defaultModel = defaultModel;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string> {
    const prompt = convertMessagesToPrompt(messages);
    const resolvedModelId = resolveModelId(
      modelId,
      this.defaultModel ?? config.defaultAnthropicModelId,
      PROVIDER_FALLBACK_MODELS.anthropic,
      "Anthropic (Claude)",
    );
    const model: LanguageModelV2 = this.anthropic(resolvedModelId);
    return generateText(model, prompt, temperature);
  }

  async listModels(): Promise<string[]> {
    return [...PROVIDER_SAMPLE_MODELS.anthropic];
  }
}

class BedrockClient implements AIClient {
  private readonly bedrock;
  private readonly defaultModel?: string;

  constructor(
    region: string,
    credentials: {
      accessKeyId?: string;
      secretAccessKey?: string;
      sessionToken?: string;
    },
    defaultModel?: string,
  ) {
    const options: {
      region: string;
      credentials?: {
        accessKeyId?: string;
        secretAccessKey?: string;
        sessionToken?: string;
      };
    } = { region };

    if (credentials?.accessKeyId && credentials?.secretAccessKey) {
      options.credentials = {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      };
    }

    this.bedrock = createAmazonBedrock(options);
    this.defaultModel = defaultModel;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string> {
    const prompt = convertMessagesToPrompt(messages);
    const resolvedModelId = resolveModelId(
      modelId,
      this.defaultModel ?? config.defaultBedrockModelId,
      PROVIDER_FALLBACK_MODELS.bedrock,
      "AWS Bedrock",
    );
    const model: LanguageModelV2 = this.bedrock(resolvedModelId);
    return generateText(model, prompt, temperature);
  }

  async listModels(): Promise<string[]> {
    return [...PROVIDER_SAMPLE_MODELS.bedrock];
  }
}

class OllamaClient implements AIClient {
  private readonly baseUrl: string;
  private readonly defaultModel?: string;

  constructor(baseUrl: string | undefined, defaultModel?: string) {
    this.baseUrl = (baseUrl?.trim() || "http://localhost:11434").replace(
      /\/$/,
      "",
    );
    this.defaultModel = defaultModel;
  }

  async createChatCompletion(
    messages: ChatMessage[],
    temperature: number,
    modelId?: string,
  ): Promise<string> {
    // First, check if Ollama is running and get available models
    const availableModels = await this.listModels();

    // Resolve model ID with available models
    let resolvedModelId = modelId;
    if (!resolvedModelId) {
      resolvedModelId = this.defaultModel ?? config.defaultOllamaModelId;
    }

    // If still no model specified, use first available
    if (!resolvedModelId && availableModels.length > 0) {
      resolvedModelId = availableModels[0];
    }

    if (!resolvedModelId) {
      throw new Error(
        "No Ollama models available. Please pull a model first with 'ollama pull <model>'",
      );
    }

    const requestBody = {
      model: resolvedModelId,
      messages: messages,
      stream: false,
      options: {
        temperature: temperature ?? 0.7,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.message?.content || "";
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("fetch failed")
        ) {
          throw new Error(
            "Ollama is not running. Please start it with 'ollama serve'",
          );
        }
        throw error;
      }
      throw new Error("Unknown error occurred while calling Ollama API");
    }
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      // Return empty array if Ollama is not running
      return [];
    }
  }
}

/**
 * 設定ファイルやオプションからプロバイダを判定し、
 * 適切な AIClient を生成するユーティリティ関数
 */
export function createAIClient(provider?: ProviderType): AIClient {
  const resolvedProvider = provider ?? config.defaultProvider ?? "openai";

  switch (resolvedProvider) {
    case "openai": {
      const profile = resolveOpenAIProfile();
      const apiKey = profile?.apiKey ?? config.openaiApiKey;
      if (!apiKey) {
        throw new Error(
          "OpenAI API Keyが設定されていません。`llmine provider add` で設定してください。",
        );
      }
      return new OpenAIClient(
        apiKey!,
        profile?.defaultModel ?? config.defaultOpenAIModelId,
      );
    }
    case "azure": {
      const profile = resolveAzureProfile();
      const resourceName =
        profile?.resourceName ?? config.azureOpenAIResourceName;
      const apiKey = profile?.apiKey ?? config.azureOpenAIKey;
      const apiVersion = profile?.apiVersion ?? config.azureOpenAIVersion;
      const deployment =
        profile?.deployment ??
        config.azureDeploymentModelId ??
        config.azureOpenAIDeployment;
      if (!resourceName || !apiKey || !apiVersion || !deployment) {
        throw new Error(
          "Azure OpenAI の設定が不足しています。`llmine provider add` で設定してください。",
        );
      }
      return new AzureOpenAIClient(
        resourceName,
        apiKey,
        apiVersion,
        deployment,
      );
    }
    case "anthropic": {
      const profile = resolveAnthropicProfile();
      const apiKey = profile?.apiKey ?? config.anthropicApiKey;
      if (!apiKey) {
        throw new Error(
          "Anthropic API Key が設定されていません。`llmine provider add` で設定してください。",
        );
      }
      return new AnthropicClient(
        apiKey,
        profile?.defaultModel ?? config.defaultAnthropicModelId,
      );
    }
    case "bedrock": {
      const profile = resolveBedrockProfile();
      const region = profile?.region ?? config.awsRegion;
      if (!region) {
        throw new Error(
          "AWS Bedrock のリージョンが設定されていません。`llmine provider add` で設定してください。",
        );
      }
      return new BedrockClient(
        region,
        {
          accessKeyId: profile?.accessKeyId ?? config.awsAccessKeyId,
          secretAccessKey:
            profile?.secretAccessKey ?? config.awsSecretAccessKey,
          sessionToken: profile?.sessionToken ?? config.awsSessionToken,
        },
        profile?.defaultModel ?? config.defaultBedrockModelId,
      );
    }
    case "ollama": {
      const profile = resolveOllamaProfile();
      const host = profile?.host ?? config.ollamaHost;
      return new OllamaClient(
        host,
        profile?.defaultModel ?? config.defaultOllamaModelId,
      );
    }
    default: {
      throw new Error(`未対応のプロバイダです: ${String(resolvedProvider)}`);
    }
  }
}
