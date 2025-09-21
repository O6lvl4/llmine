# llmine

<div align="center">
    <img src="assets/llmine-logo.png" alt="llmine logo" width="600">
</div>

[日本語版 README はこちら](README.ja.md)

A CLI tool that provides access to various LLMs (ChatGPT, Claude, etc.) from the command line.
Easily call multiple providers including OpenAI, Azure OpenAI, Anthropic (Claude), AWS Bedrock, and Ollama with a single prompt and display results in your terminal.

## Features

- Support for **OpenAI / Azure OpenAI / Anthropic (Claude) / AWS Bedrock / Ollama**
- Direct command-line arguments or pipe input support
- **Enhanced pipe functionality** - Smooth handling of large inputs like git diffs
- **Multi-language support** - Switch between Japanese/English (`llmine lang set [ja|en]`)
- **Ollama integration** - Seamless use of local LLM models
- Interactive configuration for API keys and Azure resources
- Manage provider+model profiles with `llmine model` command for quick switching
- Rich interactive CLI UI built with Ink + React
- Simple architecture with Node.js + TypeScript for easy extension

## Installation

### 1. Clone the repository (or download source)

```bash
git clone https://github.com/O6lvl4/llmine.git
cd llmine
```

### 2. Quick Install (All-in-one)

Copy and run this command to complete installation:

```bash
npm install && \
npm run build && \
npm link && \
chmod +x dist/cli/main.js && \
nodenv rehash
```

Or simply:
```bash
npm run setup
```

### 3. Step-by-step Installation

If you prefer to run commands individually:

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Register as global command
npm link

# Grant execution permission
chmod +x dist/cli/main.js

# Update shims if using nodenv
nodenv rehash
```

This registers the `llmine` command in your PATH, making it available from any directory.
If `npm link` doesn't work or isn't needed, you can use `npx llmine` format instead.

## Usage

### 1. Configure API Keys

First, configure authentication for the providers you want to use (OpenAI / Azure / Anthropic / AWS Bedrock / Ollama).
Running `llmine provider add <provider>` will prompt for required information interactively.

### 1.1 Creating and Switching Model Profiles

Create "model profiles" combining providers and models, and switch between them for different use cases.

```bash
# Add model profile (interactive)
llmine model add

# List registered profiles
llmine model list

# Activate a profile
llmine model use openai-dev

# Show current configuration
llmine model show

# Remove a profile
llmine model rm openai-dev

# Provider profiles also support CRUD operations
llmine provider add openai
llmine provider list
llmine provider show openai-default
llmine provider use openai-default
llmine provider rm openai-default
```

`model add` handles everything from provider selection → model fetching (real-time API fetch when available) → configuration (temperature, etc.) → activation.
If provider credentials aren't configured, run `llmine provider add <provider>` first.

#### OpenAI

```bash
llmine provider add openai
```

- Enter OpenAI API Key (e.g., `sk-xxxxxx...`)

#### Azure OpenAI

```bash
llmine provider add azure
```

- Azure OpenAI Resource Name (e.g., `myazureopenai123`)
- Azure OpenAI API Key
- Azure OpenAI Deployment Name (e.g., `gpt-35-test`)
- Azure OpenAI API Version (e.g., `2024-05-01-preview`)

#### Anthropic (Claude)

```bash
llmine provider add anthropic
```

- Anthropic API Key (e.g., `sk-ant-api03-...`)
- Optionally, default Claude model ID (e.g., `claude-3-5-sonnet-latest`)

#### AWS Bedrock

```bash
llmine provider add bedrock
```

- Region to use (e.g., `us-east-1`)
- AWS Access Key/Secret if needed (uses environment variables or IAM role if blank)
- Optionally, default model ID (e.g., `anthropic.claude-3-5-sonnet-20241022-v1:0`)

#### Ollama

```bash
llmine provider add ollama
```

- Connection host (default: `http://localhost:11434`)
- Optionally, default local model ID (e.g., `llama3.1`)

These settings are saved to `~/.llmine/config.json`.

### 2. Check Registered Providers

To view registered profiles:

