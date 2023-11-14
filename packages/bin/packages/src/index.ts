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

try {
  const output = await fsPromises.readdir(packagesDir, { withFileTypes: true });
  const directories = output.filter((file) => file.isDirectory());
  const packages = [];
  for (const dir of directories) {
    const workspacePath = path.join(dir.path, dir.name);
    const packageJsonPath = path.join(workspacePath, "./package.json");
    if (!fs.existsSync(packageJsonPath)) continue;
    const file = await fsPromises.readFile(packageJsonPath, {
      encoding: "utf-8",
    });
    const json: PackageJson = JSON.parse(file);
    if (!json.scripts?.deploy) continue;
    packages.push(workspacePath);
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
