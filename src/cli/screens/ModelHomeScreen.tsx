import React from "react";
import { Box, Text } from "ink";

import { getCurrentModelProfile } from "../../core/modelRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";

export const ModelHomeScreen: React.FC = () => {
  const current = getCurrentModelProfile();

  return (
    <Box flexDirection="column" gap={1}>
      {current ? (
        <Box flexDirection="column">
          <Text color="cyan">現在のアクティブモデル</Text>
          <Text>
            {current.name} → {PROVIDER_LABELS[current.provider] ?? current.provider} / {current.modelId}
            {current.temperature !== undefined && ` (temp=${current.temperature})`}
          </Text>
        </Box>
      ) : (
        <Text color="yellow">アクティブなモデルプロファイルが設定されていません。</Text>
      )}

      <Box flexDirection="column">
        <Text color="yellow">主なサブコマンド:</Text>
        <Text>  llmine model add</Text>
        <Text>  llmine model list</Text>
        <Text>  llmine model use &lt;name&gt;</Text>
        <Text>  llmine model show [name]</Text>
        <Text>  llmine model rm &lt;name&gt;</Text>
      </Box>
    </Box>
  );
};
