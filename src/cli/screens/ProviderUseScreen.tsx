import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

import {
  setCurrentProviderProfile,
  findProviderProfile,
} from "../../core/providerRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";

interface ProviderUseScreenProps {
  name: string;
}

type State = "pending" | "success" | "error";

export const ProviderUseScreen: React.FC<ProviderUseScreenProps> = ({ name }) => {
  const [state, setState] = useState<State>("pending");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const profile = findProviderProfile(name);
    if (!profile) {
      setMessage(`プロバイダプロファイル '${name}' は存在しません。`);
      setState("error");
      return;
    }

    try {
      setCurrentProviderProfile(profile.name);
      const label = PROVIDER_LABELS[profile.provider] ?? profile.provider;
      setMessage(`${profile.name} (${label}) を現在のプロバイダに設定しました。`);
      setState("success");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
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

  return (
    <Box>
      <Text color={state === "success" ? "green" : "red"}>{message}</Text>
    </Box>
  );
};
