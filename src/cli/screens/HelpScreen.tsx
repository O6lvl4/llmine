import React from "react";
import { Box, Text } from "ink";
import { pkgVersion } from "../utils/packageInfo.js";

export const HelpScreen: React.FC = () => {
  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text color="cyan">llmine v{pkgVersion}</Text>
        <Text>マルチプロバイダ対応の LLM CLI ツール</Text>
      </Box>

      <Box flexDirection="column">
        <Text color="yellow">使い方:</Text>
        <Text>  llmine [options] [prompt]</Text>
        <Text>  llmine model &lt;subcommand&gt;</Text>
        <Text>  llmine provider &lt;subcommand&gt;</Text>
      </Box>

      <Box flexDirection="column">
        <Text color="yellow">オプション:</Text>
        <Text>  -p, --provider &lt;name&gt;    プロバイダを指定</Text>
        <Text>  -m, --model &lt;model&gt;      モデル ID を指定</Text>
        <Text>  -t, --temperature &lt;num&gt;  温度 (0-2)</Text>
        <Text>  -h, --help               このヘルプを表示</Text>
        <Text>  -V, --version            バージョンを表示</Text>
      </Box>

      <Box flexDirection="column">
        <Text color="yellow">代表的なコマンド:</Text>
        <Text>  llmine "Write a haiku"</Text>
        <Text>  llmine model add</Text>
        <Text>  llmine model list</Text>
        <Text>  llmine model use openai-dev</Text>
        <Text>  llmine provider add openai</Text>
        <Text>  llmine provider list</Text>
      </Box>
    </Box>
  );
};
