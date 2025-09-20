import React from "react";
import { Box, Text } from "ink";

import { config } from "../../core/config.js";
import { PROVIDER_LABELS } from "../../core/providers.js";
import { getCurrentProviderProfile } from "../../core/providerRegistry.js";

export const ProviderHomeScreen: React.FC = () => {
  const profile = getCurrentProviderProfile();
  const provider = profile?.provider ?? config.defaultProvider ?? "openai";
  const label = PROVIDER_LABELS[provider] ?? provider;

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text color="cyan">現在のアクティブなプロバイダ</Text>
        {profile ? (
          <>
            <Text>
              プロファイル: {profile.name}
            </Text>
            <Text>
              種別: {provider} ({label})
            </Text>
          </>
        ) : (
          <Text color="yellow">アクティブなプロバイダプロファイルが未設定です。</Text>
        )}
      </Box>
      <Box flexDirection="column">
        <Text color="yellow">主なサブコマンド:</Text>
        <Text>  llmine provider add</Text>
        <Text>  llmine provider list</Text>
        <Text>  llmine provider show [name]</Text>
        <Text>  llmine provider use &lt;name&gt;</Text>
        <Text>  llmine provider rm &lt;name&gt;</Text>
        <Text>  llmine provider current</Text>
        <Text color="yellow">※ モデルプロファイルで指定されたプロバイダが優先して使用されます。</Text>
      </Box>
    </Box>
  );
};
