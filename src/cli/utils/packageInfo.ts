import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

interface PackageJsonShape {
  name?: string;
  version?: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = resolve(__dirname, "../../../package.json");

const packageJsonContent = readFileSync(packageJsonPath, "utf8");
const packageJson = JSON.parse(packageJsonContent) as PackageJsonShape;

export const pkgName = packageJson.name ?? "llmine";
export const pkgVersion = packageJson.version ?? "0.0.0";
