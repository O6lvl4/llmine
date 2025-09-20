export type Language = "ja" | "en";

interface Messages {
  waitingForResponse: string;
  selectProvider: string;
  selectModel: string;
  enterApiKey: string;
  enterBaseUrl: string;
  enterPrompt: string;
  profileName: string;
  temperature: string;
  success: string;
  error: string;
  saved: string;
  deleted: string;
  currentProvider: string;
  currentModel: string;
  noProvidersConfigured: string;
  noModelsConfigured: string;
  availableProviders: string;
  availableModels: string;
  pipedInput: string;
  lines: string;
  chars: string;
  help: {
    title: string;
    usage: string;
    basicUsage: string;
    pipeUsage: string;
    commands: string;
    options: string;
    examples: string;
  };
  provider: {
    add: string;
    list: string;
    show: string;
    use: string;
    remove: string;
    current: string;
  };
  model: {
    add: string;
    list: string;
    show: string;
    use: string;
    remove: string;
  };
  errors: {
    unsupportedProvider: string;
    providerRequired: string;
    modelRequired: string;
    profileRequired: string;
    apiKeyRequired: string;
    invalidTemperature: string;
    notFound: string;
    failedToSave: string;
    failedToDelete: string;
  };
}

const messages: Record<Language, Messages> = {
  ja: {
    waitingForResponse: "モデルからの応答を待っています...",
    selectProvider: "プロバイダを選択",
    selectModel: "モデルを選択",
    enterApiKey: "APIキーを入力",
    enterBaseUrl: "ベースURLを入力",
    enterPrompt: "プロンプトを入力",
    profileName: "プロファイル名",
    temperature: "温度",
    success: "成功",
    error: "エラー",
    saved: "保存しました",
    deleted: "削除しました",
    currentProvider: "現在のプロバイダ",
    currentModel: "現在のモデル",
    noProvidersConfigured: "プロバイダが設定されていません",
    noModelsConfigured: "モデルが設定されていません",
    availableProviders: "利用可能なプロバイダ",
    availableModels: "利用可能なモデル",
    pipedInput: "パイプ入力",
    lines: "行",
    chars: "文字",
    help: {
      title: "llmine - 複数のLLMプロバイダに対応したCLIツール",
      usage: "使用方法",
      basicUsage: "基本的な使用方法",
      pipeUsage: "パイプでの使用",
      commands: "コマンド",
      options: "オプション",
      examples: "使用例",
    },
    provider: {
      add: "プロバイダを追加",
      list: "プロバイダ一覧",
      show: "プロバイダ詳細",
      use: "プロバイダを使用",
      remove: "プロバイダを削除",
      current: "現在のプロバイダ",
    },
    model: {
      add: "モデルを追加",
      list: "モデル一覧",
      show: "モデル詳細",
      use: "モデルを使用",
      remove: "モデルを削除",
    },
    errors: {
      unsupportedProvider: "サポートされていないプロバイダです",
      providerRequired: "プロバイダの指定が必要です",
      modelRequired: "モデルの指定が必要です",
      profileRequired: "プロファイル名が必要です",
      apiKeyRequired: "APIキーが必要です",
      invalidTemperature: "温度は0から2の間で指定してください",
      notFound: "見つかりません",
      failedToSave: "保存に失敗しました",
      failedToDelete: "削除に失敗しました",
    },
  },
  en: {
    waitingForResponse: "Waiting for model response...",
    selectProvider: "Select provider",
    selectModel: "Select model",
    enterApiKey: "Enter API key",
    enterBaseUrl: "Enter base URL",
    enterPrompt: "Enter prompt",
    profileName: "Profile name",
    temperature: "Temperature",
    success: "Success",
    error: "Error",
    saved: "Saved",
    deleted: "Deleted",
    currentProvider: "Current provider",
    currentModel: "Current model",
    noProvidersConfigured: "No providers configured",
    noModelsConfigured: "No models configured",
    availableProviders: "Available providers",
    availableModels: "Available models",
    pipedInput: "Piped input",
    lines: "lines",
    chars: "chars",
    help: {
      title: "llmine - CLI tool for multiple LLM providers",
      usage: "Usage",
      basicUsage: "Basic usage",
      pipeUsage: "Pipe usage",
      commands: "Commands",
      options: "Options",
      examples: "Examples",
    },
    provider: {
      add: "Add provider",
      list: "List providers",
      show: "Show provider",
      use: "Use provider",
      remove: "Remove provider",
      current: "Current provider",
    },
    model: {
      add: "Add model",
      list: "List models",
      show: "Show model",
      use: "Use model",
      remove: "Remove model",
    },
    errors: {
      unsupportedProvider: "Unsupported provider",
      providerRequired: "Provider is required",
      modelRequired: "Model is required",
      profileRequired: "Profile name is required",
      apiKeyRequired: "API key is required",
      invalidTemperature: "Temperature must be between 0 and 2",
      notFound: "Not found",
      failedToSave: "Failed to save",
      failedToDelete: "Failed to delete",
    },
  },
};

let currentLanguage: Language = "ja";

export function detectLanguage(): Language {
  const locale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || "";

  // Check if locale starts with ja (Japanese)
  if (locale.toLowerCase().startsWith("ja")) {
    return "ja";
  }

  // Default to English
  return "en";
}

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const keys = key.split(".");
  let value: any = messages[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = messages.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === "object" && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }

  return typeof value === "string" ? value : key;
}

// Initialize language on module load
currentLanguage = detectLanguage();