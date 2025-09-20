import React from "react";
import { CLICommand } from "./types.js";
import { HelpScreen } from "./screens/HelpScreen.js";
import { ErrorScreen } from "./screens/ErrorScreen.js";
import { PromptRunner } from "./screens/PromptRunner.js";
import { ModelListScreen } from "./screens/ModelListScreen.js";
import { ModelHomeScreen } from "./screens/ModelHomeScreen.js";
import { ModelAddScreen } from "./screens/ModelAddScreen.js";
import { ModelUseScreen } from "./screens/ModelUseScreen.js";
import { ModelShowScreen } from "./screens/ModelShowScreen.js";
import { ModelRemoveScreen } from "./screens/ModelRemoveScreen.js";
import { ProviderHomeScreen } from "./screens/ProviderHomeScreen.js";
import { ProviderListScreen } from "./screens/ProviderListScreen.js";
import { ProviderAddScreen } from "./screens/ProviderAddScreen.js";
import { ProviderShowScreen } from "./screens/ProviderShowScreen.js";
import { ProviderUseScreen } from "./screens/ProviderUseScreen.js";
import { ProviderRemoveScreen } from "./screens/ProviderRemoveScreen.js";
import { ProviderCurrentScreen } from "./screens/ProviderCurrentScreen.js";
import { LanguageSet } from "./screens/language/LanguageSet.js";
import { LanguageCurrent } from "./screens/language/LanguageCurrent.js";
import { useApp } from "ink";

interface AppProps {
  command: CLICommand;
}

export const App: React.FC<AppProps> = ({ command }) => {
  const { exit } = useApp();

  switch (command.kind) {
    case "help":
      return <HelpScreen />;
    case "prompt":
      return (
        <PromptRunner
          prompt={command.prompt}
          provider={command.provider}
          model={command.model}
          temperature={command.temperature}
        />
      );
    case "model-home":
      return <ModelHomeScreen />;
    case "model-list":
      return <ModelListScreen />;
    case "model-add":
      return <ModelAddScreen presetName={command.presetName} />;
    case "model-use":
      return <ModelUseScreen name={command.name} />;
    case "model-show":
      return <ModelShowScreen name={command.name} />;
    case "model-remove":
      return <ModelRemoveScreen name={command.name} />;
    case "provider-home":
      return <ProviderHomeScreen />;
    case "provider-list":
      return <ProviderListScreen />;
    case "provider-add":
      return <ProviderAddScreen provider={command.provider} />;
    case "provider-show":
      return <ProviderShowScreen name={command.name} />;
    case "provider-use":
      return <ProviderUseScreen name={command.name} />;
    case "provider-remove":
      return <ProviderRemoveScreen name={command.name} />;
    case "provider-current":
      return <ProviderCurrentScreen />;
    case "language-set":
      return <LanguageSet lang={command.lang} onComplete={exit} />;
    case "language-current":
      return <LanguageCurrent />;
    case "unknown":
      return <ErrorScreen message={command.message} />;
    case "version":
      // version は main.tsx で処理される想定
      return <HelpScreen />;
    default:
      return <ErrorScreen message="未サポートのコマンドです" />;
  }
};
