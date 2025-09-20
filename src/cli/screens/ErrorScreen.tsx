import React from "react";
import { Box, Text } from "ink";

interface ErrorScreenProps {
  message: string;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ message }) => (
  <Box flexDirection="column">
    <Text color="red">エラー: {message}</Text>
    <Text>詳細な使い方は `llmine --help` を参照してください。</Text>
  </Box>
);
