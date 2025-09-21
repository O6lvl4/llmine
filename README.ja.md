# llmine

<div align="center">
    <img src="assets/llmine-logo.png" alt="llmine logo" width="600">
</div>

<div align="center">

[![npm version](https://badge.fury.io/js/llmine.svg)](https://badge.fury.io/js/llmine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/llmine.svg)](https://nodejs.org)

[English README](README.md)

</div>

ターミナルから様々なLLM (ChatGPT、Claude、Gemini等) に統一的にアクセスできる強力なCLIツールです。
OpenAI、Azure OpenAI、Anthropic (Claude)、AWS Bedrock、Ollamaなど複数のAIプロバイダを、エレガントな単一のコマンドラインインターフェースでシームレスに操作できます。

## 特徴

- **OpenAI / Azure OpenAI / Anthropic (Claude) / AWS Bedrock / Ollama** に対応
- プロンプトを直接コマンド引数に渡せるほか、パイプ経由での入力にも対応
- **パイプ機能の強化** - git diff などの大きな入力もスムーズに処理
- **多言語対応** - 日本語/英語の切り替えが可能 (`llmine lang set [ja|en]`)
- **Ollama連携** - ローカルLLMモデルをシームレスに利用可能
- API キーや Azure のリソース情報などは対話形式で簡単に設定可能
- `llmine model` コマンドでプロバイダ+モデルのプロファイルを管理し、用途に応じて瞬時に切替
- Ink + React 製の CLI でリッチなインタラクティブ UI を実現
- Node.js + TypeScript 製のシンプルな構成で拡張もしやすい

## インストール

### npmからインストール（推奨）

```bash
npm install -g llmine
```

### ソースからインストール

#### 1. リポジトリをクローン

```bash
git clone https://github.com/O6lvl4/llmine.git
cd llmine
```

#### 2. クイックインストール（一括実行）

```bash
npm run setup
```

このコマンドは自動的に以下を実行します：
- 依存関係のインストール
- TypeScriptのビルド
- グローバルコマンドとして登録
- 実行権限の設定

#### 3. 手動インストール

個別に実行する場合は以下の順番で：

```bash
# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build

# グローバルコマンドとして登録
npm link

# 実行権限の付与
chmod +x dist/cli/main.js

# nodenvを使用している場合はシムを更新
nodenv rehash
```


## クイックスタート

```bash
# 最初のプロバイダを設定（対話式セットアップ）
llmine provider add openai

# 最初のプロンプトを送信
llmine "人生の意味は何ですか？"

# コードレビューのためにパイプ入力
cat app.js | llmine "このコードの改善点をレビューしてください"
```

## 使い方

### 1. プロバイダの設定

使用したいAIプロバイダの認証情報を設定します。対話式セットアップがプロセスをガイドします：

```bash
llmine provider add <provider>
```

サポートされているプロバイダ：

### 2. モデルプロファイル

モデルプロファイルを作成・管理して、異なる設定を素早く切り替えることができます：

```bash
# モデルプロファイルを追加 (対話形式)
llmine model add

# 登録済みプロファイルの一覧
llmine model list

# 任意のプロファイルをアクティブ化
llmine model use openai-dev

# 現在の設定内容を確認
llmine model show

# プロファイルを削除
llmine model rm openai-dev

# プロバイダプロファイルも CRUD 可能
llmine provider add openai
llmine provider list
llmine provider show openai-default
llmine provider use openai-default
llmine provider rm openai-default

```

`model add` では、プロバイダ選択 → モデル取得（可能な場合はAPIからリアルタイム取得）→ 温度などの設定 → アクティブ化まで一括で行えます。
プロバイダの認証情報が未設定の場合は、先に `llmine provider add <provider>` を実行してください。

#### OpenAI

```bash
llmine provider add openai
```

- OpenAI API Key（例：`sk-xxxxxx...`）を入力してください。

#### Azure OpenAI

```bash
llmine provider add azure
```

- Azure OpenAI Resource Name（例：`myazureopenai123`）
- Azure OpenAI API Key
- Azure OpenAI Deployment Name（例：`gpt-35-test`）
- Azure OpenAI API Version（例：`2024-05-01-preview` など）

#### Anthropic (Claude)

```bash
llmine provider add anthropic
```

- Anthropic API Key (例: `sk-ant-api03-...`)
- 任意で既定の Claude モデル ID（例: `claude-3-5-sonnet-latest`）

#### AWS Bedrock

```bash
llmine provider add bedrock
```

- 利用するリージョン（例: `us-east-1`）
- 必要に応じて AWS Access Key / Secret (空欄の場合は環境変数や IAM ロールを使用)
- 任意で既定のモデル ID（例: `anthropic.claude-3-5-sonnet-20241022-v1:0`）

#### Ollama

```bash
llmine provider add ollama
```

- 接続先ホスト (デフォルト: `http://localhost:11434`)
- 任意で既定のローカルモデル ID（例: `llama3.1`）

これらを入力すると、`~/.llmine/config.json` に設定が保存されます。

### 3. プロバイダの管理

登録済みのプロファイルを確認するには:

```bash
llmine provider list
```

### 4. 利用可能なモデルの一覧

対応しているプロバイダの場合、利用可能なモデルの一覧を表示できます。

```bash
# デフォルトのプロバイダ (または config.json で指定されているプロバイダ) のモデル一覧
llmine models

# 明示的にプロバイダを指定する場合
llmine models --provider openai
llmine models --provider azure
llmine models --provider anthropic
llmine models --provider bedrock
llmine models --provider ollama
```

### 5. プロンプトの送信

#### 例1: 引数でプロンプトを直接指定

```bash
# デフォルトではアクティブなモデルプロファイルに設定されたプロバイダ・モデルが使われます。
llmine "明日の天気はどうなりそう？"

# -- セパレータで強制的にプロンプトとして扱う（予約語と重なる場合に便利）
llmine -- models                      # "models"をプロンプトとして送信（コマンドではなく）
llmine -- list all files              # テキスト全体をプロンプトとして送信

# モデルや temperature、プロバイダを指定したい場合
llmine "アメリカの歴代大統領を一覧で教えて" \
  --model gpt-3.5-turbo \
  --temperature 0.5 \
  --provider openai

# Claude を利用する例
llmine "最新のAI動向を3行でまとめて" \
  --provider anthropic \
  --model claude-3-5-sonnet-latest

# ローカルの Ollama モデルを利用する例
llmine "Dockerfileのセキュリティレビューをして" \
  --provider ollama \
  --model llama3.1
```

#### 例2: パイプでの入力

```bash
# ファイルの内容を読み込ませる場合など
cat sample_prompt.txt | llmine

# git diffを解析してコミットメッセージを生成
git diff | llmine "コミットメッセージを提案して"

# コードレビュー
cat app.js | llmine "このコードをレビューして改善点を教えて"

# ログ解析
tail -n 100 error.log | llmine "エラーの原因を分析して"
```

### 6. 言語設定

CLIの表示言語を切り替えることができます：

```bash
# 現在の言語設定を確認
llmine lang

# 日本語に設定
llmine lang set ja

# 英語に設定
llmine lang set en
```

### 7. Ollamaとの連携（ローカルモデル）

ローカルで動作するOllamaのモデルを利用できます：

```bash
# Ollamaが起動していることを確認
ollama list

# Ollamaプロバイダーを追加
llmine provider add ollama

# Ollamaモデルを使用
llmine "質問" -p ollama

# 特定のモデルを指定
llmine "質問" -p ollama -m llama3.1
```

### 8. ヘルプの表示

ヘルプは以下で表示されます。

```bash
llmine help
```

またはコマンドがよくわからなくなった場合は、引数なしで `llmine` と打てばヘルプが自動で表示されます。

```bash
llmine
```

## 高度な機能

### システムプロンプト

システムプロンプトでAIの動作をカスタマイズ：

```bash
# 特殊な応答のためのシステムコンテキストを設定
llmine "量子コンピューティングを説明して" \
  --system "あなたは初心者に概念を説明する物理学の教授です"
```

### ストリーミング応答

長い応答をリアルタイムでストリーミング出力：

```bash
llmine "宇宙探査について詳細なエッセイを書いて" --stream
```

### 出力フォーマット

様々なフォーマットで応答をエクスポート：

```bash
# ファイルに保存
llmine "READMEテンプレートを生成" > README.md

# クリップボードにコピー（macOS）
llmine "ユーザー分析用のSQLクエリを生成" | pbcopy
```

## 開発

### アーキテクチャ

```
src/
├── core/                      # コアビジネスロジック
│   ├── aiClient.ts           # 統一AIクライアントインターフェース
│   ├── config.ts             # 設定管理
│   ├── modelRegistry.ts      # モデルプロファイルレジストリ
│   └── providers.ts          # プロバイダ実装
├── cli/                       # インタラクティブCLI (Ink + React)
│   ├── app.tsx               # メインアプリケーションコンポーネント
│   ├── main.tsx              # CLIエントリーポイント
│   ├── parseArgs.ts          # 引数解析
│   ├── screens/              # UIスクリーン
│   └── utils/                # CLIユーティリティ
└── utils/                     # 共有ユーティリティ
    └── banner.ts             # ASCIIアートバナー
```

### 開発スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run build` | TypeScriptをJavaScriptにコンパイル |
| `npm run dev` | ホットリロード付き開発モードで実行 |
| `npm run format` | Prettierでコードをフォーマット |
| `npm run lint` | ESLintチェックを実行 |
| `npm run test` | テストスイートを実行 |
| `npm run setup` | ワンコマンドインストール |

### 設定

すべての設定は `~/.llmine/config.json` に保存されます。このファイルを直接編集するか、CLIコマンドを使用できます：

```json
{
  "currentModel": "openai-dev",
  "models": [
    {
      "name": "openai-dev",
      "provider": "openai",
      "modelId": "gpt-4o-mini",
      "temperature": 0.7
    }
  ],
  "defaultProvider": "openai",
  "openaiApiKey": "sk-xxxxxx...",
  "defaultOpenAIModelId": "gpt-4o-mini",
  "azureOpenAIResourceName": "myazureopenai123",
  "azureOpenAIKey": "xxxxxxxx...",
  "azureOpenAIVersion": "2024-05-01-preview",
  "azureDeploymentModelId": "my-test-deploy",
  "anthropicApiKey": "sk-ant-api03-xxxx",
  "defaultAnthropicModelId": "claude-3-5-sonnet-latest",
  "awsRegion": "us-east-1",
  "defaultBedrockModelId": "anthropic.claude-3-5-sonnet-20241022-v1:0",
  "ollamaHost": "http://localhost:11434",
  "defaultOllamaModelId": "llama3.1"
}
```

高度な設定のために、このJSONファイルを直接編集できます。次回実行時にCLIが変更を検証します。

## コントリビューション

貢献を歓迎します！お気軽にプルリクエストをお送りください。

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## サポート

- **Issues**: [GitHub Issues](https://github.com/O6lvl4/llmine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/O6lvl4/llmine/discussions)

## ライセンス

[MIT License](./LICENSE) - このプロジェクトは自由に利用できます。

## 謝辞

- 美しいCLIインターフェースのための[Ink](https://github.com/vadimdemedes/ink)
- 型安全性のための[TypeScript](https://www.typescriptlang.org/)
- 素晴らしいAPIを提供するすべてのAIプロバイダに感謝
