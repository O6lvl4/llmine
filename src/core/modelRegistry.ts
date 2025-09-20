import chalk from "chalk";

import {
  config,
  saveConfig,
  ProviderType,
  ModelProfile,
} from "./config.js";
import {
  PROVIDER_FALLBACK_MODELS,
  PROVIDER_LABELS,
  SUPPORTED_PROVIDERS,
} from "./providers.js";
import {
  findProviderProfilesByType,
  validateProviderProfile,
} from "./providerRegistry.js";

function ensureModelsArray(): ModelProfile[] {
  if (!config.models) {
    config.models = [];
  }
  return config.models;
}

export function listModelProfiles(): ModelProfile[] {
  return ensureModelsArray();
}

export function findModelProfile(name: string): ModelProfile | undefined {
  return ensureModelsArray().find((profile) => profile.name === name);
}

export function upsertModelProfile(profile: ModelProfile): void {
  const profiles = ensureModelsArray();
  const now = new Date().toISOString();
  const existingIndex = profiles.findIndex((p) => p.name === profile.name);
  if (existingIndex >= 0) {
    profiles[existingIndex] = {
      ...profiles[existingIndex],
      ...profile,
      createdAt: profiles[existingIndex].createdAt,
      updatedAt: now,
    };
  } else {
    profiles.push({ ...profile, createdAt: now, updatedAt: now });
  }
  saveConfig(config);
}

export function removeModelProfile(name: string): void {
  const profiles = ensureModelsArray();
  const index = profiles.findIndex((profile) => profile.name === name);
  if (index >= 0) {
    profiles.splice(index, 1);
    if (config.currentModel === name) {
      config.currentModel = undefined;
    }
    saveConfig(config);
  }
}

export function setCurrentModel(name: string): void {
  const profile = findModelProfile(name);
  if (!profile) {
    throw new Error(`指定されたモデルプロファイルが存在しません: ${name}`);
  }
  config.currentModel = profile.name;
  config.defaultProvider = profile.provider; // 後方互換のために更新
  saveConfig(config);
}

function legacyFallbackModel(): ModelProfile | undefined {
  const provider = config.defaultProvider ?? "openai";
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return undefined;
  }

  const fallbackModelId = resolveDefaultModelId(provider);
  if (!fallbackModelId) {
    return undefined;
  }

  return {
    name: `${provider}-legacy` as const,
    provider,
    modelId: fallbackModelId,
  };
}

function resolveDefaultModelId(provider: ProviderType): string | undefined {
  switch (provider) {
    case "openai":
      return (
        config.defaultOpenAIModelId ||
        PROVIDER_FALLBACK_MODELS.openai
      );
    case "azure":
      return (
        config.azureDeploymentModelId ||
        config.azureOpenAIDeployment ||
        PROVIDER_FALLBACK_MODELS.azure
      );
    case "anthropic":
      return (
        config.defaultAnthropicModelId ||
        PROVIDER_FALLBACK_MODELS.anthropic
      );
    case "bedrock":
      return (
        config.defaultBedrockModelId ||
        PROVIDER_FALLBACK_MODELS.bedrock
      );
    case "ollama":
      return (
        config.defaultOllamaModelId ||
        PROVIDER_FALLBACK_MODELS.ollama
      );
    default:
      return undefined;
  }
}

export function getCurrentModelProfile(): ModelProfile | undefined {
  const currentName = config.currentModel;
  if (currentName) {
    const profile = findModelProfile(currentName);
    if (profile) {
      return profile;
    }
  }
  return legacyFallbackModel();
}

export function describeModelProfile(profile: ModelProfile): string {
  const providerLabel = PROVIDER_LABELS[profile.provider] ?? profile.provider;
  const model = profile.modelId;
  return `${profile.name} -> ${providerLabel} (${profile.provider}) / ${model}`;
}

export function printModelProfiles(): void {
  const profiles = listModelProfiles();
  if (!profiles.length) {
    console.log(
      chalk.yellow(
        "モデルプロファイルがまだ登録されていません。`llmine model add` で作成してください。",
      ),
    );
    return;
  }

  console.log(chalk.cyan("登録済みモデルプロファイル:"));
  console.log(chalk.cyan("----------------------------"));
  profiles.forEach((profile) => {
    const isCurrent = config.currentModel === profile.name;
    const marker = isCurrent ? "*" : " ";
    console.log(
      `${marker} ${describeModelProfile(profile)}${
        isCurrent ? chalk.green("  <= 現在使用中") : ""
      }`,
    );
  });
}

export function ensureProfileExists(name: string): void {
  if (!findModelProfile(name)) {
    throw new Error(`モデルプロファイル '${name}' が見つかりません。`);
  }
}

export function validateProviderConfigured(provider: ProviderType): void {
  const profiles = findProviderProfilesByType(provider);
  if (profiles.length > 0) {
    const hasValid = profiles.some((profile) => {
      try {
        validateProviderProfile(profile);
        return true;
      } catch (_err) {
        return false;
      }
    });
    if (hasValid) {
      return;
    }
  }

  switch (provider) {
    case "openai":
      if (!config.openaiApiKey) {
        throw new Error(
          "OpenAI API Keyが設定されていません。`llmine provider add` を実行してください。",
        );
      }
      return;
    case "azure":
      if (
        !config.azureOpenAIResourceName ||
        !config.azureOpenAIKey ||
        !config.azureOpenAIVersion ||
        !(config.azureDeploymentModelId || config.azureOpenAIDeployment)
      ) {
        throw new Error(
          "Azure OpenAI の設定が不足しています。`llmine provider add` を実行してください。",
        );
      }
      return;
    case "anthropic":
      if (!config.anthropicApiKey) {
        throw new Error(
          "Anthropic API Keyが設定されていません。`llmine provider add` を実行してください。",
        );
      }
      return;
    case "bedrock":
      if (!config.awsRegion) {
        throw new Error(
          "AWS Bedrock のリージョンが未設定です。`llmine provider add` を実行してください。",
        );
      }
      return;
    case "ollama":
      if (!config.ollamaHost) {
        throw new Error(
          "Ollama のホストが未設定です。`llmine provider add` を実行してください。",
        );
      }
      return;
    default:
      throw new Error(`不明なプロバイダです: ${provider}`);
  }
}

export function getProviderDefaultModel(
  provider: ProviderType,
): string | undefined {
  return resolveDefaultModelId(provider);
}
