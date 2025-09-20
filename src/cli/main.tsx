#!/usr/bin/env node
import React from "react";
import { render } from "ink";

import { pkgVersion } from "./utils/packageInfo.js";
import { parseArgs } from "./parseArgs.js";
import { App } from "./app.js";
import { setLanguage, detectLanguage, t } from "../core/i18n.js";
import { getSetting } from "../core/settings.js";

async function readPipedInput(): Promise<string | undefined> {
  if (process.stdin.isTTY) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    let data = "";
    const chunks: string[] = [];

    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk: string) => {
      chunks.push(chunk);
    });

    process.stdin.on("end", () => {
      data = chunks.join("");
      // Don't trim to preserve formatting for code/diff input
      resolve(data);
    });

    process.stdin.on("error", (err) => {
      reject(err);
    });

    // Set timeout to prevent hanging
    setTimeout(() => {
      if (chunks.length === 0) {
        resolve(undefined);
      }
    }, 100);
  });
}

(async () => {
  try {
    // Initialize language from settings or system locale
    const savedLang = await getSetting("language");
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      setLanguage(detectLanguage());
    }

    const pipedInput = await readPipedInput();
    const argv = process.argv.slice(2);
    const parsed = parseArgs(argv, pipedInput);

    if (parsed.command.kind === "version") {
      console.log(pkgVersion);
      process.exit(0);
    }

    // If we have piped input and a prompt command, display input info
    if (pipedInput && parsed.command.kind === "prompt") {
      const lines = pipedInput.split('\n').length;
      const chars = pipedInput.length;
      if (lines > 10 || chars > 500) {
        process.stderr.write(`📥 ${t("pipedInput")}: ${lines} ${t("lines")}, ${chars} ${t("chars")}\n`);
      }
    }

    const { waitUntilExit } = render(<App command={parsed.command} />);
    await waitUntilExit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
