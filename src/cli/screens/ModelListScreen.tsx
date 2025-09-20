import React from "react";
import { Box, Text } from "ink";

import { listModelProfiles, getCurrentModelProfile } from "../../core/modelRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";

export const ModelListScreen: React.FC = () => {
  const profiles = listModelProfiles();
  const active = getCurrentModelProfile();

  if (!profiles.length) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">モデルプロファイルがまだ登録されていません。</Text>
        <Text>まずは `llmine model add` でプロファイルを作成してください。</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="cyan">登録済みモデルプロファイル</Text>
      {profiles.map((profile) => {
        const marker = active?.name === profile.name ? "*" : " ";
        const providerLabel = PROVIDER_LABELS[profile.provider] ?? profile.provider;
        return (
          <Text key={profile.name}>
            {marker} {profile.name} → {providerLabel} / {profile.modelId}
            {profile.temperature !== undefined && ` (temp=${profile.temperature})`}
            {active?.name === profile.name ? "  ← 現在使用中" : ""}
          </Text>
        );
      })}
    </Box>
  );
};
