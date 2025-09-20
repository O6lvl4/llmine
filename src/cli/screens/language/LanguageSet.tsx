import React, { useEffect } from "react";
import { Box, Text } from "ink";
import { setSetting } from "../../../core/settings.js";
import { setLanguage, t, Language } from "../../../core/i18n.js";

export interface LanguageSetProps {
  lang: Language;
  onComplete: () => void;
}

export const LanguageSet: React.FC<LanguageSetProps> = ({ lang, onComplete }) => {
  useEffect(() => {
    const setLang = async () => {
      try {
        await setSetting("language", lang);
        setLanguage(lang);
        onComplete();
      } catch (error) {
        console.error("Failed to set language:", error);
        onComplete();
      }
    };
    setLang();
  }, [lang, onComplete]);

  const langDisplay = lang === "ja" ? "日本語" : "English";
  return (
    <Box flexDirection="column">
      <Text color="green">✓ Language set to {langDisplay}</Text>
    </Box>
  );
};