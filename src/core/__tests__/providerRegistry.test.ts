import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("providerRegistry", () => {
  const originalConfigDir = process.env.LLMINE_CONFIG_DIR;
  const originalHome = process.env.HOME;
  let tempDir: string;

  beforeEach(() => {
    // Clear module cache to ensure fresh imports
    vi.resetModules();

    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "llmine-test-"));

    // Override HOME to use temp directory
    process.env.HOME = tempDir;
    delete process.env.LLMINE_CONFIG_DIR;

    // Create config directory
    fs.mkdirSync(path.join(tempDir, ".llmine"), { recursive: true });
  });

  afterEach(() => {
    // Restore original environment
    if (originalConfigDir) {
      process.env.LLMINE_CONFIG_DIR = originalConfigDir;
    } else {
      delete process.env.LLMINE_CONFIG_DIR;
    }

    if (originalHome) {
      process.env.HOME = originalHome;
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Reset module cache
    vi.resetModules();
  });

  describe("removeProviderProfile - Legacy Config Cleanup", () => {
    it("should remove OpenAI legacy config fields when removing openai-default", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        openaiApiKey: "test-openai-key",
        defaultOpenAIModelId: "gpt-4",
        defaultProvider: "openai",
        providerProfiles: [
          {
            name: "openai-default",
            provider: "openai",
            apiKey: "test-openai-key",
            defaultModel: "gpt-4",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "openai-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      // Remove the provider profile
      removeProviderProfile("openai-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Legacy fields should be removed
      expect(updatedConfig.openaiApiKey).toBeUndefined();
      expect(updatedConfig.defaultOpenAIModelId).toBeUndefined();

      // Provider profile should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(0);
    });

    it("should remove Azure legacy config fields when removing azure-default", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        // Current legacy field names
        azureOpenAIResourceName: "test-resource",
        azureOpenAIKey: "test-azure-key",
        azureDeploymentModelId: "test-deployment",
        azureOpenAIVersion: "2024-08-01-preview",
        azureOpenAIDeployment: "chat-gpt-4o",
        // Old legacy field names
        azureResourceName: "old-test-resource",
        azureApiKey: "old-test-key",
        azureDeploymentName: "old-test-deployment",
        azureApiVersion: "old-api-version",
        defaultAzureModelId: "old-default-model",
        defaultProvider: "azure",
        providerProfiles: [
          {
            name: "azure-default",
            provider: "azure",
            resourceName: "test-resource",
            apiKey: "test-azure-key",
            deployment: "test-deployment",
            apiVersion: "2024-08-01-preview",
            defaultModel: "test-deployment",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "azure-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("azure-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // All Azure legacy fields should be removed
      expect(updatedConfig.azureOpenAIResourceName).toBeUndefined();
      expect(updatedConfig.azureOpenAIKey).toBeUndefined();
      expect(updatedConfig.azureDeploymentModelId).toBeUndefined();
      expect(updatedConfig.azureOpenAIVersion).toBeUndefined();
      expect(updatedConfig.azureOpenAIDeployment).toBeUndefined();
      expect(updatedConfig.azureResourceName).toBeUndefined();
      expect(updatedConfig.azureApiKey).toBeUndefined();
      expect(updatedConfig.azureDeploymentName).toBeUndefined();
      expect(updatedConfig.azureApiVersion).toBeUndefined();
      expect(updatedConfig.defaultAzureModelId).toBeUndefined();

      // Provider profile should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(0);
    });

    it("should remove Anthropic legacy config fields when removing anthropic-default", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        anthropicApiKey: "test-anthropic-key",
        defaultAnthropicModelId: "claude-3-opus",
        defaultProvider: "anthropic",
        providerProfiles: [
          {
            name: "anthropic-default",
            provider: "anthropic",
            apiKey: "test-anthropic-key",
            defaultModel: "claude-3-opus",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "anthropic-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("anthropic-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Legacy fields should be removed
      expect(updatedConfig.anthropicApiKey).toBeUndefined();
      expect(updatedConfig.defaultAnthropicModelId).toBeUndefined();

      // Provider profile should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(0);
    });

    it("should remove Bedrock legacy config fields when removing bedrock-default", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        awsRegion: "us-west-2",
        awsAccessKeyId: "test-access-key",
        awsSecretAccessKey: "test-secret-key",
        awsSessionToken: "test-session-token",
        defaultBedrockModelId: "anthropic.claude-v2",
        defaultProvider: "bedrock",
        providerProfiles: [
          {
            name: "bedrock-default",
            provider: "bedrock",
            region: "us-west-2",
            accessKeyId: "test-access-key",
            secretAccessKey: "test-secret-key",
            sessionToken: "test-session-token",
            defaultModel: "anthropic.claude-v2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "bedrock-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("bedrock-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Legacy fields should be removed
      expect(updatedConfig.awsRegion).toBeUndefined();
      expect(updatedConfig.awsAccessKeyId).toBeUndefined();
      expect(updatedConfig.awsSecretAccessKey).toBeUndefined();
      expect(updatedConfig.awsSessionToken).toBeUndefined();
      expect(updatedConfig.defaultBedrockModelId).toBeUndefined();

      // Provider profile should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(0);
    });

    it("should remove Vertex legacy config fields when removing vertex-default", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        vertexProjectId: "test-project",
        vertexLocation: "us-central1",
        defaultVertexModelId: "gemini-pro",
        defaultProvider: "vertex",
        providerProfiles: [
          {
            name: "vertex-default",
            provider: "vertex",
            projectId: "test-project",
            location: "us-central1",
            defaultModel: "gemini-pro",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "vertex-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("vertex-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Legacy fields should be removed
      expect(updatedConfig.vertexProjectId).toBeUndefined();
      expect(updatedConfig.vertexLocation).toBeUndefined();
      expect(updatedConfig.defaultVertexModelId).toBeUndefined();

      // Provider profile should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(0);
    });

    it("should handle removing non-default profiles without affecting legacy configs", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        openaiApiKey: "test-openai-key",
        defaultOpenAIModelId: "gpt-4",
        defaultProvider: "openai",
        providerProfiles: [
          {
            name: "custom-openai",
            provider: "openai",
            apiKey: "custom-key",
            defaultModel: "gpt-3.5-turbo",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            name: "openai-default",  // This will be created by migration anyway, so include it
            provider: "openai",
            apiKey: "test-openai-key",
            defaultModel: "gpt-4",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "custom-openai",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("custom-openai");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Legacy fields should NOT be removed for non-default profiles
      expect(updatedConfig.openaiApiKey).toBe("test-openai-key");
      expect(updatedConfig.defaultOpenAIModelId).toBe("gpt-4");

      // Only custom-openai should be removed, openai-default should remain
      expect(updatedConfig.providerProfiles).toHaveLength(1);
      expect(updatedConfig.providerProfiles[0].name).toBe("openai-default");
    });

    it("should preserve other provider profiles when removing one", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        defaultProvider: "openai",
        providerProfiles: [
          {
            name: "openai-default",
            provider: "openai",
            apiKey: "test-key-1",
            defaultModel: "gpt-4",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            name: "azure-default",
            provider: "azure",
            resourceName: "test-resource",
            apiKey: "test-key-2",
            deployment: "test-deployment",
            apiVersion: "2024-08-01-preview",
            defaultModel: "test-deployment",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            name: "custom-profile",
            provider: "ollama",
            host: "http://localhost:11434",
            defaultModel: "llama2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "openai-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("openai-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Only openai-default should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(2);
      expect(updatedConfig.providerProfiles.find((p: any) => p.name === "openai-default")).toBeUndefined();
      expect(updatedConfig.providerProfiles.find((p: any) => p.name === "azure-default")).toBeDefined();
      expect(updatedConfig.providerProfiles.find((p: any) => p.name === "custom-profile")).toBeDefined();

      // Current profile should be updated to the first available
      expect(updatedConfig.currentProviderProfile).toBe("azure-default");
    });

    it("should remove Ollama legacy config fields when removing ollama-default", async () => {
      const configPath = path.join(tempDir, ".llmine", "config.json");
      const configData = {
        ollamaHost: "http://localhost:11434",
        defaultOllamaModelId: "llama2",
        defaultProvider: "ollama",
        providerProfiles: [
          {
            name: "ollama-default",
            provider: "ollama",
            host: "http://localhost:11434",
            defaultModel: "llama2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        currentProviderProfile: "ollama-default",
      };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

      // Re-import modules to pick up new config
      const { removeProviderProfile } = await import("../providerRegistry");

      removeProviderProfile("ollama-default");

      const updatedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

      // Legacy fields should be removed
      expect(updatedConfig.ollamaHost).toBeUndefined();
      expect(updatedConfig.defaultOllamaModelId).toBeUndefined();

      // Provider profile should be removed
      expect(updatedConfig.providerProfiles).toHaveLength(0);
    });
  });
});