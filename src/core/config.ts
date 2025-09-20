import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export type ProviderType =
  | "openai"
  | "azure"
  | "anthropic"
  | "bedrock"
  | "ollama";

export interface ProviderProfileBase {
  name: string;
  provider: ProviderType;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OpenAIProviderProfile = ProviderProfileBase & {
  provider: "openai";
  apiKey: string;
  defaultModel?: string;
};

export type AzureProviderProfile = ProviderProfileBase & {
  provider: "azure";
  resourceName: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
  defaultModel?: string;
};

export type AnthropicProviderProfile = ProviderProfileBase & {
  provider: "anthropic";
  apiKey: string;
  defaultModel?: string;
};

export type BedrockProviderProfile = ProviderProfileBase & {
  provider: "bedrock";
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  defaultModel?: string;
};

export type OllamaProviderProfile = ProviderProfileBase & {
  provider: "ollama";
  host: string;
  defaultModel?: string;
};

export type ProviderProfile =
  | OpenAIProviderProfile
  | AzureProviderProfile
  | AnthropicProviderProfile
  | BedrockProviderProfile
  | OllamaProviderProfile;

export interface ModelProfile {
  name: string;
  provider: ProviderType;
  modelId: string;
  temperature?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 型定義
export interface Config {
  // プロバイダのデフォルト設定
  defaultProvider?: ProviderType;

  // OpenAI 用の設定
  openaiApiKey?: string;
  defaultOpenAIModelId?: string; // 例: 'gpt-4-turbo'

  // Azure 用の設定
  azureOpenAIResourceName?: string; // リソース名
  azureOpenAIKey?: string;
  azureOpenAIVersion?: string; // 例: '2024-10-01-preview'
  azureDeploymentModelId?: string; // 例: デプロイ名
  azureOpenAIDeployment?: string; // 旧バージョン互換

  // Anthropic (Claude) 用の設定
  anthropicApiKey?: string;
  defaultAnthropicModelId?: string;

  // AWS Bedrock 用の設定
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsSessionToken?: string;
  awsRegion?: string;
  defaultBedrockModelId?: string;

  // Ollama 用の設定
  ollamaHost?: string;
  defaultOllamaModelId?: string;

  // モデルプロファイル管理
  models?: ModelProfile[];
  currentModel?: string;

  // プロバイダプロファイル管理
  providerProfiles?: ProviderProfile[];
  currentProviderProfile?: string;

  // その他の設定も必要に応じて追加可能
  [key: string]: any;
}

// 設定ディレクトリとファイルのパス
const CONFIG_DIR = path.join(os.homedir(), ".llmine");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// 設定ディレクトリが存在しない場合は作成
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// 設定を読み込む
function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    } catch (error) {
      // JSONパースに失敗した場合は空の設定を返す
      return {};
    }
  }
  return {};
}

// 設定を保存する
export function saveConfig(config: Config): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    // 書き込みに失敗した場合でも CLI が動作できるように警告のみ表示
    console.warn("設定ファイルの保存に失敗しました:", (error as Error).message);
  }
}

// グローバルに使い回すための設定オブジェクト
function migrateLegacyProviders(config: Config): boolean {
  let mutated = false;
  if (!config.providerProfiles) {
    config.providerProfiles = [];
    mutated = true;
  }

  const existingNames = new Set(config.providerProfiles.map((profile) => profile.name));

  const addProfile = (profile: ProviderProfile) => {
    if (existingNames.has(profile.name)) {
      return;
    }
    config.providerProfiles?.push({
      ...profile,
      createdAt: profile.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    existingNames.add(profile.name);
    mutated = true;
  };

  if (config.openaiApiKey) {
    addProfile({
      name: "openai-default",
      provider: "openai",
      apiKey: config.openaiApiKey,
      defaultModel: config.defaultOpenAIModelId,
    });
  }

  if (
    config.azureOpenAIResourceName &&
    config.azureOpenAIKey &&
    (config.azureDeploymentModelId || config.azureOpenAIDeployment)
  ) {
    addProfile({
      name: "azure-default",
      provider: "azure",
      resourceName: config.azureOpenAIResourceName,
      apiKey: config.azureOpenAIKey,
      deployment: config.azureDeploymentModelId || config.azureOpenAIDeployment || "",
      apiVersion: config.azureOpenAIVersion || "2024-10-01-preview",
      defaultModel: config.azureDeploymentModelId || config.azureOpenAIDeployment,
    });
  }

  if (config.anthropicApiKey) {
    addProfile({
      name: "anthropic-default",
      provider: "anthropic",
      apiKey: config.anthropicApiKey,
      defaultModel: config.defaultAnthropicModelId,
    });
  }

  if (config.awsRegion) {
    addProfile({
      name: "bedrock-default",
      provider: "bedrock",
      region: config.awsRegion,
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
      sessionToken: config.awsSessionToken,
      defaultModel: config.defaultBedrockModelId,
    });
  }

  if (config.ollamaHost) {
    addProfile({
      name: "ollama-default",
      provider: "ollama",
      host: config.ollamaHost,
      defaultModel: config.defaultOllamaModelId,
    });
  }

  if (!config.currentProviderProfile && config.providerProfiles.length > 0) {
    config.currentProviderProfile = config.providerProfiles[0].name;
    mutated = true;
  }

  return mutated;
}

const loadedConfig: Config = loadConfig();
const migrated = migrateLegacyProviders(loadedConfig);
if (migrated) {
  saveConfig(loadedConfig);
}

export const config: Config = loadedConfig;
