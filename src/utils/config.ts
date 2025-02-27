import * as fs from "fs";
import * as os from "os";
import * as path from "path";

// 型定義
export interface Config {
  // プロバイダのデフォルト設定（'openai' または 'azure'）
  defaultProvider?: "openai" | "azure";

  // OpenAI 用の設定
  openaiApiKey?: string;
  defaultOpenAIModelId?: string; // 例: 'gpt-4-turbo'

  // Azure 用の設定
  azureOpenAIResourceName?: string; // リソース名
  azureOpenAIKey?: string;
  azureOpenAIVersion?: string; // 例: '2024-10-01-preview'
  azureDeploymentModelId?: string; // 例: デプロイ名

  // その他の設定も必要に応じて追加可能
  [key: string]: any;
}

// 設定ディレクトリとファイルのパス
const CONFIG_DIR = path.join(os.homedir(), ".llmine");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// 設定ディレクトリが存在しない場合は作成
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// 設定を読み込む
function loadConfig(): Config {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    } catch (error) {
      // JSONパースに失敗した場合は空の設定を返す
      return {};
    }
  }
  return {};
}

// 設定を保存する
export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// グローバルに使い回すための設定オブジェクト
export const config: Config = loadConfig();
