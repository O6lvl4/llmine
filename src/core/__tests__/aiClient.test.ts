import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAIClient } from '../aiClient.js';
import { config } from '../config.js';
import * as providerRegistry from '../providerRegistry.js';

vi.mock('../config.js', () => ({
  config: {
    openaiApiKey: 'test-openai-key',
    anthropicApiKey: 'test-anthropic-key',
    azureOpenAIResourceName: 'test-resource',
    azureOpenAIKey: 'test-azure-key',
    azureOpenAIVersion: '2024-08-01-preview',
    azureDeploymentModelId: 'test-deployment',
    awsRegion: 'us-east-1',
    ollamaHost: 'http://localhost:11434',
    defaultOpenAIModelId: 'gpt-4',
    defaultAnthropicModelId: 'claude-3-opus',
    defaultBedrockModelId: 'anthropic.claude-3',
    defaultOllamaModelId: 'llama2',
  },
}));

vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn(() => vi.fn()),
}));

vi.mock('@ai-sdk/azure', () => ({
  createAzure: vi.fn(() => vi.fn()),
}));

vi.mock('@ai-sdk/amazon-bedrock', () => ({
  createAmazonBedrock: vi.fn(() => vi.fn()),
}));

describe('createAIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(providerRegistry, 'getProviderProfileForType').mockReturnValue(undefined);
  });

  describe('プロバイダー切り替え', () => {
    it('openaiプロバイダーが正しく選択される', () => {
      const client = createAIClient('openai');
      expect(client).toBeDefined();
      expect(client.createChatCompletion).toBeDefined();
      expect(client.listModels).toBeDefined();
    });

    it('anthropicプロバイダーが正しく選択される', () => {
      const client = createAIClient('anthropic');
      expect(client).toBeDefined();
      expect(client.createChatCompletion).toBeDefined();
      expect(client.listModels).toBeDefined();
    });

    it('azureプロバイダーが正しく選択される', () => {
      const client = createAIClient('azure');
      expect(client).toBeDefined();
      expect(client.createChatCompletion).toBeDefined();
      expect(client.listModels).toBeDefined();
    });

    it('bedrockプロバイダーが正しく選択される', () => {
      const client = createAIClient('bedrock');
      expect(client).toBeDefined();
      expect(client.createChatCompletion).toBeDefined();
    });

    it('ollamaプロバイダーが正しく選択される', () => {
      const client = createAIClient('ollama');
      expect(client).toBeDefined();
      expect(client.createChatCompletion).toBeDefined();
      expect(client.listModels).toBeDefined();
    });

    it('不正なプロバイダーでエラーが発生する', () => {
      expect(() => createAIClient('invalid' as any)).toThrow('未対応のプロバイダです: invalid');
    });
  });

  describe('APIキーの検証', () => {
    it('OpenAI APIキーが未設定の場合エラーが発生する', () => {
      const originalApiKey = config.openaiApiKey;
      config.openaiApiKey = undefined;

      expect(() => createAIClient('openai')).toThrow('OpenAI API Keyが設定されていません');

      config.openaiApiKey = originalApiKey;
    });

    it('Anthropic APIキーが未設定の場合エラーが発生する', () => {
      const originalApiKey = config.anthropicApiKey;
      config.anthropicApiKey = undefined;

      expect(() => createAIClient('anthropic')).toThrow('Anthropic API Key が設定されていません');

      config.anthropicApiKey = originalApiKey;
    });

    it('Azure設定が不足している場合エラーが発生する', () => {
      const originalResourceName = config.azureOpenAIResourceName;
      config.azureOpenAIResourceName = undefined;

      expect(() => createAIClient('azure')).toThrow('Azure OpenAI の設定が不足しています');

      config.azureOpenAIResourceName = originalResourceName;
    });

    it('AWS Bedrock設定が不足している場合エラーが発生する', () => {
      const originalRegion = config.awsRegion;
      config.awsRegion = undefined;

      expect(() => createAIClient('bedrock')).toThrow('AWS Bedrock のリージョンが設定されていません');

      config.awsRegion = originalRegion;
    });
  });

  describe('プロバイダープロファイルの優先順位', () => {
    it('プロバイダープロファイルが優先して使用される', () => {
      const mockProfile = {
        name: 'test-profile',
        provider: 'openai' as const,
        apiKey: 'profile-api-key',
        defaultModel: 'gpt-4-turbo',
      };

      vi.spyOn(providerRegistry, 'getProviderProfileForType').mockReturnValue(mockProfile);

      const client = createAIClient('openai');
      expect(client).toBeDefined();
    });
  });
});