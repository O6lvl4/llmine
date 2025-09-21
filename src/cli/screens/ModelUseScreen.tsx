import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

import { setCurrentModel, findModelProfile } from "../../core/modelRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";

interface ModelUseScreenProps {
  name: string;
}

type State = "pending" | "success" | "error";

export const ModelUseScreen: React.FC<ModelUseScreenProps> = ({ name }) => {
  const [state, setState] = useState<State>("pending");
  const [error, setError] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string>("");
  const [modelId, setModelId] = useState<string>("");

  useEffect(() => {
    try {
      setCurrentModel(name);
      const profile = findModelProfile(name);
      if (profile) {
        setProviderLabel(PROVIDER_LABELS[profile.provider] ?? profile.provider);
        setModelId(profile.modelId);
      }
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }, [name]);

  if (state === "pending") {
    return (
      <Box>
        <Text>設定を更新しています...</Text>
      </Box>
    );
  }

  if (state === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">プロファイルの切り替えに失敗しました。</Text>
        {error && <Text color="redBright">{error}</Text>}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="green">
        '{name}' を現在のアクティブモデルに設定しました。
      </Text>
      <Text>
        {providerLabel} / {modelId}
      </Text>
    </Box>
  );
};
