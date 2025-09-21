import {
  config,
  saveConfig,
  ProviderType,
  ProviderProfile,
  ProviderProfileBase,
  OpenAIProviderProfile,
  AzureProviderProfile,
  AnthropicProviderProfile,
  BedrockProviderProfile,
  OllamaProviderProfile,
} from "./config.js";

function ensureProfiles(): ProviderProfile[] {
  if (!config.providerProfiles) {
    config.providerProfiles = [];
  }
  return config.providerProfiles;
}

function currentTimestamp(): string {
  return new Date().toISOString();
}

function normalizeName(name: string): string {
  return name.trim();
}

export function listProviderProfiles(): ProviderProfile[] {
  return ensureProfiles();
}

export function findProviderProfile(name: string): ProviderProfile | undefined {
  const normalized = normalizeName(name);
  return ensureProfiles().find((profile) => profile.name === normalized);
}

export function findProviderProfilesByType(
  provider: ProviderType,
): ProviderProfile[] {
  return ensureProfiles().filter((profile) => profile.provider === provider);
}

function updateTimestamps(
  profile: ProviderProfile,
  existing?: ProviderProfile,
): ProviderProfile {
  const now = currentTimestamp();
  return {
    ...profile,
    createdAt: existing?.createdAt ?? profile.createdAt ?? now,
    updatedAt: now,
  };
}

export function upsertProviderProfile(profile: ProviderProfile): void {
  const profiles = ensureProfiles();
  const normalizedName = normalizeName(profile.name);
  const index = profiles.findIndex((p) => p.name === normalizedName);
  const enrichedProfile = updateTimestamps(
    { ...profile, name: normalizedName },
    profiles[index],
  );

  if (index >= 0) {
    profiles[index] = enrichedProfile;
  } else {
    profiles.push(enrichedProfile);
  }

  if (!config.currentProviderProfile) {
    config.currentProviderProfile = normalizedName;
  }

  config.defaultProvider = enrichedProfile.provider;
  saveConfig(config);
}

export function removeProviderProfile(name: string): void {
  const normalizedName = normalizeName(name);
  const profiles = ensureProfiles();
  const index = profiles.findIndex(
    (profile) => profile.name === normalizedName,
  );
  if (index < 0) {
    throw new Error(`プロバイダプロファイル '${name}' は存在しません。`);
  }
  profiles.splice(index, 1);

  if (config.currentProviderProfile === normalizedName) {
    config.currentProviderProfile = profiles[0]?.name;
    config.defaultProvider = profiles[0]?.provider;
  }

  saveConfig(config);
}

export function setCurrentProviderProfile(name: string): void {
  const normalizedName = normalizeName(name);
  const profile = findProviderProfile(normalizedName);
  if (!profile) {
    throw new Error(`プロバイダプロファイル '${name}' が見つかりません。`);
  }

  config.currentProviderProfile = profile.name;
  config.defaultProvider = profile.provider;
  saveConfig(config);
}

export function getCurrentProviderProfile(): ProviderProfile | undefined {
  const currentName = config.currentProviderProfile;
  if (!currentName) {
    return undefined;
  }
  return findProviderProfile(currentName);
}

export function getProviderProfileForType(
  provider: ProviderType,
): ProviderProfile | undefined {
  const current = getCurrentProviderProfile();
  if (current?.provider === provider) {
    return current;
  }
  const profiles = findProviderProfilesByType(provider);
  return profiles[0];
}

export function ensureProviderProfileExists(name: string): void {
  if (!findProviderProfile(name)) {
    throw new Error(`プロバイダプロファイル '${name}' が見つかりません。`);
  }
}

export function validateProviderProfile(profile: ProviderProfile): void {
  switch (profile.provider) {
    case "openai":
      if (!profile.apiKey.trim()) {
        throw new Error("OpenAI プロファイルには API Key が必要です。");
      }
      break;
    case "azure":
      if (
        !profile.resourceName.trim() ||
        !profile.apiKey.trim() ||
        !profile.deployment.trim()
      ) {
        throw new Error(
          "Azure プロファイルには resource, apiKey, deployment が必要です。",
        );
      }
      if (!profile.apiVersion.trim()) {
        throw new Error("Azure プロファイルには API バージョンが必要です。");
      }
      break;
    case "anthropic":
      if (!profile.apiKey.trim()) {
        throw new Error("Anthropic プロファイルには API Key が必要です。");
      }
      break;
    case "bedrock":
      if (!profile.region.trim()) {
        throw new Error("Bedrock プロファイルにはリージョンが必要です。");
      }
      break;
    case "ollama":
      if (!profile.host.trim()) {
        throw new Error("Ollama プロファイルにはホスト URL が必要です。");
      }
      break;
    default:
      throw new Error(
        `未対応のプロバイダです: ${String((profile as ProviderProfileBase).provider)}`,
      );
  }
}

export function createProviderProfile(
  provider: ProviderType,
  payload: Record<string, string | undefined>,
): ProviderProfile {
  const name = normalizeName(payload.name ?? `${provider}-${Date.now()}`);

  switch (provider) {
    case "openai":
      if (!payload.apiKey) {
        throw new Error("OpenAI の API Key は必須です。");
      }
      return {
        name,
        provider,
        apiKey: payload.apiKey.trim(),
        defaultModel: payload.defaultModel?.trim() || undefined,
      } satisfies OpenAIProviderProfile;
    case "azure":
      if (!payload.resourceName || !payload.apiKey || !payload.deployment) {
        throw new Error("Azure の resource/apiKey/deployment は必須です。");
      }
      return {
        name,
        provider,
        resourceName: payload.resourceName.trim(),
        apiKey: payload.apiKey.trim(),
        deployment: payload.deployment.trim(),
        apiVersion: (payload.apiVersion || "2024-10-01-preview").trim(),
        defaultModel: payload.defaultModel?.trim() || undefined,
      } satisfies AzureProviderProfile;
    case "anthropic":
      if (!payload.apiKey) {
        throw new Error("Anthropic の API Key は必須です。");
      }
      return {
        name,
        provider,
        apiKey: payload.apiKey.trim(),
        defaultModel: payload.defaultModel?.trim() || undefined,
      } satisfies AnthropicProviderProfile;
    case "bedrock":
      if (!payload.region) {
        throw new Error("Bedrock のリージョンは必須です。");
      }
      return {
        name,
        provider,
        region: payload.region.trim(),
        accessKeyId: payload.accessKeyId?.trim() || undefined,
        secretAccessKey: payload.secretAccessKey?.trim() || undefined,
        sessionToken: payload.sessionToken?.trim() || undefined,
        defaultModel: payload.defaultModel?.trim() || undefined,
      } satisfies BedrockProviderProfile;
    case "ollama":
      if (!payload.host) {
        throw new Error("Ollama のホスト URL は必須です。");
      }
      return {
        name,
        provider,
        host: payload.host.trim(),
        defaultModel: payload.defaultModel?.trim() || undefined,
      } satisfies OllamaProviderProfile;
    default:
      throw new Error(`未対応のプロバイダです: ${String(provider)}`);
  }
}
