import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

import {
  removeModelProfile,
  findModelProfile,
} from "../../core/modelRegistry.js";

interface ModelRemoveScreenProps {
  name: string;
}

type State = "pending" | "success" | "error";

export const ModelRemoveScreen: React.FC<ModelRemoveScreenProps> = ({
  name,
}) => {
  const [state, setState] = useState<State>("pending");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const profile = findModelProfile(name);
    if (!profile) {
      setError(`モデルプロファイル '${name}' は存在しません`);
      setState("error");
      return;
    }

    try {
      removeModelProfile(name);
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
      <Text color="green">モデルプロファイル '{name}' を削除しました。</Text>
    </Box>
  );
};
