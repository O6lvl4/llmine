import React from "react";
import { Box, Text } from "ink";

import { PROVIDER_LABELS } from "../../core/providers.js";
import {
  listProviderProfiles,
  getCurrentProviderProfile,
} from "../../core/providerRegistry.js";
import { ProviderProfile } from "../../core/config.js";

function describeProfileDetails(profile: ProviderProfile): string {
  switch (profile.provider) {
    case "openai":
      return profile.defaultModel ? ` (model: ${profile.defaultModel})` : "";
    case "azure":
      return ` (deployment: ${profile.deployment})`;
    case "anthropic":
      return profile.defaultModel ? ` (model: ${profile.defaultModel})` : "";
    case "bedrock":
      return ` (region: ${profile.region}${profile.defaultModel ? `, model: ${profile.defaultModel}` : ""})`;
    case "ollama":
      return profile.host ? ` (host: ${profile.host})` : "";
    default:
      return "";
  }
}

export const ProviderListScreen: React.FC = () => {
  const profiles = listProviderProfiles();
  const current = getCurrentProviderProfile();

  if (!profiles.length) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">プロバイダプロファイルがまだ登録されていません。</Text>
        <Text color="yellow">`llmine provider add` で設定を登録してください。</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="cyan">登録済みプロバイダプロファイル</Text>
      {profiles.map((profile) => {
        const marker = current?.name === profile.name ? "*" : " ";
        const label = PROVIDER_LABELS[profile.provider] ?? profile.provider;
        return (
          <Text key={profile.name}>
            {marker} {profile.name} → {label}
            {describeProfileDetails(profile)}
            {current?.name === profile.name ? "  ← 現在使用中" : ""}
          </Text>
        );
      })}
      <Text color="yellow">* は現在のアクティブなプロバイダプロファイルです。</Text>
    </Box>
  );
};
