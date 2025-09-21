import { normalizeProvider } from "../core/providers.js";
import { CLICommand, ParsedCLI, PromptCommand } from "./types.js";

interface ParseOptions {
  provider?: string;
  model?: string;
  temperature?: number;
}

function buildPromptCommand(
  promptText: string,
  options: ParseOptions,
): PromptCommand | CLICommand {
  const provider = options.provider
    ? normalizeProvider(options.provider)
    : undefined;

  if (options.provider && !provider) {
    return {
      kind: "unknown",
      message: `サポートされていないプロバイダです: ${options.provider}`,
    };
  }

  return {
    kind: "prompt",
    prompt: promptText,
    provider,
    model: options.model,
    temperature: options.temperature,
  };
}

export function parseArgs(argv: string[], pipedInput?: string): ParsedCLI {
  const options: ParseOptions = {};
  const positional: string[] = [];
  let forcePrompt = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    // Handle -- separator for forcing prompt mode
    if (arg === "--") {
      forcePrompt = true;
      // Collect all remaining args as prompt
      const remainingArgs = argv.slice(i + 1);
      if (remainingArgs.length > 0) {
        const promptText = remainingArgs.join(" ");
        const combined = pipedInput
          ? `${promptText}\n\n${pipedInput}`
          : promptText;
        return { command: buildPromptCommand(combined, options) };
      }
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      return { command: { kind: "help" } };
    }
    if (arg === "--version" || arg === "-V") {
      return { command: { kind: "version" }, exitAfterRender: true };
    }
    if (arg === "--provider" || arg === "-P") {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) {
        return {
          command: {
            kind: "unknown",
            message: "--provider オプションには値が必要です",
          },
        };
      }
      options.provider = value;
      i += 1;
      continue;
    }
    if (arg === "--model" || arg === "-m") {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) {
        return {
          command: {
            kind: "unknown",
            message: "--model オプションには値が必要です",
          },
        };
      }
      options.model = value;
      i += 1;
      continue;
    }
    if (arg === "--temperature" || arg === "-t") {
      const value = argv[i + 1];
      if (!value || value.startsWith("-")) {
        return {
          command: {
            kind: "unknown",
            message: "--temperature オプションには値が必要です",
          },
        };
      }
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        return {
          command: {
            kind: "unknown",
            message: "--temperature には数値を指定してください",
          },
        };
      }
      options.temperature = parsed;
      i += 1;
      continue;
    }

    positional.push(arg);
  }

  if (positional.length === 0) {
    if (pipedInput && pipedInput.length > 0) {
      // When only piped input, use it as the prompt
      return { command: buildPromptCommand(pipedInput, options) };
    }
    // If no arguments and no pipe, show interactive prompt
    return { command: { kind: "prompt-interactive" } };
  }

  const [command, ...rest] = positional;

  switch (command) {
    case "help":
      return { command: { kind: "help" } };
    case "model": {
      const sub = rest[0];
      switch (sub) {
        case undefined:
          return { command: { kind: "model-home" } };
        case "list":
          return { command: { kind: "model-list" } };
        case "add":
          return {
            command: { kind: "model-add", presetName: rest[1] },
          };
        case "use":
          if (!rest[1]) {
            return {
              command: {
                kind: "unknown",
                message: "model use にはプロファイル名が必要です",
              },
            };
          }
          return {
            command: { kind: "model-use", name: rest[1] },
          };
        case "show":
          return {
            command: { kind: "model-show", name: rest[1] },
          };
        case "rm":
          if (!rest[1]) {
            return {
              command: {
                kind: "unknown",
                message: "model rm にはプロファイル名が必要です",
              },
            };
          }
          return { command: { kind: "model-remove", name: rest[1] } };
        default:
          return {
            command: {
              kind: "unknown",
              message: `未サポートの model サブコマンドです: ${sub}`,
            },
          };
      }
    }
    case "provider": {
      const sub = rest[0];
      switch (sub) {
        case undefined:
          return { command: { kind: "provider-home" } };
        case "list":
          return { command: { kind: "provider-list" } };
        case "add":
          return {
            command: {
              kind: "provider-add",
              provider: rest[1] ? normalizeProvider(rest[1]) : undefined,
            },
          };
        case "show":
          return {
            command: { kind: "provider-show", name: rest[1] },
          };
        case "use":
          if (!rest[1]) {
            return {
              command: {
                kind: "unknown",
                message: "provider use にはプロファイル名が必要です",
              },
            };
          }
          return { command: { kind: "provider-use", name: rest[1] } };
        case "rm":
          if (!rest[1]) {
            return {
              command: {
                kind: "unknown",
                message: "provider rm にはプロファイル名が必要です",
              },
            };
          }
          return { command: { kind: "provider-remove", name: rest[1] } };
        case "current":
          return { command: { kind: "provider-current" } };
        default:
          return {
            command: {
              kind: "unknown",
              message: `未サポートの provider サブコマンドです: ${sub}`,
            },
          };
      }
    }
    case "models": {
      // Support "models" as a subcommand to list available models
      return {
        command: {
          kind: "models-list",
          provider: options.provider ? normalizeProvider(options.provider) : undefined
        }
      };
    }
    case "keys": {
      return {
        command: {
          kind: "unknown",
          message:
            "`llmine keys` コマンドは廃止されました。`llmine provider` を利用してください。",
        },
      };
    }
    case "language":
    case "lang": {
      const sub = rest[0];
      if (!sub) {
        return { command: { kind: "language-current" } };
      }
      if (sub === "set") {
        const lang = rest[1];
        if (lang !== "ja" && lang !== "en") {
          return {
            command: {
              kind: "unknown",
              message: "Language must be 'ja' or 'en'",
            },
          };
        }
        return { command: { kind: "language-set", lang } };
      }
      return { command: { kind: "language-current" } };
    }
    default: {
      const promptParts = positional.join(" ");

      // Improved pipe handling: combine prompt and piped input
      let combined: string;
      if (pipedInput && pipedInput.length > 0) {
        // Format based on content type
        const separator =
          pipedInput.includes("diff --git") ||
          pipedInput.includes("+++") ||
          pipedInput.includes("---")
            ? "\n\n=== Input ===\n"
            : "\n\n";
        combined = `${promptParts}${separator}${pipedInput}`;
      } else {
        combined = promptParts;
      }

      if (!combined.trim()) {
        return { command: { kind: "help" } };
      }
      return { command: buildPromptCommand(combined, options) };
    }
  }
}