```bash
llmine provider list
```

### 3. List Available Models

For supported providers, you can display available models:

```bash
# List models from default provider (or provider specified in config.json)
llmine models

# Explicitly specify provider
llmine models --provider openai
llmine models --provider azure
llmine models --provider anthropic
llmine models --provider bedrock
llmine models --provider ollama
```

### 4. Send Prompts

#### Example 1: Direct prompt as argument

```bash
# Uses active model profile's provider and model by default
llmine "What's the weather forecast for tomorrow?"

# Specify model, temperature, and provider
llmine "List all US presidents" \
  --model gpt-3.5-turbo \
  --temperature 0.5 \
  --provider openai

# Using Claude
llmine "Summarize recent AI trends in 3 lines" \
  --provider anthropic \
  --model claude-3-5-sonnet-latest

# Using local Ollama model
llmine "Review this Dockerfile for security issues" \
  --provider ollama \
  --model llama3.1
```

#### Example 2: Pipe input

```bash
# Read file contents
cat sample_prompt.txt | llmine

# Generate commit message from git diff
git diff | llmine "Suggest a commit message"

# Code review
cat app.js | llmine "Review this code and suggest improvements"

# Log analysis
tail -n 100 error.log | llmine "Analyze error causes"
```

### 5. Language Settings

Switch the CLI display language:

```bash
# Check current language
llmine lang

# Set to Japanese
llmine lang set ja

# Set to English
llmine lang set en
```

### 6. Ollama Integration

Use locally running Ollama models:

```bash
# Verify Ollama is running
ollama list

# Add Ollama provider
llmine provider add ollama

# Use Ollama model
llmine "question" -p ollama

# Specify a model
llmine "question" -p ollama -m llama3.1
```

### 7. Help

Display help:

```bash
llmine help
```

Or simply run `llmine` without arguments to show help automatically:

```bash
llmine
```

## Developer Information

### Directory Structure

```bash
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── src
│   ├── core                   # Common logic (config/model management/clients)
│   │   ├── aiClient.ts
│   │   ├── config.ts
│   │   ├── modelRegistry.ts
│   │   └── providers.ts
│   ├── cli                    # Ink CLI UI
│   │   ├── app.tsx
│   │   ├── main.tsx
│   │   ├── parseArgs.ts
│   │   ├── screens/
│   │   └── utils/
│   └── utils
│       └── banner.ts          # Banner display
└── ...
```

### Scripts

- `npm run build`
  Build TypeScript and output to `dist/core` and `dist/cli`.
- `npm run dev`
  Run Ink CLI in development mode via ts-node ESM loader.
- `npm run format`
  Format code with Prettier.
- `npm run start`
  Run built CLI (`dist/cli/main.js`).
- `npm link`
  Register `llmine` command globally.
- `npm run setup`
  Complete installation in one command.

### Configuration File

Settings are saved to `~/.llmine/config.json`:

```json
{
  "currentModel": "openai-dev",
  "models": [
    {
      "name": "openai-dev",
      "provider": "openai",
      "modelId": "gpt-4o-mini",
      "temperature": 0.7
    }
  ],
  "defaultProvider": "openai",
  "openaiApiKey": "sk-xxxxxx...",
  "defaultOpenAIModelId": "gpt-4o-mini",
  "azureOpenAIResourceName": "myazureopenai123",
  "azureOpenAIKey": "xxxxxxxx...",
  "azureOpenAIVersion": "2024-05-01-preview",
  "azureDeploymentModelId": "my-test-deploy",
  "anthropicApiKey": "sk-ant-api03-xxxx",
  "defaultAnthropicModelId": "claude-3-5-sonnet-latest",
  "awsRegion": "us-east-1",
  "defaultBedrockModelId": "anthropic.claude-3-5-sonnet-20241022-v1:0",
  "ollamaHost": "http://localhost:11434",
  "defaultOllamaModelId": "llama3.1"
}
```

Parameter names correspond to source code, allowing direct editing if needed.

## License

[MIT License](./LICENSE)

This software is published under the MIT License. Please read the license terms carefully before use.