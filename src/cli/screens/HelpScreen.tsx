import React from "react";
import { Box, Text } from "ink";
import { pkgVersion } from "../utils/packageInfo.js";

export const HelpScreen: React.FC = () => {
  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        <Text color="cyan">llmine v{pkgVersion}</Text>
        <Text>マルチプロバイダ対応の LLM CLI ツール</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">使い方:</Text>
        <Text> llmine [options] "prompt"          プロンプトを送信</Text>
        <Text> llmine -- any text here          強制的にプロンプトとして送信</Text>
        <Text> llmine models                    モデル一覧を表示</Text>
        <Text> llmine model &lt;subcommand&gt;        モデル管理</Text>
        <Text> llmine provider &lt;subcommand&gt;     プロバイダ管理</Text>
        <Text> llmine lang [set ja|en]          言語設定</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">オプション:</Text>
        <Text> -P, --provider &lt;name&gt;   プロバイダを指定</Text>
        <Text> -m, --model &lt;model&gt;     モデル ID を指定</Text>
        <Text> -t, --temperature &lt;n&gt;   温度 (0-2)</Text>
        <Text> -h, --help               このヘルプを表示</Text>
        <Text> -V, --version            バージョンを表示</Text>
        <Text> --                       以降をプロンプトとして扱う</Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">例:</Text>
        <Text> llmine "Write a haiku"           通常のプロンプト</Text>
        <Text> llmine -- models                 "models"をプロンプトとして送信</Text>
        <Text> llmine models                    モデル一覧を表示</Text>
        <Text> llmine -m gpt-4 "Hello"          モデル指定でプロンプト</Text>
        <Text> cat file.txt | llmine "要約して"  パイプ入力</Text>
        <Text> llmine model add                 モデル追加（対話形式）</Text>
        <Text> llmine provider add openai       OpenAI設定</Text>
      </Box>
    </Box>
  );
};
