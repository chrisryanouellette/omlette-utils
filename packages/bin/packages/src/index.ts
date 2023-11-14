import * as fsPromises from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { setOutput, setFailed, info } from "@actions/core";

type PackageJson = {
  scripts?: {
    deploy?: string;
  };
};

const outputKey = "output";
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const packagesDir = path.join(__dirname, "../../../");

async function search(sources: fs.Dirent[]): Promise<string[]> {
  const results: string[] = [];
  for (const src of sources) {
    if (!src.isDirectory()) continue;
    const dirPath = path.join(src.path, src.name);
    const packageJsonPath = path.join(dirPath, "./package.json");
    if (!fs.existsSync(packageJsonPath)) {
      const subDir = await fsPromises.readdir(dirPath, { withFileTypes: true });
      results.push(...(await search(subDir)));
    } else {
      results.push(dirPath);
    }
  }
  return results;
}

try {
  const output = await fsPromises.readdir(packagesDir, { withFileTypes: true });
  const directories = await search(output);
  const packages = [];
  for (const dir of directories) {
    const packageJsonPath = path.join(dir, "./package.json");
    if (!fs.existsSync(packageJsonPath)) continue;
    const file = await fsPromises.readFile(packageJsonPath, {
      encoding: "utf-8",
    });
    const json: PackageJson = JSON.parse(file);
    if (!json.scripts?.deploy) continue;
    packages.push(dir);
  }
  info(`Found ${packages.length} package(s) with deploy scripts`);
  setOutput(outputKey, packages);
} catch (error) {
  if (error instanceof Error) {
    setFailed(error.message);
  } else {
    setFailed(`Unknown Error: ${JSON.stringify(error)}`);
  }
}
