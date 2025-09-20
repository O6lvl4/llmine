import { ProviderType } from "./config.js";

export const SUPPORTED_PROVIDERS: ProviderType[] = [
  "openai",
  "azure",
  "anthropic",
  "bedrock",
  "ollama",
];

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  openai: "OpenAI",
  azure: "Azure OpenAI",
  anthropic: "Anthropic (Claude)",
  bedrock: "AWS Bedrock",
  ollama: "Ollama",
};

export const PROVIDER_FALLBACK_MODELS: Partial<Record<ProviderType, string>> = {
  openai: "gpt-4o-mini",
  azure: "<deployment-name>",
  anthropic: "claude-3-5-sonnet-latest",
  bedrock: "anthropic.claude-3-5-sonnet-20241022-v1:0",
  ollama: "llama3.1",
};

export const PROVIDER_SAMPLE_MODELS: Record<ProviderType, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4o", "o4-mini", "o4", "gpt-4.1-mini", "gpt-4.1"],
  azure: ["<deployment-name>", "gpt-4o", "gpt-4o-mini"],
  anthropic: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest", "claude-3-opus-latest"],
  bedrock: [
    "anthropic.claude-3-5-sonnet-20241022-v1:0",
    "anthropic.claude-3-5-haiku-20241022-v1:0",
    "meta.llama3-70b-instruct-v1:0",
    "meta.llama3-8b-instruct-v1:0",
  ],
  ollama: ["llama3.1", "mistral", "phi3", "codellama"],
};

export function isProviderType(value: string): value is ProviderType {
  return SUPPORTED_PROVIDERS.includes(value as ProviderType);
}

export function normalizeProvider(
  provider?: string,
): ProviderType | undefined {
  if (!provider) return undefined;
  const lower = provider.toLowerCase();
  return isProviderType(lower) ? (lower as ProviderType) : undefined;
}
