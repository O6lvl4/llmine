import { ProviderType } from "../core/config.js";

export type PromptCommand = {
  kind: "prompt";
  prompt: string;
  provider?: ProviderType;
  model?: string;
  temperature?: number;
};

export type ModelCommand =
  | { kind: "model-home" }
  | { kind: "model-list" }
  | { kind: "model-add"; presetName?: string }
  | { kind: "model-use"; name: string }
  | { kind: "model-show"; name?: string }
  | { kind: "model-remove"; name: string };

export type ProviderCommand =
  | { kind: "provider-home" }
  | { kind: "provider-list" }
  | { kind: "provider-add"; provider?: ProviderType }
  | { kind: "provider-show"; name?: string }
  | { kind: "provider-use"; name: string }
  | { kind: "provider-remove"; name: string }
  | { kind: "provider-current" };

export type HelpCommand = { kind: "help" };
export type VersionCommand = { kind: "version" };
export type UnknownCommand = { kind: "unknown"; message: string };

export type LanguageCommand =
  | { kind: "language-set"; lang: "ja" | "en" }
  | { kind: "language-current" };

export type CLICommand =
  | PromptCommand
  | ModelCommand
  | ProviderCommand
  | LanguageCommand
  | HelpCommand
  | VersionCommand
  | UnknownCommand;

export interface ParsedCLI {
  command: CLICommand;
  exitAfterRender?: boolean;
}
