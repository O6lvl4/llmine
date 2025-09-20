import React from "react";
import { Box, Text } from "ink";
import { getLanguage } from "../../../core/i18n.js";

export const LanguageCurrent: React.FC = () => {
  const currentLang = getLanguage();
  const langDisplay = currentLang === "ja" ? "日本語 (ja)" : "English (en)";

  return (
    <Box flexDirection="column">
      <Text>Current language: <Text color="cyan">{langDisplay}</Text></Text>
      <Text dimColor>To change: llmine lang set [ja|en]</Text>
    </Box>
  );
};