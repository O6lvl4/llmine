import React from "react";
import { Box, Text } from "ink";

import { PROVIDER_LABELS } from "../../core/providers.js";
import {
  listProviderProfiles,
  getCurrentProviderProfile,
} from "../../core/providerRegistry.js";
import { ProviderProfile } from "../../core/config.js";
import { t } from "../../core/i18n.js";

function describeProfileDetails(profile: ProviderProfile): string {
  switch (profile.provider) {
    case "openai":
      return profile.defaultModel ? ` (model: ${profile.defaultModel})` : "";
    case "azure":
      return ` (deployment: ${profile.deployment})`;
    case "anthropic":
      return profile.defaultModel ? ` (model: ${profile.defaultModel})` : "";
    case "bedrock":
      return ` (region: ${profile.region}${profile.defaultModel ? `, model: ${profile.defaultModel}` : ""})`;
    case "ollama":
      return profile.host ? ` (host: ${profile.host})` : "";
    default:
      return "";
  }
}

export const ProviderListScreen: React.FC = () => {
  const profiles = listProviderProfiles();
  const current = getCurrentProviderProfile();

  if (!profiles.length) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">{t("provider.notConfigured")}</Text>
        <Text color="yellow">
          `llmine provider add` {t("provider.add")}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text color="cyan">{t("provider.registeredProfiles")}</Text>
      {profiles.map((profile) => {
        const marker = current?.name === profile.name ? "*" : " ";
        const label = PROVIDER_LABELS[profile.provider] ?? profile.provider;
        return (
          <Text key={profile.name}>
            {marker} {profile.name} → {label}
            {describeProfileDetails(profile)}
            {current?.name === profile.name
              ? `  ← ${t("provider.currentlyUsing")}`
              : ""}
          </Text>
        );
      })}
      <Box marginTop={1}>
        <Text color="yellow">{t("provider.activeIndicator")}</Text>
      </Box>
    </Box>
  );
};
