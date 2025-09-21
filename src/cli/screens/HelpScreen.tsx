import React from "react";
import { Box, Text } from "ink";
import { pkgVersion } from "../utils/packageInfo.js";
import { t, getLanguage } from "../../core/i18n.js";

export const HelpScreen: React.FC = () => {
  const isJapanese = getLanguage() === "ja";

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        <Text color="cyan">llmine v{pkgVersion}</Text>
        <Text>
          {isJapanese
            ? "マルチプロバイダ対応の LLM CLI ツール"
            : "Multi-provider LLM CLI tool"}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">{isJapanese ? "使い方" : "Usage"}:</Text>
        <Text>
          {" "}
          llmine [options] "prompt" {isJapanese ? "プロンプトを送信" : "Send prompt"}
        </Text>
        <Text>
          {" "}
          llmine -- any text here{" "}
          {isJapanese ? "強制的にプロンプトとして送信" : "Force as prompt"}
        </Text>
        <Text>
          {" "}
          llmine models {isJapanese ? "モデル一覧を表示" : "List available models"}
        </Text>
        <Text>
          {" "}
          llmine model &lt;subcommand&gt; {isJapanese ? "モデル管理" : "Manage models"}
        </Text>
        <Text>
          {" "}
          llmine provider &lt;subcommand&gt;{" "}
          {isJapanese ? "プロバイダ管理" : "Manage providers"}
        </Text>
        <Text>
          {" "}
          llmine lang [set ja|en] {isJapanese ? "言語設定" : "Language settings"}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">{isJapanese ? "オプション" : "Options"}:</Text>
        <Text>
          {" "}
          -P, --provider &lt;name&gt; {isJapanese ? "プロバイダを指定" : "Specify provider"}
        </Text>
        <Text>
          {" "}
          -m, --model &lt;model&gt; {isJapanese ? "モデル ID を指定" : "Specify model ID"}
        </Text>
        <Text>
          {" "}
          -t, --temperature &lt;n&gt; {isJapanese ? "温度 (0-2)" : "Temperature (0-2)"}
        </Text>
        <Text>
          {" "}
          -h, --help {isJapanese ? "このヘルプを表示" : "Show this help"}
        </Text>
        <Text>
          {" "}
          -V, --version {isJapanese ? "バージョンを表示" : "Show version"}
        </Text>
        <Text>
          {" "}
          -- {isJapanese ? "以降をプロンプトとして扱う" : "Treat following as prompt"}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="yellow">{isJapanese ? "例" : "Examples"}:</Text>
        <Text>
          {" "}
          llmine "Write a haiku" {isJapanese ? "通常のプロンプト" : "Normal prompt"}
        </Text>
        <Text>
          {" "}
          llmine -- models{" "}
          {isJapanese ? '"models"をプロンプトとして送信' : 'Send "models" as prompt'}
        </Text>
        <Text>
          {" "}
          llmine models {isJapanese ? "モデル一覧を表示" : "List models"}
        </Text>
        <Text>
          {" "}
          llmine -m gpt-4 "Hello"{" "}
          {isJapanese ? "モデル指定でプロンプト" : "Prompt with model"}
        </Text>
        <Text>
          {" "}
          cat file.txt | llmine{" "}
          {isJapanese ? '"要約して"  パイプ入力' : '"summarize" Pipe input'}
        </Text>
        <Text>
          {" "}
          llmine model add{" "}
          {isJapanese ? "モデル追加（対話形式）" : "Add model (interactive)"}
        </Text>
        <Text>
          {" "}
          llmine provider add openai {isJapanese ? "OpenAI設定" : "OpenAI setup"}
        </Text>
      </Box>
    </Box>
  );
};
