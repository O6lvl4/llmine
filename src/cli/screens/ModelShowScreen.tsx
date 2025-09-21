import React from "react";
import { Box, Text } from "ink";

import {
  findModelProfile,
  getCurrentModelProfile,
} from "../../core/modelRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";

interface ModelShowScreenProps {
  name?: string;
}

export const ModelShowScreen: React.FC<ModelShowScreenProps> = ({ name }) => {
  const profile = name ? findModelProfile(name) : getCurrentModelProfile();

  if (!profile) {
    return (
      <Box flexDirection="column">
        <Text color="red">指定されたモデルプロファイルが見つかりません。</Text>
        <Text>
          `llmine model list` で登録済みのプロファイルを確認してください。
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Text color="cyan">{profile.name}</Text>
      <Text>
        プロバイダ: {PROVIDER_LABELS[profile.provider] ?? profile.provider} (
        {profile.provider})
      </Text>
      <Text>モデルID: {profile.modelId}</Text>
      <Text>
        temperature:{" "}
        {profile.temperature !== undefined ? profile.temperature : "未設定"}
      </Text>
      {profile.description && <Text>説明: {profile.description}</Text>}
    </Box>
  );
};
