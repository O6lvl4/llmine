import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { config, saveConfig } from '../config.js';
import { createAIClient } from '../aiClient.js';
import {
  upsertModelProfile,
  setCurrentModel,
  getCurrentModelProfile,
  removeModelProfile
} from '../modelRegistry.js';
import * as providerRegistry from '../providerRegistry.js';

describe('プロバイダー切り替え統合テスト', () => {
  let originalConfig: typeof config;

  beforeEach(() => {
    originalConfig = { ...config };
  });

  afterEach(() => {
    Object.assign(config, originalConfig);
  });

  describe('モデルプロファイルによるプロバイダー切り替え', () => {
    it('OpenAIからOllamaへの切り替えが正しく動作する', () => {
      config.openaiApiKey = 'test-openai-key';
      config.ollamaHost = 'http://localhost:11434';

      upsertModelProfile({
        name: 'test-openai',
        provider: 'openai',
        modelId: 'gpt-4',
      });

      upsertModelProfile({
        name: 'test-ollama',
        provider: 'ollama',
        modelId: 'llama2',
      });

      setCurrentModel('test-openai');
      let profile = getCurrentModelProfile();
      expect(profile?.provider).toBe('openai');
      expect(profile?.modelId).toBe('gpt-4');

      const openaiClient = createAIClient('openai');
      expect(openaiClient).toBeDefined();
      expect(openaiClient.createChatCompletion).toBeDefined();

      setCurrentModel('test-ollama');
      profile = getCurrentModelProfile();
      expect(profile?.provider).toBe('ollama');
      expect(profile?.modelId).toBe('llama2');

      const ollamaClient = createAIClient('ollama');
      expect(ollamaClient).toBeDefined();
      expect(ollamaClient.createChatCompletion).toBeDefined();

      removeModelProfile('test-openai');
      removeModelProfile('test-ollama');
    });

    it('プロバイダーの設定が正しく反映される', () => {
      config.openaiApiKey = 'test-key';
      config.anthropicApiKey = 'test-anthropic-key';
      config.azureOpenAIResourceName = 'test-resource';
      config.azureOpenAIKey = 'test-azure-key';
      config.azureOpenAIVersion = '2024-08-01-preview';
      config.azureDeploymentModelId = 'test-deployment';

      const providers = ['openai', 'anthropic', 'azure', 'ollama'] as const;

      providers.forEach(provider => {
        upsertModelProfile({
          name: `test-${provider}`,
          provider,
          modelId: 'test-model',
        });

        setCurrentModel(`test-${provider}`);
        const profile = getCurrentModelProfile();
        expect(profile?.provider).toBe(provider);

        if (provider !== 'bedrock') {
          const client = createAIClient(provider);
          expect(client).toBeDefined();
          expect(client.createChatCompletion).toBeDefined();
        }

        removeModelProfile(`test-${provider}`);
      });
    });
  });

  describe('デフォルト値の処理', () => {
    it('モデルプロファイルがない場合はconfig.defaultProviderが使用される', () => {
      config.defaultProvider = 'anthropic';
      config.anthropicApiKey = 'test-key';
      config.currentModel = undefined;
      config.models = [];

      const profile = getCurrentModelProfile();
      expect(profile?.provider).toBe('anthropic');
    });

    it('config.defaultProviderもない場合はopenaiがデフォルトとなる', () => {
      config.defaultProvider = undefined;
      config.openaiApiKey = 'test-key';
      config.currentModel = undefined;
      config.models = [];

      const profile = getCurrentModelProfile();
      expect(profile?.provider).toBe('openai');
    });
  });

  describe('エラーハンドリング', () => {
    it('必要な設定がない場合は適切なエラーメッセージが表示される', () => {
      const mockGetProviderProfile = vi.spyOn(providerRegistry, 'getProviderProfileForType');
      mockGetProviderProfile.mockReturnValue(undefined);

      const originalApiKey = config.openaiApiKey;
      config.openaiApiKey = undefined;

      expect(() => createAIClient('openai')).toThrow('OpenAI API Keyが設定されていません');

      config.openaiApiKey = originalApiKey;
      mockGetProviderProfile.mockRestore();
    });

    it('不正なプロバイダーを指定した場合はエラーとなる', () => {
      expect(() => createAIClient('invalid' as any)).toThrow('未対応のプロバイダです: invalid');
    });
  });
});