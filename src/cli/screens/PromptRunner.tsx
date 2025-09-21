import React, { useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";

import { createAIClient } from "../../core/aiClient.js";
import { getCurrentModelProfile } from "../../core/modelRegistry.js";
import { config, ProviderType } from "../../core/config.js";
import { normalizeProvider } from "../../core/providers.js";
import { t } from "../../core/i18n.js";

interface PromptRunnerProps {
  prompt: string;
  provider?: ProviderType;
  model?: string;
  temperature?: number;
}

type RunnerState = "loading" | "success" | "error";

export const PromptRunner: React.FC<PromptRunnerProps> = ({
  prompt,
  provider,
  model,
  temperature,
}) => {
  const [state, setState] = useState<RunnerState>("loading");
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { exit } = useApp();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const activeProfile = getCurrentModelProfile();
        const inferredProvider = provider
          ? provider
          : (activeProfile?.provider ?? config.defaultProvider ?? "openai");

        const normalized = normalizeProvider(inferredProvider);
        if (!normalized) {
          throw new Error(
            `${t("errors.unsupportedProvider")}: ${String(inferredProvider)}`,
          );
        }

        const aiClient = createAIClient(normalized);

        const resolvedTemperature =
          temperature ?? activeProfile?.temperature ?? 0.7;
        const resolvedModel =
          model ??
          (activeProfile && activeProfile.provider === normalized
            ? activeProfile.modelId
            : undefined);

        const answer = await aiClient.createChatCompletion(
          [{ role: "user", content: prompt }],
          resolvedTemperature,
          resolvedModel,
        );

        if (cancelled) return;
        setOutput(answer.trim() || "(回答が空でした)");
        setState("success");
        // Exit gracefully after displaying the result
        setTimeout(() => {
          exit();
        }, 50);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setState("error");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [prompt, provider, model, temperature]);

  if (state === "loading") {
    return (
      <Box flexDirection="column">
        <Text>
          <Text color="green">
            <Spinner type="dots" />
          </Text>{" "}
          {t("waitingForResponse")}
        </Text>
      </Box>
    );
  }

  if (state === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">{t("error")}</Text>
        {error && <Text color="redBright">{error}</Text>}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text color="green">{t("response")}:</Text>
        <Text>{output}</Text>
      </Box>
    </Box>
  );
};
