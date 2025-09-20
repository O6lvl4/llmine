# llmine 2.0 アーキテクチャ方針

## ゴール

- 1.x で実現しているプロバイダ/モデル管理・プロンプト送信機能を保ちながら、責務を `core` と `cli` に分離する。
- CLI は Ink (React ベース) で再構成し、インタラクティブで拡張性の高い UI を提供する。
- コアロジックは CLI に依存しない純粋な TypeScript モジュールとして切り出し、将来的な別 UI や API からも再利用できるようにする。

## ディレクトリ構成 (案)

```
src/
  core/
    config.ts
    providers.ts
    modelRegistry.ts
    providerRegistry.ts
    aiClient.ts
  cli/
    main.tsx
    app.tsx
    parseArgs.ts
    screens/
    utils/
```

- `core` は Node との直接依存（fs, path 等）を最小限にし、設定 IO・LLM 呼び出しを担当。
- `cli` は Commander/Ink・入出力など UI 層に専念。

## コア層のAPI案

```ts
// src/core/types.ts
export interface ModelProfile { /* ... */ }
export interface PromptExecutionOptions { prompt: string; model?: string; provider?: ProviderType; temperature?: number; }
export interface PromptExecutionResult { text: string; meta: {...}; }

// src/core/ai/client.ts
export function createAIClient(provider?: ProviderType): AIClient;
export async function executePrompt(options: PromptExecutionOptions): Promise<PromptExecutionResult>;

// src/core/ai/registry.ts
export function listProfiles(): ModelProfile[];
export function addProfile(input: AddProfileInput): ModelProfile;
export function updateProfile(name: string, update: Partial<ModelProfile>): ModelProfile;
export function removeProfile(name: string): void;
export function setActiveProfile(name: string): void;
export function getActiveProfile(): ModelProfile | undefined;
```

## CLI 層の構成案

- `Commander` は最小限の解析 (`llmine model add`, `llmine model list`, `llmine prompt`, など) を行い、実際の見た目/フローは Ink コンポーネントに委譲。
- `Ink` コンポーネントは `core` の関数を呼び出しながら、ユーザー入力を促す。
  - 例: `ModelListScreen` は `listProfiles()` の結果を表示し、矢印キーで選択→Enterで詳細表示。
  - `ModelAddWizard` や `ProviderAddScreen` は Ink + `ink-text-input` 等を使って対話的にプロファイル作成。

## ビルド/エントリーポイント

- `src/cli/main.tsx` を `bin` に指定 (`dist/cli/main.js`)。
- `tsconfig.json` を `core` と `cli` の2つの outDir (または project references) に対応させる。
- `npm run build` で 2 つのターゲットをビルド。例:
  - `tsc -p tsconfig.core.json`
  - `tsc -p tsconfig.cli.json`
- CLI 用の bundler は不要で、Ink は Node で動作するので `tsc` 出力をそのまま使用。

## 互換性と移行

- `~/.llmine/config.json` 形式は 1.x と同じに保つ。
- 可能であれば 1.x CLI エントリーポイントは `npm bin` から 2.0 に置き換える。
- `llmine model` 等のコマンド名は現状維持 (UI 表現のみ Ink 化)。

## 実装状況 (2025-09 時点)

- ✅ `core` と `cli` へのコード分割完了。共通ロジックは `src/core` に集約し、Ink を用いた CLI UI を `src/cli` で構築。
- ✅ CLI の主要フロー (`llmine model/provider` など) を Ink コンポーネント化。`model add` や `provider add` のウィザードも Ink で実装。
- ✅ Commander 相当の引数解析は `parseArgs.ts` に移し、Ink 画面を描画する `App` にルーティング。
- ✅ TypeScript の ESM ビルド (`module: nodenext`) に統一し、`npm run build` で `dist/core` と `dist/cli` が生成される。
- ✅ 旧 `llmine keys ...` は `llmine provider ...` へ統一済み。

## 今後のアイデア

- 画面遷移をよりリッチにするためのステート管理（例: zustand 等）の導入検討。
- プロバイダ別に追加情報（利用可能なツールやコンテキストサイズなど）を UI で提示。
- プロファイルごとの履歴やタグ付けといったメタデータ管理機能の拡張。
```
