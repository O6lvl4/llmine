import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import TextInput from "ink-text-input";
import { t } from "../../core/i18n.js";
import { PromptRunner } from "./PromptRunner.js";

export const PromptInteractive: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { exit } = useApp();

  const handleSubmit = () => {
    if (prompt.trim()) {
      setSubmitted(true);
    } else {
      exit();
    }
  };

  if (submitted) {
    return <PromptRunner prompt={prompt} />;
  }

  return (
    <Box flexDirection="column">
      <Text color="green" bold>
        {t("enterPrompt")}:
      </Text>
      <Text color="gray">
        (Press Enter to send, or Ctrl+C to exit)
      </Text>
      <Box marginTop={1}>
        <Text color="cyan">❯ </Text>
        <TextInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          placeholder="Ask me anything..."
        />
      </Box>
    </Box>
  );
};