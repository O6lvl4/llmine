import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';
import { PromptRunner } from '../PromptRunner.js';
import * as aiClient from '../../../core/aiClient.js';
import * as modelRegistry from '../../../core/modelRegistry.js';
import * as providers from '../../../core/providers.js';
import { config } from '../../../core/config.js';

vi.mock('../../../core/aiClient.js', () => ({
  createAIClient: vi.fn(() => ({
    createChatCompletion: vi.fn().mockResolvedValue('Test response'),
  })),
}));

vi.mock('../../../core/modelRegistry.js', () => ({
  getCurrentModelProfile: vi.fn(),
}));

vi.mock('../../../core/providers.js', () => ({
  normalizeProvider: vi.fn((provider) => provider),
}));

vi.mock('../../../core/config.js', () => ({
  config: {
    defaultProvider: 'openai',
  },
}));

describe('PromptRunner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.exit and process.stdout.isTTY
    vi.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('プロバイダー選択ロジック', () => {
    it('明示的に指定されたプロバイダーが優先される', async () => {
      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="anthropic"
          model="claude-3"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(aiClient.createAIClient).toHaveBeenCalledWith('anthropic');
      });
    });

    it('プロバイダー未指定時はモデルプロファイルのプロバイダーが使用される', async () => {
      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue({
        name: 'test-profile',
        provider: 'ollama',
        modelId: 'llama2',
      });

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(aiClient.createAIClient).toHaveBeenCalledWith('ollama');
      });
    });

    it('プロバイダーもモデルプロファイルもない場合はデフォルトプロバイダーが使用される', async () => {
      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue(undefined);
      config.defaultProvider = 'azure';

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(aiClient.createAIClient).toHaveBeenCalledWith('azure');
      });
    });

    it('全ての設定がない場合はopenaiがデフォルトとなる', async () => {
      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue(undefined);
      config.defaultProvider = undefined;

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(aiClient.createAIClient).toHaveBeenCalledWith('openai');
      });
    });
  });

  describe('モデル選択ロジック', () => {
    it('明示的に指定されたモデルが優先される', async () => {
      const mockClient = {
        createChatCompletion: vi.fn().mockResolvedValue('Test response'),
      };
      vi.mocked(aiClient.createAIClient).mockReturnValue(mockClient);

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="openai"
          model="gpt-4-turbo"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
          [{ role: 'user', content: 'test' }],
          0.7,
          'gpt-4-turbo'
        );
      });
    });

    it('モデル未指定時はプロファイルのモデルが使用される', async () => {
      const mockClient = {
        createChatCompletion: vi.fn().mockResolvedValue('Test response'),
      };
      vi.mocked(aiClient.createAIClient).mockReturnValue(mockClient);

      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue({
        name: 'test-profile',
        provider: 'openai',
        modelId: 'gpt-4',
      });

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="openai"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
          [{ role: 'user', content: 'test' }],
          0.7,
          'gpt-4'
        );
      });
    });

    it('プロバイダーが異なる場合はモデルプロファイルのモデルが使用されない', async () => {
      const mockClient = {
        createChatCompletion: vi.fn().mockResolvedValue('Test response'),
      };
      vi.mocked(aiClient.createAIClient).mockReturnValue(mockClient);

      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue({
        name: 'test-profile',
        provider: 'openai',
        modelId: 'gpt-4',
      });

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="anthropic"
          temperature={0.7}
        />
      );

      await vi.waitFor(() => {
        expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
          [{ role: 'user', content: 'test' }],
          0.7,
          undefined
        );
      });
    });
  });

  describe('温度パラメータ', () => {
    it('明示的に指定された温度が使用される', async () => {
      const mockClient = {
        createChatCompletion: vi.fn().mockResolvedValue('Test response'),
      };
      vi.mocked(aiClient.createAIClient).mockReturnValue(mockClient);

      // モデルプロファイルがない状態を明示的に設定
      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue(undefined);

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="openai"
          temperature={0.9}
        />
      );

      await vi.waitFor(() => {
        expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
          [{ role: 'user', content: 'test' }],
          0.9,
          undefined
        );
      });
    });

    it('温度未指定時はプロファイルの温度が使用される', async () => {
      const mockClient = {
        createChatCompletion: vi.fn().mockResolvedValue('Test response'),
      };
      vi.mocked(aiClient.createAIClient).mockReturnValue(mockClient);

      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue({
        name: 'test-profile',
        provider: 'openai',
        modelId: 'gpt-4',
        temperature: 0.5,
      });

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="openai"
        />
      );

      await vi.waitFor(() => {
        expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
          [{ role: 'user', content: 'test' }],
          0.5,
          'gpt-4'
        );
      });
    });

    it('温度もプロファイルもない場合はデフォルト値0.7が使用される', async () => {
      const mockClient = {
        createChatCompletion: vi.fn().mockResolvedValue('Test response'),
      };
      vi.mocked(aiClient.createAIClient).mockReturnValue(mockClient);

      vi.mocked(modelRegistry.getCurrentModelProfile).mockReturnValue(undefined);

      const { lastFrame } = render(
        <PromptRunner
          prompt="test"
          provider="openai"
        />
      );

      await vi.waitFor(() => {
        expect(mockClient.createChatCompletion).toHaveBeenCalledWith(
          [{ role: 'user', content: 'test' }],
          0.7,
          undefined
        );
      });
    });
  });
});