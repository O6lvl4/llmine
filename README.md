# llmine

<img src="docs/llmine-logo.png" width="300px" />

コマンドラインから LLM (ChatGPT など) にアクセスできる CLI ツールです。  
OpenAI や Azure OpenAI をプロンプト一発で簡単に呼び出し、その結果を端末上に表示できます。

## 特徴

- **OpenAI および Azure OpenAI** に対応  
- プロンプトを直接コマンド引数に渡せるほか、パイプ経由での入力にも対応  
- API キーや Azure のリソース情報などは対話形式で簡単に設定可能  
- Node.js + TypeScript 製のシンプルな構成で拡張もしやすい

## インストール

### 1. リポジトリをクローン (またはソースをダウンロード)

```bash
git clone https://github.com/yourname/llmine.git
cd llmine
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. ビルド & CLI 登録

```bash
npm run build
npm link
```

上記で `llmine` コマンドがパスに登録され、どのディレクトリからでも呼び出せるようになります。  
もし `npm link` がうまく動作しない場合や、不要な場合は `npx llmine` 形式で利用しても構いません。

## 使い方

### 1. APIキーを設定

まずは使用したいプロバイダ (OpenAI or Azure) の API キーやリソース情報を設定します。  
以下のコマンドを実行すると、対話形式でキーの入力を求められます。

#### OpenAI

```bash
llmine keys set openai
```

- OpenAI API Key（例：`sk-xxxxxx...`）を入力してください。

#### Azure OpenAI

```bash
llmine keys set azure
```

- Azure OpenAI Resource Name（例：`myazureopenai123`）  
- Azure OpenAI API Key  
- Azure OpenAI Deployment Name（例：`gpt-35-test`）  
- Azure OpenAI API Version（例：`2024-05-01-preview` など）  

これらを入力すると、`~/.llmine/config.json` に設定が保存されます。

### 2. キー一覧を確認

設定したキーやリソース情報を確認するには:

```bash
llmine keys list
```

### 3. モデルの一覧を確認

対応しているプロバイダの場合、利用可能なモデルの一覧を表示できます。

```bash
# デフォルトのプロバイダ (または config.json で指定されているプロバイダ) のモデル一覧
llmine models

# 明示的にプロバイダを指定する場合
llmine models --provider openai
llmine models --provider azure
```

### 4. 実際にプロンプトを送信してみる

#### 例1: 引数でプロンプトを直接指定

```bash
# デフォルトでは OpenAI / Azure など、config.json に設定したデフォルトプロバイダが使われます。
llmine "明日の天気はどうなりそう？"

# モデルや temperature、プロバイダを指定したい場合
llmine "アメリカの歴代大統領を一覧で教えて" \
  --model gpt-3.5-turbo \
  --temperature 0.5 \
  --provider openai
```

#### 例2: パイプでの入力

```bash
# ファイルの内容を読み込ませる場合など
cat sample_prompt.txt | llmine
```

### 5. ヘルプ

ヘルプは以下で表示されます。

```bash
llmine help
```

またはコマンドがよくわからなくなった場合は、引数なしで `llmine` と打てばヘルプが自動で表示されます。

```bash
llmine
```

## 開発者向け情報

### ディレクトリ構成

```bash
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── src
│   ├── commands
│   │   ├── defaultCommand.ts  # デフォルトコマンド（"llmine [prompt]"）
│   │   ├── helpCommand.ts     # "llmine help"
│   │   ├── keysCommand.ts     # "llmine keys ..."
│   │   └── modelsCommand.ts   # "llmine models"
│   ├── index.ts               # CLI エントリーポイント
│   └── utils
│       ├── aiClient.ts        # AI クライアント生成ロジック
│       ├── banner.ts          # バナー表示用
│       ├── config.ts          # 設定ファイル管理
│       └── openai.ts          # (直接 OpenAI SDK を使いたい場合のサンプル)
└── ...
```

### スクリプト一覧

- `npm run build`  
  TypeScript コンパイルを実行します (出力先: `dist` ディレクトリ)。
- `npm run dev`  
  `ts-node` で `src/index.ts` を直接実行し、開発モードで CLI を試せます。
- `npm run format`  
  Prettier によるコード整形を行います。
- `npm link`  
  グローバルに `llmine` コマンドを登録します。

### 設定ファイル

`~/.llmine/config.json` に、以下のような内容が保存されます。

```json
{
  "defaultProvider": "openai",
  "openaiApiKey": "sk-xxxxxx...",
  "azureOpenAIResourceName": "myazureopenai123",
  "azureOpenAIKey": "xxxxxxxx...",
  "azureOpenAIVersion": "2024-05-01-preview",
  "azureDeploymentModelId": "my-test-deploy"
}
```

一部パラメータの名称はソース側と対応しているため、直接編集も可能です。

## ライセンス

[MIT License](./LICENSE)  

本ソフトウェアは MIT License のもとで公開されています。ライセンス条文をよくお読みの上、ご利用ください。
