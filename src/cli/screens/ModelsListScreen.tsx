import React, { useEffect, useState } from "react";
import { Box, Text, useApp } from "ink";
import Spinner from "ink-spinner";
import { createAIClient } from "../../core/aiClient.js";
import { normalizeProvider } from "../../core/providers.js";
import { getCurrentModelProfile } from "../../core/modelRegistry.js";
import { config, ProviderType } from "../../core/config.js";
import { t } from "../../core/i18n.js";

interface ModelsListScreenProps {
  provider?: ProviderType;
}

export const ModelsListScreen: React.FC<ModelsListScreenProps> = ({ provider }) => {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { exit } = useApp();

  useEffect(() => {
    async function fetchModels() {
      try {
        const activeProfile = getCurrentModelProfile();
        const inferredProvider = provider
          ? provider
          : (activeProfile?.provider ?? config.defaultProvider ?? "openai");

        const normalized = normalizeProvider(inferredProvider);
        if (!normalized) {
          setError(`${t("errors.unsupportedProvider")}: ${String(inferredProvider)}`);
          setLoading(false);
          return;
        }

        const client = createAIClient(normalized);
        if ("listModels" in client && typeof client.listModels === "function") {
          const modelsList = await client.listModels();
          setModels(modelsList);
        } else {
          setError(`Provider ${normalized} does not support listing models`);
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    }

    fetchModels();

    // Exit after displaying results
    setTimeout(() => {
      exit();
    }, 3000);
  }, [provider]);

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text>
          <Text color="green">
            <Spinner type="dots" />
          </Text>{" "}
          Fetching available models...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">{t("error")}</Text>
        <Text color="redBright">{error}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        {t("availableModels")}:
      </Text>
      {models.length > 0 ? (
        models.map((model, index) => (
          <Text key={index}>• {model}</Text>
        ))
      ) : (
        <Text color="yellow">No models available</Text>
      )}
    </Box>
  );
};