import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

import {
  findProviderProfile,
  removeProviderProfile,
} from "../../core/providerRegistry.js";

interface ProviderRemoveScreenProps {
  name: string;
}

type State = "pending" | "success" | "error";

export const ProviderRemoveScreen: React.FC<ProviderRemoveScreenProps> = ({ name }) => {
  const [state, setState] = useState<State>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = findProviderProfile(name);
    if (!profile) {
      setError(`プロバイダプロファイル '${name}' は存在しません。`);
      setState("error");
      return;
    }

    try {
      removeProviderProfile(name);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }, [name]);

  if (state === "pending") {
    return (
      <Box>
        <Text>削除しています...</Text>
      </Box>
    );
  }

  if (state === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">削除に失敗しました。</Text>
        {error && <Text color="redBright">{error}</Text>}
      </Box>
    );
  }

  return (
    <Box>
      <Text color="green">プロバイダプロファイル '{name}' を削除しました。</Text>
    </Box>
  );
};
