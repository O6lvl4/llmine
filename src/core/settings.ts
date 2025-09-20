import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { Language } from "./i18n.js";

interface Settings {
  language?: Language;
  defaultProvider?: string;
  defaultModel?: string;
}

const SETTINGS_DIR = path.join(os.homedir(), ".llmine");
const SETTINGS_FILE = path.join(SETTINGS_DIR, "settings.json");

async function ensureSettingsDir(): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });
}

export async function loadSettings(): Promise<Settings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await ensureSettingsDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function getSetting<K extends keyof Settings>(
  key: K
): Promise<Settings[K] | undefined> {
  const settings = await loadSettings();
  return settings[key];
}

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  const settings = await loadSettings();
  settings[key] = value;
  await saveSettings(settings);
}