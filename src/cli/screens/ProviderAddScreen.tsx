import React, { useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import TextInput from "ink-text-input";

import {
  ProviderType,
  ProviderProfile,
} from "../../core/config.js";
import {
  PROVIDER_LABELS,
  SUPPORTED_PROVIDERS,
} from "../../core/providers.js";
import {
  createProviderProfile,
  upsertProviderProfile,
  setCurrentProviderProfile,
  validateProviderProfile,
} from "../../core/providerRegistry.js";

interface ProviderAddScreenProps {
  provider?: ProviderType;
}

type Step =
  | "provider"
  | "name"
  | "fields"
  | "set-current"
  | "saving"
  | "done"
  | "error";

type FieldDefinition = {
  key: string;
  label: string;
  mask?: string;
  optional?: boolean;
  placeholder?: string;
  defaultValue?: string;
};

type FieldMap = Record<ProviderType, FieldDefinition[]>;

type MutableValues = Record<string, string>;

type SelectItem<V> = {
  label: string;
  value: V;
  key?: string;
};

const DEFAULT_FIELDS: FieldMap = {
  openai: [
    { key: "apiKey", label: "OpenAI API Key", mask: "*" },
    { key: "defaultModel", label: "デフォルトモデル (空欄可)", optional: true },
  ],
  azure: [
    { key: "resourceName", label: "Azure リソース名" },
    { key: "apiKey", label: "Azure API Key", mask: "*" },
    { key: "deployment", label: "デプロイ名" },
    {
      key: "apiVersion",
      label: "API バージョン",
      placeholder: "2024-10-01-preview",
      defaultValue: "2024-10-01-preview",
    },
    { key: "defaultModel", label: "デフォルトモデル (空欄可)", optional: true },
  ],
  anthropic: [
    { key: "apiKey", label: "Anthropic API Key", mask: "*" },
    { key: "defaultModel", label: "デフォルトモデル (空欄可)", optional: true },
  ],
  bedrock: [
    { key: "region", label: "AWS Bedrock リージョン" },
    { key: "accessKeyId", label: "Access Key ID (空欄可)", optional: true },
    { key: "secretAccessKey", label: "Secret Access Key (空欄可)", optional: true, mask: "*" },
    { key: "sessionToken", label: "Session Token (必要な場合のみ)", optional: true, mask: "*" },
    { key: "defaultModel", label: "デフォルトモデル (空欄可)", optional: true },
  ],
  ollama: [
    {
      key: "host",
      label: "Ollama ホストURL",
      placeholder: "http://localhost:11434",
      defaultValue: "http://localhost:11434",
    },
    { key: "defaultModel", label: "デフォルトモデル (空欄可)", optional: true },
  ],
};

export const ProviderAddScreen: React.FC<ProviderAddScreenProps> = ({ provider }) => {
  const [step, setStep] = useState<Step>(provider ? "name" : "provider");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | undefined>(provider);
  const [name, setName] = useState<string>(provider ? `${provider}-profile` : "");
  const [values, setValues] = useState<MutableValues>({});
  const [fieldIndex, setFieldIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [setCurrent, setSetCurrent] = useState<boolean>(true);
  const [savedProfile, setSavedProfile] = useState<ProviderProfile | null>(null);

  const providerItems: Array<SelectItem<ProviderType>> = useMemo(
    () =>
      SUPPORTED_PROVIDERS.map((p) => ({
        label: `${p} (${PROVIDER_LABELS[p]})`,
        value: p,
      })),
    [],
  );

  const fieldsForProvider = selectedProvider
    ? DEFAULT_FIELDS[selectedProvider]
    : undefined;

  useEffect(() => {
    setError(null);
  }, [step, selectedProvider, fieldIndex]);

  if (step === "error") {
    return (
      <Box flexDirection="column">
        <Text color="red">{error ?? "不明なエラー"}</Text>
      </Box>
    );
  }

  if (step === "provider") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">プロバイダ種別を選択してください:</Text>
        <SelectInput
          items={providerItems}
          onSelect={(item) => {
            setSelectedProvider(item.value);
            setValues({});
            setFieldIndex(0);
            setName(`${item.value}-profile`);
            setStep("name");
          }}
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  if (!selectedProvider) {
    setError("プロバイダが選択されていません");
    setStep("error");
    return null;
  }

  if (step === "name") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">プロファイル名を入力してください:</Text>
        <TextInput
          value={name}
          onChange={(value: string) => setName(value)}
          onSubmit={(value: string) => {
            const trimmed = value.trim();
            if (!trimmed) {
              setError("プロファイル名を入力してください");
              return;
            }
            setName(trimmed);
            setFieldIndex(0);
            setValues({});
            setStep("fields");
          }}
        />
        {error && <Text color="red">{error}</Text>}
      </Box>
    );
  }

  if (!fieldsForProvider) {
    setError("このプロバイダのフィールドが定義されていません");
    setStep("error");
    return null;
  }

  const field = fieldsForProvider[fieldIndex];

  if (step === "fields") {
    if (!field) {
      setStep("set-current");
    } else {
      return (
        <Box flexDirection="column">
          <Text color="cyan">{PROVIDER_LABELS[selectedProvider] ?? selectedProvider} の設定</Text>
          <Text>{field.label}:</Text>
          <TextInput
            value={values[field.key] ?? field.defaultValue ?? ""}
            onChange={(value: string) =>
              setValues((prev) => ({ ...prev, [field.key]: value }))
            }
            mask={field.mask}
            placeholder={field.placeholder}
            onSubmit={(value: string) => {
              const trimmed = value.trim();
              if (!trimmed && !field.optional) {
                setError("必須項目です");
                return;
              }
              setValues((prev) => ({ ...prev, [field.key]: trimmed }));
              setFieldIndex((prev) => prev + 1);
            }}
          />
          {field.optional && <Text color="yellow">空欄でスキップできます。</Text>}
          {error && <Text color="red">{error}</Text>}
        </Box>
      );
    }
  }

  if (step === "set-current") {
    return (
      <Box flexDirection="column">
        <Text color="cyan">このプロファイルを現在のアクティブプロバイダに設定しますか?</Text>
        <SelectInput
          items={[
            { label: "はい", value: "yes" },
            { label: "いいえ", value: "no" },
          ]}
          onSelect={(item) => {
            setSetCurrent(item.value === "yes");
            setStep("saving");
          }}
        />
      </Box>
    );
  }

  if (step === "saving") {
    try {
      const payload: Record<string, string | undefined> = {
        name,
        ...values,
      };
      const profile = createProviderProfile(selectedProvider, payload);
      validateProviderProfile(profile);
      upsertProviderProfile(profile);
      if (setCurrent) {
        setCurrentProviderProfile(profile.name);
      }
      setSavedProfile(profile);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep("error");
    }
    return (
      <Box>
        <Text>保存しています...</Text>
      </Box>
    );
  }

  if (step === "done" && savedProfile) {
    const label = PROVIDER_LABELS[savedProfile.provider] ?? savedProfile.provider;
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="green">プロバイダプロファイル '{savedProfile.name}' を追加しました。</Text>
        <Text>
          種別: {label}
        </Text>
        {savedProfile.provider === "azure" && (
          <Text>Deployment: {savedProfile.deployment}</Text>
        )}
        {savedProfile.provider === "openai" && savedProfile.defaultModel && (
          <Text>Model: {savedProfile.defaultModel}</Text>
        )}
        {savedProfile.provider === "anthropic" && savedProfile.defaultModel && (
          <Text>Model: {savedProfile.defaultModel}</Text>
        )}
        {savedProfile.provider === "bedrock" && savedProfile.defaultModel && (
          <Text>Model: {savedProfile.defaultModel}</Text>
        )}
        {savedProfile.provider === "ollama" && (
          <Text>Host: {savedProfile.host}</Text>
        )}
        {setCurrent && <Text color="green">現在のプロバイダに設定しました。</Text>}
      </Box>
    );
  }

  return null;
};
