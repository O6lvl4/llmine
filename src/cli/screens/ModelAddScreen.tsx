import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";

import {
  SUPPORTED_PROVIDERS,
  PROVIDER_LABELS,
  PROVIDER_SAMPLE_MODELS,
  normalizeProvider,
} from "../../core/providers.js";
import {
  validateProviderConfigured,
  upsertModelProfile,
  setCurrentModel,
  findModelProfile,
} from "../../core/modelRegistry.js";
import { createAIClient } from "../../core/aiClient.js";
import { ProviderType } from "../../core/config.js";

type SelectInputItem<V> = {
  label: string;
  value: V;
  key?: string;
};

interface ModelAddScreenProps {
  presetName?: string;
}

type Step =
  | "name"
  | "provider"
  | "model-loading"
  | "model-select"
  | "model-manual"
  | "temperature"
  | "set-current"
  | "done"
  | "error";

export const ModelAddScreen: React.FC<ModelAddScreenProps> = ({ presetName }) => {
  const [step, setStep] = useState<Step>("name");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>(presetName ?? "");
  const [provider, setProvider] = useState<ProviderType | undefined>(undefined);
  const [models, setModels] = useState<string[]>([]);
  const [modelId, setModelId] = useState<string>("");
  const [temperature, setTemperature] = useState<string>("");
  const [setCurrent, setSetCurrent] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const providerItems: Array<SelectInputItem<string>> = useMemo(
    () =>
      SUPPORTED_PROVIDERS.map((p: ProviderType) => ({
        label: `${p} (${PROVIDER_LABELS[p]})`,
        value: p,
      })),
    [],
  );

  useEffect(() => {
    if (step !== "model-loading" || !provider) {
      return;
    }

    const targetProvider = provider;

    let cancelled = false;

    async function loadModels() {
      try {
        setLoadingMessage(`${PROVIDER_LABELS[targetProvider] ?? targetProvider} のモデルを取得中...`);
        const client = createAIClient(targetProvider);
        if (client.listModels) {
          const fetched = await client.listModels();
          if (!cancelled) {
            const unique = Array.from(
              new Set(fetched.concat(PROVIDER_SAMPLE_MODELS[targetProvider] ?? [])),
            );
            setModels(unique);
            setStep(unique.length ? "model-select" : "model-manual");
          }
        } else {
          if (!cancelled) {
            const fallback = PROVIDER_SAMPLE_MODELS[targetProvider] ?? [];
            setModels(fallback);
            setStep(fallback.length ? "model-select" : "model-manual");
          }
        }
      } catch (err) {
        if (cancelled) return;
        setModels(PROVIDER_SAMPLE_MODELS[targetProvider] ?? []);
        setError(
          err instanceof Error
            ? err.message
            : "モデル一覧の取得に失敗しました",
        );
        setStep(
          PROVIDER_SAMPLE_MODELS[targetProvider]?.length ? "model-select" : "model-manual",
        );
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [step, provider]);

  useEffect(() => {
    setError(null);
  }, [step]);

  if (step === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">{error ?? "不明なエラー"}</Text>
      </Box>
    );
  }

  if (step === "name") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">モデルプロファイル名を入力してください:</Text>
        <TextInput
          value={name}
          onChange={(value: string) => setName(value)}
          onSubmit={(value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
              setError("プロファイル名を入力してください");
              return;
            }
            if (findModelProfile(trimmed)) {
              setError("同名のプロファイルが既に存在します");
              return;
            }
            setName(trimmed);
            setStep("provider");
            setError(null);
          }}
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  if (step === "provider") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">プロバイダを選択してください:</Text>
        <SelectInput
          items={providerItems}
          onSelect={(item) => {
            const normalized = normalizeProvider(item.value);
            try {
              if (!normalized) {
                throw new Error(`未対応のプロバイダです: ${String(item.value)}`);
              }
              validateProviderConfigured(normalized);
              setProvider(normalized);
              setModels([]);
              setStep("model-loading");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  if (step === "model-loading") {
    return (
      <Box flexDirection="column">
        <Text>{loadingMessage || "モデル一覧を取得しています..."}</Text>
      </Box>
    );
  }

  if (step === "model-select") {
    const items: Array<SelectInputItem<string>> = models.map((m) => ({ label: m, value: m }));
    items.push({ label: "手動で入力する", value: "__manual__" });
    return (
      <Box flexDirection="column">
        <Text color="cyan">利用するモデルを選択してください:</Text>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === "__manual__") {
              setStep("model-manual");
            } else {
              setModelId(item.value);
              setStep("temperature");
            }
          }}
        />
      </Box>
    );
  }

  if (step === "model-manual") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">モデルIDを入力してください (例: gpt-4o-mini):</Text>
        <TextInput
          value={modelId}
          onChange={(value: string) => setModelId(value)}
          onSubmit={(value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
              setError("モデルIDを入力してください");
              return;
            }
            setModelId(trimmed);
            setError(null);
            setStep("temperature");
          }}
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  if (step === "temperature") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">temperature (0-2, 空欄可):</Text>
        <TextInput
          value={temperature}
          onChange={(value: string) => setTemperature(value)}
          onSubmit={(value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
              setTemperature("");
              setStep("set-current");
              return;
            }
            const num = Number(trimmed);
            if (Number.isNaN(num) || num < 0 || num > 2) {
              setError("0 以上 2 以下の数値を入力してください");
              return;
            }
            setTemperature(trimmed);
            setError(null);
            setStep("set-current");
          }}
        />
        <Text>Enter で次へ進みます。空欄の場合は既定値 0.7 を使用します。</Text>
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  if (step === "set-current") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">このプロファイルを現在のアクティブモデルに設定しますか?</Text>
        <SelectInput
          items={[
            { label: "はい", value: "yes" },
            { label: "いいえ", value: "no" },
          ]}
          onSelect={(item) => {
            const shouldSet = item.value === "yes";
            setSetCurrent(shouldSet);
            const tempNumber = temperature ? Number(temperature) : undefined;
            if (!provider) {
              setError("プロバイダが未選択です");
              setStep("error");
              return;
            }
            upsertModelProfile({
              name,
              provider,
              modelId,
              temperature: tempNumber,
            });
            if (shouldSet) {
              try {
                setCurrentModel(name);
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
                setStep("error");
                return;
              }
            }
            setStep("done");
          }}
        />
      </Box>
    );
  }

  if (step === "done") {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="green">
          モデルプロファイル '{name}' を追加しました。
        </Text>
        <Text>
          プロバイダ: {provider ? PROVIDER_LABELS[provider] ?? provider : "unknown"}
        </Text>
        <Text>モデル: {modelId}</Text>
        <Text>
          temperature: {temperature ? Number(temperature) : "未設定"}
        </Text>
        {setCurrent && <Text color="green">現在のアクティブモデルとして設定しました。</Text>}
      </Box>
    );
  }

  return null;
};
