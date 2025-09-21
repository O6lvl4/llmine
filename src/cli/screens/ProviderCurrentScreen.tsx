import React from "react";
import { Box, Text } from "ink";

import { config, ProviderProfile } from "../../core/config.js";
import { PROVIDER_LABELS } from "../../core/providers.js";
import { getCurrentProviderProfile } from "../../core/providerRegistry.js";

export const ProviderCurrentScreen: React.FC = () => {
  const activeProfile = getCurrentProviderProfile();
  const defaultProvider =
    activeProfile?.provider ?? config.defaultProvider ?? "openai";
  const label = PROVIDER_LABELS[defaultProvider] ?? defaultProvider;

  return (
    <Box flexDirection="column">
      <Text color="cyan">現在利用中のプロバイダ</Text>
      {activeProfile ? (
        <>
          <Text>
            プロファイル: {activeProfile.name} → {label}
          </Text>
          {describeProfile(activeProfile)}
        </>
      ) : (
        <Text color="yellow">
          アクティブなプロバイダプロファイルが未設定です。`llmine provider add`
          で作成してください。
        </Text>
      )}
    </Box>
  );
};

function describeProfile(profile: ProviderProfile): React.ReactNode {
  switch (profile.provider) {
    case "openai":
      return (
        <Text>
          API Key:{" "}
          {profile.apiKey ? `********${profile.apiKey.slice(-4)}` : "未設定"}
          {profile.defaultModel ? ` / model: ${profile.defaultModel}` : ""}
        </Text>
      );
    case "azure":
      return (
        <Text>
          Resource: {profile.resourceName} / Deployment: {profile.deployment}
        </Text>
      );
    case "anthropic":
      return (
        <Text>
          API Key:{" "}
          {profile.apiKey ? `********${profile.apiKey.slice(-4)}` : "未設定"}
          {profile.defaultModel ? ` / model: ${profile.defaultModel}` : ""}
        </Text>
      );
    case "bedrock":
      return (
        <Text>
          Region: {profile.region}
          {profile.defaultModel ? ` / model: ${profile.defaultModel}` : ""}
        </Text>
      );
    case "ollama":
      return (
        <Text>
          Host: {profile.host}
          {profile.defaultModel ? ` / model: ${profile.defaultModel}` : ""}
        </Text>
      );
    default:
      return null;
  }
}
