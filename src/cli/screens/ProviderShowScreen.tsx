import React from "react";
import { Box, Text } from "ink";

import {
  findProviderProfile,
  getCurrentProviderProfile,
} from "../../core/providerRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";
import { ProviderProfile } from "../../core/config.js";

interface ProviderShowScreenProps {
  name?: string;
}

export const ProviderShowScreen: React.FC<ProviderShowScreenProps> = ({ name }) => {
  const profile = name ? findProviderProfile(name) : getCurrentProviderProfile();

  if (!profile) {
    return (
      <Box flexDirection="column">
        <Text color="red">指定されたプロバイダプロファイルが見つかりません。</Text>
        <Text>`llmine provider list` で登録済みのプロファイルを確認してください。</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="cyan">{profile.name}</Text>
      <Text>
        種別: {profile.provider} ({PROVIDER_LABELS[profile.provider] ?? profile.provider})
      </Text>
      {renderDetails(profile)}
      {profile.description && <Text>メモ: {profile.description}</Text>}
      <Text>最終更新: {profile.updatedAt ?? "-"}</Text>
    </Box>
  );
};

function renderDetails(profile: ProviderProfile): React.ReactNode {
  switch (profile.provider) {
    case "openai":
      return (
        <>
          <Text>API Key: ********{profile.apiKey.slice(-4)}</Text>
          <Text>デフォルトモデル: {profile.defaultModel ?? "未設定"}</Text>
        </>
      );
    case "azure":
      return (
        <>
          <Text>Resource: {profile.resourceName}</Text>
          <Text>Deployment: {profile.deployment}</Text>
          <Text>API Version: {profile.apiVersion}</Text>
          <Text>デフォルトモデル: {profile.defaultModel ?? "未設定"}</Text>
        </>
      );
    case "anthropic":
      return (
        <>
          <Text>API Key: ********{profile.apiKey.slice(-4)}</Text>
          <Text>デフォルトモデル: {profile.defaultModel ?? "未設定"}</Text>
        </>
      );
    case "bedrock":
      return (
        <>
          <Text>Region: {profile.region}</Text>
          <Text>Access Key: {mask(profile.accessKeyId)}</Text>
          <Text>Secret Key: {mask(profile.secretAccessKey)}</Text>
          <Text>Session Token: {mask(profile.sessionToken)}</Text>
          <Text>デフォルトモデル: {profile.defaultModel ?? "未設定"}</Text>
        </>
      );
    case "ollama":
      return (
        <>
          <Text>Host: {profile.host}</Text>
          <Text>デフォルトモデル: {profile.defaultModel ?? "未設定"}</Text>
        </>
      );
    default:
      return null;
  }
}

function mask(value?: string): string {
  if (!value) return "未設定";
  return `********${value.slice(-4)}`;
}
