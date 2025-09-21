import React from "react";
import { Box, Text } from "ink";

import {
  listModelProfiles,
  getCurrentModelProfile,
} from "../../core/modelRegistry.js";
import { PROVIDER_LABELS } from "../../core/providers.js";
import { t } from "../../core/i18n.js";

export const ModelListScreen: React.FC = () => {
  const profiles = listModelProfiles();
  const active = getCurrentModelProfile();

  if (!profiles.length) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">{t("model.notConfigured")}</Text>
        <Text>
          `llmine model add` {t("model.add")}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan">{t("model.registeredProfiles")}</Text>
      {profiles.map((profile) => {
        const marker = active?.name === profile.name ? "*" : " ";
        const providerLabel =
          PROVIDER_LABELS[profile.provider] ?? profile.provider;
        return (
          <Text key={profile.name}>
            {marker} {profile.name} → {providerLabel} / {profile.modelId}
            {profile.temperature !== undefined &&
              ` (temp=${profile.temperature})`}
            {active?.name === profile.name
              ? `  ← ${t("model.currentlyUsing")}`
              : ""}
          </Text>
        );
      })}
    </Box>
  );
};
