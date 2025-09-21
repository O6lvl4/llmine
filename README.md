# llmine

<div align="center">
    <img src="assets/llmine-logo.png" alt="llmine logo" width="600">
</div>

<div align="center">

[![npm version](https://badge.fury.io/js/llmine.svg)](https://badge.fury.io/js/llmine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/llmine.svg)](https://nodejs.org)

[日本語版 README はこちら](README.ja.md)

</div>

A powerful CLI tool that provides unified access to various LLMs (ChatGPT, Claude, Gemini, etc.) from your terminal.
Seamlessly interact with multiple AI providers including OpenAI, Azure OpenAI, Anthropic (Claude), AWS Bedrock, and Ollama through a single, elegant command-line interface.

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

### Install from npm (Recommended)

```bash
npm install -g llmine
```

### Install from Source

#### 1. Clone the repository

```bash
git clone https://github.com/O6lvl4/llmine.git
cd llmine
```

#### 2. Quick Install (All-in-one)

```bash
npm run setup
```

This will automatically:
- Install dependencies
- Build TypeScript sources
- Register the `llmine` command globally
- Set up execution permissions

#### 3. Manual Installation

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

## Quick Start

```bash
# Configure your first provider (interactive setup)
llmine provider add openai

# Send your first prompt
llmine "What is the meaning of life?"

# Pipe input for code review
cat app.js | llmine "Review this code for improvements"
```

## Usage

### 1. Configure Providers

Set up authentication for your preferred AI providers. The interactive setup will guide you through the process:

```bash
llmine provider add <provider>
```

Supported providers:

### 2. Model Profiles

Create and manage model profiles to quickly switch between different configurations:

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

### 3. Managing Providers

To view registered profiles:

```bash
llmine provider list
```

### 4. List Available Models

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

### 5. Send Prompts

#### Example 1: Direct prompt as argument

```bash
# Uses active model profile's provider and model by default
llmine "What's the weather forecast for tomorrow?"

# Force prompt mode with -- separator (useful for reserved words)
llmine -- models                      # Sends "models" as prompt, not command
llmine -- list all files              # Sends entire text as prompt

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

### 6. Language Settings

Switch the CLI display language:

```bash
# Check current language
llmine lang

# Set to Japanese
llmine lang set ja

# Set to English
llmine lang set en
```

### 7. Ollama Integration (Local Models)

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

### 8. Getting Help

Display help:

```bash
llmine help
```

Or simply run `llmine` without arguments to show help automatically:

```bash
llmine
```

## Advanced Features

### System Prompts

Customize AI behavior with system prompts:

```bash
# Set system context for specialized responses
llmine "Explain quantum computing" \
  --system "You are a physics professor explaining concepts to beginners"
```

### Streaming Responses

Get real-time streaming output for long responses:

```bash
llmine "Write a detailed essay about space exploration" --stream
```

### Output Formats

Export responses in different formats:

```bash
# Save to file
llmine "Generate a README template" > README.md

# Copy to clipboard (macOS)
llmine "Generate SQL query for user analytics" | pbcopy
```

## Development

### Architecture

```
src/
├── core/                      # Core business logic
│   ├── aiClient.ts           # Unified AI client interface
│   ├── config.ts             # Configuration management
│   ├── modelRegistry.ts      # Model profile registry
│   └── providers.ts          # Provider implementations
├── cli/                       # Interactive CLI (Ink + React)
│   ├── app.tsx               # Main application component
│   ├── main.tsx              # CLI entry point
│   ├── parseArgs.ts          # Argument parsing
│   ├── screens/              # UI screens
│   └── utils/                # CLI utilities
└── utils/                     # Shared utilities
    └── banner.ts             # ASCII art banner
```

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run in development mode with hot reload |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run test suite |
| `npm run setup` | One-command installation |

### Configuration

All settings are stored in `~/.llmine/config.json`. You can edit this file directly or use the CLI commands:

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

You can directly edit this JSON file for advanced configuration. The CLI will validate your changes on next run.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/O6lvl4/llmine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/O6lvl4/llmine/discussions)

## License

[MIT License](./LICENSE) - feel free to use this project for any purpose.

## Acknowledgments

- Built with [Ink](https://github.com/vadimdemedes/ink) for beautiful CLI interfaces
- Powered by [TypeScript](https://www.typescriptlang.org/) for type safety
- Thanks to all the AI providers for their amazing APIs